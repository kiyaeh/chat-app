# 🏗️ Monolithic Architecture Mastery: From Concept to Production

Learn monolithic architecture by building real applications step by step. Every concept explained with practical examples.

## 🎯 What is Monolithic Architecture?

**Monolithic Architecture** is like building a traditional house - everything is connected and built as one solid structure.

**Real-world analogy**:
- **Monolith** = Traditional house (all rooms connected, shared utilities)
- **Database** = Foundation (supports everything)
- **Business Logic** = Living spaces (where work happens)
- **API Layer** = Front door (single entry point)

**Why Monolithic Architecture?**
- **Simplicity**: One codebase, one deployment
- **Performance**: No network calls between components
- **Development Speed**: Easy to develop and test locally
- **Consistency**: Shared database ensures data consistency
- **Debugging**: Easier to trace issues across the system

## 📚 Chapter 1: Monolithic Fundamentals

### Step 1: Understanding Monolithic vs Other Architectures

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

MICROSERVICES ARCHITECTURE (for comparison)
┌─────────┐    ┌─────────┐    ┌─────────┐
│Service A│    │Service B│    │Service C│
│   +DB   │    │   +DB   │    │   +DB   │
└─────────┘    └─────────┘    └─────────┘
```

**Monolithic Characteristics:**
1. **Single Deployable Unit**: One application file
2. **Shared Database**: All components use same database
3. **In-Process Communication**: Function calls, not network calls
4. **Centralized Business Logic**: All rules in one place
5. **Single Technology Stack**: Usually one programming language

### Step 2: Design Monolithic Application Structure

```bash
# Create monolithic chat application structure
mkdir monolithic-chat-app
cd monolithic-chat-app

# Create directory structure
mkdir -p src/{controllers,services,models,middleware,utils,config}
mkdir -p src/views/{auth,chat,admin}
mkdir -p public/{css,js,images}
mkdir -p tests/{unit,integration}

# Initialize project
npm init -y

# Install dependencies
npm install express ejs bcryptjs jsonwebtoken sqlite3 socket.io multer express-session connect-sqlite3 helmet cors express-rate-limit

# Create package.json scripts
cat > package.json << 'EOF'
{
  "name": "monolithic-chat-app",
  "version": "1.0.0",
  "description": "Complete monolithic chat application",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "db:setup": "node src/scripts/setup-database.js",
    "db:seed": "node src/scripts/seed-database.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "ejs": "^3.1.9",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "sqlite3": "^5.1.6",
    "socket.io": "^4.7.2",
    "multer": "^1.4.5",
    "express-session": "^1.17.3",
    "connect-sqlite3": "^0.9.13",
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
```

**Directory Structure Explained:**

1. **src/controllers**: Handle HTTP requests and responses
2. **src/services**: Business logic and data processing
3. **src/models**: Database models and data access
4. **src/middleware**: Authentication, validation, logging
5. **src/views**: HTML templates (EJS)
6. **src/config**: Configuration files
7. **public**: Static files (CSS, JS, images)

### Step 3: Create Database Layer (Models)

```bash
# Create database configuration
cat > src/config/database.js << 'EOF'
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = null;
    this.init();
  }

  init() {
    const dbPath = path.join(__dirname, '../../data/chat.db');
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('📊 Connected to SQLite database');
        this.createTables();
      }
    });
  }

  createTables() {
    // Users table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(255),
        role VARCHAR(20) DEFAULT 'user',
        is_online BOOLEAN DEFAULT 0,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Rooms table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        type VARCHAR(20) DEFAULT 'public',
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `);

    // Messages table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'text',
        user_id INTEGER NOT NULL,
        room_id INTEGER NOT NULL,
        reply_to INTEGER,
        file_url VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (room_id) REFERENCES rooms (id),
        FOREIGN KEY (reply_to) REFERENCES messages (id)
      )
    `);

    // Room members table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS room_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        room_id INTEGER NOT NULL,
        role VARCHAR(20) DEFAULT 'member',
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (room_id) REFERENCES rooms (id),
        UNIQUE(user_id, room_id)
      )
    `);

    // Sessions table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR(255) PRIMARY KEY,
        sess TEXT NOT NULL,
        expire DATETIME NOT NULL
      )
    `);

    console.log('📋 Database tables created/verified');
  }

  getConnection() {
    return this.db;
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('📊 Database connection closed');
        }
      });
    }
  }
}

