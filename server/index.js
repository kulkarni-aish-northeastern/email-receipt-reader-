const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdf = require('pdf-parse');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'text/csv' || 
        file.mimetype === 'application/csv' ||
        file.originalname.endsWith('.csv') ||
        file.originalname.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and CSV files are allowed!'), false);
    }
  }
});

// Initialize SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'ledger.db'));

// Create ledger table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    merchant TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    category TEXT,
    description TEXT,
    receipt_file TEXT,
    email_source TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS bank_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS email_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    imap_host TEXT NOT NULL,
    imap_port INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Email processing function
async function processEmailAttachments() {
  try {
    // Get email settings
    db.get('SELECT * FROM email_settings WHERE is_active = 1 LIMIT 1', (err, settings) => {
      if (err || !settings) {
        console.log('No email settings configured');
        return;
      }

      const imap = new Imap({
        user: settings.email,
        password: settings.password,
        host: settings.imap_host,
        port: settings.imap_port,
        tls: true,
        tlsOptions: { rejectUnauthorized: false }
      });

      imap.once('ready', () => {
        imap.openBox('INBOX', false, (err, box) => {
          if (err) {
            console.error('Error opening inbox:', err);
            return;
          }

          // Search for unread emails with attachments
          imap.search(['UNSEEN', ['HEADER', 'content-type', 'application/pdf']], (err, results) => {
            if (err || results.length === 0) {
              console.log('No new emails with PDF attachments');
              imap.end();
              return;
            }

            const fetch = imap.fetch(results, { bodies: '', struct: true });

            fetch.on('message', (msg, seqno) => {
              let buffer = '';
              let attachment = null;

              msg.on('body', (stream, info) => {
                stream.on('data', (chunk) => {
                  buffer += chunk.toString('utf8');
                });
              });

              msg.once('attributes', (attrs) => {
                attachment = attrs.attachments[0];
              });

              msg.once('end', () => {
                if (attachment) {
                  // Process PDF attachment
                  const attachmentBuffer = Buffer.from(attachment.content, 'base64');
                  processPDFAttachment(attachmentBuffer, attachment.filename);
                }
              });
            });

            fetch.once('error', (err) => {
              console.error('Fetch error:', err);
            });

            fetch.once('end', () => {
              imap.end();
            });
          });
        });
      });

      imap.once('error', (err) => {
        console.error('IMAP error:', err);
      });

      imap.once('end', () => {
        console.log('IMAP connection ended');
      });

      imap.connect();
    });
  } catch (error) {
    console.error('Email processing error:', error);
  }
}

