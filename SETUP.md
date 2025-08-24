# CI/CD Pipeline Setup Guide

## 🎯 Quick Start

This repository contains a complete CI/CD pipeline implementation using GitHub Actions, AWS EC2, and comprehensive automation workflows.

---

## 📋 Prerequisites

### **Required Accounts & Services**
- GitHub account with repository access
- AWS account with EC2 and S3 services
- Discord webhook URL (for notifications)

### **Local Development**
- Node.js v18.x LTS
- npm package manager
- Git version control
- Docker (for local testing)

---

## ⚙️ GitHub Repository Setup

### **1. Fork/Clone Repository**
```bash
git clone https://github.com/yourusername/MERN-Project-Backend.git
cd MERN-Project-Backend
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Configure GitHub Secrets**
Navigate to **Repository Settings** → **Secrets and variables** → **Actions** and add:

#### **AWS Configuration**
```
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-deployment-bucket
```

#### **EC2 Configuration**
```
EC2_HOST=your-ec2-public-ip
EC2_USERNAME=ec2-user
EC2_PRIVATE_KEY=your-ssh-private-key-content
EC2_PORT=22
```

#### **Application Configuration**
```
PROD_PORT=3000
PROD_DATABASE_URL=mongodb://localhost:27017/production-db
JWT_SECRET=your-jwt-secret-key
CORS_ORIGIN=https://your-frontend-domain.com
```

#### **Notifications**
```
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook
```

---

## ☁️ AWS Infrastructure Setup

### **1. Create EC2 Instance**
```bash
# Instance Configuration
Instance Type: t3.micro (1 vCPU, 1GB RAM)
Operating System: Amazon Linux 2
Security Groups: 
  - SSH (Port 22) from your IP
  - HTTP (Port 3000) for application traffic
Key Pair: Create and download .pem file
```

### **2. Configure EC2 Instance**
SSH into your instance and run:

```bash
# Update system
sudo yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install AWS CLI
sudo yum install -y awscli

# Configure AWS credentials
aws configure
```

### **3. Create SystemD Service**
```bash
sudo tee /etc/systemd/system/backend-app.service > /dev/null <<EOF
[Unit]
Description=Backend Node.js App
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/app
Environment=NODE_ENV=production
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable backend-app
```

### **4. Create S3 Bucket**
```bash
# Create deployment bucket
aws s3 mb s3://your-deployment-bucket

# Set bucket policy for deployment artifacts
aws s3api put-bucket-policy --bucket your-deployment-bucket --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"AWS": "arn:aws:iam::YOUR-ACCOUNT:user/github-actions"},
    "Action": ["s3:GetObject", "s3:PutObject"],
    "Resource": "arn:aws:s3:::your-deployment-bucket/*"
  }]
}'
```

---

## 🔐 Security Configuration

### **1. IAM User for GitHub Actions**
Create IAM user with programmatic access and attach policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-deployment-bucket",
        "arn:aws:s3:::your-deployment-bucket/*"
      ]
    }
  ]
}
```

### **2. SSH Key Configuration**
```bash
# Generate SSH key pair (if needed)
ssh-keygen -t rsa -b 2048 -f ~/.ssh/ec2-keypair

# Copy public key to EC2 instance
ssh-copy-id -i ~/.ssh/ec2-keypair.pub ec2-user@your-ec2-ip

# Add private key content to GitHub Secrets as EC2_PRIVATE_KEY
```

---

## 🧪 Testing the Pipeline

### **1. Verify CI Workflow**
```bash
# Push code to trigger CI
git add .
git commit -m "test: trigger CI pipeline"
git push origin main

# Check GitHub Actions tab for CI execution
```

### **2. Manual Deployment Test**
1. Go to **Actions** tab in GitHub
2. Select **Deploy Backend to AWS EC2 (CD)**
3. Click **Run workflow**
4. Choose parameters:
   - Environment: `production`
   - Skip tests: `false`
   - Reason: `Initial deployment test`

### **3. Verify Application**
```bash
# Check application health
curl http://your-ec2-ip:3000/health

# Test authentication endpoint
curl -X POST http://your-ec2-ip:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

---

## 📊 Monitoring & Maintenance

### **1. Check Service Status**
```bash
# On EC2 instance
sudo systemctl status backend-app
sudo journalctl -u backend-app -f
```

### **2. Monitor Deployment Artifacts**
```bash
# List S3 deployment packages
aws s3 ls s3://your-deployment-bucket/deployments/

# Check latest deployment
aws s3 ls s3://your-deployment-bucket/deployments/ --recursive --human-readable --summarize
```

### **3. Review Logs**
- **GitHub Actions**: Actions tab → Workflow runs → Logs
- **Application**: EC2 instance → `/var/log/` or `journalctl`
- **Discord**: Automated notifications for deployment status

---

## 🚀 Workflow Features

### **Automated CI Pipeline**
- **Triggers**: Push to main/dev, Pull requests
- **Testing**: Docker-based Jest test suite
- **Artifacts**: Test results and coverage reports
- **Notifications**: Discord alerts for test status

### **Intelligent CD Pipeline**
- **Business Hours Deployment**: Monday-Friday, 9AM-6PM UTC
- **Multiple Triggers**: CI success, manual dispatch, scheduled maintenance
- **Environment Management**: Production configuration injection
- **Health Monitoring**: Post-deployment verification

### **Advanced Features**
- **Pre-deployment Validation**: Business hours and CI status checks
- **Deployment Rollback**: Automatic backup and recovery procedures
- **Security**: Encrypted secrets and secure deployment practices
- **Scalability**: Ready for horizontal scaling and load balancing

---

## 📚 Documentation

For detailed information, see:
- `docs/CICD_WORKFLOWS.md` - Complete workflow documentation
- `docs/WORKFLOW_SCENARIOS.md` - Real-world deployment examples
- `docs/WORKFLOW_DIAGRAMS.md` - Visual architecture guides
- `docs/CICD_SERVICES_TECHNOLOGIES.md` - Technology analysis

---

## 🆘 Troubleshooting

### **Common Issues**

#### **CI Tests Failing**
```bash
# Run tests locally
npm test

# Check Docker environment
docker --version
docker compose --version
```

#### **Deployment Connection Issues**
```bash
# Test SSH connection
ssh -i ~/.ssh/keypair.pem ec2-user@your-ec2-ip

# Verify security group allows port 3000
aws ec2 describe-security-groups --group-ids sg-your-security-group
```

#### **Service Won't Start**
```bash
# Check service logs
sudo journalctl -u backend-app --no-pager -n 50

# Verify Node.js installation
node --version
npm --version
```

### **Getting Help**
- Review workflow logs in GitHub Actions
- Check Discord notifications for deployment status
- Monitor EC2 instance health via AWS Console
- Review comprehensive documentation in `/docs/` folder

---

This setup guide ensures successful CI/CD pipeline deployment and operation. All automation workflows are ready for immediate use once configuration is complete.