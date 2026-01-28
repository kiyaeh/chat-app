# 🚀 GitHub Actions Mastery: From Zero to CI/CD Expert

Learn GitHub Actions by building real automation workflows step by step. Every concept explained with practical examples.

## 🎯 What is GitHub Actions?

**GitHub Actions** is like having a robot assistant that automatically does tasks when something happens in your code repository.

**Real-world analogy**: 
- When you push code → Robot tests it
- When tests pass → Robot deploys it
- When someone opens PR → Robot checks code quality

**Why GitHub Actions?**
- **Automation**: No manual testing/deployment
- **Consistency**: Same process every time
- **Speed**: Parallel execution
- **Integration**: Built into GitHub
- **Free**: 2000 minutes/month for public repos

## 📚 Chapter 1: GitHub Actions Fundamentals

### Step 1: Understanding the Workflow
```yaml
# .github/workflows/hello.yml
name: My First Workflow

on:
  push:
    branches: [ main ]

jobs:
  hello:
    runs-on: ubuntu-latest
    steps:
    - name: Say Hello
      run: echo "Hello, GitHub Actions!"
```

**Breakdown:**
- **name**: Workflow display name
- **on**: When to trigger (push to main branch)
- **jobs**: Tasks to run
- **runs-on**: Operating system
- **steps**: Individual actions

**What happens?**
1. You push code to main branch
2. GitHub detects the push
3. Starts Ubuntu virtual machine
4. Runs the echo command
5. Shows results in Actions tab

### Step 2: Create Your First Workflow
```bash
# In your repository, create directories
mkdir -p .github/workflows

# Create workflow file
cat > .github/workflows/first-workflow.yml << 'EOF'
name: First Workflow

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Print working directory
      run: pwd
      
    - name: List files
      run: ls -la
      
    - name: Print environment
      run: |
        echo "Runner OS: $RUNNER_OS"
        echo "GitHub Actor: $GITHUB_ACTOR"
        echo "Repository: $GITHUB_REPOSITORY"
EOF
```

**Key Concepts:**

1. **Triggers (on)**: When workflow runs
   - `push`: When code is pushed
   - `pull_request`: When PR is opened/updated
   - `schedule`: Time-based triggers
   - `workflow_dispatch`: Manual trigger

2. **Jobs**: Independent tasks that can run in parallel

3. **Steps**: Sequential actions within a job

4. **Actions**: Reusable code units (like functions)

### Step 3: Commit and Watch
```bash
# Add and commit
git add .github/workflows/first-workflow.yml
git commit -m "Add first GitHub Actions workflow"
git push origin main
```

**What to observe:**
1. Go to your GitHub repository
2. Click "Actions" tab
3. See your workflow running
4. Click on the workflow to see details
5. Expand steps to see output

## 📚 Chapter 2: Working with Code

### Step 4: Node.js Application Workflow
```yaml
# .github/workflows/node-app.yml
name: Node.js Application

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16, 18, 20]
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
    
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
```

**New Concepts Explained:**

1. **Strategy Matrix**: 
   - **What**: Run same job with different configurations
   - **Why**: Test on multiple Node.js versions
   - **How**: Creates 3 parallel jobs (Node 16, 18, 20)

2. **actions/checkout@v4**:
   - **What**: Downloads your repository code
   - **Why**: Runner starts empty, needs your code
   - **How**: Git clone into runner

3. **actions/setup-node@v4**:
   - **What**: Installs Node.js
   - **Why**: Runner doesn't have Node.js by default
   - **How**: Downloads and configures Node.js

4. **Cache**:
   - **What**: Saves npm packages between runs
   - **Why**: Faster builds (no re-downloading)
   - **How**: Stores node_modules

### Step 5: Environment Variables and Secrets
```yaml
# .github/workflows/env-secrets.yml
name: Environment and Secrets

on:
  push:
    branches: [ main ]

env:
  NODE_ENV: production
  API_VERSION: v1

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Use environment variables
      run: |
        echo "Environment: $NODE_ENV"
        echo "API Version: $API_VERSION"
        echo "Secret length: ${#DATABASE_PASSWORD}"
      env:
        DATABASE_PASSWORD: ${{ secrets.DATABASE_PASSWORD }}
    
    - name: Conditional step
      if: github.ref == 'refs/heads/main'
      run: echo "This only runs on main branch"
```

