#!/bin/bash

# Simple deployment script for EC2 instance
# Run this after you have SSH access to your EC2 instance

EC2_IP="54.204.209.167"
SSH_KEY="~/.ssh/ec2-key"

echo "🚀 Deploying to EC2 instance: $EC2_IP"

# Upload deployment script
echo "📤 Uploading deployment script..."
scp -i $SSH_KEY deploy.sh ec2-user@$EC2_IP:~/

# Upload entire project
echo "📤 Uploading project files..."
scp -i $SSH_KEY -r . ec2-user@$EC2_IP:/opt/testimonial-app/

# SSH into instance and run deployment
echo "🔧 Running deployment on EC2..."
ssh -i $SSH_KEY ec2-user@$EC2_IP << 'EOF'
chmod +x deploy.sh
./deploy.sh
EOF

echo "✅ Deployment completed!"
echo "🌐 Your application should be available at:"
echo "   http://$EC2_IP:12345"
echo "   http://$EC2_IP (via nginx)" 