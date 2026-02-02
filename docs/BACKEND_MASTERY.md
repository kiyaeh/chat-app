# 🚀 Backend Development Mastery: From Zero to Expert

Learn backend development by building real applications step by step. Every concept explained with WHY and HOW.

## 🎯 What is Backend Development?

**Backend Development** is like being the chef in a restaurant kitchen - you prepare everything behind the scenes so customers (frontend) get what they need.

**Real-world analogy**:
- **Frontend** = Restaurant dining area (what customers see)
- **Backend** = Kitchen (where food is prepared)
- **API** = Waiter (carries requests and responses)
- **Database** = Pantry (stores ingredients/data)

**Why Backend Development?**
- **Data Management**: Store and retrieve information
- **Business Logic**: Process requests and make decisions
- **Security**: Protect sensitive information
- **Integration**: Connect different systems
- **Scalability**: Handle millions of users

## 📚 Chapter 1: Backend Fundamentals

### Step 1: Understanding Client-Server Architecture
```
┌─────────────┐    HTTP Request     ┌─────────────┐
│   Client    │ ──────────────────► │   Server    │
│ (Frontend)  │                     │ (Backend)   │
│             │ ◄────────────────── │             │
└─────────────┘    HTTP Response    └─────────────┘
```

**What happens when you visit a website:**
1. **Client** (your browser) sends HTTP request
2. **Server** (backend) receives request
3. **Server** processes request (check database, run logic)
4. **Server** sends HTTP response back
5. **Client** displays the result

### Step 2: HTTP Methods and Status Codes
```bash
# HTTP Methods (Verbs)
GET    /users     # Read data (get all users)
POST   /users     # Create data (create new user)
PUT    /users/1   # Update data (update user 1)
DELETE /users/1   # Delete data (delete user 1)
```

**HTTP Status Codes:**
- **200 OK**: Success
- **201 Created**: Resource created successfully
- **400 Bad Request**: Client error (invalid data)
- **401 Unauthorized**: Authentication required
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server error

**Why these matter:**
- **Methods** tell server what action to perform
- **Status codes** tell client what happened
- **Consistent communication** between frontend and backend

### Step 3: Create Your First Backend Server
```bash
# Create project directory
mkdir my-backend
cd my-backend

# Initialize Node.js project
npm init -y

# Install Express.js (web framework)
npm install express

# Create server.js
cat > server.js << 'EOF'
const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// In-memory data store (temporary)
let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

// GET /users - Read all users
app.get('/users', (req, res) => {
  res.json({
    success: true,
    data: users,
    message: 'Users retrieved successfully'
  });
});

// GET /users/:id - Read specific user
app.get('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  res.json({
    success: true,
    data: user,
    message: 'User retrieved successfully'
  });
});

// POST /users - Create new user
app.post('/users', (req, res) => {
  const { name, email } = req.body;
  
  // Validation
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Name and email are required'
    });
  }
  
  // Create new user
  const newUser = {
    id: users.length + 1,
    name,
    email
  };
  
  users.push(newUser);
  
  res.status(201).json({
    success: true,
    data: newUser,
    message: 'User created successfully'
  });
});

// PUT /users/:id - Update user
app.put('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  const { name, email } = req.body;
  
  // Update user
  users[userIndex] = {
    ...users[userIndex],
    name: name || users[userIndex].name,
    email: email || users[userIndex].email
  };
  
  res.json({
    success: true,
    data: users[userIndex],
    message: 'User updated successfully'
  });
});

// DELETE /users/:id - Delete user
app.delete('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  users.splice(userIndex, 1);
  
  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation:`);
  console.log(`   GET    /users     - Get all users`);
  console.log(`   GET    /users/:id - Get user by ID`);
  console.log(`   POST   /users     - Create new user`);
  console.log(`   PUT    /users/:id - Update user`);
  console.log(`   DELETE /users/:id - Delete user`);
  console.log(`   GET    /health    - Health check`);
});
EOF

# Start the server
node server.js
```

**Code Breakdown:**

1. **Express.js**: Web framework for Node.js
   - **Why**: Simplifies HTTP server creation
   - **How**: Handles routing, middleware, requests/responses

2. **Middleware**: Functions that run before route handlers
   - `express.json()`: Parses JSON request bodies
   - **Why**: Transforms raw HTTP data into usable format

3. **Route Handlers**: Functions that respond to HTTP requests
   - **Pattern**: `app.METHOD(path, handler)`
   - **Why**: Define what happens for each endpoint

4. **Request/Response Objects**:
   - `req.params`: URL parameters (/users/:id)
   - `req.body`: Request body data
   - `res.json()`: Send JSON response
   - `res.status()`: Set HTTP status code

### Step 4: Test Your API
```bash
# Test with curl (in new terminal)
# Get all users
curl http://localhost:3000/users

