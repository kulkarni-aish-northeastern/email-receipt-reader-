#!/bin/bash

echo "🚀 Building Email Receipt Reader..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd client && npm install && cd ..

# Build the client
echo "🔨 Building React client..."
cd client && npm run build && cd ..

# Check if build was successful
if [ -f "client/build/index.html" ]; then
    echo "✅ Build successful! Client files created."
    ls -la client/build/
else
    echo "❌ Build failed! Client files not found."
    exit 1
fi

echo "�� Build complete!" 