**Secrets Management:**

1. **What are secrets?**
   - Encrypted environment variables
   - API keys, passwords, tokens
   - Never visible in logs

2. **How to add secrets:**
   - Repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `DATABASE_PASSWORD`, Value: `your-secret`

3. **Environment variables vs Secrets:**
   - **Env vars**: Public, visible in workflow
   - **Secrets**: Private, encrypted, hidden in logs

### Step 6: Conditional Logic and Expressions
```yaml
# .github/workflows/conditions.yml
name: Conditional Workflows

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Run on any branch
      run: echo "This always runs"
    
    - name: Run only on main
      if: github.ref == 'refs/heads/main'
      run: echo "Main branch deployment"
    
    - name: Run only on PR
      if: github.event_name == 'pull_request'
      run: echo "Pull request validation"
    
    - name: Run on specific files changed
      if: contains(github.event.head_commit.message, '[deploy]')
      run: echo "Deploy flag detected in commit message"
```

**Conditional Expressions:**
- `github.ref`: Current branch reference
- `github.event_name`: What triggered the workflow
- `contains()`: Check if string contains substring
- `startsWith()`: Check if string starts with substring
- `success()`: Previous step succeeded
- `failure()`: Previous step failed

## 📚 Chapter 3: Advanced Workflows

### Step 7: Multi-Job Workflows with Dependencies
```yaml
# .github/workflows/multi-job.yml
name: Multi-Job Pipeline

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    outputs:
      test-result: ${{ steps.test.outputs.result }}
    
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install and test
      id: test
      run: |
        npm ci
        npm test
        echo "result=passed" >> $GITHUB_OUTPUT
  
  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Build application
      run: |
        npm ci
        npm run build
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v4
      with:
        name: build-files
        path: dist/
  
  deploy:
    needs: [test, build]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Download build artifacts
      uses: actions/download-artifact@v4
      with:
        name: build-files
        path: dist/
    
    - name: Deploy to production
      run: |
        echo "Test result: ${{ needs.test.outputs.test-result }}"
        echo "Deploying to production..."
        ls -la dist/
```

**Advanced Concepts:**

1. **Job Dependencies (`needs`)**:
   - **What**: Control job execution order
   - **Why**: Don't deploy if tests fail
   - **How**: `needs: [test, build]`

2. **Job Outputs**:
   - **What**: Pass data between jobs
   - **Why**: Share test results, build info
   - **How**: `echo "key=value" >> $GITHUB_OUTPUT`

3. **Artifacts**:
   - **What**: Files shared between jobs
   - **Why**: Build once, deploy multiple places
   - **How**: Upload/download actions

### Step 8: Services and Databases
```yaml
# .github/workflows/with-database.yml
name: Test with Database

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Wait for services
      run: |
        sleep 10
        pg_isready -h localhost -p 5432
        redis-cli -h localhost -p 6379 ping
    
    - name: Run database tests
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/testdb
        REDIS_URL: redis://localhost:6379
      run: npm run test:integration
```

**Services Explained:**

1. **What are services?**
   - Docker containers that run alongside your job
   - Databases, caches, message queues
   - Automatically started and stopped

2. **Health checks**:
   - **What**: Ensure service is ready before tests
   - **Why**: Avoid connection errors
   - **How**: Built-in Docker health checks

3. **Port mapping**:
   - **What**: Expose container ports to runner
   - **Why**: Your tests need to connect
   - **How**: `ports: - 5432:5432`

## 📚 Chapter 4: Docker Integration

### Step 9: Building and Pushing Docker Images
```yaml
# .github/workflows/docker.yml
name: Docker Build and Push

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=semver,pattern={{version}}
          type=semver,pattern={{major}}.{{minor}}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
```

**Docker Integration Concepts:**

1. **Docker Buildx**:
   - **What**: Advanced Docker builder
   - **Why**: Multi-platform builds, caching
   - **How**: Automatically configured

2. **Container Registry**:
   - **What**: Storage for Docker images
   - **Why**: Share images between environments
   - **How**: GitHub Container Registry (ghcr.io)

3. **Metadata extraction**:
   - **What**: Generate tags and labels automatically
   - **Why**: Consistent naming, versioning
   - **How**: Based on branch, tag, or PR

