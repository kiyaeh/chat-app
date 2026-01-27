# 🚀 AWS Deployment Guide for Beginners

This guide will walk you through deploying your chat application to AWS from scratch.

## 📋 Prerequisites

### 1. AWS Account Setup
1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Click "Create an AWS Account"
3. Follow the registration process
4. **Important**: Set up billing alerts to avoid unexpected charges

### 2. Install Required Tools

#### AWS CLI
```bash
# Windows (using chocolatey)
choco install awscli

# Or download from: https://aws.amazon.com/cli/
```

#### Terraform
```bash
# Windows (using chocolatey)
choco install terraform

# Or download from: https://terraform.io/downloads
```

#### Docker Desktop
- Download from: https://www.docker.com/products/docker-desktop

## 🔐 Step 1: AWS Account Configuration

### 1.1 Create IAM User
1. Login to AWS Console
2. Go to **IAM** service
3. Click **Users** → **Add User**
4. Username: `chatapp-deploy`
5. Access type: **Programmatic access**
6. Attach policies:
   - `AmazonEC2ContainerRegistryFullAccess`
   - `AmazonECS_FullAccess`
   - `AmazonRDSFullAccess`
   - `ElastiCacheFullAccess`
   - `AmazonVPCFullAccess`
   - `IAMFullAccess`
   - `CloudWatchFullAccess`
7. **Save the Access Key ID and Secret Access Key**

### 1.2 Configure AWS CLI
```bash
aws configure
# AWS Access Key ID: [paste your key]
# AWS Secret Access Key: [paste your secret]
# Default region name: us-east-1
# Default output format: json
```

### 1.3 Verify Configuration
```bash
aws sts get-caller-identity
```

## 🏗️ Step 2: Infrastructure Deployment

### 2.1 Create S3 Bucket for Terraform State
```bash
# Create bucket (replace 'your-unique-name' with something unique)
aws s3 mb s3://chatapp-terraform-state-your-unique-name --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket chatapp-terraform-state-your-unique-name \
  --versioning-configuration Status=Enabled
```

### 2.2 Update Terraform Backend Configuration
Update `infrastructure/terraform/main.tf`:
```hcl
backend "s3" {
  bucket = "chatapp-terraform-state-your-unique-name"  # Use your bucket name
  key    = "terraform.tfstate"
  region = "us-east-1"
}
```

### 2.3 Deploy Infrastructure
```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Create terraform.tfvars file
echo 'db_password = "YourSecurePassword123!"' > terraform.tfvars
echo 'jwt_secret = "your-super-secret-jwt-key-change-this"' >> terraform.tfvars

# Plan deployment (review what will be created)
terraform plan

# Apply infrastructure (type 'yes' when prompted)
terraform apply
```

**Expected Resources Created:**
- VPC with public/private subnets
- RDS PostgreSQL database
- ElastiCache Redis cluster
- ECS cluster
- Application Load Balancer
- ECR repositories
- Security groups
- IAM roles

### 2.4 Save Important Outputs
```bash
# Get important information
terraform output
```

## 🐳 Step 3: Build and Push Docker Images

### 3.1 Get ECR Login
```bash
# Get your account ID
aws sts get-caller-identity --query Account --output text

# Login to ECR (replace ACCOUNT_ID with your actual account ID)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

### 3.2 Build and Push API Image
```bash
cd server

# Build image
docker build -t chatapp-api .

# Tag image (replace ACCOUNT_ID)
docker tag chatapp-api:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/chatapp-api:latest

# Push image
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/chatapp-api:latest
```

### 3.3 Build and Push Client Image
```bash
cd ../client

# Build image
docker build -t chatapp-client .

# Tag image (replace ACCOUNT_ID)
docker tag chatapp-client:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/chatapp-client:latest

# Push image
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/chatapp-client:latest
```

## 🚀 Step 4: Deploy Application

### 4.1 Update ECS Services
```bash
# Force new deployment
aws ecs update-service \
  --cluster chatapp-cluster \
  --service chatapp-api-service \
  --force-new-deployment

