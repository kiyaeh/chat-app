# 🗄️ Database Mastery: PostgreSQL, MySQL & MongoDB

Master database technologies by building real applications. Every concept explained with practical examples.

## 🎯 What are Databases?

**Databases** are like digital filing cabinets that store, organize, and retrieve information efficiently.

**Types of Databases:**
- **SQL (Relational)**: PostgreSQL, MySQL - Structured data with relationships
- **NoSQL (Document)**: MongoDB - Flexible schema, JSON-like documents
- **Key-Value**: Redis - Simple key-value pairs for caching
- **Graph**: Neo4j - Connected data relationships

## 📚 Chapter 1: PostgreSQL Mastery

### Step 1: PostgreSQL Setup and Basics

```bash
# Install PostgreSQL
# Windows: Download from https://www.postgresql.org/download/
# macOS: brew install postgresql
# Linux: sudo apt-get install postgresql

# Start PostgreSQL service
# Windows: Services → PostgreSQL
# macOS/Linux: brew services start postgresql

# Connect to PostgreSQL
psql -U postgres -h localhost

# Create database
CREATE DATABASE chatapp;

# Connect to database
\c chatapp;

# List databases
\l

# List tables
\dt
```

### Step 2: Advanced PostgreSQL Schema Design

```sql
-- Create users table with advanced features
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create rooms table
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'public' CHECK (type IN ('public', 'private', 'direct')),
    max_members INTEGER DEFAULT 100,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table with partitioning
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    reply_to_id UUID REFERENCES messages(id),
    file_url TEXT,
    file_name VARCHAR(255),
    file_size BIGINT,
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Create partitions for messages (monthly partitions)
CREATE TABLE messages_2024_01 PARTITION OF messages
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE messages_2024_02 PARTITION OF messages
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Create room_members table
CREATE TABLE room_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, room_id)
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;

CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_room_created ON messages(room_id, created_at);

CREATE INDEX idx_room_members_user_id ON room_members(user_id);
CREATE INDEX idx_room_members_room_id ON room_members(room_id);

-- Create full-text search index
CREATE INDEX idx_messages_content_fts ON messages USING gin(to_tsvector('english', content));
```

### Step 3: Advanced PostgreSQL Queries

```sql
-- Complex JOIN query with aggregations
SELECT 
    r.id,
    r.name,
    r.type,
    u.username as creator,
    COUNT(DISTINCT rm.user_id) as member_count,
    COUNT(DISTINCT m.id) as message_count,
    MAX(m.created_at) as last_message_at
FROM rooms r
LEFT JOIN users u ON r.created_by = u.id
LEFT JOIN room_members rm ON r.id = rm.room_id
LEFT JOIN messages m ON r.id = m.room_id
WHERE r.type = 'public'
GROUP BY r.id, r.name, r.type, u.username
HAVING COUNT(DISTINCT rm.user_id) > 5
ORDER BY last_message_at DESC NULLS LAST;

-- Window functions for analytics
SELECT 
    u.username,
    COUNT(m.id) as message_count,
    RANK() OVER (ORDER BY COUNT(m.id) DESC) as rank,
    LAG(COUNT(m.id)) OVER (ORDER BY COUNT(m.id) DESC) as prev_count,
    COUNT(m.id) - LAG(COUNT(m.id)) OVER (ORDER BY COUNT(m.id) DESC) as diff
FROM users u
LEFT JOIN messages m ON u.id = m.user_id
WHERE m.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY u.id, u.username
ORDER BY message_count DESC;

-- Common Table Expressions (CTE) for recursive queries
WITH RECURSIVE message_thread AS (
    -- Base case: original message
    SELECT id, content, user_id, reply_to_id, 0 as depth
    FROM messages 
    WHERE id = 'original-message-id'
    
    UNION ALL
    
    -- Recursive case: replies
    SELECT m.id, m.content, m.user_id, m.reply_to_id, mt.depth + 1
    FROM messages m
    INNER JOIN message_thread mt ON m.reply_to_id = mt.id
    WHERE mt.depth < 10  -- Prevent infinite recursion
)
SELECT * FROM message_thread ORDER BY depth, created_at;

-- Full-text search with ranking
SELECT 
    m.id,
    m.content,
    u.username,
    ts_rank(to_tsvector('english', m.content), plainto_tsquery('english', 'search term')) as rank
FROM messages m
JOIN users u ON m.user_id = u.id
WHERE to_tsvector('english', m.content) @@ plainto_tsquery('english', 'search term')
ORDER BY rank DESC, m.created_at DESC;

-- Advanced aggregations with FILTER
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as total_messages,
    COUNT(*) FILTER (WHERE message_type = 'text') as text_messages,
    COUNT(*) FILTER (WHERE message_type = 'image') as image_messages,
    COUNT(*) FILTER (WHERE message_type = 'file') as file_messages,
    AVG(LENGTH(content)) FILTER (WHERE message_type = 'text') as avg_text_length
FROM messages
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date;
```