4. **Build cache**:
   - **What**: Reuse Docker layers between builds
   - **Why**: Faster builds
   - **How**: GitHub Actions cache

### Step 10: Multi-Stage Docker Builds
```yaml
# .github/workflows/multi-stage-docker.yml
name: Multi-Stage Docker Build

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Build development image
      uses: docker/build-push-action@v5
      with:
        context: .
        target: development
        tags: myapp:dev
        load: true
    
    - name: Run tests in development image
      run: |
        docker run --rm myapp:dev npm test
    
    - name: Build production image
      uses: docker/build-push-action@v5
      with:
        context: .
        target: production
        tags: myapp:prod
        push: false
```

**Multi-Stage Benefits:**
- Test in development environment
- Deploy optimized production image
- Single Dockerfile for all stages

## 📚 Chapter 5: Real-World CI/CD Pipeline

### Step 11: Complete Chat App Pipeline
```yaml
# .github/workflows/chat-app-pipeline.yml
name: Chat App CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY_API: chatapp-api
  ECR_REPOSITORY_CLIENT: chatapp-client

jobs:
  # Job 1: Run tests
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: chatapp_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: |
          server/package-lock.json
          client/package-lock.json
    
    - name: Install server dependencies
      working-directory: ./server
      run: npm ci
    
    - name: Install client dependencies
      working-directory: ./client
      run: npm ci
    
    - name: Generate Prisma Client
      working-directory: ./server
      run: npm run db:generate
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/chatapp_test
    
    - name: Run database migrations
      working-directory: ./server
      run: npm run db:push
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/chatapp_test
    
    - name: Run server tests
      working-directory: ./server
      run: npm run test
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/chatapp_test
        JWT_SECRET: test-secret
        REDIS_HOST: localhost
        REDIS_PORT: 6379
    
    - name: Run client tests
      working-directory: ./client
      run: npm run test
    
    - name: Build applications
      run: |
        cd server && npm run build
        cd ../client && npm run build
      env:
        NEXT_PUBLIC_API_URL: http://localhost:3001

  # Job 2: Security scanning
  security:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v3
      if: always()
      with:
        sarif_file: 'trivy-results.sarif'

  # Job 3: Build and push Docker images
  build-and-push:
    runs-on: ubuntu-latest
    needs: [test, security]
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
    
    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v2
    
    - name: Build and push API image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY_API:$IMAGE_TAG -f server/Dockerfile server/
        docker push $ECR_REGISTRY/$ECR_REPOSITORY_API:$IMAGE_TAG
        docker tag $ECR_REGISTRY/$ECR_REPOSITORY_API:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY_API:latest
        docker push $ECR_REGISTRY/$ECR_REPOSITORY_API:latest
    
    - name: Build and push Client image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY_CLIENT:$IMAGE_TAG -f client/Dockerfile client/
        docker push $ECR_REGISTRY/$ECR_REPOSITORY_CLIENT:$IMAGE_TAG
        docker tag $ECR_REGISTRY/$ECR_REPOSITORY_CLIENT:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY_CLIENT:latest
        docker push $ECR_REGISTRY/$ECR_REPOSITORY_CLIENT:latest

  # Job 4: Deploy to AWS
  deploy:
    runs-on: ubuntu-latest
    needs: build-and-push
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
    
    - name: Deploy to ECS
      run: |
        aws ecs update-service \
          --cluster chatapp-cluster \
          --service chatapp-api-service \
          --force-new-deployment
        
        aws ecs update-service \
          --cluster chatapp-cluster \
          --service chatapp-client-service \
          --force-new-deployment
    
    - name: Wait for deployment
      run: |
        aws ecs wait services-stable \
          --cluster chatapp-cluster \
          --services chatapp-api-service chatapp-client-service
    
    - name: Notify deployment success
      run: |
        echo "🚀 Deployment completed successfully!"
        echo "API: https://api.yourapp.com"
        echo "Client: https://yourapp.com"
```

**Pipeline Breakdown:**

1. **Test Job**: 
   - Runs on every push/PR
   - Sets up databases
   - Runs all tests
   - Builds applications

2. **Security Job**:
   - Scans for vulnerabilities
   - Uploads results to GitHub Security
   - Runs after tests pass

