# EC2 Deployment Guide for Testimonial Survey App

This guide will help you deploy your testimonial survey application on an Amazon EC2 instance.

## Prerequisites

- An EC2 instance running Amazon Linux 2023
- SSH access to your EC2 instance
- Basic knowledge of Linux commands

## Quick Deployment

### Option 1: Automated Deployment (Recommended)

1. **Connect to your EC2 instance:**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

2. **Upload the deployment script:**
   ```bash
   # From your local machine
   scp -i your-key.pem deploy.sh ubuntu@your-ec2-ip:~/
   ```

3. **Make the script executable and run it:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Option 2: Manual Setup

1. **Run the environment setup script:**
   ```bash
   chmod +x setup-ec2.sh
   ./setup-ec2.sh
   ```

2. **Upload your application files:**
   ```bash
   # From your local machine
   scp -i your-key.pem -r . ubuntu@your-ec2-ip:/opt/testimonial-app/
   ```

3. **Install dependencies and start the application:**
   ```bash
   cd /opt/testimonial-app
   npm install
   cd client && npm install && npm run build && cd ..
   pm2 start server.js --name testimonial-app
   pm2 save
   pm2 startup
   ```

## Environment Configuration

The deployment script automatically creates a `.env` file with the following configuration:

```env
MONGODB_URI=mongodb://localhost:27017/testimonial-survey
PORT=12345
```

## Security Groups Configuration

Make sure your EC2 security group allows the following ports:

- **Port 22**: SSH access
- **Port 80**: HTTP (for nginx)
- **Port 12345**: Application port

## Accessing Your Application

After deployment, you can access your application at:

- **Local access**: `http://localhost:12345`
- **Public access**: `http://your-ec2-public-ip:12345`
- **With nginx**: `http://your-ec2-public-ip` (port 80)

## Useful Commands

### PM2 Process Management
```bash
# Check application status
pm2 status

# View logs
pm2 logs testimonial-app

# Restart application
pm2 restart testimonial-app

# Stop application
pm2 stop testimonial-app
```

### MongoDB Management
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Stop MongoDB
sudo systemctl stop mongod

# Check MongoDB logs
sudo journalctl -u mongod -f
```

### Nginx Management
```bash
# Check nginx status
sudo systemctl status nginx

# Restart nginx
sudo systemctl restart nginx

# View nginx logs
sudo tail -f /var/log/nginx/access.log

# Check nginx configuration
sudo nginx -t
```

## Updating Your Application

### Using the Update Script
```bash
cd /opt/testimonial-app
./update.sh
```

### Manual Update
```bash
cd /opt/testimonial-app
# Upload new files or git pull
npm install
cd client && npm install && npm run build && cd ..
pm2 restart testimonial-app
```

## Troubleshooting

### Common Issues

1. **Application not starting:**
   ```bash
   pm2 logs testimonial-app
   ```

2. **MongoDB connection issues:**
   ```bash
   sudo systemctl status mongod
   sudo journalctl -u mongod
   ```

3. **Port already in use:**
   ```bash
   sudo ss -tlnp | grep 12345
   sudo kill -9 <PID>
   ```

4. **Permission issues:**
   ```bash
   sudo chown -R $USER:$USER /opt/testimonial-app
   ```

5. **Firewall issues:**
   ```bash
   sudo firewall-cmd --list-all
   sudo firewall-cmd --permanent --add-port=12345/tcp
   sudo firewall-cmd --reload
   ```

### Health Check
Run the health check script to verify everything is working:
```bash
cd /opt/testimonial-app
./health-check.sh
```

## Monitoring

### PM2 Monitoring
```bash
# Monitor CPU and memory usage
pm2 monit

# View detailed process information
pm2 show testimonial-app
```

### System Monitoring
```bash
# Check system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h
```

## Backup and Recovery

### MongoDB Backup
```bash
# Create backup
mongodump --db testimonial-survey --out /backup/$(date +%Y%m%d)

# Restore backup
mongorestore --db testimonial-survey /backup/YYYYMMDD/testimonial-survey/
```

### Application Backup
```bash
# Backup application files
tar -czf testimonial-app-backup-$(date +%Y%m%d).tar.gz /opt/testimonial-app/
```

## Security Considerations

1. **Change default passwords** for MongoDB and admin accounts
2. **Use HTTPS** in production (configure SSL certificates)
3. **Regular security updates** for the system
4. **Monitor logs** for suspicious activity
5. **Backup regularly** to prevent data loss

## Performance Optimization

1. **Enable nginx caching** for static files
2. **Configure PM2 clustering** for multiple CPU cores
3. **Use MongoDB indexes** for better query performance
4. **Monitor and optimize** database queries
5. **Consider using a CDN** for static assets

## Support

If you encounter issues during deployment:

1. Check the logs: `pm2 logs testimonial-app`
2. Verify services are running: `sudo systemctl status mongod nginx`
3. Check firewall rules: `sudo firewall-cmd --list-all`
4. Verify port accessibility: `sudo ss -tlnp | grep 12345`

For additional help, check the application logs and system logs for error messages. 