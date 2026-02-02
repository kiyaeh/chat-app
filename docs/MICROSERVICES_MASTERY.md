# 🏗️ Microservices Architecture Mastery: From Monolith to Distributed Systems

Learn microservices architecture by building real distributed applications step by step. Every concept explained with practical examples.

## 🎯 What is Microservices Architecture?

**Microservices Architecture** is like building a modern apartment complex - each unit is independent but they work together as a community.

**Real-world analogy**:
- **Microservices** = Apartment complex (independent units)
- **Each Service** = Individual apartment (own utilities, entrance)
- **API Gateway** = Main reception (single entry point)
- **Service Mesh** = Building infrastructure (shared utilities)
- **Message Queue** = Mail system (communication between units)

**Why Microservices Architecture?**
- **Scalability**: Scale individual services independently
- **Technology Diversity**: Different services can use different technologies
- **Team Independence**: Teams can work on services independently
- **Fault Isolation**: One service failure doesn't bring down the entire system
- **Deployment Flexibility**: Deploy services independently

## 📚 Chapter 1: Microservices Fundamentals

### Step 1: Understanding Microservices vs Monolithic

```
MONOLITHIC ARCHITECTURE
┌─────────────────────────────────────┐
│           Single Application        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐│
│  │   UI    │ │Business │ │  Data   ││
│  │ Layer   │ │ Logic   │ │ Layer   ││
│  └─────────┘ └─────────┘ └─────────┘│
└─────────────────────────────────────┘
              │
              ▼
        ┌─────────────┐
        │  Database   │
        └─────────────┘

MICROSERVICES ARCHITECTURE
┌─────────────┐
│ API Gateway │
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
   ▼       ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ User    │ │ Chat    │ │ Message │ │ File    │
│Service  │ │Service  │ │Service  │ │Service  │
│   +DB   │ │   +DB   │ │   +DB   │ │   +DB   │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

**Microservices Characteristics:**
1. **Single Responsibility**: Each service has one business purpose
2. **Independent Deployment**: Services can be deployed separately
3. **Decentralized Data**: Each service owns its data
4. **Communication via APIs**: Services communicate over network
5. **Technology Agnostic**: Services can use different tech stacks

### Step 2: Design Microservices for Chat Application

```bash
# Create microservices project structure
mkdir microservices-chat-app
cd microservices-chat-app

# Create individual service directories
mkdir -p services/{user-service,chat-service,message-service,notification-service}
mkdir -p services/{api-gateway,file-service}
mkdir -p infrastructure/{docker,kubernetes,monitoring}
mkdir -p shared/{events,utils,types}

# Create docker-compose for local development
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # Databases
  user-db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: userdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - user_db_data:/var/lib/postgresql/data

  chat-db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: chatdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5433:5432"
    volumes:
      - chat_db_data:/var/lib/postgresql/data

  message-db:
    image: mongodb/mongodb-community-server:7.0-ubi8
    environment:
      MONGODB_INITDB_ROOT_USERNAME: admin
      MONGODB_INITDB_ROOT_PASSWORD: password
    ports:
      - "27017:27017"
    volumes:
      - message_db_data:/data/db

  # Message Queue
  rabbitmq:
    image: rabbitmq:3-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: password
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq

  # Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Service Discovery
  consul:
    image: consul:1.15
    ports:
      - "8500:8500"
    command: consul agent -dev -client=0.0.0.0

  # API Gateway
  api-gateway:
    build: ./services/api-gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - CONSUL_HOST=consul
      - REDIS_HOST=redis
    depends_on:
      - consul
      - redis

  # User Service
  user-service:
    build: ./services/user-service
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@user-db:5432/userdb
      - CONSUL_HOST=consul
      - RABBITMQ_URL=amqp://admin:password@rabbitmq:5672
    depends_on:
      - user-db
      - consul
      - rabbitmq

  # Chat Service
  chat-service:
    build: ./services/chat-service
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@chat-db:5432/chatdb
      - CONSUL_HOST=consul
      - RABBITMQ_URL=amqp://admin:password@rabbitmq:5672
    depends_on:
      - chat-db
      - consul
      - rabbitmq

  # Message Service
  message-service:
    build: ./services/message-service
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=development
      - MONGODB_URL=mongodb://admin:password@message-db:27017/messagedb?authSource=admin
      - CONSUL_HOST=consul
      - RABBITMQ_URL=amqp://admin:password@rabbitmq:5672
    depends_on:
      - message-db
      - consul
      - rabbitmq

  # Notification Service
  notification-service:
    build: ./services/notification-service
    ports:
      - "3004:3004"
    environment:
      - NODE_ENV=development
      - REDIS_HOST=redis
      - CONSUL_HOST=consul
      - RABBITMQ_URL=amqp://admin:password@rabbitmq:5672
    depends_on:
      - redis
      - consul
      - rabbitmq

