# AWS EC2 File Upload Guide

Here are all the methods to upload your testimonial application files to your EC2 instance (54.204.209.167):

## 🚀 Method 1: AWS Systems Manager (Recommended - No SSH keys needed)

### Prerequisites:
- AWS CLI configured
- EC2 instance has SSM agent installed
- IAM role with SSM permissions

### Steps:
```bash
# 1. Get your instance ID
aws ec2 describe-instances --filters "Name=ip-address,Values=54.204.209.167" --query 'Reservations[*].Instances[*].InstanceId' --output text

# 2. Connect via Session Manager
aws ssm start-session --target YOUR_INSTANCE_ID --region YOUR_REGION

# 3. Once connected, create directories and upload files
mkdir -p /opt/testimonial-app
exit

# 4. Upload files using AWS CLI
aws ssm send-command \
  --instance-ids YOUR_INSTANCE_ID \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["mkdir -p /opt/testimonial-app"]' \
  --region YOUR_REGION
```

## 🔑 Method 2: Add SSH Key and Upload

### Step 1: Get your instance details
```bash
# Find your instance ID
aws ec2 describe-instances --filters "Name=ip-address,Values=54.204.209.167" --query 'Reservations[*].Instances[*].InstanceId' --output text
```

### Step 2: Add SSH key using AWS CLI
```bash
# Add the public key to your instance
aws ec2-instance-connect send-ssh-public-key \
  --instance-id YOUR_INSTANCE_ID \
  --availability-zone YOUR_AZ \
  --instance-os-user ec2-user \
  --ssh-public-key file://~/.ssh/ec2-key.pub \
  --region YOUR_REGION
```

### Step 3: Upload files
```bash
# Upload deployment script
scp -i ~/.ssh/ec2-key deploy.sh ec2-user@54.204.209.167:~/

# Upload entire project
scp -i ~/.ssh/ec2-key -r . ec2-user@54.204.209.167:/opt/testimonial-app/
```

## 🌐 Method 3: AWS Console + CloudShell

### Step 1: Use AWS CloudShell
1. Go to AWS Console
2. Open CloudShell (top right)
3. Upload your files to CloudShell
4. Use SCP to transfer to EC2

### Step 2: Transfer files
```bash
# In CloudShell
scp -i your-key.pem deploy.sh ec2-user@54.204.209.167:~/
scp -i your-key.pem -r . ec2-user@54.204.209.167:/opt/testimonial-app/
```

## 📦 Method 4: S3 + EC2 Download

### Step 1: Upload to S3
```bash
# Create S3 bucket
aws s3 mb s3://testimonial-app-deployment

# Upload files
aws s3 cp deploy.sh s3://testimonial-app-deployment/
aws s3 cp --recursive . s3://testimonial-app-deployment/app/
```

### Step 2: Download on EC2
```bash
# Connect to EC2 and download
aws s3 cp s3://testimonial-app-deployment/deploy.sh ~/
aws s3 cp --recursive s3://testimonial-app-deployment/app/ /opt/testimonial-app/
```

## 🔧 Method 5: Manual Setup via AWS Console

### Step 1: Connect via AWS Console
1. Go to EC2 Console
2. Select your instance
3. Click "Connect" → "Session Manager"
4. Connect to instance

### Step 2: Manual file creation
```bash
# Create directories
sudo mkdir -p /opt/testimonial-app
sudo chown ec2-user:ec2-user /opt/testimonial-app

# Create deployment script manually
cat > /opt/testimonial-app/deploy.sh << 'EOF'
#!/bin/bash
# Your deployment script content here
EOF
```

## 🎯 Quick Start (Try this first):

### Option A: If you have AWS CLI configured
```bash
# 1. Get your instance ID
INSTANCE_ID=$(aws ec2 describe-instances --filters "Name=ip-address,Values=54.204.209.167" --query 'Reservations[*].Instances[*].InstanceId' --output text)

# 2. Add SSH key
aws ec2-instance-connect send-ssh-public-key \
  --instance-id $INSTANCE_ID \
  --availability-zone us-east-1a \
  --instance-os-user ec2-user \
  --ssh-public-key file://~/.ssh/ec2-key.pub

# 3. Upload files
scp -i ~/.ssh/ec2-key deploy.sh ec2-user@54.204.209.167:~/
scp -i ~/.ssh/ec2-key -r . ec2-user@54.204.209.167:/opt/testimonial-app/
```

### Option B: Use AWS Console
1. Go to EC2 Console
2. Find your instance (54.204.209.167)
3. Click "Connect" → "Session Manager"
4. Once connected, manually create the files

## 🔍 Troubleshooting:

### If SSH key doesn't work:
```bash
# Check if instance supports EC2 Instance Connect
aws ec2 describe-instances --instance-ids YOUR_INSTANCE_ID --query 'Reservations[*].Instances[*].InstanceType'
```

### If Systems Manager doesn't work:
1. Check if SSM agent is installed
2. Verify IAM role has SSM permissions
3. Check security groups allow SSM

### If S3 method doesn't work:
1. Ensure EC2 has IAM role with S3 permissions
2. Check if S3 bucket exists and is accessible

## 📋 Next Steps After Upload:

Once files are uploaded:
```bash
# SSH into instance
ssh -i ~/.ssh/ec2-key ec2-user@54.204.209.167

# Run deployment
chmod +x deploy.sh
./deploy.sh
```

Your application will be available at `http://54.204.209.167:12345` 