# 🛠️ Local Development Setup Guide

Complete guide to set up and run the chat application locally.

## 📋 Prerequisites

### Required Software
- **Node.js 18+**: [Download](https://nodejs.org/)
- **Docker Desktop**: [Download](https://www.docker.com/products/docker-desktop)
- **Git**: [Download](https://git-scm.com/)

### Verify Installation
```bash
node --version    # Should be 18+
npm --version     # Should be 8+
docker --version  # Should be 20+
git --version     # Any recent version
```

## 🚀 Quick Start

### 1. Clone and Setup
```bash
# Clone repository
git clone https://github.com/kiyaeh/chat-app.git
cd chat-app

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
cd ..
```

### 2. Environment Configuration
```bash
# Copy environment files
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 3. Start Infrastructure
```bash
# Start PostgreSQL and Redis
docker-compose up postgres redis -d

# Verify services are running
docker-compose ps
```

### 4. Database Setup
```bash
cd server

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# (Optional) Seed with sample data
npm run db:seed
```

### 5. Start Development Servers
```bash
# Terminal 1: Start API server
cd server
npm run start:dev

# Terminal 2: Start client
cd client
npm run dev
```

### 6. Access Application
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs
- **Database Studio**: `npm run db:studio` (in server directory)

## 🔧 Development Workflow

### Database Operations
```bash
cd server

# View database in browser
npm run db:studio

# Reset database
npx prisma migrate reset

# Create new migration
npm run db:migrate

# Push schema changes without migration
npm run db:push
```

### Testing
```bash
# Server tests
cd server
npm run test
npm run test:watch
npm run test:e2e

# Client tests
cd client
npm run test
```

### Code Quality
```bash
# Lint and format
cd server
npm run lint
npm run format

cd client
npm run lint
```

## 🐳 Docker Development

### Full Stack with Docker
```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual Services
```bash
# Start only database services
docker-compose up postgres redis -d

# Start only API
docker-compose up api -d

# Start only client
docker-compose up client -d
```

## 🔍 Debugging

### Server Debugging
```bash
# Start with debugger
cd server
npm run start:debug

# Attach debugger on port 9229
```

### Database Debugging
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d chatapp

# Connect to Redis
docker-compose exec redis redis-cli
```

### Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs api
docker-compose logs postgres
```

## 🚨 Troubleshooting

### Port Conflicts
```bash
# Check what's using ports
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :5432

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Database Issues
```bash
# Reset database
cd server
npx prisma migrate reset

# Check database connection
npm run db:studio
```

### Docker Issues
```bash
# Clean up Docker
docker-compose down -v
docker system prune -f

# Rebuild containers
docker-compose up --build --force-recreate
```

### Node Modules Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
```

## 📁 Project Structure

```
chat-app/
├── server/                 # NestJS API
│   ├── src/
│   │   ├── auth/          # Authentication
│   │   ├── users/         # User management
│   │   ├── rooms/         # Chat rooms
│   │   ├── messages/      # Messages
│   │   ├── chat/          # WebSocket gateway
│   │   └── prisma/        # Database service
│   ├── prisma/            # Database schema
│   └── Dockerfile
├── client/                # Next.js frontend
│   ├── src/
│   │   └── app/          # App router pages
│   └── Dockerfile
├── infrastructure/        # Terraform configs
├── .github/              # CI/CD workflows
└── docker-compose.yml    # Local development
```

## 🔄 Development Tips

### Hot Reload
- Server: Automatically restarts on file changes
- Client: Hot reloads in browser
- Database: Use Prisma Studio for real-time data viewing

### API Testing
```bash
# Test endpoints with curl
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"test","password":"password123"}'
```

### Environment Variables
```bash
# Server (.env)
DATABASE_URL="postgresql://postgres:password@localhost:5432/chatapp"
JWT_SECRET="your-secret-key"
REDIS_HOST="localhost"
REDIS_PORT=6379

# Client (.env.local)
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="ws://localhost:3001"
```

## 📚 Useful Commands

### Package Management
```bash
# Add new dependency
npm install package-name

# Add dev dependency
npm install -D package-name

# Update dependencies
npm update

# Check outdated packages
npm outdated
```

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin feature/new-feature
```

---

**🎯 Ready to start coding!** Your development environment is now set up and ready for building amazing features.