// Process PDF attachment from email
async function processPDFAttachment(buffer, filename) {
  try {
    const data = await pdf(buffer);
    const text = data.text;
    const receiptInfo = extractReceiptInfo(text);

    // Store in database
    const stmt = db.prepare(`
      INSERT INTO ledger (merchant, amount, date, category, description, receipt_file, email_source)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      receiptInfo.merchant,
      receiptInfo.amount,
      receiptInfo.date,
      receiptInfo.category,
      receiptInfo.description,
      filename,
      'email',
      function(err) {
        if (err) {
          console.error('Database error:', err);
        } else {
          console.log(`Email receipt processed: ${receiptInfo.merchant} - $${receiptInfo.amount}`);
        }
      }
    );

    stmt.finalize();
  } catch (error) {
    console.error('Error processing email PDF:', error);
  }
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Configure email settings
app.post('/api/email-settings', (req, res) => {
  const { email, password, imap_host, imap_port } = req.body;

  if (!email || !password || !imap_host || !imap_port) {
    return res.status(400).json({ error: 'All email settings are required' });
  }

  // Deactivate all existing settings
  db.run('UPDATE email_settings SET is_active = 0', (err) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to update email settings' });
    }

    // Insert new settings
    const stmt = db.prepare(`
      INSERT INTO email_settings (email, password, imap_host, imap_port, is_active)
      VALUES (?, ?, ?, ?, 1)
    `);

    stmt.run(email, password, imap_host, imap_port, function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to save email settings' });
      }

      res.json({
        success: true,
        message: 'Email settings saved successfully',
        data: { id: this.lastID }
      });
    });

    stmt.finalize();
  });
});

// Get email settings
app.get('/api/email-settings', (req, res) => {
  db.get('SELECT email, imap_host, imap_port, is_active FROM email_settings WHERE is_active = 1', (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch email settings' });
    }
    res.json(row || {});
  });
});

// Test email connection
app.post('/api/test-email-connection', (req, res) => {
  const { email, password, imap_host, imap_port } = req.body;

  if (!email || !password || !imap_host || !imap_port) {
    return res.status(400).json({ error: 'All email settings are required' });
  }

  const imap = new Imap({
    user: email,
    password: password,
    host: imap_host,
    port: imap_port,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
  });

  imap.once('ready', () => {
    res.json({ success: true, message: 'Email connection successful' });
    imap.end();
  });

  imap.once('error', (err) => {
    let errorMessage = 'Email connection failed';
    let details = err.message;
    
    // Provide more helpful error messages
    if (err.message.includes('Invalid credentials')) {
      errorMessage = 'Invalid email or password';
      details = 'Please check your credentials. For Gmail, use an App Password if 2FA is enabled.';
    } else if (err.message.includes('ENOTFOUND')) {
      errorMessage = 'Invalid IMAP host';
      details = 'Please check the IMAP host address.';
    } else if (err.message.includes('ECONNREFUSED')) {
      errorMessage = 'Connection refused';
      details = 'Please check the IMAP port and ensure IMAP is enabled in your email settings.';
    } else if (err.message.includes('UNAUTH')) {
      errorMessage = 'Authentication failed';
      details = 'Please check your email and password. For Gmail, use an App Password.';
    }
    
    res.status(500).json({ error: errorMessage, details: details });
  });

  imap.connect();
});

// Manual email processing trigger
app.post('/api/process-emails', (req, res) => {
  processEmailAttachments();
  res.json({ success: true, message: 'Email processing started' });
});

// Upload and parse PDF receipt
app.post('/api/upload-receipt', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const filePath = req.file.path;
    console.log('Processing file:', filePath);
    const dataBuffer = fs.readFileSync(filePath);
    console.log('File size:', dataBuffer.length);

    // Parse PDF content
    console.log('Parsing PDF...');
    const data = await pdf(dataBuffer);
    console.log('PDF parsed, text length:', data.text.length);
    const text = data.text;

    // Extract receipt information using regex patterns
    const receiptInfo = extractReceiptInfo(text);
    
    // Store in database
    const stmt = db.prepare(`
      INSERT INTO ledger (merchant, amount, date, category, description, receipt_file, email_source)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      receiptInfo.merchant,
      receiptInfo.amount,
      receiptInfo.date,
      receiptInfo.category,
      receiptInfo.description,
      req.file.filename,
      'manual',
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to save receipt data' });
        }

        res.json({
          success: true,
          message: 'Receipt uploaded and parsed successfully',
          data: {
            id: this.lastID,
            ...receiptInfo,
            receipt_file: req.file.filename
          }
        });
        
        stmt.finalize();
      }
    );

  } catch (error) {
    console.error('Error processing PDF:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to process PDF file', details: error.message });
  }
});

// Upload and parse CSV bank statement
app.post('/api/upload-bank-statement', upload.single('csv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    const filePath = req.file.path;
    const transactions = [];

    // Parse CSV content
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Handle different CSV formats
        const transaction = {
          date: row.Date || row.date || row.DATE,
          description: row.Description || row.description || row.DESC || row.Details,
          amount: parseFloat(row.Amount || row.amount || row.AMOUNT || 0),
          type: row.Type || row.type || 'debit',
          category: row.Category || row.category || 'Uncategorized'
        };
        
        if (transaction.date && transaction.description && transaction.amount !== 0) {
          transactions.push(transaction);
        }
      })
      .on('end', () => {
        // Store transactions in database
        const stmt = db.prepare(`
          INSERT INTO bank_transactions (date, description, amount, type, category)
          VALUES (?, ?, ?, ?, ?)
        `);

        let insertedCount = 0;
        transactions.forEach((transaction) => {
          stmt.run(
            transaction.date,
            transaction.description,
            transaction.amount,
            transaction.type,
            transaction.category,
            function(err) {
              if (!err) insertedCount++;
            }
          );
        });

        stmt.finalize(() => {
          res.json({
            success: true,
            message: `Bank statement uploaded successfully. ${insertedCount} transactions imported.`,
            data: {
              transactions_imported: insertedCount,
              total_transactions: transactions.length
            }
          });
        });
      })
      .on('error', (error) => {
        console.error('Error processing CSV:', error);
        res.status(500).json({ error: 'Failed to process CSV file' });
      });

  } catch (error) {
    console.error('Error processing CSV:', error);
    res.status(500).json({ error: 'Failed to process CSV file' });
  }
});

// Get all ledger entries
app.get('/api/ledger', (req, res) => {
  db.all('SELECT * FROM ledger ORDER BY date DESC', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch ledger data' });
    }
    res.json(rows);
  });
});

// Get all bank transactions
app.get('/api/bank-transactions', (req, res) => {
  db.all('SELECT * FROM bank_transactions ORDER BY date DESC', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch bank transactions' });
    }
    res.json(rows);
  });
});

