# 📧 Email Receipt Reader - Complete Financial Management System

A comprehensive full-stack application that automatically reads emails for PDF receipts, parses them, and compares with bank statements for complete financial tracking.

## 🚀 Features

### ✨ **Email Integration**
- **Automatic Email Processing**: Checks email every 5 minutes for new PDF receipts
- **IMAP Support**: Works with Gmail, Outlook, Yahoo, iCloud, and custom IMAP servers
- **Smart PDF Parsing**: Extracts merchant, amount, date, and categorizes transactions
- **Manual Processing**: Trigger email processing on-demand
- **Connection Testing**: Test email settings before saving

### 📄 **Manual Upload**
- **Drag & Drop**: Intuitive PDF receipt upload
- **Real-time Parsing**: Instant data extraction and categorization
- **Multiple Formats**: Supports various receipt formats

### 🏦 **Bank Statement Integration**
- **CSV Upload**: Upload bank statements in multiple formats
- **Smart Matching**: Compare receipts with bank transactions
- **Flexible Matching**: Amount and date-based comparison with tolerance
- **Three-column View**: Matches, Ledger Only, Bank Only


## 🛠️ Technology Stack

### Backend
- **Node.js** with Express
- **SQLite** for data persistence
- **IMAP** for email integration
- **PDF-parse** for receipt processing
- **CSV-parser** for bank statements

### Frontend
- **React** with Hooks
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Dropzone** for file uploads

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd email-receipt-reader
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## 🔧 Configuration

### Email Settings

1. **Navigate to "Email Settings"** in the application
2. **Select your email provider** (Gmail, Outlook, Yahoo, iCloud)
3. **Enter your credentials**:
   - Email address
   - Password (use App Password for Gmail with 2FA)
   - IMAP host and port (auto-filled for major providers)

### Gmail Setup 

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Use the App Password** instead of your regular password

## 📊 API Endpoints

### Email Integration
- `POST /api/email-settings` - Configure email settings
- `GET /api/email-settings` - Get current email settings
- `POST /api/test-email-connection` - Test email connection
- `POST /api/process-emails` - Manually process emails

### Receipt Management
- `POST /api/upload-receipt` - Upload PDF receipt
- `GET /api/ledger` - Get all ledger entries

### Bank Statement
- `POST /api/upload-bank-statement` - Upload CSV bank statement
- `GET /api/bank-transactions` - Get all bank transactions
- `GET /api/compare-transactions` - Compare ledger with bank transactions

### Health Check
- `GET /api/health` - Server health status

## 🎯 Usage

### 1. **Email Integration Setup**
1. Go to "Email Settings" tab
2. Select your email provider
3. Enter credentials and test connection
4. Save settings
5. System will automatically check for new receipts every 5 minutes

### 2. **Manual Receipt Upload**
1. Go to "Receipts" tab
2. Drag & drop PDF receipts or click to browse
3. Watch real-time parsing and categorization
4. View parsed data in the ledger table

### 3. **Bank Statement Comparison**
1. Go to "Bank Comparison" tab
2. Upload CSV bank statement
3. View three-column comparison:
   - **Matches** (Green): Transactions found in both
   - **Ledger Only** (Yellow): Receipts not in bank statement
   - **Bank Only** (Red): Bank transactions not in receipts

## 🔍 Sample Data

### Sample Receipts
Located in `sample-receipts/`:
- `receipt-1-walmart.txt` - Walmart receipt ($58.01)
- `receipt-2-starbucks.txt` - Starbucks receipt ($7.75)
- `receipt-3-target.txt` - Target receipt ($89.99)
- `receipt-4-mcdonalds.txt` - McDonald's receipt ($12.45)

### Sample Bank Statements
Located in `sample-bank-statements/`:
- `bank-statement-1.csv` - Full format with all columns
- `bank-statement-2.csv` - Simple format
- `bank-statement-3.csv` - Detailed format

## 🧪 Testing

### Quick Test Commands
```bash
# Check server health
curl http://localhost:5001/api/health

# Get ledger data
curl http://localhost:5001/api/ledger

# Get bank transactions
curl http://localhost:5001/api/bank-transactions

# Get comparison results
curl http://localhost:5001/api/compare-transactions
```

### Manual Testing Steps
1. **Convert sample receipts** to PDF format
2. **Upload PDFs** to the Receipts tab
3. **Upload CSV bank statements** to the Bank Comparison tab
4. **Verify matching** in the comparison view

## 🚀 Deployment

### Vercel Deployment
1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Configure environment variables** in Vercel dashboard

### Environment Variables
```env
PORT=5001
NODE_ENV=production
```



## 📄 License

MIT License - see LICENSE file for details

