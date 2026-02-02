# 🚀 Chat App - Microservices Architecture

Enterprise-grade chat application built with microservices architecture using NestJS, PostgreSQL, and WebSocket.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   API Gateway   │    │   PostgreSQL    │
│   Client        │◄──►│   (Port 8080)   │◄──►│   Database      │
│   (Port 3000)   │    │                 │    │   (Port 5432)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
            ┌───────▼───┐ ┌─────▼─────┐ ┌───▼───────┐
            │Auth Service│ │User Service│ │Room Service│
            │(Port 3001) │ │(Port 3002) │ │(Port 3003)│
            └───────────┘ └───────────┘ └───────────┘
                    │           │           │
            ┌───────▼───┐ ┌─────▼─────┐ ┌───▼───────┐
            │Message Svc │ │WebSocket  │ │   Redis   │
            │(Port 3004) │ │(Port 3007)│ │(Port 6379)│
            └───────────┘ └───────────┘ └───────────┘
```

## 📁 Project Structure

```
chat-app/
├── client/                    # Next.js Frontend
├── microservices/             # Backend Services
│   ├── api-gateway/           # Request routing & load balancing
│   ├── auth-service/          # Authentication & JWT
│   ├── user-service/          # User management & profiles
│   ├── room-service/          # Chat rooms & memberships
│   ├── message-service/       # Message handling & history
│   ├── websocket-service/     # Real-time communication
│   ├── shared/               # Common schemas & utilities
│   └── docker-compose.yml    # Service orchestration
├── docs/                     # Documentation
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (via Docker)

### 1. Start Infrastructure & Services
```bash
cd microservices
docker-compose up -d
```

### 2. Start Frontend
```bash
cd client
npm install
npm run dev
```

### 3. Access Application
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **Services**: Individual ports 3001-3007

## 🛠️ Services

| Service | Port | Purpose |
|---------|------|---------|
| **API Gateway** | 8080 | Single entry point, routing |
| **Auth Service** | 3001 | JWT authentication |
| **User Service** | 3002 | User profiles & status |
| **Room Service** | 3003 | Chat rooms & memberships |
| **Message Service** | 3004 | Message CRUD & history |
| **WebSocket Service** | 3007 | Real-time messaging |

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login

### Users
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update profile
- `GET /api/v1/users/search` - Search users

### Rooms
- `GET /api/v1/rooms` - List user's rooms
- `POST /api/v1/rooms` - Create new room
- `POST /api/v1/rooms/:id/join` - Join room
- `GET /api/v1/rooms/:id/members` - Get room members

### Messages
- `GET /api/v1/messages/:roomId` - Get room messages
- `POST /api/v1/messages` - Send message
- `PUT /api/v1/messages/:id` - Edit message
- `DELETE /api/v1/messages/:id` - Delete message

## 🔧 Development

### Individual Service Development
```bash
cd microservices/auth-service
npm install
npm run start:dev
```

### Database Operations
```bash
# Run migrations (from any service with Prisma)
cd microservices/auth-service
npx prisma migrate dev
npx prisma generate
```

## 🏗️ Technology Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Real-time**: Socket.IO WebSocket
- **Authentication**: JWT with Passport
- **Containerization**: Docker & Docker Compose
- **Frontend**: Next.js 14 with TypeScript

## 📈 Scalability Features

- **Microservices Architecture** - Independent scaling
- **API Gateway** - Load balancing & routing
- **Database Optimization** - Indexes & connection pooling
- **Caching Layer** - Redis for performance
- **Real-time Communication** - WebSocket with horizontal scaling
- **Container Orchestration** - Docker Compose ready

---

**Built for enterprise-scale applications** 🚀