// Compare ledger with bank transactions
app.get('/api/compare-transactions', (req, res) => {
  // First get all ledger and bank transactions
  db.all('SELECT * FROM ledger ORDER BY date DESC', (err, ledgerRows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch ledger data' });
    }

    db.all('SELECT * FROM bank_transactions ORDER BY date DESC', (err, bankRows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch bank data' });
      }

      // Manual comparison with flexible matching
      const comparison = {
        matches: [],
        ledger_only: [],
        bank_only: []
      };

      // Helper function to normalize dates
      const normalizeDate = (dateStr) => {
        try {
          const date = new Date(dateStr);
          return date.toISOString().split('T')[0]; // YYYY-MM-DD format
        } catch (e) {
          return dateStr;
        }
      };

      // Helper function to check if amounts match (with tolerance)
      const amountsMatch = (amount1, amount2) => {
        return Math.abs(parseFloat(amount1) - parseFloat(amount2)) < 0.01;
      };

      // Helper function to check if dates are close (within 3 days)
      const datesClose = (date1, date2) => {
        const d1 = new Date(normalizeDate(date1));
        const d2 = new Date(normalizeDate(date2));
        const diffTime = Math.abs(d2 - d1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 3;
      };

      // Find matches
      const matchedLedgerIds = new Set();
      const matchedBankIds = new Set();

      ledgerRows.forEach(ledger => {
        bankRows.forEach(bank => {
          if (amountsMatch(ledger.amount, bank.amount) && datesClose(ledger.date, bank.date)) {
            comparison.matches.push({
              ledger: {
                id: ledger.id,
                merchant: ledger.merchant,
                amount: ledger.amount,
                date: ledger.date,
                category: ledger.category
              },
              bank: {
                id: bank.id,
                description: bank.description,
                amount: bank.amount,
                date: bank.date,
                type: bank.type,
                category: bank.category
              }
            });
            matchedLedgerIds.add(ledger.id);
            matchedBankIds.add(bank.id);
          }
        });
      });

      // Find ledger-only transactions
      ledgerRows.forEach(ledger => {
        if (!matchedLedgerIds.has(ledger.id)) {
          comparison.ledger_only.push({
            id: ledger.id,
            merchant: ledger.merchant,
            amount: ledger.amount,
            date: ledger.date,
            category: ledger.category
          });
        }
      });

      // Find bank-only transactions
      bankRows.forEach(bank => {
        if (!matchedBankIds.has(bank.id)) {
          comparison.bank_only.push({
            id: bank.id,
            description: bank.description,
            amount: bank.amount,
            date: bank.date,
            type: bank.type,
            category: bank.category
          });
        }
      });

      res.json(comparison);
    });
  });
});

// Helper function to extract receipt information
function extractReceiptInfo(text) {
  // Common patterns for receipt parsing
  const patterns = {
    // Amount patterns (look for currency amounts)
    amount: /(\$?\d+\.\d{2})/g,
    // Date patterns
    date: /(\d{1,2}\/\d{1,2}\/\d{2,4})|(\d{4}-\d{2}-\d{2})/g,
    // Merchant patterns (look for common store names)
    merchant: /(WALMART|TARGET|COSTCO|AMAZON|STARBUCKS|MCDONALD|BURGER KING|SUBWAY|DOMINO|PIZZA HUT|KROGER|SAFEWAY|WHOLE FOODS|TRADER JOE|HOME DEPOT|LOWE|BEST BUY|APPLE|GOOGLE|MICROSOFT|NETFLIX|SPOTIFY|UBER|LYFT|DOORDASH|GRUBHUB)/gi
  };

  let amount = 0;
  let date = new Date().toISOString().split('T')[0];
  let merchant = 'Unknown Merchant';
  let category = 'General';
  let description = 'Receipt from uploaded PDF';

  // Extract amount
  const amountMatches = text.match(patterns.amount);
  if (amountMatches && amountMatches.length > 0) {
    // Take the largest amount found (usually the total)
    amount = Math.max(...amountMatches.map(match => parseFloat(match.replace('$', ''))));
  }

  // Extract date
  const dateMatches = text.match(patterns.date);
  if (dateMatches && dateMatches.length > 0) {
    date = dateMatches[0];
  }

  // Extract merchant
  const merchantMatches = text.match(patterns.merchant);
  if (merchantMatches && merchantMatches.length > 0) {
    merchant = merchantMatches[0].toUpperCase();
    
    // Categorize based on merchant
    if (merchant.includes('WALMART') || merchant.includes('TARGET') || merchant.includes('COSTCO')) {
      category = 'Retail';
    } else if (merchant.includes('STARBUCKS') || merchant.includes('MCDONALD') || merchant.includes('BURGER')) {
      category = 'Food & Dining';
    } else if (merchant.includes('UBER') || merchant.includes('LYFT')) {
      category = 'Transportation';
    } else if (merchant.includes('NETFLIX') || merchant.includes('SPOTIFY')) {
      category = 'Entertainment';
    }
  }

  return {
    merchant,
    amount,
    date,
    category,
    description
  };
}

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  
  // Start email processing every 5 minutes
  setInterval(processEmailAttachments, 5 * 60 * 1000);
}); 