# Get specific user
curl http://localhost:3000/users/1

# Create new user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob Wilson","email":"bob@example.com"}'

# Update user
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"John Updated"}'

# Delete user
curl -X DELETE http://localhost:3000/users/2

# Health check
curl http://localhost:3000/health
```

**What you learned:**
- Created RESTful API endpoints
- Handled different HTTP methods
- Implemented CRUD operations (Create, Read, Update, Delete)
- Added error handling and validation
- Used proper HTTP status codes

## 📚 Chapter 2: Database Integration

### Step 5: Understanding Databases
**Database** is like a digital filing cabinet that stores and organizes data.

**Types of Databases:**
1. **SQL (Relational)**: PostgreSQL, MySQL, SQLite
   - **Structure**: Tables with rows and columns
   - **Relationships**: Foreign keys connect tables
   - **Query Language**: SQL

2. **NoSQL (Non-relational)**: MongoDB, Redis, DynamoDB
   - **Structure**: Documents, key-value pairs, graphs
   - **Flexibility**: Schema-less or flexible schema
   - **Query Language**: Various (MongoDB Query Language, etc.)

### Step 6: Add Database to Your Backend
```bash
# Install SQLite (simple database for learning)
npm install sqlite3

# Create database.js
cat > database.js << 'EOF'
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath);

// Initialize database schema
db.serialize(() => {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Insert sample data
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO users (name, email) VALUES (?, ?)
  `);
  
  stmt.run('John Doe', 'john@example.com');
  stmt.run('Jane Smith', 'jane@example.com');
  stmt.finalize();
});

// Database operations
const UserModel = {
  // Get all users
  getAll: (callback) => {
    db.all('SELECT * FROM users ORDER BY created_at DESC', callback);
  },
  
  // Get user by ID
  getById: (id, callback) => {
    db.get('SELECT * FROM users WHERE id = ?', [id], callback);
  },
  
  // Create new user
  create: (userData, callback) => {
    const { name, email } = userData;
    db.run(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email],
      function(err) {
        if (err) return callback(err);
        // Return the created user
        UserModel.getById(this.lastID, callback);
      }
    );
  },
  
  // Update user
  update: (id, userData, callback) => {
    const { name, email } = userData;
    db.run(
      `UPDATE users 
       SET name = COALESCE(?, name), 
           email = COALESCE(?, email),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, email, id],
      function(err) {
        if (err) return callback(err);
        if (this.changes === 0) {
          return callback(new Error('User not found'));
        }
        UserModel.getById(id, callback);
      }
    );
  },
  
  // Delete user
  delete: (id, callback) => {
    db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
      if (err) return callback(err);
      callback(null, { deleted: this.changes > 0 });
    });
  }
};

module.exports = UserModel;
EOF
```

**Database Concepts Explained:**

1. **Schema**: Structure of your data
   - **Tables**: Like spreadsheets
   - **Columns**: Data fields (name, email, etc.)
   - **Rows**: Individual records
   - **Primary Key**: Unique identifier (id)

2. **SQL Queries**:
   - `SELECT`: Read data
   - `INSERT`: Create data
   - `UPDATE`: Modify data
   - `DELETE`: Remove data

3. **Callbacks**: Handle asynchronous database operations
   - **Why**: Database operations take time
   - **How**: Function called when operation completes

### Step 7: Update Server to Use Database
```bash
# Create server-with-db.js
cat > server-with-db.js << 'EOF'
const express = require('express');
const UserModel = require('./database');
const app = express();
const PORT = 3000;

app.use(express.json());

// GET /users - Read all users
app.get('/users', (req, res) => {
  UserModel.getAll((err, users) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message
      });
    }
    
    res.json({
      success: true,
      data: users,
      count: users.length,
      message: 'Users retrieved successfully'
    });
  });
});

// GET /users/:id - Read specific user
app.get('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  
  UserModel.getById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message
      });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user,
      message: 'User retrieved successfully'
    });
  });
});