### Step 4: PostgreSQL Performance Optimization

```sql
-- Create materialized view for expensive queries
CREATE MATERIALIZED VIEW room_stats AS
SELECT 
    r.id,
    r.name,
    COUNT(DISTINCT rm.user_id) as member_count,
    COUNT(DISTINCT m.id) as message_count,
    MAX(m.created_at) as last_activity
FROM rooms r
LEFT JOIN room_members rm ON r.id = rm.room_id
LEFT JOIN messages m ON r.id = m.room_id
GROUP BY r.id, r.name;

-- Create unique index on materialized view
CREATE UNIQUE INDEX idx_room_stats_id ON room_stats(id);

-- Refresh materialized view
REFRESH MATERIALIZED VIEW room_stats;

-- Create stored procedure for complex operations
CREATE OR REPLACE FUNCTION create_room_with_members(
    p_name VARCHAR(100),
    p_description TEXT,
    p_creator_id UUID,
    p_member_ids UUID[]
) RETURNS UUID AS $$
DECLARE
    v_room_id UUID;
    v_member_id UUID;
BEGIN
    -- Create room
    INSERT INTO rooms (name, description, created_by)
    VALUES (p_name, p_description, p_creator_id)
    RETURNING id INTO v_room_id;
    
    -- Add creator as owner
    INSERT INTO room_members (user_id, room_id, role)
    VALUES (p_creator_id, v_room_id, 'owner');
    
    -- Add other members
    FOREACH v_member_id IN ARRAY p_member_ids
    LOOP
        INSERT INTO room_members (user_id, room_id, role)
        VALUES (v_member_id, v_room_id, 'member')
        ON CONFLICT (user_id, room_id) DO NOTHING;
    END LOOP;
    
    RETURN v_room_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Query optimization with EXPLAIN ANALYZE
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT m.*, u.username
FROM messages m
JOIN users u ON m.user_id = u.id
WHERE m.room_id = 'room-uuid'
ORDER BY m.created_at DESC
LIMIT 50;
```

## 📚 Chapter 2: MySQL Mastery

### Step 5: MySQL Setup and Advanced Features

```sql
-- Create database with proper charset
CREATE DATABASE chatapp 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE chatapp;

-- Create users table with MySQL-specific features
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    role ENUM('user', 'admin', 'moderator') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Full-text search index
    FULLTEXT KEY idx_users_search (first_name, last_name, username)
) ENGINE=InnoDB;

-- Create messages table with partitioning
CREATE TABLE messages (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    content TEXT NOT NULL,
    message_type ENUM('text', 'image', 'file', 'system') DEFAULT 'text',
    user_id CHAR(36) NOT NULL,
    room_id CHAR(36) NOT NULL,
    reply_to_id CHAR(36) NULL,
    file_url TEXT,
    file_name VARCHAR(255),
    file_size BIGINT UNSIGNED,
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    KEY idx_messages_room_created (room_id, created_at),
    KEY idx_messages_user (user_id),
    
    -- Full-text search
    FULLTEXT KEY idx_messages_content (content),
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_to_id) REFERENCES messages(id) ON DELETE SET NULL
) ENGINE=InnoDB
PARTITION BY RANGE (UNIX_TIMESTAMP(created_at)) (
    PARTITION p202401 VALUES LESS THAN (UNIX_TIMESTAMP('2024-02-01')),
    PARTITION p202402 VALUES LESS THAN (UNIX_TIMESTAMP('2024-03-01')),
    PARTITION p202403 VALUES LESS THAN (UNIX_TIMESTAMP('2024-04-01')),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- Create JSON column for flexible data
CREATE TABLE user_preferences (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    preferences JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- JSON indexes
    KEY idx_theme ((CAST(preferences->>'$.theme' AS CHAR(20)))),
    KEY idx_notifications ((CAST(preferences->>'$.notifications.enabled' AS UNSIGNED)))
) ENGINE=InnoDB;
```