volumes:
  user_db_data:
  chat_db_data:
  message_db_data:
  rabbitmq_data:
  redis_data:
EOF
```

**Service Breakdown:**

1. **User Service**: Authentication, user profiles, user management
2. **Chat Service**: Room management, room membership
3. **Message Service**: Message storage, message history
4. **Notification Service**: Real-time notifications, push notifications
5. **File Service**: File upload, file storage
6. **API Gateway**: Request routing, authentication, rate limiting

### Step 3: Create Shared Event System

```bash
# Create shared event definitions
cat > shared/events/index.js << 'EOF'
// Event types
const EVENT_TYPES = {
  // User events
  USER_REGISTERED: 'user.registered',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_ONLINE: 'user.online',
  USER_OFFLINE: 'user.offline',
  
  // Chat events
  ROOM_CREATED: 'room.created',
  ROOM_UPDATED: 'room.updated',
  ROOM_DELETED: 'room.deleted',
  USER_JOINED_ROOM: 'room.user_joined',
  USER_LEFT_ROOM: 'room.user_left',
  
  // Message events
  MESSAGE_SENT: 'message.sent',
  MESSAGE_UPDATED: 'message.updated',
  MESSAGE_DELETED: 'message.deleted',
  
  // Notification events
  NOTIFICATION_SEND: 'notification.send',
  NOTIFICATION_DELIVERED: 'notification.delivered'
};

// Event schemas
const EVENT_SCHEMAS = {
  [EVENT_TYPES.USER_REGISTERED]: {
    userId: 'string',
    username: 'string',
    email: 'string',
    timestamp: 'date'
  },
  
  [EVENT_TYPES.MESSAGE_SENT]: {
    messageId: 'string',
    roomId: 'string',
    userId: 'string',
    content: 'string',
    type: 'string',
    timestamp: 'date'
  },
  
  [EVENT_TYPES.ROOM_CREATED]: {
    roomId: 'string',
    name: 'string',
    type: 'string',
    createdBy: 'string',
    timestamp: 'date'
  }
};

module.exports = {
  EVENT_TYPES,
  EVENT_SCHEMAS
};
EOF

# Create event publisher utility
cat > shared/utils/EventPublisher.js << 'EOF'
const amqp = require('amqplib');

class EventPublisher {
  constructor(rabbitmqUrl) {
    this.rabbitmqUrl = rabbitmqUrl;
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      this.connection = await amqp.connect(this.rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      
      // Create exchange for events
      await this.channel.assertExchange('events', 'topic', { durable: true });
      
      console.log('📡 Event Publisher connected to RabbitMQ');
    } catch (error) {
      console.error('Event Publisher connection error:', error);
      throw error;
    }
  }