// POST /users - Create new user
app.post('/users', (req, res) => {
  const { name, email } = req.body;
  
  // Validation
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Name and email are required'
    });
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }
  
  UserModel.create({ name, email }, (err, user) => {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message
      });
    }
    
    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  });
});

// PUT /users/:id - Update user
app.put('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, email } = req.body;
  
  // Email validation if provided
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }
  }
  
  UserModel.update(userId, { name, email }, (err, user) => {
    if (err) {
      if (err.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message
      });
    }
    
    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  });
});

// DELETE /users/:id - Delete user
app.delete('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  
  UserModel.delete(userId, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message
      });
    }
    
    if (!result.deleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  });
});

// Health check with database status
app.get('/health', (req, res) => {
  UserModel.getAll((err, users) => {
    res.json({
      status: err ? 'ERROR' : 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: err ? 'disconnected' : 'connected',
      users_count: err ? 0 : users.length
    });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server with Database running on http://localhost:${PORT}`);
  console.log(`📊 Database: SQLite (users.db)`);
});
EOF

# Run server with database
node server-with-db.js
```

**What you learned:**
- Integrated SQLite database
- Created database schema and models
- Implemented proper error handling
- Added data validation
- Used SQL queries for CRUD operations

## 📚 Chapter 3: Authentication & Security

### Step 8: Understanding Authentication
**Authentication** is like checking ID at a club entrance.

**Key Concepts:**
1. **Authentication**: Who are you? (Login)
2. **Authorization**: What can you do? (Permissions)
3. **JWT (JSON Web Token)**: Digital ID card
4. **Hashing**: One-way encryption for passwords

### Step 9: Add Authentication System
```bash
# Install authentication packages
npm install bcryptjs jsonwebtoken

# Create auth.js
cat > auth.js << 'EOF'
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();

const JWT_SECRET = 'your-super-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Database connection
const db = new sqlite3.Database('users.db');

// Create users table with password field
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS auth_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

const AuthModel = {
  // Register new user
  register: async (userData, callback) => {
    const { username, email, password } = userData;
    
    try {
      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      // Insert user
      db.run(
        'INSERT INTO auth_users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, passwordHash],
        function(err) {
          if (err) return callback(err);
          
          // Get created user (without password)
          db.get(
            'SELECT id, username, email, role, created_at FROM auth_users WHERE id = ?',
            [this.lastID],
            callback
          );
        }
      );
    } catch (err) {
      callback(err);
    }
  },
  
  // Login user
  login: async (credentials, callback) => {
    const { email, password } = credentials;
    
    // Get user with password
    db.get(
      'SELECT * FROM auth_users WHERE email = ?',
      [email],
      async (err, user) => {
        if (err) return callback(err);
        if (!user) return callback(new Error('Invalid credentials'));
        
        try {
          // Verify password
          const isValidPassword = await bcrypt.compare(password, user.password_hash);
          if (!isValidPassword) {
            return callback(new Error('Invalid credentials'));
          }
          
          // Generate JWT token
          const token = jwt.sign(
            { 
              userId: user.id, 
              email: user.email,
              role: user.role 
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
          );
          
          // Return user data (without password) and token
          const { password_hash, ...userWithoutPassword } = user;
          callback(null, {
            user: userWithoutPassword,
            token
          });
        } catch (err) {
          callback(err);
        }
      }
    );
  },
  
  // Verify JWT token
  verifyToken: (token, callback) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get current user data
      db.get(
        'SELECT id, username, email, role FROM auth_users WHERE id = ?',
        [decoded.userId],
        (err, user) => {
          if (err) return callback(err);
          if (!user) return callback(new Error('User not found'));
          
          callback(null, user);
        }
      );
    } catch (err) {
      callback(err);
    }
  }
};

module.exports = AuthModel;
EOF
```

**Authentication Concepts:**

1. **Password Hashing**:
   - **Why**: Never store plain text passwords
   - **How**: bcrypt creates one-way hash
   - **Salt**: Random data added to prevent rainbow table attacks

2. **JWT (JSON Web Token)**:
   - **Structure**: Header.Payload.Signature
   - **Stateless**: Server doesn't store session data
   - **Portable**: Can be used across different services

3. **Middleware**: Functions that run before route handlers
   - **Authentication middleware**: Verify user identity
   - **Authorization middleware**: Check user permissions

### Step 10: Create Authentication Middleware
```bash
# Create middleware.js
cat > middleware.js << 'EOF'
const AuthModel = require('./auth');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }
  
  // Verify token
  AuthModel.verifyToken(token, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    // Add user to request object
    req.user = user;
    next(); // Continue to next middleware/route handler
  });
};