### Step 6: Advanced MySQL Queries

```sql
-- JSON operations
SELECT 
    u.username,
    JSON_EXTRACT(up.preferences, '$.theme') as theme,
    JSON_EXTRACT(up.preferences, '$.notifications.email') as email_notifications,
    JSON_KEYS(up.preferences) as preference_keys
FROM users u
LEFT JOIN user_preferences up ON u.id = up.user_id
WHERE JSON_EXTRACT(up.preferences, '$.notifications.enabled') = true;

-- Update JSON data
UPDATE user_preferences 
SET preferences = JSON_SET(
    preferences, 
    '$.theme', 'dark',
    '$.notifications.push', true,
    '$.lastUpdated', NOW()
)
WHERE user_id = 'user-uuid';

-- Full-text search with relevance scoring
SELECT 
    m.id,
    m.content,
    u.username,
    MATCH(m.content) AGAINST('search query' IN NATURAL LANGUAGE MODE) as relevance
FROM messages m
JOIN users u ON m.user_id = u.id
WHERE MATCH(m.content) AGAINST('search query' IN NATURAL LANGUAGE MODE)
ORDER BY relevance DESC, m.created_at DESC;

-- Advanced aggregations with GROUP BY and HAVING
SELECT 
    u.username,
    COUNT(m.id) as message_count,
    AVG(CHAR_LENGTH(m.content)) as avg_message_length,
    MIN(m.created_at) as first_message,
    MAX(m.created_at) as last_message,
    DATEDIFF(MAX(m.created_at), MIN(m.created_at)) as active_days
FROM users u
JOIN messages m ON u.id = m.user_id
WHERE m.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY u.id, u.username
HAVING message_count >= 10
ORDER BY message_count DESC;

-- Window functions (MySQL 8.0+)
SELECT 
    username,
    message_count,
    RANK() OVER (ORDER BY message_count DESC) as rank,
    PERCENT_RANK() OVER (ORDER BY message_count DESC) as percentile,
    LAG(message_count) OVER (ORDER BY message_count DESC) as prev_count
FROM (
    SELECT 
        u.username,
        COUNT(m.id) as message_count
    FROM users u
    LEFT JOIN messages m ON u.id = m.user_id
    GROUP BY u.id, u.username
) user_stats;
```

### Step 7: MySQL Performance Optimization

```sql
-- Create composite indexes
CREATE INDEX idx_messages_room_user_created 
ON messages(room_id, user_id, created_at);

-- Create covering index
CREATE INDEX idx_messages_covering 
ON messages(room_id, created_at, id, content, user_id);

-- Analyze table performance
ANALYZE TABLE messages;

-- Check index usage
SHOW INDEX FROM messages;

-- Create stored procedure
DELIMITER //
CREATE PROCEDURE GetRoomMessages(
    IN p_room_id CHAR(36),
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT 
        m.id,
        m.content,
        m.message_type,
        m.created_at,
        u.username,
        u.avatar_url
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.room_id = p_room_id
    ORDER BY m.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END //
DELIMITER ;

-- Call stored procedure
CALL GetRoomMessages('room-uuid', 50, 0);

-- Create view for complex queries
CREATE VIEW active_room_stats AS
SELECT 
    r.id,
    r.name,
    r.type,
    COUNT(DISTINCT rm.user_id) as member_count,
    COUNT(DISTINCT m.id) as message_count,
    MAX(m.created_at) as last_activity
FROM rooms r
LEFT JOIN room_members rm ON r.id = rm.room_id
LEFT JOIN messages m ON r.id = m.room_id
WHERE r.is_active = TRUE
GROUP BY r.id, r.name, r.type;
```

## 📚 Chapter 3: MongoDB Mastery

### Step 8: MongoDB Setup and Schema Design