  async publish(eventType, data) {
    try {
      if (!this.channel) {
        await this.connect();
      }

      const event = {
        type: eventType,
        data,
        timestamp: new Date().toISOString(),
        id: this.generateEventId()
      };

      const message = Buffer.from(JSON.stringify(event));
      
      await this.channel.publish('events', eventType, message, {
        persistent: true,
        messageId: event.id
      });

      console.log(`📤 Event published: ${eventType}`, event.id);
    } catch (error) {
      console.error('Event publish error:', error);
      throw error;
    }
  }

  generateEventId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async close() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}

module.exports = EventPublisher;
EOF

# Create event subscriber utility
cat > shared/utils/EventSubscriber.js << 'EOF'
const amqp = require('amqplib');

class EventSubscriber {
  constructor(rabbitmqUrl, serviceName) {
    this.rabbitmqUrl = rabbitmqUrl;
    this.serviceName = serviceName;
    this.connection = null;
    this.channel = null;
    this.handlers = new Map();
  }

  async connect() {
    try {
      this.connection = await amqp.connect(this.rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      
      // Create exchange for events
      await this.channel.assertExchange('events', 'topic', { durable: true });
      
      // Create service-specific queue
      const queueName = `${this.serviceName}-events`;
      await this.channel.assertQueue(queueName, { durable: true });
      
      console.log(`📡 Event Subscriber connected: ${this.serviceName}`);
    } catch (error) {
      console.error('Event Subscriber connection error:', error);
      throw error;
    }
  }

  async subscribe(eventType, handler) {
    try {
      if (!this.channel) {
        await this.connect();
      }

      const queueName = `${this.serviceName}-events`;
      
      // Bind queue to exchange with routing key
      await this.channel.bindQueue(queueName, 'events', eventType);
      
      // Store handler
      this.handlers.set(eventType, handler);
      
      // Start consuming messages
      await this.channel.consume(queueName, async (message) => {
        if (message) {
          try {
            const event = JSON.parse(message.content.toString());
            const handler = this.handlers.get(event.type);
            
            if (handler) {
              console.log(`📥 Event received: ${event.type}`, event.id);
              await handler(event.data, event);
              this.channel.ack(message);
            } else {
              console.warn(`No handler for event type: ${event.type}`);
              this.channel.ack(message);
            }
          } catch (error) {
            console.error('Event processing error:', error);
            this.channel.nack(message, false, false); // Dead letter
          }
        }
      });

      console.log(`📋 Subscribed to event: ${eventType}`);
    } catch (error) {
      console.error('Event subscription error:', error);
      throw error;
    }
  }

  async close() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}

module.exports = EventSubscriber;
EOF
```

**Event-Driven Architecture Benefits:**

1. **Loose Coupling**: Services don't need to know about each other
2. **Scalability**: Handle events asynchronously
3. **Reliability**: Message queues ensure delivery
4. **Flexibility**: Easy to add new event handlers
5. **Audit Trail**: All events are logged

### Step 4: Build User Service (Microservice #1)

```bash
# Create User Service
cd services/user-service

# Initialize package.json
cat > package.json << 'EOF'
{
  "name": "user-service",
  "version": "1.0.0",
  "description": "User management microservice",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.3",
    "amqplib": "^0.10.3",
    "consul": "^0.40.0",
    "helmet": "^7.0.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^6.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2"
  }
}
EOF

# Create User Service application
mkdir -p src/{controllers,services,models,middleware,config}

cat > src/app.js << 'EOF'
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Import utilities
const EventPublisher = require('../../shared/utils/EventPublisher');
const EventSubscriber = require('../../shared/utils/EventSubscriber');
const { EVENT_TYPES } = require('../../shared/events');

// Import components
const UserController = require('./controllers/UserController');
const { authenticateToken } = require('./middleware/auth');
const Database = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize event system
const eventPublisher = new EventPublisher(process.env.RABBITMQ_URL);
const eventSubscriber = new EventSubscriber(process.env.RABBITMQ_URL, 'user-service');

// Security middleware
app.use(helmet());
app.use(cors());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Body parsing
app.use(express.json());

// Initialize database
Database.init();