// Authorization middleware (check roles)
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

// Rate limiting middleware (simple implementation)
const rateLimitMap = new Map();

const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitMap.has(clientIP)) {
      rateLimitMap.set(clientIP, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const clientData = rateLimitMap.get(clientIP);
    
    if (now > clientData.resetTime) {
      // Reset window
      clientData.count = 1;
      clientData.resetTime = now + windowMs;
      return next();
    }
    
    if (clientData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later'
      });
    }
    
    clientData.count++;
    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  rateLimit
};
EOF
```

## 📚 Chapter 4: Complete Backend Application

### Step 11: Build Complete Authenticated API
```bash
# Create complete-server.js
cat > complete-server.js << 'EOF'
const express = require('express');
const AuthModel = require('./auth');
const UserModel = require('./database');
const { authenticateToken, requireRole, rateLimit } = require('./middleware');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(rateLimit(100, 15 * 60 * 1000)); // 100 requests per 15 minutes

// Public routes (no authentication required)

// POST /auth/register - Register new user
app.post('/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  // Validation
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username, email, and password are required'
    });
  }
  
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }
  
  AuthModel.register({ username, email, password }, (err, user) => {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({
          success: false,
          message: 'Username or email already exists'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: err.message
      });
    }
    
    res.status(201).json({
      success: true,
      data: user,
      message: 'User registered successfully'
    });
  });
});

// POST /auth/login - Login user
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  
  AuthModel.login({ email, password }, (err, result) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: err.message
      });
    }
    
    res.json({
      success: true,
      data: result,
      message: 'Login successful'
    });
  });
});

// Protected routes (authentication required)

// GET /auth/me - Get current user profile
app.get('/auth/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: req.user,
    message: 'Profile retrieved successfully'
  });
});

// GET /users - Get all users (authenticated users only)
app.get('/users', authenticateToken, (req, res) => {
  UserModel.getAll((err, users) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message
      });
    }
    
    res.json({
      success: true,
      data: users,
      count: users.length,
      message: 'Users retrieved successfully'
    });
  });
});

// Admin-only routes

// DELETE /users/:id - Delete user (admin only)
app.delete('/users/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  const userId = parseInt(req.params.id);
  
  UserModel.delete(userId, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message
      });
    }
    
    if (!result.deleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Complete Backend Server running on http://localhost:${PORT}`);
  console.log(`📚 API Endpoints:`);
  console.log(`   POST   /auth/register - Register new user`);
  console.log(`   POST   /auth/login    - Login user`);
  console.log(`   GET    /auth/me       - Get current user (protected)`);
  console.log(`   GET    /users         - Get all users (protected)`);
  console.log(`   DELETE /users/:id     - Delete user (admin only)`);
  console.log(`   GET    /health        - Health check`);
});
EOF

# Run complete server
node complete-server.js
```

### Step 12: Test Complete Authentication System
```bash
# Register new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login user (save the token from response)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Use token to access protected route (replace YOUR_TOKEN)
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get all users (protected)
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🏆 Mastery Checklist

After completing this guide, you should understand:

- [ ] Client-server architecture
- [ ] HTTP methods and status codes
- [ ] RESTful API design
- [ ] Database integration (SQL)
- [ ] CRUD operations
- [ ] Authentication vs Authorization
- [ ] Password hashing and JWT tokens
- [ ] Middleware patterns
- [ ] Error handling
- [ ] Input validation
- [ ] Rate limiting
- [ ] Security best practices

## 🚀 Next Steps

1. **Learn Advanced Topics**:
   - Database relationships (foreign keys)
   - Query optimization
   - Caching strategies
   - API versioning

2. **Explore Frameworks**:
   - NestJS (TypeScript)
   - Fastify (Performance)
   - Koa.js (Modern)

3. **Database Technologies**:
   - PostgreSQL (Production SQL)
   - MongoDB (NoSQL)
   - Redis (Caching)

4. **DevOps & Deployment**:
   - Docker containers
   - Cloud deployment (AWS, GCP, Azure)
   - CI/CD pipelines

**🎉 Congratulations!** You've built a complete backend application with authentication, database integration, and security features!