```javascript
// Connect to MongoDB
const { MongoClient } = require('mongodb');

const client = new MongoClient('mongodb://localhost:27017');
await client.connect();
const db = client.db('chatapp');

// Create collections with validation
await db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'username', 'passwordHash'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        },
        username: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 30
        },
        passwordHash: {
          bsonType: 'string'
        },
        role: {
          enum: ['user', 'admin', 'moderator']
        },
        isActive: {
          bsonType: 'bool'
        },
        profile: {
          bsonType: 'object',
          properties: {
            firstName: { bsonType: 'string' },
            lastName: { bsonType: 'string' },
            avatarUrl: { bsonType: 'string' },
            bio: { bsonType: 'string' }
          }
        },
        preferences: {
          bsonType: 'object',
          properties: {
            theme: { enum: ['light', 'dark'] },
            notifications: {
              bsonType: 'object',
              properties: {
                email: { bsonType: 'bool' },
                push: { bsonType: 'bool' },
                sound: { bsonType: 'bool' }
              }
            }
          }
        },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

// Create indexes
await db.collection('users').createIndexes([
  { key: { email: 1 }, unique: true },
  { key: { username: 1 }, unique: true },
  { key: { 'profile.firstName': 'text', 'profile.lastName': 'text', username: 'text' } },
  { key: { isActive: 1 } },
  { key: { createdAt: -1 } }
]);

// Messages collection with embedded documents
await db.createCollection('messages', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['content', 'userId', 'roomId', 'createdAt'],
      properties: {
        content: { bsonType: 'string' },
        messageType: { enum: ['text', 'image', 'file', 'system'] },
        userId: { bsonType: 'objectId' },
        roomId: { bsonType: 'objectId' },
        replyTo: { bsonType: 'objectId' },
        attachments: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            properties: {
              url: { bsonType: 'string' },
              fileName: { bsonType: 'string' },
              fileSize: { bsonType: 'long' },
              mimeType: { bsonType: 'string' }
            }
          }
        },
        reactions: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            properties: {
              emoji: { bsonType: 'string' },
              userId: { bsonType: 'objectId' },
              createdAt: { bsonType: 'date' }
            }
          }
        },
        isEdited: { bsonType: 'bool' },
        editHistory: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            properties: {
              content: { bsonType: 'string' },
              editedAt: { bsonType: 'date' }
            }
          }
        },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

// Create compound indexes for messages
await db.collection('messages').createIndexes([
  { key: { roomId: 1, createdAt: -1 } },
  { key: { userId: 1, createdAt: -1 } },
  { key: { content: 'text' } },
  { key: { roomId: 1, messageType: 1, createdAt: -1 } }
]);
```

### Step 9: Advanced MongoDB Queries

