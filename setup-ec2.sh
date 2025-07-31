#!/bin/bash

# Simple EC2 Setup Script for Testimonial Survey App on Amazon Linux 2023
# Run this script on your EC2 instance to set up the environment

echo "🚀 Setting up EC2 environment for Testimonial Survey App on Amazon Linux 2023..."

# Update system
sudo dnf update -y

# Install Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install MongoDB
# Create MongoDB repository file
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

echo "✅ EC2 environment setup completed!"
echo "📝 Next steps:"
echo "1. Upload your application files to /opt/testimonial-app"
echo "2. Run the deploy.sh script"
echo "3. Or manually install dependencies and start the app" 