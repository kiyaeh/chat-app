# 🐳 Docker Mastery: From Zero to Hero

Learn Docker by building real applications step by step. Each command explained with WHY and HOW.

## 🎯 What is Docker?

**Docker** is like a shipping container for your applications. Just like how shipping containers can carry anything (clothes, electronics, food) and work on any ship, truck, or train, Docker containers can carry any application and run on any computer.

**Why Docker?**
- **Consistency**: "It works on my machine" → "It works everywhere"
- **Isolation**: Apps don't interfere with each other
- **Portability**: Run anywhere (your laptop, servers, cloud)
- **Efficiency**: Lightweight compared to virtual machines

## 📚 Chapter 1: Docker Basics

### Step 1: Install Docker
```bash
# Download Docker Desktop from: https://www.docker.com/products/docker-desktop
# After installation, verify:
docker --version
```

**What happened?** You installed Docker Engine, which is like installing a "container runtime" on your computer.

### Step 2: Your First Container
```bash
# Run a simple container
docker run hello-world
```

**What happened?**
1. Docker looked for "hello-world" image locally (not found)
2. Downloaded it from Docker Hub (like an app store for containers)
3. Created a container from the image
4. Ran the container
5. Container printed message and exited

**Key Concepts:**
- **Image**: Blueprint/template (like a class in programming)
- **Container**: Running instance (like an object from a class)

### Step 3: Interactive Container
```bash
# Run Ubuntu container interactively
docker run -it ubuntu bash
```

**Command Breakdown:**
- `docker run`: Create and start a container
- `-it`: Interactive mode with terminal
- `ubuntu`: Image name
- `bash`: Command to run inside container

**Inside the container, try:**
```bash
# You're now inside Ubuntu container
ls /
cat /etc/os-release
exit  # This stops and exits the container
```

**What happened?** You ran a complete Ubuntu operating system inside a container on your computer!

### Step 4: Background Containers
```bash
# Run nginx web server in background
docker run -d -p 8080:80 --name my-web nginx
```

**Command Breakdown:**
- `-d`: Detached mode (runs in background)
- `-p 8080:80`: Port mapping (your computer:container)
- `--name my-web`: Give container a name
- `nginx`: Web server image

**Test it:**
```bash
# Open browser to http://localhost:8080
# You should see nginx welcome page
```

**What happened?** You started a web server inside a container and mapped port 8080 on your computer to port 80 inside the container.

## 📚 Chapter 2: Managing Containers

### Step 5: Container Lifecycle
```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Stop container
docker stop my-web

# Start stopped container
docker start my-web

# Remove container
docker rm my-web
```

**Why these commands?**
- Containers have states: created → running → stopped → removed
- You need to manage them like processes on your computer

### Step 6: Working with Images
```bash
# List local images
docker images

# Pull image without running
docker pull node:18

# Remove image
docker rmi hello-world
```

**What's happening?**
- Images are stored locally after first download
- You can pre-download images
- Remove unused images to save space

### Step 7: Container Logs and Inspection
```bash
# Start nginx again
docker run -d -p 8080:80 --name web nginx

# View logs
docker logs web

# Follow logs in real-time
docker logs -f web

# Inspect container details
docker inspect web

# Execute command in running container
docker exec -it web bash
```

**Why this matters?**
- Logs help debug issues
- Inspection shows configuration
- Exec lets you troubleshoot running containers

## 📚 Chapter 3: Building Your Own Images

### Step 8: Create a Simple Node.js App
```bash
# Create project directory
mkdir my-node-app
cd my-node-app

# Create package.json
cat > package.json << EOF
{
  "name": "my-app",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.0"
  }
}
EOF

# Create server.js
cat > server.js << EOF
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello from Docker!',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
EOF
```

**What we created:**
- A simple web API that returns JSON
- Package.json defines dependencies
- Server.js is our application code

### Step 9: Create Dockerfile
```bash
# Create Dockerfile
cat > Dockerfile << EOF
# Use official Node.js image as base
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port 3000
EXPOSE 3000

# Command to run when container starts
CMD ["npm", "start"]
EOF
```

**Dockerfile Explained Line by Line:**

1. `FROM node:18-alpine`
   - **What**: Use Node.js 18 on Alpine Linux as base
   - **Why**: Alpine is tiny (5MB vs 100MB+), secure, fast

2. `WORKDIR /app`
   - **What**: Set /app as working directory
   - **Why**: Organizes files, makes paths predictable

3. `COPY package*.json ./`
   - **What**: Copy package.json and package-lock.json
   - **Why**: Copy dependencies first for Docker layer caching

4. `RUN npm install`
   - **What**: Install Node.js dependencies
   - **Why**: Happens during build, not runtime

5. `COPY . .`
   - **What**: Copy all application files
   - **Why**: After dependencies for better caching