aws ecs update-service \
  --cluster chatapp-cluster \
  --service chatapp-client-service \
  --force-new-deployment
```

### 4.2 Wait for Deployment
```bash
# Wait for services to be stable
aws ecs wait services-stable \
  --cluster chatapp-cluster \
  --services chatapp-api-service chatapp-client-service
```

### 4.3 Get Application URL
```bash
# Get load balancer DNS name
aws elbv2 describe-load-balancers \
  --names chatapp-alb \
  --query 'LoadBalancers[0].DNSName' \
  --output text
```

## 🔍 Step 5: Verify Deployment

### 5.1 Check ECS Services
```bash
# Check service status
aws ecs describe-services \
  --cluster chatapp-cluster \
  --services chatapp-api-service chatapp-client-service
```

### 5.2 Check Application Health
```bash
# Test API health (replace DNS_NAME with your load balancer DNS)
curl http://DNS_NAME/api/health

# Expected response: {"status":"ok","timestamp":"...","uptime":...}
```

### 5.3 Access Application
- **Frontend**: `http://YOUR_LOAD_BALANCER_DNS`
- **API Docs**: `http://YOUR_LOAD_BALANCER_DNS/api/docs`

## 🔧 Step 6: GitHub Actions Setup

### 6.1 Add GitHub Secrets
Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:
- `AWS_ACCESS_KEY_ID`: Your IAM user access key
- `AWS_SECRET_ACCESS_KEY`: Your IAM user secret key
- `DB_PASSWORD`: Your database password
- `JWT_SECRET`: Your JWT secret

### 6.2 Test CI/CD Pipeline
```bash
# Make a change and push to main branch
git add .
git commit -m "Test deployment"
git push origin main
```

## 📊 Step 7: Monitoring and Logs

### 7.1 View ECS Logs
```bash
# Get log group names
aws logs describe-log-groups --log-group-name-prefix "/ecs/chatapp"

# View API logs
aws logs tail /ecs/chatapp-api --follow

# View Client logs
aws logs tail /ecs/chatapp-client --follow
```

### 7.2 Monitor Resources
- **ECS Console**: Monitor container health
- **RDS Console**: Database performance
- **ElastiCache Console**: Redis metrics
- **CloudWatch**: Application metrics

## 💰 Step 8: Cost Management

### 8.1 Set Up Billing Alerts
1. Go to **CloudWatch** → **Billing**
2. Create alarm for estimated charges
3. Set threshold (e.g., $10/month)

### 8.2 Monitor Costs
- **Cost Explorer**: Analyze spending
- **Budgets**: Set spending limits

### 8.3 Clean Up Resources (When Done Testing)
```bash
# Destroy all resources
cd infrastructure/terraform
terraform destroy
```

## 🚨 Troubleshooting

### Common Issues

#### 1. ECS Tasks Not Starting
```bash
# Check task definition
aws ecs describe-task-definition --task-definition chatapp-api

# Check service events
aws ecs describe-services --cluster chatapp-cluster --services chatapp-api-service
```

#### 2. Database Connection Issues
```bash
# Check RDS status
aws rds describe-db-instances --db-instance-identifier chatapp-postgres

# Check security groups
aws ec2 describe-security-groups --group-names chatapp-rds-sg
```

#### 3. Load Balancer Issues
```bash
# Check target group health
aws elbv2 describe-target-health --target-group-arn TARGET_GROUP_ARN
```

## 📚 Learning Resources

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS CLI Reference](https://docs.aws.amazon.com/cli/)

## 🎯 Next Steps

1. **Custom Domain**: Set up Route 53 for custom domain
2. **SSL Certificate**: Add HTTPS with ACM
3. **Auto Scaling**: Configure ECS auto scaling
4. **Monitoring**: Set up detailed CloudWatch dashboards
5. **Backup Strategy**: Configure automated backups

---

**⚠️ Important**: Always monitor your AWS costs and clean up resources when not needed!