```javascript
// Aggregation pipeline for complex queries
const roomStats = await db.collection('rooms').aggregate([
  // Match active rooms
  { $match: { isActive: true } },
  
  // Lookup members
  {
    $lookup: {
      from: 'room_members',
      localField: '_id',
      foreignField: 'roomId',
      as: 'members'
    }
  },
  
  // Lookup messages
  {
    $lookup: {
      from: 'messages',
      localField: '_id',
      foreignField: 'roomId',
      as: 'messages'
    }
  },
  
  // Add computed fields
  {
    $addFields: {
      memberCount: { $size: '$members' },
      messageCount: { $size: '$messages' },
      lastActivity: { $max: '$messages.createdAt' }
    }
  },
  
  // Filter rooms with activity
  { $match: { messageCount: { $gt: 0 } } },
  
  // Sort by last activity
  { $sort: { lastActivity: -1 } },
  
  // Project final fields
  {
    $project: {
      name: 1,
      type: 1,
      memberCount: 1,
      messageCount: 1,
      lastActivity: 1,
      createdBy: 1
    }
  }
]).toArray();

// Text search with scoring
const searchResults = await db.collection('messages').aggregate([
  {
    $match: {
      $text: { $search: 'search query' }
    }
  },
  {
    $addFields: {
      score: { $meta: 'textScore' }
    }
  },
  {
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'user'
    }
  },
  {
    $unwind: '$user'
  },
  {
    $project: {
      content: 1,
      messageType: 1,
      createdAt: 1,
      score: 1,
      'user.username': 1,
      'user.profile.avatarUrl': 1
    }
  },
  { $sort: { score: { $meta: 'textScore' }, createdAt: -1 } },
  { $limit: 20 }
]).toArray();

// Complex aggregation with facets
const analyticsData = await db.collection('messages').aggregate([
  {
    $match: {
      createdAt: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    }
  },
  {
    $facet: {
      // Messages by day
      messagesByDay: [
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ],
      
      // Messages by type
      messagesByType: [
        {
          $group: {
            _id: '$messageType',
            count: { $sum: 1 }
          }
        }
      ],
      
      // Top users by message count
      topUsers: [
        {
          $group: {
            _id: '$userId',
            messageCount: { $sum: 1 },
            avgMessageLength: { $avg: { $strLenCP: '$content' } }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            username: '$user.username',
            messageCount: 1,
            avgMessageLength: { $round: ['$avgMessageLength', 2] }
          }
        },
        { $sort: { messageCount: -1 } },
        { $limit: 10 }
      ]
    }
  }
]).toArray();

// Update with array operations
await db.collection('messages').updateOne(
  { _id: messageId },
  {
    $push: {
      reactions: {
        emoji: '👍',
        userId: new ObjectId(userId),
        createdAt: new Date()
      }
    }
  }
);

// Remove reaction
await db.collection('messages').updateOne(
  { _id: messageId },
  {
    $pull: {
      reactions: {
        userId: new ObjectId(userId),
        emoji: '👍'
      }
    }
  }
);

// Upsert operation
await db.collection('user_sessions').updateOne(
  { userId: new ObjectId(userId) },
  {
    $set: {
      lastActivity: new Date(),
      isOnline: true
    },
    $setOnInsert: {
      createdAt: new Date()
    }
  },
  { upsert: true }
);
```

### Step 10: MongoDB Performance Optimization

```javascript
// Create compound indexes for optimal query performance
await db.collection('messages').createIndex(
  { roomId: 1, createdAt: -1, messageType: 1 },
  { background: true }
);

// Partial index for active users only
await db.collection('users').createIndex(
  { lastActivity: -1 },
  { 
    partialFilterExpression: { isActive: true },
    background: true 
  }
);

// TTL index for temporary data
await db.collection('user_sessions').createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 86400 } // 24 hours
);

// Explain query performance
const explainResult = await db.collection('messages')
  .find({ roomId: new ObjectId(roomId) })
  .sort({ createdAt: -1 })
  .limit(50)
  .explain('executionStats');

console.log('Query execution stats:', explainResult.executionStats);

// Bulk operations for better performance
const bulkOps = [];
for (const message of messages) {
  bulkOps.push({
    insertOne: {
      document: {
        ...message,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  });
}

await db.collection('messages').bulkWrite(bulkOps, { ordered: false });

// Aggregation with optimization hints
const optimizedResults = await db.collection('messages').aggregate([
  { $match: { roomId: new ObjectId(roomId) } },
  { $sort: { createdAt: -1 } },
  { $limit: 100 },
  {
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'user'
    }
  },
  { $unwind: '$user' }
], {
  hint: { roomId: 1, createdAt: -1 },
  allowDiskUse: true
}).toArray();
```

## 🏆 Database Mastery Checklist

After completing this guide, you should master:

- [ ] PostgreSQL advanced features and optimization
- [ ] MySQL performance tuning and partitioning
- [ ] MongoDB aggregation pipelines and indexing
- [ ] Database design patterns and normalization
- [ ] Query optimization techniques
- [ ] Index strategies for different use cases
- [ ] Transaction management and ACID properties
- [ ] Backup and recovery strategies
- [ ] Database security best practices
- [ ] Monitoring and performance analysis

## 🚀 Advanced Database Topics

1. **Database Sharding and Replication**
2. **Database Migration Strategies**
3. **Multi-database Architecture**
4. **Database Monitoring and Alerting**
5. **Backup and Disaster Recovery**
6. **Database Security and Compliance**
7. **Performance Tuning and Optimization**
8. **Database DevOps and Automation**

**🎉 Congratulations!** You've mastered database technologies from SQL to NoSQL with production-ready skills!