// Routes
app.post('/register', UserController.register);
app.post('/login', UserController.login);
app.get('/profile/:id', authenticateToken, UserController.getProfile);
app.put('/profile/:id', authenticateToken, UserController.updateProfile);
app.get('/users', authenticateToken, UserController.getUsers);
app.post('/verify-token', UserController.verifyToken);

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'user-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Initialize event system
async function initializeEvents() {
  try {
    await eventPublisher.connect();
    await eventSubscriber.connect();
    
    // Make event publisher available globally
    app.locals.eventPublisher = eventPublisher;
    
    console.log('📡 Event system initialized');
  } catch (error) {
    console.error('Event system initialization failed:', error);
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`👤 User Service running on port ${PORT}`);
  await initializeEvents();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await eventPublisher.close();
  await eventSubscriber.close();
  process.exit(0);
});
EOF

# Create User Controller
cat > src/controllers/UserController.js << 'EOF'
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { EVENT_TYPES } = require('../../../shared/events');

class UserController {
  // Register new user
  static async register(req, res) {
    try {
      const { username, email, password } = req.body;
      
      // Validation
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username, email, and password are required'
        });
      }
      
      // Check if user exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);
      
      // Create user
      const user = await User.create({
        username,
        email,
        password_hash: passwordHash
      });
      
      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );
      
      // Publish event
      if (req.app.locals.eventPublisher) {
        await req.app.locals.eventPublisher.publish(EVENT_TYPES.USER_REGISTERED, {
          userId: user.id,
          username: user.username,
          email: user.email,
          timestamp: new Date()
        });
      }
      
      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          },
          token
        },
        message: 'User registered successfully'
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed'
      });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }
      
      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );
      
      // Update online status
      await User.updateOnlineStatus(user.id, true);
      
      // Publish event
      if (req.app.locals.eventPublisher) {
        await req.app.locals.eventPublisher.publish(EVENT_TYPES.USER_ONLINE, {
          userId: user.id,
          timestamp: new Date()
        });
      }
      
      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          },
          token
        },
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed'
      });
    }
  }

  // Get user profile
  static async getProfile(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar_url: user.avatar_url,
          is_online: user.is_online,
          last_seen: user.last_seen
        },
        message: 'Profile retrieved successfully'
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile'
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const { id } = req.params;
      const { username, avatar_url } = req.body;
      
      // Check if user exists
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Update user
      const updatedUser = await User.update(id, { username, avatar_url });
      
      // Publish event
      if (req.app.locals.eventPublisher) {
        await req.app.locals.eventPublisher.publish(EVENT_TYPES.USER_UPDATED, {
          userId: updatedUser.id,
          username: updatedUser.username,
          timestamp: new Date()
        });
      }
      
      res.json({
        success: true,
        data: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          avatar_url: updatedUser.avatar_url
        },
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }

  // Get all users
  static async getUsers(req, res) {
    try {
      const users = await User.findAll();
      
      res.json({
        success: true,
        data: users.map(user => ({
          id: user.id,
          username: user.username,
          avatar_url: user.avatar_url,
          is_online: user.is_online,
          last_seen: user.last_seen
        })),
        message: 'Users retrieved successfully'
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get users'
      });
    }
  }

  // Verify JWT token (for other services)
  static async verifyToken(req, res) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token is required'
        });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.json({
        success: true,
        data: {
          userId: user.id,
          email: user.email,
          username: user.username
        },
        message: 'Token verified successfully'
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  }
}

module.exports = UserController;
EOF

# Create User Model
cat > src/models/User.js << 'EOF'
const Database = require('../config/database');

