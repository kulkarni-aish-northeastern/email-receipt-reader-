

## 🎯 **Deploy Now**

### **Step 1: Go to Render**
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Click **"New Web Service"**

### **Step 2: Connect Repository**
1. Connect your GitHub repo: `kulkarni-aish-northeastern/email-receipt-reader-`
2. Select the repository

### **Step 3: Configure Settings**
Use these **EXACT** settings:

```
Name: email-receipt-reader
Environment: Node
Build Command: npm run build-all
Start Command: npm start
Plan: Free
```

### **Step 4: Add Environment Variables**
In Render dashboard, add these variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |

### **Step 5: Deploy**
Click **"Create Web Service"**

**Result**: `https://email-receipt-reader.onrender.com`

---

## 🎉 **Test Your Deployment**

Once deployed, test with:

```bash
# Health check
curl https://your-app-url.com/api/health

# Upload test
curl -X POST -F "csv=@sample-bank-statements/bank-statement-1.csv" https://your-app-url.com/api/upload-bank-statement
```


---

