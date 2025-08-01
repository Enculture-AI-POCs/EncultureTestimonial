#!/bin/bash

# Testimonial Survey App EC2 Deployment Script for Amazon Linux 2023
# This script sets up and deploys the application on an EC2 instance

set -e  # Exit on any error

echo "🚀 Starting deployment of Testimonial Survey App on Amazon Linux 2023..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Update system packages
print_status "Updating system packages..."
sudo dnf update -y --allowerasing

# Install essential packages
print_status "Installing essential packages..."
sudo dnf install -y curl wget git unzip gcc-c++ make --allowerasing

# Install Node.js 18.x
print_status "Installing Node.js 18.x..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs --allowerasing

# Verify Node.js installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_success "Node.js $NODE_VERSION and npm $NPM_VERSION installed"

# Install PM2 globally
print_status "Installing PM2 process manager..."
sudo npm install -g pm2

# Create application directory
APP_DIR="/opt/testimonial-app"
print_status "Creating application directory at $APP_DIR..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Navigate to app directory (assuming repository is already cloned)
cd $APP_DIR

# Create uploads directory
mkdir -p uploads

# Install server dependencies
print_status "Installing server dependencies..."
npm install

# Install client dependencies and build
print_status "Installing client dependencies..."
cd client
npm install
print_status "Building React application..."
npm run build
cd ..

# Create environment file with MongoDB Atlas connection
print_status "Creating environment configuration..."
cat > .env << EOF
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://ram:c9w8ooSuBKhr80FI@testimonials.g3g5r2f.mongodb.net/?retryWrites=true&w=majority&appName=Testimonials

# Server Port
PORT=12345

# Optional: JWT Secret (if implementing authentication)
# JWT_SECRET=your-secret-key-here
EOF

# Create PM2 ecosystem file
print_status "Creating PM2 configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'testimonial-app',
    script: 'server.js',
    cwd: '$APP_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 12345
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Start application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup

print_warning "Run the following command to complete PM2 startup setup:"
echo "sudo env PATH=\$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME"

# Configure firewall (using firewalld for Amazon Linux)
print_status "Configuring firewall..."
sudo systemctl start firewalld
sudo systemctl enable firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-port=12345/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --reload
print_success "Firewall configured"

# Install and configure nginx
print_status "Installing and configuring nginx..."
sudo dnf install -y nginx --allowerasing

cat > testimonial-app << EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:12345;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo mv testimonial-app /etc/nginx/conf.d/
sudo rm -f /etc/nginx/conf.d/default.conf
sudo systemctl start nginx
sudo systemctl enable nginx

# Create deployment script for future updates
cat > update.sh << 'EOF'
#!/bin/bash
# Update script for future deployments

set -e

echo "🔄 Updating Testimonial Survey App..."

# Navigate to app directory
cd /opt/testimonial-app

# Pull latest changes (if using git)
# git pull origin main

# Install/update dependencies
npm install
cd client && npm install && npm run build && cd ..

# Restart application
pm2 restart testimonial-app

echo "✅ Update completed successfully!"
EOF

chmod +x update.sh

# Create health check script
cat > health-check.sh << 'EOF'
#!/bin/bash
# Health check script

APP_URL="http://localhost:12345"

echo "=== Health Check ==="
echo "PM2 Status:"
pm2 status
echo "Application Status:"
curl -s -o /dev/null -w "%{http_code}" $APP_URL || echo "Failed to connect"
echo ""
EOF

chmod +x health-check.sh

# Display final information
print_success "Deployment completed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "======================"
echo "• Application directory: $APP_DIR"
echo "• MongoDB: Using MongoDB Atlas (cloud database)"
echo "• Node.js: $NODE_VERSION"
echo "• PM2: Application managed by PM2"
echo "• Port: 12345"
echo "• Nginx: Configured as reverse proxy"
echo ""
echo "🔧 Useful Commands:"
echo "• Check app status: pm2 status"
echo "• View logs: pm2 logs testimonial-app"
echo "• Restart app: pm2 restart testimonial-app"
echo "• Health check: ./health-check.sh"
echo "• Update app: ./update.sh"
echo ""
echo "🌐 Access your application at:"
echo "• Local: http://localhost:12345"
echo "• Public: http://$(curl -s ifconfig.me):12345"
echo ""
print_warning "Don't forget to run the PM2 startup command shown above!" 