class User {
  static async create(userData) {
    const { username, email, password_hash } = userData;
    
    const query = `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, created_at
    `;
    
    const result = await Database.query(query, [username, email, password_hash]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await Database.query(query, [id]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await Database.query(query, [email]);
    return result.rows[0];
  }

  static async findAll() {
    const query = `
      SELECT id, username, email, avatar_url, is_online, last_seen, created_at
      FROM users
      ORDER BY created_at DESC
    `;
    const result = await Database.query(query);
    return result.rows;
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `
      UPDATE users 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, username, email, avatar_url, is_online, last_seen
    `;

    const result = await Database.query(query, values);
    return result.rows[0];
  }

  static async updateOnlineStatus(id, isOnline) {
    const query = `
      UPDATE users 
      SET is_online = $1, last_seen = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, is_online, last_seen
    `;
    
    const result = await Database.query(query, [isOnline, id]);
    return result.rows[0];
  }
}

module.exports = User;
EOF

# Create Database configuration
cat > src/config/database.js << 'EOF'
const { Pool } = require('pg');

class Database {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async init() {
    try {
      // Create users table
      await this.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          avatar_url VARCHAR(255),
          is_online BOOLEAN DEFAULT FALSE,
          last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('📊 User Service database initialized');
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  async query(text, params) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = new Database();
EOF

# Create authentication middleware
cat > src/middleware/auth.js << 'EOF'
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  });
};

module.exports = {
  authenticateToken
};
EOF

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Copy shared utilities
COPY ../../shared ./shared/

EXPOSE 3001

CMD ["npm", "start"]
EOF
```

**User Service Responsibilities:**

1. **User Authentication**: Register, login, token verification
2. **User Management**: Profile updates, user listing
3. **Event Publishing**: Notify other services of user events
4. **Data Ownership**: Owns user data and business logic

### Step 5: Build API Gateway (Service Orchestration)

```bash
# Create API Gateway
cd ../api-gateway

cat > package.json << 'EOF'
{
  "name": "api-gateway",
  "version": "1.0.0",
  "description": "API Gateway for microservices",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "http-proxy-middleware": "^2.0.6",
    "express-rate-limit": "^6.10.0",
    "helmet": "^7.0.0",
    "cors": "^2.8.5",
    "consul": "^0.40.0",
    "redis": "^4.6.7",
    "axios": "^1.5.0"
  }
}
EOF

cat > src/app.js << 'EOF'
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const consul = require('consul')();
const redis = require('redis');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Redis client
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  }
});
app.use(limiter);

// Body parsing
app.use(express.json());

// Service discovery
const services = new Map();

async function discoverServices() {
  try {
    const healthyServices = await consul.health.service({
      service: 'user-service',
      passing: true
    });
    
    if (healthyServices.length > 0) {
      const service = healthyServices[0];
      services.set('user-service', {
        host: service.Service.Address,
        port: service.Service.Port
      });
    }
    
    console.log('🔍 Services discovered:', Array.from(services.keys()));
  } catch (error) {
    console.error('Service discovery error:', error);
  }
}

// Authentication middleware
const authenticateRequest = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }
  
  try {
    // Verify token with user service
    const userService = services.get('user-service');
    if (!userService) {
      throw new Error('User service not available');
    }
    
    const response = await axios.post(
      `http://${userService.host}:${userService.port}/verify-token`,
      { token }
    );
    
    req.user = response.data.data;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Load balancer for services
function getServiceUrl(serviceName) {
  const service = services.get(serviceName);
  if (!service) {
    throw new Error(`Service ${serviceName} not available`);
  }
  return `http://${service.host}:${service.port}`;
}

// Route definitions
const routes = [
  {
    path: '/api/auth',
    target: 'user-service',
    auth: false
  },
  {
    path: '/api/users',
    target: 'user-service',
    auth: true
  },
  {
    path: '/api/rooms',
    target: 'chat-service',
    auth: true
  },
  {
    path: '/api/messages',
    target: 'message-service',
    auth: true
  },
  {
    path: '/api/notifications',
    target: 'notification-service',
    auth: true
  }
];

// Setup proxy routes
routes.forEach(route => {
  const middleware = [];
  
  // Add authentication if required
  if (route.auth) {
    middleware.push(authenticateRequest);
  }
  
  // Add proxy middleware
  middleware.push(createProxyMiddleware({
    target: () => getServiceUrl(route.target),
    changeOrigin: true,
    pathRewrite: {
      [`^${route.path}`]: ''
    },
    onError: (err, req, res) => {
      console.error(`Proxy error for ${route.path}:`, err.message);
      res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable'
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add user context to request headers
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.userId);
        proxyReq.setHeader('X-User-Email', req.user.email);
      }
    }
  }));
  
  app.use(route.path, ...middleware);
});

