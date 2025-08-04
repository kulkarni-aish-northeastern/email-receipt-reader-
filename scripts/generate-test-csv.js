const fs = require('fs');
const path = require('path');

// Sample bank transactions
const transactions = [
  {
    Date: '2023-12-15',
    Description: 'WALMART PURCHASE',
    Amount: '58.01',
    Type: 'debit',
    Category: 'Retail'
  },
  {
    Date: '2023-12-16',
    Description: 'STARBUCKS COFFEE',
    Amount: '7.75',
    Type: 'debit',
    Category: 'Food & Dining'
  },
  {
    Date: '2023-12-17',
    Description: 'TARGET ELECTRONICS',
    Amount: '89.99',
    Type: 'debit',
    Category: 'Retail'
  },
  {
    Date: '2023-12-18',
    Description: 'MCDONALDS BURGER',
    Amount: '12.45',
    Type: 'debit',
    Category: 'Food & Dining'
  },
  {
    Date: '2023-12-19',
    Description: 'UBER RIDE',
    Amount: '25.00',
    Type: 'debit',
    Category: 'Transportation'
  },
  {
    Date: '2023-12-20',
    Description: 'NETFLIX SUBSCRIPTION',
    Amount: '15.99',
    Type: 'debit',
    Category: 'Entertainment'
  },
  {
    Date: '2023-12-21',
    Description: 'AMAZON PURCHASE',
    Amount: '45.67',
    Type: 'debit',
    Category: 'Retail'
  },
  {
    Date: '2023-12-22',
    Description: 'SALARY DEPOSIT',
    Amount: '2500.00',
    Type: 'credit',
    Category: 'Income'
  },
  {
    Date: '2023-12-23',
    Description: 'SPOTIFY PREMIUM',
    Amount: '9.99',
    Type: 'debit',
    Category: 'Entertainment'
  },
  {
    Date: '2023-12-24',
    Description: 'LYFT RIDE',
    Amount: '18.50',
    Type: 'debit',
    Category: 'Transportation'
  }
];

// Create test directory
const testDir = path.join(__dirname, '../test-bank-statements');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// Generate CSV files with different formats
const formats = [
  {
    name: 'standard',
    headers: ['Date', 'Description', 'Amount', 'Type', 'Category'],
    filename: 'bank-statement-standard.csv'
  },
  {
    name: 'simple',
    headers: ['date', 'description', 'amount'],
    filename: 'bank-statement-simple.csv'
  },
  {
    name: 'detailed',
    headers: ['DATE', 'DESC', 'AMOUNT', 'TYPE', 'CATEGORY'],
    filename: 'bank-statement-detailed.csv'
  }
];

formats.forEach((format, index) => {
  let csvContent = format.headers.join(',') + '\n';
  
  transactions.forEach(transaction => {
    const row = format.headers.map(header => {
      const key = header.toLowerCase();
      return transaction[key.charAt(0).toUpperCase() + key.slice(1)] || transaction[key] || '';
    });
    csvContent += row.join(',') + '\n';
  });
  
  const filepath = path.join(testDir, format.filename);
  fs.writeFileSync(filepath, csvContent);
  console.log(`Generated: ${format.filename}`);
});

console.log('\nSample bank statements generated in test-bank-statements/ directory');
console.log('You can use these CSV files to test the bank comparison feature.');
console.log('\nFormats available:');
console.log('1. standard - Full format with all columns');
console.log('2. simple - Basic format with date, description, amount');
console.log('3. detailed - Detailed format with uppercase headers'); 