module.exports = new Database();
EOF

# Create User model
cat > src/models/User.js << 'EOF'
const database = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.avatar_url = data.avatar_url;
    this.role = data.role;
    this.is_online = data.is_online;
    this.last_seen = data.last_seen;
    this.created_at = data.created_at;
  }

  // Create new user
  static async create(userData) {
    return new Promise((resolve, reject) => {
      const { username, email, password } = userData;
      
      // Hash password
      bcrypt.hash(password, 12, (err, hash) => {
        if (err) return reject(err);
        
        const db = database.getConnection();
        db.run(
          'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
          [username, email, hash],
          function(err) {
            if (err) return reject(err);
            
            // Return created user
            User.findById(this.lastID)
              .then(resolve)
              .catch(reject);
          }
        );
      });
    });
  }

  // Find user by ID
  static async findById(id) {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      db.get(
        'SELECT * FROM users WHERE id = ?',
        [id],
        (err, row) => {
          if (err) return reject(err);
          if (!row) return resolve(null);
          resolve(new User(row));
        }
      );
    });
  }

  // Find user by email
  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      db.get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, row) => {
          if (err) return reject(err);
          if (!row) return resolve(null);
          resolve(row); // Return raw data for password verification
        }
      );
    });
  }

  // Get all users
  static async findAll() {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      db.all(
        'SELECT id, username, email, avatar_url, role, is_online, last_seen FROM users ORDER BY created_at DESC',
        [],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows.map(row => new User(row)));
        }
      );
    });
  }

  // Update user online status
  static async updateOnlineStatus(userId, isOnline) {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      db.run(
        'UPDATE users SET is_online = ?, last_seen = CURRENT_TIMESTAMP WHERE id = ?',
        [isOnline ? 1 : 0, userId],
        function(err) {
          if (err) return reject(err);
          resolve(this.changes > 0);
        }
      );
    });
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update user profile
  async update(updateData) {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      const fields = [];
      const values = [];
      
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });
      
      if (fields.length === 0) return resolve(this);
      
      values.push(this.id);
      
      db.run(
        `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values,
        (err) => {
          if (err) return reject(err);
          
          // Reload user data
          User.findById(this.id)
            .then(resolve)
            .catch(reject);
        }
      );
    });
  }
}

module.exports = User;
EOF
```

**Model Layer Explained:**

1. **Database Abstraction**: Models hide SQL complexity from business logic
2. **Data Validation**: Models ensure data integrity
3. **Relationships**: Foreign keys maintain data consistency
4. **Business Methods**: User-specific operations (password verification)
5. **Promise-based**: Async operations for better performance

### Step 4: Create Service Layer (Business Logic)

```bash
# Create Authentication Service
cat > src/services/AuthService.js << 'EOF'
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  }

  // Register new user
  async register(userData) {
    try {
      // Validate input
      const { username, email, password } = userData;
      
      if (!username || !email || !password) {
        throw new Error('Username, email, and password are required');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      // Create user
      const user = await User.create({ username, email, password });
      
      // Generate token
      const token = this.generateToken(user);
      
      return {
        user,
        token,
        message: 'User registered successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Login user
  async login(credentials) {
    try {
      const { email, password } = credentials;
      
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Find user with password
      const userData = await User.findByEmail(email);
      if (!userData) {
        throw new Error('Invalid email or password');
      }
      
      // Verify password
      const isValidPassword = await User.verifyPassword(password, userData.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }
      
      // Create user object (without password)
      const user = new User(userData);
      
      // Update online status
      await User.updateOnlineStatus(user.id, true);
      
      // Generate token
      const token = this.generateToken(user);
      
      return {
        user,
        token,
        message: 'Login successful'
      };
    } catch (error) {
      throw error;
    }
  }

  // Logout user
  async logout(userId) {
    try {
      await User.updateOnlineStatus(userId, false);
      return { message: 'Logout successful' };
    } catch (error) {
      throw error;
    }
  }

  // Generate JWT token
  generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };
    
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    });
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Get user from token
  async getUserFromToken(token) {
    try {
      const decoded = this.verifyToken(token);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();
EOF

# Create Chat Service
cat > src/services/ChatService.js << 'EOF'
const database = require('../config/database');

class ChatService {
  // Create new room
  async createRoom(roomData, creatorId) {
    return new Promise((resolve, reject) => {
      const { name, description, type = 'public' } = roomData;
      
      if (!name) {
        return reject(new Error('Room name is required'));
      }
      
      const db = database.getConnection();
      
      // Create room
      db.run(
        'INSERT INTO rooms (name, description, type, created_by) VALUES (?, ?, ?, ?)',
        [name, description, type, creatorId],
        function(err) {
          if (err) return reject(err);
          
          const roomId = this.lastID;
          
          // Add creator as admin member
          db.run(
            'INSERT INTO room_members (user_id, room_id, role) VALUES (?, ?, ?)',
            [creatorId, roomId, 'admin'],
            (err) => {
              if (err) return reject(err);
              
              // Return created room
              ChatService.prototype.getRoomById(roomId)
                .then(resolve)
                .catch(reject);
            }
          );
        }
      );
    });
  }

  // Get room by ID
  async getRoomById(roomId) {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      db.get(
        `SELECT r.*, u.username as creator_name 
         FROM rooms r 
         LEFT JOIN users u ON r.created_by = u.id 
         WHERE r.id = ?`,
        [roomId],
        (err, row) => {
          if (err) return reject(err);
          if (!row) return resolve(null);
          resolve(row);
        }
      );
    });
  }

  // Get all public rooms
  async getPublicRooms() {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      db.all(
        `SELECT r.*, u.username as creator_name,
                COUNT(rm.user_id) as member_count
         FROM rooms r 
         LEFT JOIN users u ON r.created_by = u.id
         LEFT JOIN room_members rm ON r.id = rm.room_id
         WHERE r.type = 'public'
         GROUP BY r.id
         ORDER BY r.created_at DESC`,
        [],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }

  // Join room
  async joinRoom(userId, roomId) {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      
      // Check if already a member
      db.get(
        'SELECT * FROM room_members WHERE user_id = ? AND room_id = ?',
        [userId, roomId],
        (err, row) => {
          if (err) return reject(err);
          if (row) return reject(new Error('Already a member of this room'));
          
          // Add as member
          db.run(
            'INSERT INTO room_members (user_id, room_id) VALUES (?, ?)',
            [userId, roomId],
            function(err) {
              if (err) return reject(err);
              resolve({ message: 'Joined room successfully' });
            }
          );
        }
      );
    });
  }

  // Send message
  async sendMessage(messageData) {
    return new Promise((resolve, reject) => {
      const { content, type = 'text', userId, roomId, replyTo } = messageData;
      
      if (!content || !userId || !roomId) {
        return reject(new Error('Content, user ID, and room ID are required'));
      }
      
      const db = database.getConnection();
      
      // Check if user is member of room
      db.get(
        'SELECT * FROM room_members WHERE user_id = ? AND room_id = ?',
        [userId, roomId],
        (err, row) => {
          if (err) return reject(err);
          if (!row) return reject(new Error('User is not a member of this room'));
          
          // Insert message
          db.run(
            'INSERT INTO messages (content, type, user_id, room_id, reply_to) VALUES (?, ?, ?, ?, ?)',
            [content, type, userId, roomId, replyTo || null],
            function(err) {
              if (err) return reject(err);
              
              // Get created message with user info
              db.get(
                `SELECT m.*, u.username, u.avatar_url 
                 FROM messages m 
                 JOIN users u ON m.user_id = u.id 
                 WHERE m.id = ?`,
                [this.lastID],
                (err, message) => {
                  if (err) return reject(err);
                  resolve(message);
                }
              );
            }
          );
        }
      );
    });
  }

  // Get room messages
  async getRoomMessages(roomId, limit = 50, offset = 0) {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      db.all(
        `SELECT m.*, u.username, u.avatar_url,
                rm.content as reply_content, ru.username as reply_username
         FROM messages m 
         JOIN users u ON m.user_id = u.id
         LEFT JOIN messages rm ON m.reply_to = rm.id
         LEFT JOIN users ru ON rm.user_id = ru.id
         WHERE m.room_id = ?
         ORDER BY m.created_at DESC
         LIMIT ? OFFSET ?`,
        [roomId, limit, offset],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows.reverse()); // Reverse to show oldest first
        }
      );
    });
  }

  // Get user's rooms
  async getUserRooms(userId) {
    return new Promise((resolve, reject) => {
      const db = database.getConnection();
      db.all(
        `SELECT r.*, rm.role, rm.joined_at,
                COUNT(DISTINCT rm2.user_id) as member_count,
                MAX(m.created_at) as last_message_at
         FROM rooms r
         JOIN room_members rm ON r.id = rm.room_id
         LEFT JOIN room_members rm2 ON r.id = rm2.room_id
         LEFT JOIN messages m ON r.id = m.room_id
         WHERE rm.user_id = ?
         GROUP BY r.id
         ORDER BY last_message_at DESC NULLS LAST`,
        [userId],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }
}

module.exports = new ChatService();
EOF
```

**Service Layer Benefits:**

1. **Business Logic Separation**: Keep controllers thin
2. **Reusability**: Services can be used by multiple controllers
3. **Testability**: Easy to unit test business logic
4. **Transaction Management**: Handle complex database operations
5. **Error Handling**: Centralized error processing

### Step 5: Create Controller Layer (HTTP Handlers)

```bash
# Create Authentication Controller
cat > src/controllers/AuthController.js << 'EOF'
const AuthService = require('../services/AuthService');

class AuthController {
  // Render login page
  async showLogin(req, res) {
    if (req.session.user) {
      return res.redirect('/chat');
    }
    res.render('auth/login', { 
      title: 'Login',
      error: req.query.error 
    });
  }

  // Render register page
  async showRegister(req, res) {
    if (req.session.user) {
      return res.redirect('/chat');
    }
    res.render('auth/register', { 
      title: 'Register',
      error: req.query.error 
    });
  }

  // Handle login
  async login(req, res) {
    try {
      const result = await AuthService.login(req.body);
      
      // Store user in session
      req.session.user = result.user;
      req.session.token = result.token;
      
      // API response
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json({
          success: true,
          data: result,
          message: result.message
        });
      }
      
      // Web response
      res.redirect('/chat');
    } catch (error) {
      // API response
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      // Web response
      res.redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  // Handle register
  async register(req, res) {
    try {
      const result = await AuthService.register(req.body);
      
      // Store user in session
      req.session.user = result.user;
      req.session.token = result.token;
      
      // API response
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(201).json({
          success: true,
          data: result,
          message: result.message
        });
      }
      
      // Web response
      res.redirect('/chat');
    } catch (error) {
      // API response
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      // Web response
      res.redirect(`/register?error=${encodeURIComponent(error.message)}`);
    }
  }

  // Handle logout
  async logout(req, res) {
    try {
      if (req.session.user) {
        await AuthService.logout(req.session.user.id);
      }
      
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
        }
        
        // API response
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
          return res.json({
            success: true,
            message: 'Logout successful'
          });
        }
        
        // Web response
        res.redirect('/login');
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      res.json({
        success: true,
        data: req.session.user,
        message: 'Profile retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AuthController();
EOF

# Create Chat Controller
cat > src/controllers/ChatController.js << 'EOF'
const ChatService = require('../services/ChatService');
const User = require('../models/User');

class ChatController {
  // Show chat interface
  async showChat(req, res) {
    try {
      const user = req.session.user;
      const rooms = await ChatService.getUserRooms(user.id);
      const publicRooms = await ChatService.getPublicRooms();
      
      res.render('chat/index', {
        title: 'Chat',
        user,
        rooms,
        publicRooms
      });
    } catch (error) {
      res.status(500).render('error', {
        title: 'Error',
        message: error.message
      });
    }
  }

  // API: Get user's rooms
  async getUserRooms(req, res) {
    try {
      const rooms = await ChatService.getUserRooms(req.session.user.id);
      res.json({
        success: true,
        data: rooms,
        message: 'Rooms retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // API: Get public rooms
  async getPublicRooms(req, res) {
    try {
      const rooms = await ChatService.getPublicRooms();
      res.json({
        success: true,
        data: rooms,
        message: 'Public rooms retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // API: Create new room
  async createRoom(req, res) {
    try {
      const room = await ChatService.createRoom(req.body, req.session.user.id);
      res.status(201).json({
        success: true,
        data: room,
        message: 'Room created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // API: Join room
  async joinRoom(req, res) {
    try {
      const { roomId } = req.params;
      const result = await ChatService.joinRoom(req.session.user.id, roomId);
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // API: Get room messages
  async getRoomMessages(req, res) {
    try {
      const { roomId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      
      const messages = await ChatService.getRoomMessages(
        roomId, 
        parseInt(limit), 
        parseInt(offset)
      );
      
      res.json({
        success: true,
        data: messages,
        message: 'Messages retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // API: Send message
  async sendMessage(req, res) {
    try {
      const { roomId } = req.params;
      const messageData = {
        ...req.body,
        userId: req.session.user.id,
        roomId
      };
      
      const message = await ChatService.sendMessage(messageData);
      
      res.status(201).json({
        success: true,
        data: message,
        message: 'Message sent successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // API: Get online users
  async getOnlineUsers(req, res) {
    try {
      const users = await User.findAll();
      const onlineUsers = users.filter(user => user.is_online);
      
      res.json({
        success: true,
        data: onlineUsers,
        count: onlineUsers.length,
        message: 'Online users retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ChatController();
EOF
```

**Controller Layer Responsibilities:**

1. **HTTP Request Handling**: Parse requests, validate input
2. **Response Formatting**: JSON for API, HTML for web
3. **Session Management**: Handle user sessions
4. **Error Handling**: Convert service errors to HTTP responses
5. **Routing Logic**: Determine which service to call

## 📚 Chapter 5: Complete Monolithic Application

### Step 6: Create Application Entry Point

```bash
# Create main application file
cat > src/app.js << 'EOF'
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

// Import controllers
const AuthController = require('./controllers/AuthController');
const ChatController = require('./controllers/ChatController');

// Import middleware
const { requireAuth, requireGuest } = require('./middleware/auth');

// Import services
const ChatService = require('./services/ChatService');
const User = require('./models/User');

// Initialize database
require('./config/database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://cdn.socket.io"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session configuration
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.db',
    dir: path.join(__dirname, '../data')
  }),
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Make user available in all templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routes

// Home route
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/chat');
  }
  res.redirect('/login');
});

// Authentication routes
app.get('/login', requireGuest, AuthController.showLogin);
app.get('/register', requireGuest, AuthController.showRegister);
app.post('/login', requireGuest, AuthController.login);
app.post('/register', requireGuest, AuthController.register);
app.post('/logout', requireAuth, AuthController.logout);

// API routes
app.get('/api/auth/profile', requireAuth, AuthController.getProfile);
app.get('/api/rooms', requireAuth, ChatController.getUserRooms);
app.get('/api/rooms/public', requireAuth, ChatController.getPublicRooms);
app.post('/api/rooms', requireAuth, ChatController.createRoom);
app.post('/api/rooms/:roomId/join', requireAuth, ChatController.joinRoom);
app.get('/api/rooms/:roomId/messages', requireAuth, ChatController.getRoomMessages);
app.post('/api/rooms/:roomId/messages', requireAuth, ChatController.sendMessage);
app.get('/api/users/online', requireAuth, ChatController.getOnlineUsers);

// Chat interface
app.get('/chat', requireAuth, ChatController.showChat);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Socket.IO for real-time communication
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join user to their rooms
  socket.on('join-rooms', async (data) => {
    try {
      const { userId } = data;
      const rooms = await ChatService.getUserRooms(userId);
      
      rooms.forEach(room => {
        socket.join(`room-${room.id}`);
      });
      
      // Update user online status
      await User.updateOnlineStatus(userId, true);
      
      // Broadcast user online status
      socket.broadcast.emit('user-online', { userId });
    } catch (error) {
      console.error('Join rooms error:', error);
    }
  });
  
  // Handle new message
  socket.on('send-message', async (data) => {
    try {
      const message = await ChatService.sendMessage(data);
      
      // Broadcast to room members
      io.to(`room-${data.roomId}`).emit('new-message', message);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });
  
  // Handle typing indicator
  socket.on('typing', (data) => {
    socket.to(`room-${data.roomId}`).emit('user-typing', {
      userId: data.userId,
      username: data.username,
      isTyping: data.isTyping
    });
  });
  
  // Handle disconnect
  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    // Note: In production, you'd need to track user-socket mapping
    // to update online status properly
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } else {
    res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong!'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  } else {
    res.status(404).render('error', {
      title: '404 - Not Found',
      message: 'Page not found'
    });
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Monolithic Chat App running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Session store: SQLite`);
  console.log(`⚡ Real-time: Socket.IO enabled`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
EOF

# Create authentication middleware
cat > src/middleware/auth.js << 'EOF'
// Require authentication
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    return res.redirect('/login');
  }
  next();
};

