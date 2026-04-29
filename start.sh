#!/bin/bash

# Jurasec POS Startup Script

echo "🚀 Starting Jurasec POS..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if dist exists
if [ ! -d "dist" ]; then
    echo "🔨 Building application..."
    npx vite build
    node build-electron.js
    echo ""
fi

# Start the application
echo "✅ Launching Jurasec POS..."
echo ""
npx electron .
