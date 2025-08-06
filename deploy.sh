#!/bin/bash

echo "🚀 Deploying Email Receipt Reader..."

# Build the client
echo "📦 Building React client..."
cd client && npm run build && cd ..

# Deploy backend to Railway
echo "🔧 Deploying backend to Railway..."
railway up

# Get the Railway URL
echo "🔗 Getting Railway URL..."
RAILWAY_URL=$(railway status --json | grep -o '"url":"[^"]*"' | cut -d'"' -f4)

echo "✅ Backend deployed to: $RAILWAY_URL"

# Update Netlify config with Railway URL
echo "🔧 Updating Netlify config..."
sed -i '' "s|your-backend-url.railway.app|${RAILWAY_URL#https://}|g" netlify.toml

echo "🎉 Deployment complete!"
echo "📱 Frontend: Deploy to Netlify manually"
echo "🔧 Backend: $RAILWAY_URL"
echo ""
echo "Next steps:"
echo "1. Go to netlify.com"
echo "2. Connect your GitHub repo"
echo "3. Set build command: cd client && npm run build"
echo "4. Set publish directory: client/build" 