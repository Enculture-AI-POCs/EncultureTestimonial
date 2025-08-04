#!/bin/bash

# Quick Update Script for Testimonial Survey App
# This script updates the application without a full reinstall

set -e

echo "🔄 Quick Update - Testimonial Survey App"

# Navigate to app directory
cd /opt/testimonial-app

# Stop the application
pm2 stop testimonial-app

# Remove old node_modules and package-lock files
echo "🧹 Cleaning old node files..."
rm -rf node_modules package-lock.json
rm -rf client/node_modules client/package-lock.json

# Install/update server dependencies
echo "📦 Installing server dependencies..."
npm install

# Install/update client dependencies and build
echo "📦 Installing client dependencies..."
cd client
npm install
echo "🔨 Building React application..."
npm run build
cd ..

# Start the application
echo "🚀 Starting application..."
pm2 start testimonial-app

# Save PM2 configuration
pm2 save

echo "✅ Quick update completed successfully!"
echo "📊 Application status:"
pm2 status testimonial-app 