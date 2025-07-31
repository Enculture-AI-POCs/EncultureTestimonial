#!/bin/bash

# Simple Git-based deployment setup for EC2
# Run this on your EC2 instance after connecting via AWS Console Session Manager

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
echo ""
echo "📝 Next steps:"
echo "1. Navigate to /opt/testimonial-app"
echo "2. Clone your Git repository: git clone YOUR_REPO_URL ."
echo "3. Run: npm install"
echo "4. Run: cd client && npm install && npm run build && cd .."
echo "5. Create .env file with your configuration"
echo "6. Start with PM2: pm2 start server.js --name testimonial-app"
echo ""
echo "🌐 Your app will be available at: http://54.204.209.167:12345" 