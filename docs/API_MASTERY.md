# 🚀 API Development Mastery: From Zero to Hero

Learn API development by building production-ready APIs step by step. Every concept explained with practical examples.

## 🎯 What is API Development?

**API (Application Programming Interface)** is like a waiter in a restaurant - it takes your order (request), communicates with the kitchen (server), and brings back your food (response).

**Why APIs Matter:**
- **Integration**: Connect different systems and services
- **Scalability**: Handle thousands of concurrent requests
- **Flexibility**: Support multiple client types (web, mobile, IoT)
- **Reusability**: One API serves multiple applications
- **Business Value**: Enable partnerships and third-party integrations

## 📚 Chapter 1: API Fundamentals

### Step 1: Understanding HTTP and REST

```bash
# HTTP Methods and their purposes
GET    /users          # Retrieve all users
GET    /users/123      # Retrieve specific user
POST   /users          # Create new user
PUT    /users/123      # Update entire user
PATCH  /users/123      # Update partial user
DELETE /users/123      # Delete user
```

**HTTP Status Codes:**
- **2xx Success**: 200 OK, 201 Created, 204 No Content
- **3xx Redirection**: 301 Moved Permanently, 304 Not Modified
- **4xx Client Error**: 400 Bad Request, 401 Unauthorized, 404 Not Found
- **5xx Server Error**: 500 Internal Server Error, 503 Service Unavailable

### Step 2: Create Your First RESTful API

```bash
# Create API project
mkdir api-mastery
cd api-mastery

# Initialize project
npm init -y

# Install dependencies
npm install express cors helmet morgan compression
npm install express-rate-limit express-validator
npm install jsonwebtoken bcryptjs
npm install swagger-jsdoc swagger-ui-express
npm install jest supertest nodemon

# Create project structure
mkdir -p src/{controllers,middleware,models,routes,utils,config}
mkdir -p tests/{unit,integration}
```

### Step 3: Basic API Server Setup

```javascript
// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later'
  }
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.details
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token'
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
});

module.exports = app;
```

### Step 4: Request Validation and Error Handling

```javascript
// src/middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// User validation rules
const userValidation = {
  create: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('username')
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username must be 3-30 characters, alphanumeric and underscore only'),
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must be at least 8 characters with uppercase, lowercase, number and special character'),
    validate
  ],
  
  update: [
    param('id').isUUID().withMessage('Valid user ID is required'),
    body('email').optional().isEmail().normalizeEmail(),
    body('username').optional().isLength({ min: 3, max: 30 }),
    validate
  ],
  
  get: [
    param('id').isUUID().withMessage('Valid user ID is required'),
    validate
  ],
  
  list: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isLength({ min: 1, max: 100 }),
    validate
  ]
};

module.exports = {
  validate,
  userValidation
};
```

## 📚 Chapter 2: Advanced API Patterns

### Step 5: Authentication and Authorization

```javascript
// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthService {
  // Generate JWT token
  generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      issuer: 'api-mastery',
      audience: 'api-users'
    });
  }

  // Generate refresh token
  generateRefreshToken(payload) {
    return jwt.sign(
      { ...payload, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
  }

  // Verify token
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Hash password
  async hashPassword(password) {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Compare password
  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }
}

// Authentication middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access token is required'
    });
  }

  try {
    const authService = new AuthService();
    const decoded = authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or expired token'
    });
  }
};

// Authorization middleware
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

module.exports = {
  AuthService,
  authenticate,
  authorize
};
```

### Step 6: Advanced CRUD Operations

