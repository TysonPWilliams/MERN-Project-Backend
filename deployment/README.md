# Deployment Setup Guide

This guide explains how to set up the CD pipeline to deploy your backend to AWS EC2.

## Prerequisites

1. AWS EC2 instance running Ubuntu/Amazon Linux
2. AWS S3 bucket for deployment artifacts
3. GitHub repository secrets configured
4. Node.js installed on EC2 instance

## Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

### AWS Configuration
- `AWS_ACCESS_KEY_ID` - AWS access key with S3 and EC2 permissions
- `AWS_SECRET_ACCESS_KEY` - AWS secret access key
- `AWS_REGION` - AWS region (e.g., us-east-1)
- `S3_BUCKET_NAME` - S3 bucket name for deployment artifacts

### EC2 Configuration
- `EC2_HOST` - EC2 instance public IP or domain name
- `EC2_USERNAME` - SSH username (usually ubuntu or ec2-user)
- `EC2_PRIVATE_KEY` - Private key content for SSH access
- `EC2_PORT` - SSH port (usually 22)

### Application Configuration
- `PROD_PORT` - Port for production application (e.g., 3001)
- `PROD_DATABASE_URL` - MongoDB connection string for production
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGIN` - Allowed CORS origin for frontend

### Notification (Optional)
- `DISCORD_WEBHOOK_URL` - Discord webhook for deployment notifications

## EC2 Instance Setup

1. Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. Install AWS CLI:
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

3. Configure AWS CLI with IAM user credentials that have S3 access

4. Create systemd service:
```bash
sudo cp /home/ubuntu/app/deployment/backend-app.service /etc/systemd/system/
sudo systemctl daemon-reload
```

## Security Setup

### IAM Policy for GitHub Actions

Create an IAM user with this policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME"
        }
    ]
}
```

### EC2 Security Group

Ensure your EC2 security group allows:
- SSH (port 22) from GitHub Actions IP ranges
- HTTP (port 3001 or your PROD_PORT) from your frontend/load balancer

## Environment-Specific Settings

The deployment creates a production `.env` file with:
- `NODE_ENV=production`
- `PORT` from `PROD_PORT` secret
- `DATABASE_URL` from `PROD_DATABASE_URL` secret
- `JWT_SECRET` from GitHub secret
- `CORS_ORIGIN` from GitHub secret

## Database Configuration

### MongoDB Atlas (Recommended for students)
1. Create a free MongoDB Atlas cluster
2. Add EC2 instance IP to IP whitelist
3. Create database user with read/write permissions
4. Use connection string in `PROD_DATABASE_URL` secret

### Self-hosted MongoDB
If running MongoDB on the same EC2 instance:
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

Use connection string: `mongodb://localhost:27017/your-database-name`

## Deployment Process

1. Push to main branch triggers CI tests
2. If tests pass, CD workflow starts automatically
3. Application is packaged and uploaded to S3
4. EC2 instance downloads and deploys new version
5. Service is restarted with zero-downtime deployment
6. Health check confirms successful deployment
7. Discord notification sent (if configured)

## Monitoring and Troubleshooting

### Check service status:
```bash
sudo systemctl status backend-app
```

### View application logs:
```bash
sudo journalctl -u backend-app -f
```

### Manual deployment rollback:
```bash
cd /home/ubuntu/backups
tar -xzf backup-YYYYMMDD-HHMMSS.tar.gz -C /home/ubuntu/app/
sudo systemctl restart backend-app
```

## Cost Optimization Tips

1. Use t2.micro or t3.micro EC2 instances (free tier eligible)
2. Use MongoDB Atlas free tier (512MB storage)
3. Configure S3 lifecycle policies to delete old deployments
4. Stop EC2 instance when not actively developing (remember to restart)

## Security Best Practices

1. Use IAM roles instead of access keys when possible
2. Regularly rotate GitHub secrets
3. Enable EC2 CloudTrail logging
4. Use VPC with private subnets for database
5. Enable automatic security updates on EC2
6. Use HTTPS with SSL certificates (Let's Encrypt)