// Require guest (not authenticated)
const requireGuest = (req, res, next) => {
  if (req.session.user) {
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(400).json({
        success: false,
        message: 'Already authenticated'
      });
    }
    return res.redirect('/chat');
  }
  next();
};

module.exports = {
  requireAuth,
  requireGuest
};
EOF
```

## 🏆 Monolithic Architecture Benefits

### Advantages:
1. **Simple Development**: Single codebase, easy to understand
2. **Easy Testing**: Test entire application as one unit
3. **Simple Deployment**: One artifact to deploy
4. **Performance**: No network latency between components
5. **ACID Transactions**: Database consistency across all operations
6. **Debugging**: Easy to trace requests through the system

### When to Use Monolithic Architecture:
1. **Small to Medium Applications**: Less than 100,000 users
2. **Simple Business Logic**: Not too many different domains
3. **Small Development Team**: 2-8 developers
4. **Rapid Prototyping**: Quick to build and iterate
5. **Limited Resources**: Single server deployment

### Scaling Strategies:
1. **Vertical Scaling**: Increase server resources (CPU, RAM)
2. **Load Balancing**: Multiple instances behind load balancer
3. **Database Optimization**: Indexing, query optimization
4. **Caching**: Redis, Memcached for frequently accessed data
5. **CDN**: Static asset delivery

## 🏆 Mastery Checklist

After completing this guide, you should understand:

- [ ] Monolithic architecture principles
- [ ] Layered architecture (Controller-Service-Model)
- [ ] Database design and relationships
- [ ] Session-based authentication
- [ ] Real-time communication with WebSockets
- [ ] Error handling and logging
- [ ] Security best practices
- [ ] Performance optimization
- [ ] Deployment strategies
- [ ] When to use monolithic vs microservices

## 🚀 Next Steps

1. **Add Features**:
   - File upload for messages
   - User profiles and avatars
   - Room permissions and moderation
   - Message search and history

2. **Performance Optimization**:
   - Database indexing
   - Query optimization
   - Caching layer (Redis)
   - Connection pooling

3. **Production Deployment**:
   - Environment configuration
   - Process management (PM2)
   - Reverse proxy (Nginx)
   - SSL/HTTPS setup

4. **Monitoring**:
   - Application logs
   - Performance metrics
   - Error tracking
   - Health checks

**🎉 Congratulations!** You've built a complete monolithic chat application with real-time features, authentication, and proper architecture!