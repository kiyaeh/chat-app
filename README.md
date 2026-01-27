# 🚀 Enterprise Chat Application

A production-ready, scalable real-time chat application built with modern technologies and enterprise-grade architecture.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   NestJS API    │    │   PostgreSQL    │
│   Client        │◄──►│   Server        │◄──►│   Database      │
│   (Port 3000)   │    │   (Port 3001)   │    │   (Port 5432)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │     Redis       │              │
         └──────────────►│   Cache/Queue   │◄─────────────┘
                        │   (Port 6379)   │
                        └─────────────────┘
```

## 🛠️ Tech Stack

### Backend
- **NestJS** - Scalable Node.js framework
- **PostgreSQL** - Primary database
- **Prisma** - Database ORM and migrations
- **Redis** - Caching and real-time features
- **Socket.IO** - WebSocket connections
- **JWT** - Authentication
- **Swagger** - API documentation

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Socket.IO Client** - Real-time communication

### Infrastructure
- **Docker** - Containerization
- **AWS ECS** - Container orchestration
- **AWS RDS** - Managed PostgreSQL
- **AWS ElastiCache** - Managed Redis
- **AWS ALB** - Load balancing
- **Terraform** - Infrastructure as Code
- **GitHub Actions** - CI/CD pipeline

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### 1. Clone Repository
```bash
git clone https://github.com/kiyaeh/chat-app.git
cd chat-app
```

### 2. Environment Setup
```bash
# Copy environment files
cp server/.env.example server/.env
cp client/.env.example client/.env

# Update environment variables in server/.env
DATABASE_URL="postgresql://postgres:password@localhost:5432/chatapp?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
REDIS_HOST="localhost"
```

### 3. Start with Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Database Setup
```bash
# Generate Prisma client
cd server
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

### 5. Access Application
- **Client**: http://localhost:3000
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs
- **Database Studio**: `npm run db:studio`

## 🏃‍♂️ Development

### Server Development
```bash
cd server
npm install
npm run start:dev
```

### Client Development
```bash
cd client
npm install
npm run dev
```

### Database Operations
```bash
# Generate Prisma client
npm run db:generate

# Create migration
npm run db:migrate

# Push schema changes
npm run db:push

# Open Prisma Studio
npm run db:studio

# Reset database
npx prisma migrate reset
```

## 🧪 Testing

### Run Tests
```bash
# Server tests
cd server
npm run test
npm run test:e2e
npm run test:cov

# Client tests
cd client
npm run test
```

### Load Testing
```bash
# Install artillery
npm install -g artillery

# Run load tests
artillery run tests/load-test.yml
```

## 📦 Deployment

### AWS Infrastructure Setup

1. **Prerequisites**
   - AWS CLI configured
   - Terraform installed
   - Docker installed

2. **Deploy Infrastructure**
   ```bash
   cd infrastructure/terraform
   
   # Initialize Terraform
   terraform init
   
   # Plan deployment
   terraform plan -var="db_password=your-secure-password" -var="jwt_secret=your-jwt-secret"
   
   # Apply infrastructure
   terraform apply -var="db_password=your-secure-password" -var="jwt_secret=your-jwt-secret"
   ```

3. **Build and Push Images**
   ```bash
   # Login to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
   
   # Build and push API
   docker build -t chatapp-api server/
   docker tag chatapp-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/chatapp-api:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/chatapp-api:latest
   
   # Build and push Client
   docker build -t chatapp-client client/
   docker tag chatapp-client:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/chatapp-client:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/chatapp-client:latest
   ```

### GitHub Actions CI/CD

1. **Setup Secrets**
   ```
   AWS_ACCESS_KEY_ID
   AWS_SECRET_ACCESS_KEY
   DB_PASSWORD
   JWT_SECRET
   ```

2. **Automatic Deployment**
   - Push to `main` branch triggers deployment
   - Tests run automatically
   - Security scanning included
   - Zero-downtime deployment

## 🔧 Configuration

### Environment Variables

#### Server (.env)
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"
REDIS_HOST="localhost"
REDIS_PORT=6379
PORT=3001
NODE_ENV="development"
```

#### Client (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="ws://localhost:3001"
```

## 📊 Monitoring & Observability

### Health Checks
- **API Health**: `GET /health`
- **Database**: Connection monitoring
- **Redis**: Connection monitoring

### Logging
- Structured JSON logging
- CloudWatch integration
- Error tracking with Sentry (optional)

### Metrics
- Application metrics
- Infrastructure metrics
- Custom business metrics

## 🔒 Security Features

- **Authentication**: JWT-based auth
- **Authorization**: Role-based access control
- **Rate Limiting**: Request throttling
- **Input Validation**: Class-validator
- **SQL Injection**: Prisma ORM protection
- **CORS**: Configured origins
- **Helmet**: Security headers
- **Container Security**: Trivy scanning

## 🚀 Performance Optimizations

- **Database**: Connection pooling, indexing
- **Caching**: Redis for sessions and data
- **CDN**: Static asset delivery
- **Compression**: Gzip/Brotli
- **Load Balancing**: AWS ALB
- **Auto Scaling**: ECS service scaling

## 📈 Scalability

### Horizontal Scaling
- Stateless application design
- Load balancer distribution
- Database read replicas
- Redis clustering

### Vertical Scaling
- ECS task resource allocation
- Database instance sizing
- Cache memory optimization

## 🛡️ Disaster Recovery

- **Database Backups**: Automated daily backups
- **Point-in-time Recovery**: RDS feature
- **Multi-AZ Deployment**: High availability
- **Infrastructure as Code**: Quick recovery

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 API Documentation

Visit `/api/docs` when running the server to see the complete Swagger documentation.

### Key Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /users/me` - Get current user
- `GET /rooms` - List chat rooms
- `POST /rooms` - Create chat room
- `GET /messages/:roomId` - Get room messages

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection**
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps postgres
   
   # Check logs
   docker-compose logs postgres
   ```

2. **Redis Connection**
   ```bash
   # Test Redis connection
   docker-compose exec redis redis-cli ping
   ```

3. **Port Conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :3001
   ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- Prisma team for the excellent ORM
- Next.js team for the React framework
- AWS for cloud infrastructure
- Open source community

---

**Built with ❤️ for enterprise-grade applications**