6. `EXPOSE 3000`
   - **What**: Document that app uses port 3000
   - **Why**: Documentation (doesn't actually open port)

7. `CMD ["npm", "start"]`
   - **What**: Default command when container starts
   - **Why**: Defines what the container does

### Step 10: Build Your Image
```bash
# Build image with tag
docker build -t my-node-app .
```

**Command Breakdown:**
- `docker build`: Build image from Dockerfile
- `-t my-node-app`: Tag (name) the image
- `.`: Build context (current directory)

**What happened?**
1. Docker read Dockerfile
2. Downloaded node:18-alpine base image
3. Created layers for each instruction
4. Cached layers for faster rebuilds

### Step 11: Run Your Custom Container
```bash
# Run your app
docker run -d -p 3000:3000 --name my-app my-node-app

# Test it
curl http://localhost:3000
# or open browser to http://localhost:3000
```

**Success!** You built and ran your own containerized application!

## 📚 Chapter 4: Multi-Container Applications

### Step 12: Understanding Docker Compose
**Problem**: Real apps need multiple services (web server, database, cache)
**Solution**: Docker Compose - orchestrate multiple containers

### Step 13: Create Docker Compose File
```bash
# Create docker-compose.yml
cat > docker-compose.yml << EOF
version: '3.8'

services:
  # Web application
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis

  # PostgreSQL database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Redis cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
EOF
```

**Docker Compose Explained:**

1. **version**: Compose file format version
2. **services**: Define containers
3. **build**: Build from Dockerfile
4. **image**: Use pre-built image
5. **ports**: Port mapping
6. **environment**: Environment variables
7. **depends_on**: Start order
8. **volumes**: Persistent data storage

### Step 14: Run Multi-Container App
```bash
# Start all services
docker-compose up -d

# View running services
docker-compose ps

# View logs
docker-compose logs web

# Stop all services
docker-compose down
```

**What happened?**
1. Docker Compose created a network
2. Started postgres and redis
3. Built and started web app
4. Connected everything together

## 📚 Chapter 5: Advanced Docker Concepts

### Step 15: Multi-Stage Builds
```bash
# Create optimized Dockerfile
cat > Dockerfile.multi << EOF
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
EOF

# Build with multi-stage
docker build -f Dockerfile.multi -t my-app-optimized .
```

**Why Multi-Stage?**
- Smaller final image
- No build tools in production
- Better security

### Step 16: Docker Networks
```bash
# Create custom network
docker network create my-network

# Run containers on same network
docker run -d --network my-network --name db postgres:15-alpine
docker run -d --network my-network --name app my-node-app

# List networks
docker network ls

# Inspect network
docker network inspect my-network
```

**Why Networks?**
- Isolate container communication
- Custom DNS resolution
- Security boundaries

### Step 17: Data Persistence
```bash
# Create volume
docker volume create my-data

# Run container with volume
docker run -d -v my-data:/data --name data-container alpine

# List volumes
docker volume ls

# Inspect volume
docker volume inspect my-data
```

**Why Volumes?**
- Data survives container deletion
- Share data between containers
- Better performance than bind mounts

## 📚 Chapter 6: Production Best Practices

### Step 18: Health Checks
```bash
# Add health check to Dockerfile
cat > Dockerfile.health << EOF
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["npm", "start"]
EOF
```

**Why Health Checks?**
- Monitor container health
- Automatic restarts
- Load balancer integration

### Step 19: Security Best Practices
```bash
# Create secure Dockerfile
cat > Dockerfile.secure << EOF
FROM node:18-alpine

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

# Copy and install as root
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy app files
COPY . .

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
CMD ["npm", "start"]
EOF
```

**Security Principles:**
- Don't run as root
- Minimal base images
- No secrets in images
- Regular updates

### Step 20: Monitoring and Logging
```bash
# Run with logging driver
docker run -d \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  my-app

# Monitor resource usage
docker stats

# Export container as image
docker commit my-app my-app-snapshot
```

## 🎯 Real-World Exercise: Chat App Containerization

### Step 21: Containerize Our Chat App
```bash
# Server Dockerfile
cat > server/Dockerfile << EOF
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS deps
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY package*.json ./

USER nestjs
EXPOSE 3001
CMD ["npm", "run", "start:prod"]
EOF
```

### Step 22: Complete Docker Compose
```bash
# Production-ready docker-compose.yml
cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  api:
    build:
      context: ./server
      target: production
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/chatapp
      REDIS_HOST: redis
      JWT_SECRET: \${JWT_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  client:
    build:
      context: ./client
      target: production
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
    depends_on:
      - api

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: chatapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  postgres_data:
  redis_data:
EOF
```

## 🏆 Mastery Checklist

After completing this guide, you should be able to:

- [ ] Explain what Docker is and why it's useful
- [ ] Run containers interactively and in background
- [ ] Build custom images from Dockerfiles
- [ ] Use Docker Compose for multi-container apps
- [ ] Implement security best practices
- [ ] Set up health checks and monitoring
- [ ] Troubleshoot common Docker issues
- [ ] Optimize images for production

## 🚀 Next Steps

1. **Practice**: Containerize your own applications
2. **Learn Kubernetes**: Container orchestration at scale
3. **CI/CD Integration**: Automate builds and deployments
4. **Security**: Advanced container security practices
5. **Monitoring**: Production monitoring and logging

## 🔧 Common Commands Reference

```bash
# Container Management
docker run -d -p 8080:80 nginx          # Run container
docker ps                               # List running containers
docker stop <container>                 # Stop container
docker rm <container>                   # Remove container

# Image Management
docker images                           # List images
docker build -t myapp .                 # Build image
docker rmi <image>                      # Remove image

# Docker Compose
docker-compose up -d                    # Start services
docker-compose down                     # Stop services
docker-compose logs -f                  # View logs

# Debugging
docker logs <container>                 # View logs
docker exec -it <container> bash        # Enter container
docker inspect <container>              # Inspect container
```

**🎉 Congratulations!** You've mastered Docker from zero to production-ready applications!