3. **Build-and-Push Job**:
   - Only on main branch
   - Builds Docker images
   - Pushes to AWS ECR
   - Uses commit SHA as tag

4. **Deploy Job**:
   - Only after successful build
   - Updates ECS services
   - Waits for deployment
   - Notifies success

## 📚 Chapter 6: Advanced Patterns

### Step 12: Reusable Workflows
```yaml
# .github/workflows/reusable-test.yml
name: Reusable Test Workflow

on:
  workflow_call:
    inputs:
      node-version:
        required: true
        type: string
      working-directory:
        required: false
        type: string
        default: '.'
    secrets:
      DATABASE_URL:
        required: true

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
    
    - name: Run tests
      working-directory: ${{ inputs.working-directory }}
      run: |
        npm ci
        npm test
      env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

```yaml
# .github/workflows/main.yml
name: Main Pipeline

on:
  push:
    branches: [ main ]

jobs:
  test-server:
    uses: ./.github/workflows/reusable-test.yml
    with:
      node-version: '18'
      working-directory: './server'
    secrets:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
  
  test-client:
    uses: ./.github/workflows/reusable-test.yml
    with:
      node-version: '18'
      working-directory: './client'
    secrets:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

**Reusable Workflows Benefits:**
- **DRY**: Don't repeat yourself
- **Consistency**: Same process everywhere
- **Maintenance**: Update once, apply everywhere

### Step 13: Matrix Strategies
```yaml
# .github/workflows/matrix.yml
name: Matrix Testing

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [16, 18, 20]
        include:
          - os: ubuntu-latest
            node-version: 18
            coverage: true
        exclude:
          - os: windows-latest
            node-version: 16
    
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Generate coverage
      if: matrix.coverage
      run: npm run test:coverage
```

**Matrix Strategy Features:**
- **Combinations**: Test all combinations
- **Include**: Add specific combinations
- **Exclude**: Remove specific combinations
- **Parallel**: All combinations run simultaneously

## 🏆 Mastery Checklist

After completing this guide, you should be able to:

- [ ] Create basic workflows with triggers
- [ ] Use actions from the marketplace
- [ ] Set up Node.js applications with caching
- [ ] Manage secrets and environment variables
- [ ] Create multi-job workflows with dependencies
- [ ] Use services (databases, caches)
- [ ] Build and push Docker images
- [ ] Implement security scanning
- [ ] Deploy to cloud platforms
- [ ] Create reusable workflows
- [ ] Use matrix strategies for testing
- [ ] Debug workflow failures

## 🚀 Best Practices

### Security
```yaml
# Use specific action versions
- uses: actions/checkout@v4  # ✅ Good
- uses: actions/checkout@main  # ❌ Bad

# Limit permissions
permissions:
  contents: read
  packages: write

# Use secrets for sensitive data
env:
  API_KEY: ${{ secrets.API_KEY }}  # ✅ Good
  API_KEY: "hardcoded-key"  # ❌ Bad
```

### Performance
```yaml
# Use caching
- uses: actions/setup-node@v4
  with:
    cache: 'npm'  # ✅ Faster builds

# Parallel jobs
jobs:
  test:
    # runs in parallel
  build:
    # runs in parallel
  deploy:
    needs: [test, build]  # runs after both complete
```

### Reliability
```yaml
# Use conditions to prevent unnecessary runs
- name: Deploy
  if: github.ref == 'refs/heads/main'
  run: deploy.sh

# Use timeouts
jobs:
  test:
    timeout-minutes: 10
    runs-on: ubuntu-latest
```

## 🔧 Common Patterns Reference

```yaml
# Basic Node.js workflow
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'
- run: npm ci
- run: npm test

# Docker build and push
- uses: docker/setup-buildx-action@v3
- uses: docker/login-action@v3
- uses: docker/build-push-action@v5

# AWS deployment
- uses: aws-actions/configure-aws-credentials@v4
- uses: aws-actions/amazon-ecr-login@v2

# Conditional execution
if: github.ref == 'refs/heads/main'
if: github.event_name == 'pull_request'
if: contains(github.event.head_commit.message, '[deploy]')
```

**🎉 Congratulations!** You've mastered GitHub Actions from basic automation to enterprise CI/CD pipelines!