// Health check
app.get('/health', (req, res) => {
  const serviceStatus = {};
  services.forEach((service, name) => {
    serviceStatus[name] = 'healthy';
  });
  
  res.json({
    service: 'api-gateway',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: serviceStatus
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚪 API Gateway running on port ${PORT}`);
  
  // Discover services periodically
  await discoverServices();
  setInterval(discoverServices, 30000); // Every 30 seconds
});
EOF

cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/

EXPOSE 3000

CMD ["npm", "start"]
EOF
```

**API Gateway Responsibilities:**

1. **Request Routing**: Route requests to appropriate services
2. **Authentication**: Verify tokens before forwarding requests
3. **Rate Limiting**: Protect services from abuse
4. **Load Balancing**: Distribute requests across service instances
5. **Service Discovery**: Find healthy service instances
6. **Request/Response Transformation**: Modify requests/responses as needed

## 📚 Chapter 6: Microservices Communication Patterns

### Step 6: Implement Service-to-Service Communication

```bash
# Create Message Service (MongoDB-based)
cd ../message-service

cat > package.json << 'EOF'
{
  "name": "message-service",
  "version": "1.0.0",
  "description": "Message management microservice",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongodb": "^6.1.0",
    "amqplib": "^0.10.3",
    "axios": "^1.5.0",
    "helmet": "^7.0.0",
    "cors": "^2.8.5"
  }
}
EOF

cat > src/app.js << 'EOF'
const express = require('express');
const { MongoClient } = require('mongodb');
const helmet = require('helmet');
const cors = require('cors');

// Import utilities
const EventPublisher = require('../../shared/utils/EventPublisher');
const EventSubscriber = require('../../shared/utils/EventSubscriber');
const { EVENT_TYPES } = require('../../shared/events');

const app = express();
const PORT = process.env.PORT || 3003;

// MongoDB connection
let db;
const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/messagedb';

// Initialize event system
const eventPublisher = new EventPublisher(process.env.RABBITMQ_URL);
const eventSubscriber = new EventSubscriber(process.env.RABBITMQ_URL, 'message-service');

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    db = client.db();
    
    // Create indexes
    await db.collection('messages').createIndex({ roomId: 1, createdAt: -1 });
    await db.collection('messages').createIndex({ userId: 1 });
    
    console.log('📊 Message Service connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Message routes
app.post('/messages', async (req, res) => {
  try {
    const { content, type = 'text', roomId, replyTo } = req.body;
    const userId = req.headers['x-user-id'];
    
    if (!content || !roomId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Content, room ID, and user ID are required'
      });
    }
    
    // Create message
    const message = {
      content,
      type,
      userId,
      roomId,
      replyTo: replyTo || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('messages').insertOne(message);
    message._id = result.insertedId;
    
    // Publish event
    await eventPublisher.publish(EVENT_TYPES.MESSAGE_SENT, {
      messageId: message._id.toString(),
      roomId: message.roomId,
      userId: message.userId,
      content: message.content,
      type: message.type,
      timestamp: message.createdAt
    });
    
    res.status(201).json({
      success: true,
      data: message,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

app.get('/messages/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const messages = await db.collection('messages')
      .find({ roomId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .toArray();
    
    res.json({
      success: true,
      data: messages.reverse(), // Show oldest first
      message: 'Messages retrieved successfully'
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages'
    });
  }
});

app.put('/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.headers['x-user-id'];
    
    // Check if message exists and user owns it
    const message = await db.collection('messages').findOne({
      _id: new ObjectId(id),
      userId
    });
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or unauthorized'
      });
    }
    
    // Update message
    const updatedMessage = await db.collection('messages').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          content, 
          updatedAt: new Date(),
          isEdited: true 
        } 
      },
      { returnDocument: 'after' }
    );
    
    // Publish event
    await eventPublisher.publish(EVENT_TYPES.MESSAGE_UPDATED, {
      messageId: id,
      roomId: updatedMessage.value.roomId,
      userId: updatedMessage.value.userId,
      content: updatedMessage.value.content,
      timestamp: new Date()
    });
    
    res.json({
      success: true,
      data: updatedMessage.value,
      message: 'Message updated successfully'
    });
  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message'
    });
  }
});

app.delete('/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];
    
    // Check if message exists and user owns it
    const message = await db.collection('messages').findOne({
      _id: new ObjectId(id),
      userId
    });
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or unauthorized'
      });
    }
    
    // Delete message
    await db.collection('messages').deleteOne({ _id: new ObjectId(id) });
    
    // Publish event
    await eventPublisher.publish(EVENT_TYPES.MESSAGE_DELETED, {
      messageId: id,
      roomId: message.roomId,
      userId: message.userId,
      timestamp: new Date()
    });
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'message-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: db ? 'connected' : 'disconnected'
  });
});

// Initialize and start server
async function startServer() {
  try {
    await connectToMongoDB();
    await eventPublisher.connect();
    await eventSubscriber.connect();
    
    app.listen(PORT, () => {
      console.log(`💬 Message Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
}

startServer();
EOF
```

## 🏆 Microservices Architecture Benefits & Challenges

### Benefits:
1. **Independent Scaling**: Scale services based on demand
2. **Technology Diversity**: Use best tool for each job
3. **Team Autonomy**: Teams can work independently
4. **Fault Isolation**: Service failures don't cascade
5. **Deployment Independence**: Deploy services separately

### Challenges:
1. **Complexity**: More moving parts to manage
2. **Network Latency**: Inter-service communication overhead
3. **Data Consistency**: Eventual consistency vs ACID
4. **Testing**: Integration testing becomes complex
5. **Monitoring**: Need distributed tracing and logging

### When to Use Microservices:
1. **Large Applications**: Complex business domains
2. **Large Teams**: Multiple development teams
3. **Scalability Requirements**: Different scaling needs per service
4. **Technology Diversity**: Need different tech stacks
5. **Organizational Maturity**: DevOps and monitoring capabilities

## 🏆 Mastery Checklist

After completing this guide, you should understand:

- [ ] Microservices architecture principles
- [ ] Service decomposition strategies
- [ ] Inter-service communication patterns
- [ ] Event-driven architecture
- [ ] API Gateway pattern
- [ ] Service discovery
- [ ] Data management in microservices
- [ ] Distributed system challenges
- [ ] Monitoring and observability
- [ ] When to choose microservices vs monolith

## 🚀 Next Steps

1. **Advanced Patterns**:
   - Circuit Breaker pattern
   - Saga pattern for distributed transactions
   - CQRS and Event Sourcing
   - Service Mesh (Istio, Linkerd)

2. **Observability**:
   - Distributed tracing (Jaeger, Zipkin)
   - Centralized logging (ELK stack)
   - Metrics and monitoring (Prometheus, Grafana)

3. **Deployment**:
   - Kubernetes orchestration
   - Docker Swarm
   - Service mesh deployment
   - Blue-green deployments

4. **Security**:
   - OAuth 2.0 / OpenID Connect
   - Service-to-service authentication
   - API security best practices
   - Zero-trust architecture

**🎉 Congratulations!** You've mastered microservices architecture and built a distributed chat application with proper service decomposition, event-driven communication, and scalable design!