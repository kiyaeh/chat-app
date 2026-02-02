# 🗄️ Advanced Database Architecture & Patterns

## 📋 Table of Contents
1. [Database Architecture Patterns](#database-architecture-patterns)
2. [Advanced Query Optimization](#advanced-query-optimization)
3. [Database Scaling Strategies](#database-scaling-strategies)
4. [Data Modeling Patterns](#data-modeling-patterns)
5. [Database Security & Compliance](#database-security--compliance)
6. [Backup & Disaster Recovery](#backup--disaster-recovery)
7. [Database Monitoring & Performance](#database-monitoring--performance)
8. [Multi-Database Architecture](#multi-database-architecture)

## 🏗️ Database Architecture Patterns

### 1. Polyglot Persistence

**Database Selection by Use Case**
- **PostgreSQL**: ACID transactions, complex queries
- **MongoDB**: Document storage, flexible schema
- **Redis**: Caching, session storage, real-time data
- **Elasticsearch**: Full-text search, analytics
- **InfluxDB**: Time-series data, metrics
- **Neo4j**: Graph relationships, social networks

**Data Flow Architecture**
```
Application Layer
       ↓
API Gateway/Service Mesh
       ↓
┌─────────────────────────────────────┐
│  Microservices Architecture        │
├─────────────┬─────────────┬─────────┤
│ User Service│ Chat Service│ Analytics│
│     ↓       │     ↓       │    ↓    │
│ PostgreSQL  │  MongoDB    │ InfluxDB│
└─────────────┴─────────────┴─────────┘
       ↓              ↓           ↓
   Redis Cache    Elasticsearch  Grafana
```

### 2. CQRS (Command Query Responsibility Segregation)

**Write Model (Commands)**
- Optimized for writes and business logic
- Normalized data structure
- Strong consistency
- Transaction boundaries

**Read Model (Queries)**
- Optimized for reads and reporting
- Denormalized data structure
- Eventual consistency
- Multiple read replicas

**Event Store Pattern**
- Immutable event log
- Event replay capabilities
- Audit trail maintenance
- Temporal queries

### 3. Database Per Service Pattern

**Service Boundaries**
```
User Service → PostgreSQL
├─ User profiles
├─ Authentication data
└─ User preferences

Chat Service → MongoDB
├─ Messages
├─ Rooms
└─ Real-time data

Notification Service → Redis
├─ Push notifications
├─ Email queue
└─ SMS queue

Analytics Service → InfluxDB
├─ User metrics
├─ Performance data
└─ Business KPIs
```

**Data Consistency Challenges**
- Cross-service transactions
- Eventual consistency
- Saga pattern implementation
- Compensating actions

## ⚡ Advanced Query Optimization

### 1. PostgreSQL Advanced Optimization

**Query Plan Analysis**
```sql
-- Analyze query execution
EXPLAIN (ANALYZE, BUFFERS, VERBOSE) 
SELECT u.username, COUNT(m.id) as message_count
FROM users u
LEFT JOIN messages m ON u.id = m.user_id
WHERE u.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.id, u.username
ORDER BY message_count DESC
LIMIT 10;

-- Index usage statistics
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Table statistics
SELECT 
    schemaname,
    tablename,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

**Advanced Indexing Strategies**
```sql
-- Partial indexes for active users
CREATE INDEX idx_active_users_activity 
ON users (last_activity) 
WHERE is_active = true;

-- Functional indexes
CREATE INDEX idx_users_lower_email 
ON users (LOWER(email));

-- Multi-column indexes with proper order
CREATE INDEX idx_messages_room_time 
ON messages (room_id, created_at DESC, message_type);

-- GIN indexes for full-text search
CREATE INDEX idx_messages_content_gin 
ON messages USING gin(to_tsvector('english', content));

-- BRIN indexes for time-series data
CREATE INDEX idx_messages_created_brin 
ON messages USING brin(created_at);
```

**Window Functions for Analytics**
```sql
-- Running totals and rankings
SELECT 
    user_id,
    username,
    message_count,
    SUM(message_count) OVER (ORDER BY created_at) as running_total,
    ROW_NUMBER() OVER (ORDER BY message_count DESC) as rank,
    PERCENT_RANK() OVER (ORDER BY message_count) as percentile
FROM user_message_stats;

-- Time-based analytics
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    COUNT(*) as messages_per_hour,
    LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('hour', created_at)) as prev_hour,
    COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('hour', created_at)) as growth
FROM messages
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour;
```

### 2. MongoDB Advanced Aggregation

**Complex Aggregation Pipelines**
```javascript
// User engagement analytics
db.messages.aggregate([
  // Match recent messages
  {
    $match: {
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }
  },
  
  // Group by user and calculate metrics
  {
    $group: {
      _id: "$userId",
      messageCount: { $sum: 1 },
      avgMessageLength: { $avg: { $strLenCP: "$content" } },
      uniqueRooms: { $addToSet: "$roomId" },
      firstMessage: { $min: "$createdAt" },
      lastMessage: { $max: "$createdAt" }
    }
  },
  
  // Add computed fields
  {
    $addFields: {
      uniqueRoomCount: { $size: "$uniqueRooms" },
      daysSinceFirst: {
        $divide: [
          { $subtract: ["$lastMessage", "$firstMessage"] },
          1000 * 60 * 60 * 24
        ]
      }
    }
  },
  
  // Lookup user details
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "user"
    }
  },
  
  // Unwind user array
  { $unwind: "$user" },
  
  // Calculate engagement score
  {
    $addFields: {
      engagementScore: {
        $multiply: [
          { $log: { $add: ["$messageCount", 1] } },
          { $log: { $add: ["$uniqueRoomCount", 1] } },
          { $divide: [1, { $add: ["$daysSinceFirst", 1] }] }
        ]
      }
    }
  },
  
  // Project final results
  {
    $project: {
      username: "$user.username",
      messageCount: 1,
      avgMessageLength: { $round: ["$avgMessageLength", 2] },
      uniqueRoomCount: 1,
      engagementScore: { $round: ["$engagementScore", 4] }
    }
  },
  
  // Sort by engagement score
  { $sort: { engagementScore: -1 } },
  { $limit: 50 }
]);

// Real-time message analytics with time windows
db.messages.aggregate([
  {
    $match: {
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
    }
  },
  {
    $bucket: {
      groupBy: "$createdAt",
      boundaries: [
        new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        new Date(Date.now() - 45 * 60 * 1000), // 45 min ago
        new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
        new Date(Date.now() - 15 * 60 * 1000), // 15 min ago
        new Date() // Now
      ],
      default: "Other",
      output: {
        count: { $sum: 1 },
        avgLength: { $avg: { $strLenCP: "$content" } },
        uniqueUsers: { $addToSet: "$userId" }
      }
    }
  },
  {
    $addFields: {
      uniqueUserCount: { $size: "$uniqueUsers" }
    }
  }
]);
```

**Index Optimization Strategies**
```javascript
// Compound indexes for common query patterns
db.messages.createIndex(
  { roomId: 1, createdAt: -1, messageType: 1 },
  { background: true, name: "room_time_type_idx" }
);

// Sparse indexes for optional fields
db.users.createIndex(
  { "profile.phoneNumber": 1 },
  { sparse: true, background: true }
);

// Text indexes with weights
db.messages.createIndex(
  {
    content: "text",
    "attachments.fileName": "text"
  },
  {
    weights: {
      content: 10,
      "attachments.fileName": 5
    },
    name: "message_search_idx"
  }
);

// Geospatial indexes for location-based features
db.users.createIndex(
  { "profile.location": "2dsphere" },
  { background: true }
);
```

## 📈 Database Scaling Strategies

### 1. Horizontal Scaling (Sharding)

**Sharding Strategies**
- **Range-based**: Shard by date ranges
- **Hash-based**: Distribute by hash function
- **Directory-based**: Lookup service for shard location
- **Geographic**: Shard by user location

**PostgreSQL Sharding with Citus**
```sql
-- Create distributed tables
SELECT create_distributed_table('messages', 'room_id');
SELECT create_distributed_table('users', 'id');

-- Create reference tables for small lookup data
SELECT create_reference_table('room_types');

-- Rebalance shards
SELECT rebalance_table_shards('messages');
```

**MongoDB Sharding**
```javascript
// Enable sharding on database
sh.enableSharding("chatapp");

// Shard messages collection by room_id
sh.shardCollection("chatapp.messages", { roomId: 1 });

// Shard users collection by hashed _id
sh.shardCollection("chatapp.users", { _id: "hashed" });

// Monitor shard distribution
db.printShardingStatus();
```

### 2. Vertical Scaling Optimization

**Resource Allocation**
- CPU: Query processing, indexing
- Memory: Buffer pools, query cache
- Storage: IOPS, throughput
- Network: Replication, client connections

**PostgreSQL Configuration**
```sql
-- Memory settings
shared_buffers = '256MB'          -- 25% of RAM
effective_cache_size = '1GB'      -- 75% of RAM
work_mem = '4MB'                  -- Per query operation
maintenance_work_mem = '64MB'     -- Maintenance operations

-- Connection settings
max_connections = 200
shared_preload_libraries = 'pg_stat_statements'

-- Query optimization
random_page_cost = 1.1            -- SSD optimization
effective_io_concurrency = 200    -- Concurrent I/O
```

### 3. Read Replicas and Load Balancing

**Master-Slave Replication**
```sql
-- Master configuration (postgresql.conf)
wal_level = replica
max_wal_senders = 3
wal_keep_segments = 64

-- Slave configuration
hot_standby = on
max_standby_streaming_delay = 30s
```

**Connection Routing**
```javascript
// Database connection pool with read/write splitting
const masterPool = new Pool({
  host: 'master.db.chatapp.com',
  database: 'chatapp',
  max: 20
});

const replicaPools = [
  new Pool({ host: 'replica1.db.chatapp.com', max: 10 }),
  new Pool({ host: 'replica2.db.chatapp.com', max: 10 }),
  new Pool({ host: 'replica3.db.chatapp.com', max: 10 })
];

// Route queries based on operation type
function getConnection(operation) {
  if (operation === 'write') {
    return masterPool;
  }
  
  // Load balance read operations
  const replicaIndex = Math.floor(Math.random() * replicaPools.length);
  return replicaPools[replicaIndex];
}
```

## 🎯 Data Modeling Patterns

### 1. Event Sourcing Implementation

**Event Store Schema**
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_id UUID NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    event_metadata JSONB,
    version INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(aggregate_id, version)
);

CREATE INDEX idx_events_aggregate ON events (aggregate_id, version);
CREATE INDEX idx_events_type ON events (aggregate_type, event_type);
CREATE INDEX idx_events_created ON events (created_at);
```

**Event Types for Chat Application**
```json
{
  "UserRegistered": {
    "userId": "uuid",
    "email": "string",
    "username": "string",
    "timestamp": "datetime"
  },
  "MessageSent": {
    "messageId": "uuid",
    "userId": "uuid",
    "roomId": "uuid",
    "content": "string",
    "messageType": "enum",
    "timestamp": "datetime"
  },
  "RoomCreated": {
    "roomId": "uuid",
    "name": "string",
    "createdBy": "uuid",
    "roomType": "enum",
    "timestamp": "datetime"
  }
}
```

### 2. Temporal Data Modeling

**Slowly Changing Dimensions (SCD)**
```sql
-- Type 2 SCD: Keep history of changes
CREATE TABLE user_profiles_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    avatar_url TEXT,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_to TIMESTAMP WITH TIME ZONE,
    is_current BOOLEAN DEFAULT true,
    
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Get current profile
SELECT * FROM user_profiles_history 
WHERE user_id = $1 AND is_current = true;

-- Get profile at specific time
SELECT * FROM user_profiles_history 
WHERE user_id = $1 
  AND valid_from <= $2 
  AND (valid_to IS NULL OR valid_to > $2);
```

### 3. Graph Data Modeling

**Social Network Relationships**
```sql
-- User connections with relationship types
CREATE TABLE user_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL,
    to_user_id UUID NOT NULL,
    relationship_type VARCHAR(50) NOT NULL, -- 'friend', 'blocked', 'following'
    status VARCHAR(20) DEFAULT 'pending',   -- 'pending', 'accepted', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (from_user_id) REFERENCES users(id),
    FOREIGN KEY (to_user_id) REFERENCES users(id),
    UNIQUE(from_user_id, to_user_id, relationship_type)
);

-- Find mutual friends
WITH user_friends AS (
    SELECT to_user_id as friend_id 
    FROM user_relationships 
    WHERE from_user_id = $1 AND relationship_type = 'friend' AND status = 'accepted'
),
target_friends AS (
    SELECT to_user_id as friend_id 
    FROM user_relationships 
    WHERE from_user_id = $2 AND relationship_type = 'friend' AND status = 'accepted'
)
SELECT u.username, u.profile
FROM user_friends uf
JOIN target_friends tf ON uf.friend_id = tf.friend_id
JOIN users u ON u.id = uf.friend_id;
```

## 🔒 Database Security & Compliance

### 1. Data Encryption

**Encryption at Rest**
```sql
-- PostgreSQL TDE (Transparent Data Encryption)
-- Enable encryption for specific columns
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    ssn VARCHAR(11) ENCRYPTED, -- Encrypted column
    phone VARCHAR(20) ENCRYPTED
);

-- Application-level encryption
CREATE OR REPLACE FUNCTION encrypt_pii(data TEXT) 
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_encrypt(data, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql;
```

**Encryption in Transit**
```sql
-- SSL/TLS configuration
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
ssl_ca_file = 'ca.crt'
ssl_crl_file = 'server.crl'
```

### 2. Access Control and Auditing

**Row-Level Security (RLS)**
```sql
-- Enable RLS on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see messages from rooms they're members of
CREATE POLICY user_room_messages ON messages
    FOR SELECT
    TO application_role
    USING (
        room_id IN (
            SELECT room_id 
            FROM room_members 
            WHERE user_id = current_setting('app.current_user_id')::UUID
        )
    );

-- Policy: Users can only insert messages as themselves
CREATE POLICY user_own_messages ON messages
    FOR INSERT
    TO application_role
    WITH CHECK (user_id = current_setting('app.current_user_id')::UUID);
```

**Audit Logging**
```sql
-- Audit table for tracking changes
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    user_id UUID,
    session_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger function for audit logging
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (
        table_name, operation, old_values, new_values, 
        user_id, session_id, ip_address
    ) VALUES (
        TG_TABLE_NAME, TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
        current_setting('app.current_user_id', true)::UUID,
        current_setting('app.session_id', true),
        current_setting('app.client_ip', true)::INET
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

### 3. Data Privacy and GDPR Compliance

**Data Anonymization**
```sql
-- Anonymize user data for GDPR compliance
CREATE OR REPLACE FUNCTION anonymize_user_data(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
    -- Update user profile with anonymized data
    UPDATE users SET
        email = 'deleted-' || id || '@example.com',
        username = 'deleted-user-' || EXTRACT(EPOCH FROM NOW()),
        first_name = 'Deleted',
        last_name = 'User',
        phone = NULL,
        avatar_url = NULL,
        is_deleted = true,
        deleted_at = NOW()
    WHERE id = user_id_param;
    
    -- Anonymize messages but keep for conversation context
    UPDATE messages SET
        content = '[Message deleted by user]',
        attachments = '[]'::jsonb
    WHERE user_id = user_id_param;
    
    -- Log the anonymization
    INSERT INTO audit_log (table_name, operation, new_values, user_id)
    VALUES ('users', 'ANONYMIZE', jsonb_build_object('user_id', user_id_param), user_id_param);
END;
$$ LANGUAGE plpgsql;
```

**Data Retention Policies**
```sql
-- Automated data cleanup
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS VOID AS $$
BEGIN
    -- Delete old audit logs (keep 7 years)
    DELETE FROM audit_log 
    WHERE created_at < NOW() - INTERVAL '7 years';
    
    -- Archive old messages (move to cold storage after 2 years)
    INSERT INTO messages_archive 
    SELECT * FROM messages 
    WHERE created_at < NOW() - INTERVAL '2 years';
    
    DELETE FROM messages 
    WHERE created_at < NOW() - INTERVAL '2 years';
    
    -- Delete expired sessions
    DELETE FROM user_sessions 
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup job
SELECT cron.schedule('cleanup-old-data', '0 2 * * *', 'SELECT cleanup_old_data();');
```

## 💾 Backup & Disaster Recovery

### 1. Backup Strategies

**PostgreSQL Backup Methods**
```bash
# Full database backup
pg_dump -h localhost -U postgres -d chatapp -f chatapp_backup.sql

# Compressed backup
pg_dump -h localhost -U postgres -d chatapp | gzip > chatapp_backup.sql.gz

# Directory format backup (parallel)
pg_dump -h localhost -U postgres -d chatapp -F d -j 4 -f chatapp_backup_dir

# Continuous archiving (WAL-E)
wal-e backup-push /var/lib/postgresql/data

# Point-in-time recovery setup
archive_mode = on
archive_command = 'wal-e wal-push %p'
wal_level = replica
```

**MongoDB Backup Strategies**
```bash
# Database dump
mongodump --host localhost:27017 --db chatapp --out /backup/mongodb

# Compressed backup
mongodump --host localhost:27017 --db chatapp --gzip --archive=/backup/chatapp.gz

# Replica set backup
mongodump --host replica-set/mongo1:27017,mongo2:27017,mongo3:27017 --db chatapp

# Incremental backup using oplog
mongodump --host localhost:27017 --oplog --out /backup/incremental
```

### 2. High Availability Setup

**PostgreSQL Streaming Replication**
```sql
-- Master configuration
wal_level = replica
max_wal_senders = 10
wal_keep_segments = 64
synchronous_standby_names = 'standby1,standby2'

-- Standby configuration
hot_standby = on
max_standby_streaming_delay = 30s
wal_receiver_status_interval = 10s
```

**MongoDB Replica Set**
```javascript
// Initialize replica set
rs.initiate({
  _id: "chatapp-rs",
  members: [
    { _id: 0, host: "mongo1:27017", priority: 2 },
    { _id: 1, host: "mongo2:27017", priority: 1 },
    { _id: 2, host: "mongo3:27017", priority: 1, arbiterOnly: true }
  ]
});

// Check replica set status
rs.status();

// Configure read preferences
db.messages.find().readPref("secondaryPreferred");
```

### 3. Disaster Recovery Planning

**Recovery Time Objective (RTO) & Recovery Point Objective (RPO)**
- **RTO**: Maximum acceptable downtime (e.g., 4 hours)
- **RPO**: Maximum acceptable data loss (e.g., 15 minutes)

**Multi-Region Setup**
```yaml
# AWS RDS Multi-AZ deployment
Resources:
  ChatAppDatabase:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceClass: db.r5.xlarge
      Engine: postgres
      MultiAZ: true
      BackupRetentionPeriod: 30
      PreferredBackupWindow: "03:00-04:00"
      PreferredMaintenanceWindow: "sun:04:00-sun:05:00"
      
  ReadReplica:
    Type: AWS::RDS::DBInstance
    Properties:
      SourceDBInstanceIdentifier: !Ref ChatAppDatabase
      DBInstanceClass: db.r5.large
      PubliclyAccessible: false
```

## 📊 Database Monitoring & Performance

### 1. Performance Metrics

**Key Database Metrics**
- **Throughput**: Queries per second (QPS)
- **Latency**: Query response time percentiles
- **Connections**: Active/idle connection counts
- **Resource Usage**: CPU, memory, disk I/O
- **Error Rates**: Failed queries, timeouts
- **Cache Hit Ratios**: Buffer pool efficiency

**PostgreSQL Monitoring Queries**
```sql
-- Current activity and blocking queries
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    state_change,
    waiting,
    query
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start;

-- Table and index usage statistics
SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    n_tup_ins,
    n_tup_upd,
    n_tup_del
FROM pg_stat_user_tables
ORDER BY seq_scan DESC;

-- Slow queries from pg_stat_statements
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 20;
```

### 2. Automated Monitoring Setup

**Prometheus + Grafana Stack**
```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      
  postgres-exporter:
    image: prometheuscommunity/postgres-exporter
    environment:
      - DATA_SOURCE_NAME=postgresql://user:pass@postgres:5432/chatapp?sslmode=disable
      
  mongodb-exporter:
    image: percona/mongodb_exporter
    command:
      - '--mongodb.uri=mongodb://mongo:27017'
```

**Alert Rules**
```yaml
# alerts.yml
groups:
  - name: database.rules
    rules:
      - alert: PostgreSQLDown
        expr: pg_up == 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL is down"
          
      - alert: HighDatabaseConnections
        expr: pg_stat_database_numbackends / pg_settings_max_connections > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High database connection usage"
          
      - alert: SlowQueries
        expr: pg_stat_statements_mean_time_ms > 1000
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Slow database queries detected"
```

## 🌐 Multi-Database Architecture

### 1. Database Federation

**Cross-Database Queries**
```sql
-- PostgreSQL Foreign Data Wrapper
CREATE EXTENSION postgres_fdw;

CREATE SERVER mongodb_server
FOREIGN DATA WRAPPER postgres_fdw
OPTIONS (host 'mongodb-proxy', port '5432', dbname 'mongodb_proxy');

CREATE USER MAPPING FOR current_user
SERVER mongodb_server
OPTIONS (user 'proxy_user', password 'proxy_pass');

-- Query across databases
SELECT 
    u.username,
    m.message_count,
    a.page_views
FROM users u
JOIN (
    SELECT user_id, COUNT(*) as message_count
    FROM messages_foreign
    GROUP BY user_id
) m ON u.id = m.user_id
JOIN analytics_foreign a ON u.id = a.user_id;
```

### 2. Data Synchronization

**Change Data Capture (CDC)**
```javascript
// Debezium configuration for PostgreSQL
{
  "name": "chatapp-postgres-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "postgres",
    "database.port": "5432",
    "database.user": "debezium",
    "database.password": "password",
    "database.dbname": "chatapp",
    "database.server.name": "chatapp-postgres",
    "table.whitelist": "public.users,public.messages,public.rooms",
    "plugin.name": "pgoutput"
  }
}

// Event processing
const kafka = require('kafkajs');

const consumer = kafka.consumer({ groupId: 'chatapp-sync' });

await consumer.subscribe({ topic: 'chatapp-postgres.public.users' });

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const event = JSON.parse(message.value.toString());
    
    // Sync to MongoDB
    if (event.op === 'c') { // Create
      await mongoDb.collection('users').insertOne(event.after);
    } else if (event.op === 'u') { // Update
      await mongoDb.collection('users').updateOne(
        { id: event.after.id },
        { $set: event.after }
      );
    } else if (event.op === 'd') { // Delete
      await mongoDb.collection('users').deleteOne({ id: event.before.id });
    }
  },
});
```

### 3. Database Proxy and Load Balancing

**PgBouncer Configuration**
```ini
[databases]
chatapp = host=postgres-master port=5432 dbname=chatapp
chatapp_ro = host=postgres-replica port=5432 dbname=chatapp

[pgbouncer]
listen_port = 6432
listen_addr = *
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
reserve_pool_size = 5
```

**MongoDB Connection Routing**
```javascript
// Connection string with read preference
const uri = "mongodb://mongo1:27017,mongo2:27017,mongo3:27017/chatapp?replicaSet=rs0&readPreference=secondaryPreferred";

// Application-level routing
class DatabaseRouter {
  constructor() {
    this.writeConnection = new MongoClient(writeUri);
    this.readConnections = readUris.map(uri => new MongoClient(uri));
  }
  
  getConnection(operation) {
    if (operation === 'write') {
      return this.writeConnection;
    }
    
    // Round-robin read connections
    const index = this.readIndex++ % this.readConnections.length;
    return this.readConnections[index];
  }
}
```

## 🏆 Advanced Database Mastery Checklist

- [ ] Polyglot persistence architecture
- [ ] Advanced query optimization techniques
- [ ] Database sharding and partitioning
- [ ] Event sourcing and CQRS patterns
- [ ] Database security and compliance
- [ ] Backup and disaster recovery strategies
- [ ] Performance monitoring and alerting
- [ ] Multi-database synchronization
- [ ] High availability and failover
- [ ] Data modeling for scale

**🎉 Master these advanced concepts to architect enterprise-scale database systems!**