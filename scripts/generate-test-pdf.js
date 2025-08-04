const fs = require('fs');
const path = require('path');

// Simple HTML to PDF conversion using a basic receipt template
function generateReceiptHTML(merchant, amount, date, items = []) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { text-align: center; margin-bottom: 20px; }
    .merchant { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    .date { font-size: 14px; color: #666; }
    .items { margin: 20px 0; }
    .item { display: flex; justify-content: space-between; margin: 5px 0; }
    .total { font-size: 18px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; margin-top: 20px; }
    .amount { text-align: right; }
  </style>
</head>
<body>
  <div class="header">
    <div class="merchant">${merchant}</div>
    <div class="date">Date: ${date}</div>
  </div>
  
  <div class="items">
    ${items.map(item => `
      <div class="item">
        <span>${item.name}</span>
        <span>$${item.price.toFixed(2)}</span>
      </div>
    `).join('')}
  </div>
  
  <div class="total">
    <div class="item">
      <span>Total</span>
      <span class="amount">$${amount.toFixed(2)}</span>
    </div>
  </div>
</body>
</html>
  `;
}

// Sample receipts
const receipts = [
  {
    merchant: 'WALMART',
    amount: 58.01,
    date: '12/15/2023',
    items: [
      { name: 'Groceries', price: 45.67 },
      { name: 'Household Items', price: 12.34 }
    ]
  },
  {
    merchant: 'STARBUCKS',
    amount: 7.75,
    date: '12/16/2023',
    items: [
      { name: 'Coffee', price: 4.50 },
      { name: 'Pastry', price: 3.25 }
    ]
  },
  {
    merchant: 'TARGET',
    amount: 89.99,
    date: '12/17/2023',
    items: [
      { name: 'Electronics', price: 79.99 },
      { name: 'Accessories', price: 10.00 }
    ]
  },
  {
    merchant: 'MCDONALD',
    amount: 12.45,
    date: '12/18/2023',
    items: [
      { name: 'Burger Combo', price: 8.99 },
      { name: 'Fries', price: 2.99 },
      { name: 'Drink', price: 0.47 }
    ]
  }
];

// Create test directory
const testDir = path.join(__dirname, '../test-receipts');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// Generate HTML files (you can convert these to PDF using browser or online tools)
receipts.forEach((receipt, index) => {
  const html = generateReceiptHTML(
    receipt.merchant,
    receipt.amount,
    receipt.date,
    receipt.items
  );
  
  const filename = `receipt-${index + 1}-${receipt.merchant.toLowerCase()}.html`;
  const filepath = path.join(testDir, filename);
  
  fs.writeFileSync(filepath, html);
  console.log(`Generated: ${filename}`);
});

console.log('\nTest receipts generated in test-receipts/ directory');
console.log('To convert to PDF:');
console.log('1. Open the HTML files in a browser');
console.log('2. Print to PDF (Ctrl+P or Cmd+P)');
console.log('3. Save as PDF files');
console.log('\nOr use online HTML to PDF converters'); 