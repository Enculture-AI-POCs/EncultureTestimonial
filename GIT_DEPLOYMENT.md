# Git-based Deployment Guide for EC2

This guide will help you deploy your testimonial application using Git on your EC2 instance (54.204.209.167).

## 🚀 Quick Start (Recommended)

### Step 1: Connect to your EC2 instance
1. **Go to AWS Console** → EC2 → Instances
2. **Find your instance** (54.204.209.167)
3. **Click "Connect"** → **"Session Manager"**
4. **Click "Connect"** to open terminal

### Step 2: Run the environment setup
```bash
# Create and run the setup script
cat > setup-git-deploy.sh << 'EOF'
#!/bin/bash

echo "🚀 Setting up Git-based deployment for Testimonial Survey App..."

# Update system
sudo dnf update -y

# Install Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install MongoDB
sudo tee /etc/yum.repos.d/mongodb-org-6.0.repo << EOF
[mongodb-org-6.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2/mongodb-org/6.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-6.0.asc
EOF

sudo dnf install -y mongodb-org

# Create MongoDB data directory
sudo mkdir -p /var/lib/mongo
sudo mkdir -p /var/log/mongodb
sudo chown -R mongod:mongod /var/lib/mongo
sudo chown -R mongod:mongod /var/log/mongodb

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install nginx
sudo dnf install -y nginx

# Configure firewall
sudo systemctl start firewalld
sudo systemctl enable firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=12345/tcp
sudo firewall-cmd --reload

# Create application directory
sudo mkdir -p /opt/testimonial-app
sudo chown ec2-user:ec2-user /opt/testimonial-app

echo "✅ Environment setup completed!"
EOF

chmod +x setup-git-deploy.sh
./setup-git-deploy.sh
```

### Step 3: Clone your repository
```bash
# Navigate to app directory
cd /opt/testimonial-app

# Clone your Git repository (replace with your actual URL)
git clone https://github.com/yourusername/testimonial-survey-app.git .

# OR for private repositories with authentication
# git clone https://username:token@github.com/yourusername/testimonial-survey-app.git .
```

### Step 4: Install dependencies and build
```bash
# Install server dependencies
npm install

# Install client dependencies and build
cd client
npm install
npm run build
cd ..
```

### Step 5: Create environment file
```bash
# Create .env file
cat > .env << EOF
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/testimonial-survey

# Server Port
PORT=12345

# Optional: JWT Secret (if implementing authentication)
# JWT_SECRET=your-secret-key-here
EOF
```

### Step 6: Start the application
```bash
# Start with PM2
pm2 start server.js --name testimonial-app

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Step 7: Configure nginx
```bash
# Create nginx configuration
sudo tee /etc/nginx/conf.d/testimonial-app << EOF
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

# Remove default nginx config
sudo rm -f /etc/nginx/conf.d/default.conf

# Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 🔄 Updating Your Application

### Method 1: Manual Update
```bash
cd /opt/testimonial-app

# Pull latest changes
git pull origin main

# Install/update dependencies
npm install
cd client && npm install && npm run build && cd ..

# Restart application
pm2 restart testimonial-app
```

### Method 2: Automated Update Script
```bash
# Create update script
cat > /opt/testimonial-app/update.sh << 'EOF'
#!/bin/bash
set -e

echo "🔄 Updating Testimonial Survey App from Git..."

cd /opt/testimonial-app

# Pull latest changes from Git
git pull origin main

# Install/update dependencies
npm install
cd client && npm install && npm run build && cd ..

# Restart application
pm2 restart testimonial-app

echo "✅ Update completed successfully!"
EOF

chmod +x /opt/testimonial-app/update.sh

# Run update
./update.sh
```

## 🔧 Useful Commands

### PM2 Management
```bash
# Check status
pm2 status

# View logs
pm2 logs testimonial-app

# Restart app
pm2 restart testimonial-app

# Stop app
pm2 stop testimonial-app
```

### MongoDB Management
```bash
# Check status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Stop MongoDB
sudo systemctl stop mongod

# View logs
sudo journalctl -u mongod -f
```

### Nginx Management
```bash
# Check status
sudo systemctl status nginx

# Restart nginx
sudo systemctl restart nginx

# Test configuration
sudo nginx -t

# View logs
sudo tail -f /var/log/nginx/access.log
```

## 🔍 Health Check

Create a health check script:
```bash
cat > /opt/testimonial-app/health-check.sh << 'EOF'
#!/bin/bash

APP_URL="http://localhost:12345"
MONGO_STATUS=$(sudo systemctl is-active mongod)

echo "=== Health Check ==="
echo "MongoDB Status: $MONGO_STATUS"
echo "PM2 Status:"
pm2 status
echo "Application Status:"
curl -s -o /dev/null -w "%{http_code}" $APP_URL || echo "Failed to connect"
echo ""
EOF

chmod +x /opt/testimonial-app/health-check.sh

# Run health check
./health-check.sh
```

## 🌐 Access Your Application

After deployment, your application will be available at:

- **Direct access**: `http://54.204.209.167:12345`
- **Via nginx**: `http://54.204.209.167` (port 80)

## 🔒 Security Considerations

### 1. Git Repository Security
- Use private repositories for sensitive code
- Use SSH keys or personal access tokens for authentication
- Never commit sensitive data (passwords, API keys)

### 2. Environment Variables
- Store sensitive configuration in `.env` file
- Never commit `.env` files to Git
- Use different configurations for development and production

### 3. Firewall Configuration
- Only open necessary ports (22, 80, 12345)
- Consider using HTTPS in production
- Regularly update security groups

## 📋 Troubleshooting

### Common Issues

1. **Git clone fails:**
   ```bash
   # Check if Git is installed
   git --version
   
   # Check network connectivity
   ping github.com
   ```

2. **npm install fails:**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Check Node.js version
   node --version
   ```

3. **PM2 app not starting:**
   ```bash
   # Check logs
   pm2 logs testimonial-app
   
   # Check if port is in use
   sudo ss -tlnp | grep 12345
   ```

4. **MongoDB connection issues:**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   
   # Check MongoDB logs
   sudo journalctl -u mongod -f
   ```

## 🎯 Next Steps

1. **Set up automatic deployments** using GitHub Actions or AWS CodeDeploy
2. **Configure monitoring** with CloudWatch or PM2 monitoring
3. **Set up backups** for MongoDB data
4. **Configure SSL/TLS** for HTTPS
5. **Set up domain name** and configure DNS

Your application is now ready for Git-based deployment and updates! 