```javascript
// src/controllers/UserController.js
const { AuthService } = require('../middleware/auth');

class UserController {
  constructor() {
    this.authService = new AuthService();
    this.users = new Map(); // In production, use a database
  }

  // Create user
  async create(req, res) {
    try {
      const { email, username, password } = req.body;

      // Check if user already exists
      const existingUser = Array.from(this.users.values())
        .find(user => user.email === email || user.username === username);
      
      if (existingUser) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'User with this email or username already exists'
        });
      }

      // Hash password
      const passwordHash = await this.authService.hashPassword(password);

      // Create user
      const user = {
        id: require('crypto').randomUUID(),
        email,
        username,
        passwordHash,
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.users.set(user.id, user);

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const accessToken = this.authService.generateToken(tokenPayload);
      const refreshToken = this.authService.generateRefreshToken(tokenPayload);

      // Return user without password
      const { passwordHash, ...userResponse } = user;

      res.status(201).json({
        success: true,
        data: {
          user: userResponse,
          tokens: {
            accessToken,
            refreshToken
          }
        },
        message: 'User created successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  // Get all users with pagination and filtering
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        role = '',
        isActive = ''
      } = req.query;

      let users = Array.from(this.users.values());

      // Apply filters
      if (search) {
        users = users.filter(user =>
          user.username.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (role) {
        users = users.filter(user => user.role === role);
      }

      if (isActive !== '') {
        users = users.filter(user => user.isActive === (isActive === 'true'));
      }

      // Sort by creation date (newest first)
      users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedUsers = users.slice(startIndex, endIndex);

      // Remove password hashes
      const safeUsers = paginatedUsers.map(({ passwordHash, ...user }) => user);

      res.json({
        success: true,
        data: {
          users: safeUsers,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(users.length / limit),
            totalItems: users.length,
            itemsPerPage: parseInt(limit),
            hasNextPage: endIndex < users.length,
            hasPrevPage: page > 1
          }
        },
        message: 'Users retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  // Get user by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const user = this.users.get(id);

      if (!user) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found'
        });
      }

      // Remove password hash
      const { passwordHash, ...userResponse } = user;

      res.json({
        success: true,
        data: userResponse,
        message: 'User retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  // Update user
  async update(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const user = this.users.get(id);
      if (!user) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found'
        });
      }

      // Check authorization (users can only update their own profile unless admin)
      if (req.user.userId !== id && req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only update your own profile'
        });
      }

      // Validate unique fields
      if (updates.email || updates.username) {
        const existingUser = Array.from(this.users.values())
          .find(u => u.id !== id && (
            (updates.email && u.email === updates.email) ||
            (updates.username && u.username === updates.username)
          ));

        if (existingUser) {
          return res.status(409).json({
            error: 'Conflict',
            message: 'Email or username already exists'
          });
        }
      }

      // Hash password if provided
      if (updates.password) {
        updates.passwordHash = await this.authService.hashPassword(updates.password);
        delete updates.password;
      }

      // Update user
      const updatedUser = {
        ...user,
        ...updates,
        updatedAt: new Date()
      };

      this.users.set(id, updatedUser);

      // Remove password hash from response
      const { passwordHash, ...userResponse } = updatedUser;

      res.json({
        success: true,
        data: userResponse,
        message: 'User updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  // Delete user
  async delete(req, res) {
    try {
      const { id } = req.params;

      if (!this.users.has(id)) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found'
        });
      }

      // Check authorization (only admins can delete users)
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only administrators can delete users'
        });
      }

      this.users.delete(id);

      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const user = this.users.get(req.user.userId);
      
      if (!user) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found'
        });
      }

      const { passwordHash, ...userResponse } = user;

      res.json({
        success: true,
        data: userResponse,
        message: 'Profile retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
}

module.exports = UserController;
```

## 📚 Chapter 3: API Documentation and Testing

### Step 7: Swagger/OpenAPI Documentation

```javascript
// src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Mastery',
      version: '1.0.0',
      description: 'A comprehensive API built with Express.js',
      contact: {
        name: 'API Support',
        email: 'support@apimastery.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'username'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 30,
              description: 'Unique username'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin', 'moderator'],
              description: 'User role'
            },
            isActive: {
              type: 'boolean',
              description: 'Account status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error type'
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            details: {
              type: 'array',
              items: {
                type: 'object'
              },
              description: 'Additional error details'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js'] // Path to the API files
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi
};
```

### Step 8: API Routes with Documentation

```javascript
// src/routes/users.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authenticate, authorize } = require('../middleware/auth');
const { userValidation } = require('../middleware/validation');

const userController = new UserController();

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                         refreshToken:
 *                           type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: User already exists
 */
router.post('/', userValidation.create, userController.create.bind(userController));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users with pagination and filtering
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in username or email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin, moderator]
 *         description: Filter by role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 *                         itemsPerPage:
 *                           type: integer
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPrevPage:
 *                           type: boolean
 */
router.get('/', authenticate, userValidation.list, userController.getAll.bind(userController));

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 */
router.get('/profile', authenticate, userController.getProfile.bind(userController));

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/:id', authenticate, userValidation.get, userController.getById.bind(userController));

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.put('/:id', authenticate, userValidation.update, userController.update.bind(userController));

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.delete('/:id', authenticate, authorize(['admin']), userController.delete.bind(userController));

module.exports = router;
```

## 🏆 API Development Mastery Checklist

After completing this guide, you should master:

- [ ] RESTful API design principles
- [ ] HTTP methods and status codes
- [ ] Request validation and error handling
- [ ] Authentication and authorization
- [ ] API documentation with Swagger
- [ ] Testing strategies
- [ ] Security best practices
- [ ] Performance optimization
- [ ] Versioning strategies
- [ ] Rate limiting and throttling

## 🚀 Advanced API Topics

1. **GraphQL APIs**
2. **API Versioning Strategies**
3. **Microservices APIs**
4. **Real-time APIs (WebSockets)**
5. **API Gateway Patterns**
6. **API Monitoring and Analytics**
7. **API Security (OAuth, API Keys)**
8. **API Testing Automation**

**🎉 Congratulations!** You've mastered API development from basic REST to production-ready APIs!