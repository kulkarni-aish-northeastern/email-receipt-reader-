# Sample Files for Testing

This guide provides sample files you can use to test the Email Receipt Reader application.

## 📄 Sample Receipt PDFs

### How to Convert Text to PDF

1. **Online Conversion**: Use online tools like:
   - [PDF24](https://tools.pdf24.org/en/text-to-pdf)
   - [SmallPDF](https://smallpdf.com/text-to-pdf)
   - [ILovePDF](https://www.ilovepdf.com/text_to_pdf)

2. **Copy the text content** from the `.txt` files in `sample-receipts/` folder
3. **Paste into the converter** and download as PDF
4. **Upload the PDF** to test the receipt parsing

### Sample Receipts Available:

#### 1. Walmart Receipt (`receipt-1-walmart.txt`)
- **Merchant**: WALMART
- **Amount**: $58.01
- **Date**: 12/15/2023
- **Category**: Retail

#### 2. Starbucks Receipt (`receipt-2-starbucks.txt`)
- **Merchant**: STARBUCKS COFFEE
- **Amount**: $7.75
- **Date**: 12/15/2023
- **Category**: Food & Dining

#### 3. Target Receipt (`receipt-3-target.txt`)
- **Merchant**: TARGET ELECTRONICS
- **Amount**: $89.99
- **Date**: 12/16/2023
- **Category**: Electronics

#### 4. McDonald's Receipt (`receipt-4-mcdonalds.txt`)
- **Merchant**: MCDONALDS BURGER
- **Amount**: $12.45
- **Date**: 12/17/2023
- **Category**: Food & Dining

## 📊 Sample Bank Statement CSVs

### Ready-to-use CSV files:

#### 1. `bank-statement-1.csv` - Full Format
- Includes: Date, Description, Amount, Type, Category
- **Matching transactions**: Walmart ($58.01), Starbucks ($7.75), Target ($89.99), McDonald's ($12.45)
- **Non-matching**: Additional transactions for testing

#### 2. `bank-statement-2.csv` - Simple Format
- Includes: date, description, amount (with negative values)
- **Matching transactions**: Same as above
- **Format**: Uses negative amounts for debits

#### 3. `bank-statement-3.csv` - Uppercase Headers
- Includes: DATE, DESC, AMOUNT, TYPE
- **Matching transactions**: Same as above
- **Format**: Uppercase headers, uppercase transaction types

## 🧪 Testing Scenarios

### Scenario 1: Perfect Matches
1. Convert `receipt-1-walmart.txt` to PDF
2. Upload the PDF to the receipt reader
3. Upload `bank-statement-1.csv` to the bank comparison
4. **Expected Result**: 4 matching transactions

### Scenario 2: Amount Tolerance
1. Convert `receipt-2-starbucks.txt` to PDF (amount: $7.75)
2. Upload the PDF to the receipt reader
3. Upload `bank-statement-2.csv` (amount: -$7.75)
4. **Expected Result**: 1 matching transaction (tolerance: < $0.01)

### Scenario 3: Date Tolerance
1. Convert `receipt-3-target.txt` to PDF (date: 12/16/2023)
2. Upload the PDF to the receipt reader
3. Upload `bank-statement-3.csv` (date: 12/16/2023)
4. **Expected Result**: 1 matching transaction (tolerance: ±3 days)

### Scenario 4: No Matches
1. Convert `receipt-4-mcdonalds.txt` to PDF
2. Upload the PDF to the receipt reader
3. Upload a CSV with different amounts/dates
4. **Expected Result**: 0 matching transactions

## 🔧 Testing Steps

### Local Testing:
1. Start the application: `npm run dev`
2. Open http://localhost:3000
3. Upload sample PDFs and CSVs
4. Check the comparison results

### Live Testing:
1. Deploy to Vercel
2. Upload the same sample files
3. Verify the results match local testing

## 📋 Expected Results

### Receipt Upload Results:
- **Walmart**: Merchant: "WALMART", Amount: $58.01, Category: "Retail"
- **Starbucks**: Merchant: "STARBUCKS COFFEE", Amount: $7.75, Category: "Food & Dining"
- **Target**: Merchant: "TARGET ELECTRONICS", Amount: $89.99, Category: "Electronics"
- **McDonald's**: Merchant: "MCDONALDS BURGER", Amount: $12.45, Category: "Food & Dining"

### Bank Comparison Results:
- **Matching Transactions**: 4 transactions (Walmart, Starbucks, Target, McDonald's)
- **Ledger Only**: Receipts uploaded but not in bank statement
- **Bank Only**: Bank transactions not matched to receipts

## 🚨 Troubleshooting

### PDF Upload Issues:
- Ensure PDF is not corrupted
- Check file size (should be < 10MB)
- Verify PDF contains readable text (not just images)

### CSV Upload Issues:
- Ensure CSV has correct headers
- Check date format (MM/DD/YYYY)
- Verify amount format (numbers only)

### Matching Issues:
- Check amount tolerance (±$0.01)
- Check date tolerance (±3 days)
- Verify merchant name matching

## 📁 File Structure

```
sample-receipts/
├── receipt-1-walmart.txt
├── receipt-2-starbucks.txt
├── receipt-3-target.txt
└── receipt-4-mcdonalds.txt

sample-bank-statements/
├── bank-statement-1.csv
├── bank-statement-2.csv
└── bank-statement-3.csv
```

Use these files to thoroughly test all functionality of your Email Receipt Reader application! 