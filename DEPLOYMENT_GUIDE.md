# 🚀 Vercel Deployment Guide

## 📋 Prerequisites

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

## 🔧 Deployment Steps

### **Step 1: Build the Application**
```bash
# Build the React client
cd client
npm run build
cd ..

# Install all dependencies
npm run install-all
```

### **Step 2: Deploy to Vercel**
```bash
# Deploy to Vercel
vercel --prod
```

### **Step 3: Configure Environment Variables**
After deployment, go to your Vercel dashboard and add these environment variables:

```env
NODE_ENV=production
PORT=5001
```

## 🎯 **Quick Deployment Commands**

```bash
# 1. Build the client
cd client && npm run build && cd ..

# 2. Deploy to Vercel
vercel --prod

# 3. Get your deployment URL
vercel ls
```

## 📊 **Expected Result**

After successful deployment, you'll get:
- ✅ **Production URL**: `https://your-app.vercel.app`
- ✅ **API Endpoints**: `https://your-app.vercel.app/api/*`
- ✅ **Frontend**: `https://your-app.vercel.app`

## 🔧 **Post-Deployment Configuration**

### **1. Email Integration Setup**
1. Go to your deployed app
2. Navigate to "Email Settings"
3. Configure Gmail with App Password
4. Test the connection

### **2. Database Setup**
- SQLite database will be created automatically
- Data persists between deployments
- No additional configuration needed

## 🚨 **Important Notes**

### **Email Integration on Vercel**
- **IMAP connections** work on Vercel
- **Automatic processing** runs every 5 minutes
- **Manual processing** available via UI

### **File Uploads**
- **PDF receipts**: Stored temporarily
- **CSV bank statements**: Processed and stored in database
- **No permanent file storage** (use cloud storage for production)

### **Database**
- **SQLite**: Lightweight, perfect for demo
- **Production**: Consider PostgreSQL or MongoDB
- **Data persistence**: Configure external database for production

## 🎉 **Success Indicators**

When deployment is successful:
- ✅ **App loads** without errors
- ✅ **API endpoints** respond correctly
- ✅ **File uploads** work
- ✅ **Email integration** functions
- ✅ **Bank comparison** works

## 🔗 **Share Your App**

Once deployed, share your Vercel URL:
```
https://your-app-name.vercel.app
```

## 🆘 **Troubleshooting**

### **Build Errors**
```bash
# Clear cache and rebuild
rm -rf client/build
cd client && npm run build && cd ..
```

### **Deployment Issues**
```bash
# Check Vercel logs
vercel logs

# Redeploy
vercel --prod --force
```

### **API Issues**
- Check environment variables in Vercel dashboard
- Verify API routes are working
- Test endpoints individually

## 🎯 **Final Checklist**

- ✅ **Application builds** successfully
- ✅ **Vercel deployment** completes
- ✅ **Environment variables** configured
- ✅ **API endpoints** respond
- ✅ **Email integration** works
- ✅ **File uploads** function
- ✅ **Database** stores data

**Your Email Receipt Reader is now live on Vercel!** 🚀 