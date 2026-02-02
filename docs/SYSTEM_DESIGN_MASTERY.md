# 🏗️ Enterprise System Design & Architecture

## 📋 Table of Contents
1. [Distributed Systems Fundamentals](#distributed-systems-fundamentals)
2. [Scalability Patterns](#scalability-patterns)
3. [Microservices Architecture](#microservices-architecture)
4. [Event-Driven Architecture](#event-driven-architecture)
5. [Caching Strategies](#caching-strategies)
6. [Load Balancing & Traffic Management](#load-balancing--traffic-management)
7. [Reliability & Fault Tolerance](#reliability--fault-tolerance)
8. [Security Architecture](#security-architecture)

## 🌐 Distributed Systems Fundamentals

### 1. CAP Theorem in Practice

**Consistency, Availability, Partition Tolerance Trade-offs**

**CP Systems (Consistency + Partition Tolerance)**
- **Use Case**: Financial transactions, inventory management
- **Examples**: MongoDB (with strong consistency), HBase
- **Trade-off**: Sacrifice availability during network partitions
- **Implementation**: Synchronous replication, distributed locks

**AP Systems (Availability + Partition Tolerance)**
- **Use Case**: Social media feeds, content delivery
- **Examples**: Cassandra, DynamoDB
- **Trade-off**: Eventual consistency, temporary data inconsistency
- **Implementation**: Asynchronous replication, conflict resolution

**CA Systems (Consistency + Availability)**
- **Use Case**: Single-datacenter applications
- **Examples**: Traditional RDBMS (PostgreSQL, MySQL)
- **Trade-off**: Cannot handle network partitions
- **Implementation**: ACID transactions, immediate consistency

### 2. Consensus Algorithms

**Raft Consensus**
- **Leader Election**: Single leader handles all writes
- **Log Replication**: Leader replicates entries to followers
- **Safety**: Ensures consistency across nodes
- **Use Cases**: etcd, Consul, MongoDB replica sets

**PBFT (Practical Byzantine Fault Tolerance)**
- **Byzantine Failures**: Handles malicious or arbitrary failures
- **3f+1 Nodes**: Tolerates f Byzantine failures
- **Use Cases**: Blockchain, critical financial systems

### 3. Distributed Data Patterns

**Saga Pattern for Distributed Transactions**
```
Order Service → Payment Service → Inventory Service → Shipping Service
     ↓               ↓                ↓                 ↓
Create Order → Process Payment → Reserve Items → Schedule Delivery
     ↓               ↓                ↓                 ↓
Compensate ← Cancel Payment ← Release Items ← Cancel Delivery
```

**Event Sourcing Architecture**
```
Command → Event Store → Event Handlers → Read Models
   ↓           ↓             ↓              ↓
Create User → UserCreated → Update Cache → User Profile View
Edit Profile → ProfileUpdated → Send Email → Notification View
```

## 📈 Scalability Patterns

### 1. Horizontal vs Vertical Scaling

**Horizontal Scaling (Scale Out)**
- **Advantages**: Linear scalability, fault tolerance
- **Challenges**: Data consistency, complexity
- **Patterns**: Load balancing, sharding, microservices
- **Cost**: Lower per unit, higher operational complexity

**Vertical Scaling (Scale Up)**
- **Advantages**: Simplicity, strong consistency
- **Challenges**: Hardware limits, single point of failure
- **Patterns**: Resource optimization, caching
- **Cost**: Higher per unit, lower operational complexity

### 2. Database Scaling Strategies

**Read Replicas Pattern**
```
Application Layer
       ↓
Load Balancer
    ↙     ↘
Write DB   Read Replicas
(Master)   (Slave 1, 2, 3)
    ↓           ↑
Replication ----┘
```

**Database Sharding Patterns**
```
Shard Key: user_id % 4

Shard 0: users 0, 4, 8, 12...
Shard 1: users 1, 5, 9, 13...
Shard 2: users 2, 6, 10, 14...
Shard 3: users 3, 7, 11, 15...
```

**CQRS (Command Query Responsibility Segregation)**
```
Commands (Writes)     Queries (Reads)
       ↓                    ↑
Write Database → Events → Read Database
   (Normalized)           (Denormalized)
```

### 3. Caching Layers

**Multi-Level Caching Strategy**
```
Client → CDN → Load Balancer → Application Cache → Database Cache → Database
  L1      L2         L3              L4               L5           L6
```

**Cache Patterns**
- **Cache-Aside**: Application manages cache
- **Write-Through**: Write to cache and database simultaneously
- **Write-Behind**: Write to cache first, database later
- **Refresh-Ahead**: Proactively refresh cache before expiration

## 🔧 Microservices Architecture

### 1. Service Decomposition Strategies

**Domain-Driven Design (DDD)**
```
Chat Application Bounded Contexts:

User Management Context
├─ User Registration
├─ Authentication
├─ Profile Management
└─ User Preferences

Communication Context
├─ Message Handling
├─ Room Management
├─ Real-time Events
└─ File Sharing

Notification Context
├─ Push Notifications
├─ Email Notifications
├─ SMS Notifications
└─ Notification Preferences
```

**Service Boundaries**
- **Single Responsibility**: One business capability per service
- **Data Ownership**: Each service owns its data
- **Independent Deployment**: Services can be deployed separately
- **Technology Diversity**: Different tech stacks per service

### 2. Inter-Service Communication

**Synchronous Communication**
```
HTTP/REST APIs
├─ Request-Response Pattern
├─ Strong Consistency
├─ Higher Latency
└─ Tight Coupling

gRPC
├─ Binary Protocol
├─ Type Safety
├─ Streaming Support
└─ Better Performance
```

**Asynchronous Communication**
```
Message Queues
├─ Point-to-Point
├─ Guaranteed Delivery
├─ Load Balancing
└─ Examples: RabbitMQ, SQS

Event Streaming
├─ Publish-Subscribe
├─ Event Replay
├─ High Throughput
└─ Examples: Kafka, EventBridge
```

### 3. Service Mesh Architecture

**Istio Service Mesh Components**
```
Data Plane (Envoy Proxies)
├─ Traffic Management
├─ Security (mTLS)
├─ Observability
└─ Load Balancing

Control Plane
├─ Pilot (Traffic Management)
├─ Citadel (Security)
├─ Galley (Configuration)
└─ Mixer (Telemetry)
```

## ⚡ Event-Driven Architecture

### 1. Event Patterns

**Event Types**
- **Domain Events**: Business-significant occurrences
- **Integration Events**: Cross-service communication
- **System Events**: Infrastructure and operational events

**Event Schema Evolution**
```json
{
  "eventType": "MessageSent",
  "version": "2.0",
  "eventId": "uuid",
  "timestamp": "2024-01-15T10:30:00Z",
  "aggregateId": "message-123",
  "data": {
    "messageId": "uuid",
    "userId": "uuid",
    "roomId": "uuid",
    "content": "string",
    "messageType": "text|image|file",
    "metadata": {
      "clientVersion": "1.2.3",
      "platform": "web|mobile"
    }
  },
  "schemaVersion": "2.0"
}
```

### 2. Event Streaming Architecture

**Apache Kafka Architecture**
```
Producers → Kafka Cluster → Consumers
    ↓           ↓              ↓
Services    Topics/Partitions  Services
            (Distributed Log)
```

**Event Processing Patterns**
- **Event Sourcing**: Store events as source of truth
- **CQRS**: Separate command and query models
- **Saga**: Distributed transaction management
- **Event Replay**: Rebuild state from events

### 3. Event-Driven Microservices

**Choreography vs Orchestration**

**Choreography (Decentralized)**
```
Order Created → Payment Service → Inventory Service → Shipping Service
     ↓               ↓                ↓                 ↓
   Event          Event            Event             Event
```

**Orchestration (Centralized)**
```
Order Orchestrator
├─ Call Payment Service
├─ Call Inventory Service
├─ Call Shipping Service
└─ Handle Failures
```

## 🚀 Caching Strategies

### 1. Cache Hierarchy

**Application-Level Caching**
```javascript
// In-memory cache with TTL
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

// Multi-level cache strategy
class CacheManager {
  constructor() {
    this.l1Cache = new Map(); // Memory cache
    this.l2Cache = redisClient; // Distributed cache
  }
  
  async get(key) {
    // L1 cache check
    if (this.l1Cache.has(key)) {
      return this.l1Cache.get(key);
    }
    
    // L2 cache check
    const value = await this.l2Cache.get(key);
    if (value) {
      this.l1Cache.set(key, value);
      return value;
    }
    
    return null;
  }
}
```

**Distributed Caching Patterns**
```
Cache Cluster Topology:

Master-Slave Replication
Master → Slave 1
      → Slave 2
      → Slave 3

Consistent Hashing
Node 1: Keys 0-25%
Node 2: Keys 25-50%
Node 3: Keys 50-75%
Node 4: Keys 75-100%
```

### 2. Cache Invalidation Strategies

**Time-Based Expiration**
- **TTL (Time To Live)**: Fixed expiration time
- **Sliding Expiration**: Reset timer on access
- **Absolute Expiration**: Fixed expiration date

**Event-Based Invalidation**
```javascript
// Cache invalidation on data changes
class CacheInvalidator {
  constructor(cache, eventBus) {
    this.cache = cache;
    this.eventBus = eventBus;
    
    // Listen for data change events
    this.eventBus.on('user.updated', (userId) => {
      this.cache.del(`user:${userId}`);
      this.cache.del(`user:profile:${userId}`);
    });
    
    this.eventBus.on('message.sent', (roomId) => {
      this.cache.del(`room:messages:${roomId}`);
      this.cache.del(`room:stats:${roomId}`);
    });
  }
}
```

### 3. Cache Warming and Preloading

**Predictive Caching**
```javascript
// Preload frequently accessed data
class CacheWarmer {
  async warmUserCache(userId) {
    const user = await this.userService.getUser(userId);
    const profile = await this.userService.getProfile(userId);
    const rooms = await this.roomService.getUserRooms(userId);
    
    // Cache user data
    await this.cache.setex(`user:${userId}`, 3600, JSON.stringify(user));
    await this.cache.setex(`user:profile:${userId}`, 3600, JSON.stringify(profile));
    await this.cache.setex(`user:rooms:${userId}`, 1800, JSON.stringify(rooms));
  }
  
  async warmPopularContent() {
    const popularRooms = await this.analyticsService.getPopularRooms();
    
    for (const room of popularRooms) {
      const messages = await this.messageService.getRecentMessages(room.id);
      await this.cache.setex(`room:messages:${room.id}`, 600, JSON.stringify(messages));
    }
  }
}
```

## ⚖️ Load Balancing & Traffic Management

### 1. Load Balancing Algorithms

**Round Robin**
- **Simple**: Distribute requests evenly
- **Weighted**: Assign different weights to servers
- **Use Case**: Homogeneous server capacity

**Least Connections**
- **Dynamic**: Route to server with fewest active connections
- **Adaptive**: Adjusts to server load
- **Use Case**: Long-lived connections

**IP Hash**
- **Sticky Sessions**: Same client always goes to same server
- **Consistent**: Based on client IP hash
- **Use Case**: Session-dependent applications

### 2. Traffic Shaping and Rate Limiting

**Rate Limiting Algorithms**
```javascript
// Token Bucket Algorithm
class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRate;
    this.lastRefill = Date.now();
  }
  
  consume(tokens = 1) {
    this.refill();
    
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    
    return false;
  }
  
  refill() {
    const now = Date.now();
    const tokensToAdd = Math.floor((now - this.lastRefill) / 1000 * this.refillRate);
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}

// Sliding Window Rate Limiter
class SlidingWindowRateLimiter {
  constructor(windowSize, maxRequests) {
    this.windowSize = windowSize;
    this.maxRequests = maxRequests;
    this.requests = new Map();
  }
  
  isAllowed(clientId) {
    const now = Date.now();
    const windowStart = now - this.windowSize;
    
    if (!this.requests.has(clientId)) {
      this.requests.set(clientId, []);
    }
    
    const clientRequests = this.requests.get(clientId);
    
    // Remove old requests
    while (clientRequests.length > 0 && clientRequests[0] < windowStart) {
      clientRequests.shift();
    }
    
    if (clientRequests.length < this.maxRequests) {
      clientRequests.push(now);
      return true;
    }
    
    return false;
  }
}
```

### 3. Circuit Breaker Pattern

**Circuit Breaker Implementation**
```javascript
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.recoveryTimeout = options.recoveryTimeout || 60000;
    this.monitoringPeriod = options.monitoringPeriod || 10000;
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
  }
  
  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failureCount = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= 3) {
        this.state = 'CLOSED';
      }
    }
  }
  
  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}
```

## 🛡️ Reliability & Fault Tolerance

### 1. Failure Modes and Recovery

**Common Failure Patterns**
- **Cascading Failures**: One failure triggers others
- **Split Brain**: Network partition creates multiple leaders
- **Thundering Herd**: Simultaneous requests overwhelm system
- **Resource Exhaustion**: Memory, CPU, or connection limits

**Recovery Strategies**
```javascript
// Retry with Exponential Backoff
class RetryManager {
  constructor(maxRetries = 3, baseDelay = 1000) {
    this.maxRetries = maxRetries;
    this.baseDelay = baseDelay;
  }
  
  async execute(fn, context = {}) {
    let lastError;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === this.maxRetries) {
          break;
        }
        
        // Exponential backoff with jitter
        const delay = this.baseDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 0.1 * delay;
        await this.sleep(delay + jitter);
      }
    }
    
    throw lastError;
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 2. Health Checks and Monitoring

**Health Check Patterns**
```javascript
// Comprehensive health check
class HealthChecker {
  constructor() {
    this.checks = new Map();
  }
  
  addCheck(name, checkFn, options = {}) {
    this.checks.set(name, {
      fn: checkFn,
      timeout: options.timeout || 5000,
      critical: options.critical || false
    });
  }
  
  async runChecks() {
    const results = {};
    let overallStatus = 'healthy';
    
    for (const [name, check] of this.checks) {
      try {
        const startTime = Date.now();
        await Promise.race([
          check.fn(),
          this.timeout(check.timeout)
        ]);
        
        results[name] = {
          status: 'healthy',
          responseTime: Date.now() - startTime
        };
      } catch (error) {
        results[name] = {
          status: 'unhealthy',
          error: error.message
        };
        
        if (check.critical) {
          overallStatus = 'unhealthy';
        }
      }
    }
    
    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: results
    };
  }
  
  timeout(ms) {
    return new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Health check timeout')), ms)
    );
  }
}

// Usage
const healthChecker = new HealthChecker();

healthChecker.addCheck('database', async () => {
  await db.query('SELECT 1');
}, { critical: true });

healthChecker.addCheck('redis', async () => {
  await redis.ping();
}, { critical: true });

healthChecker.addCheck('external-api', async () => {
  const response = await fetch('https://api.external.com/health');
  if (!response.ok) throw new Error('External API unhealthy');
});
```

### 3. Graceful Degradation

**Feature Flags and Circuit Breakers**
```javascript
class FeatureManager {
  constructor() {
    this.features = new Map();
    this.circuitBreakers = new Map();
  }
  
  async executeFeature(featureName, primaryFn, fallbackFn) {
    // Check if feature is enabled
    if (!this.isFeatureEnabled(featureName)) {
      return await fallbackFn();
    }
    
    // Get or create circuit breaker
    let circuitBreaker = this.circuitBreakers.get(featureName);
    if (!circuitBreaker) {
      circuitBreaker = new CircuitBreaker({
        failureThreshold: 5,
        recoveryTimeout: 30000
      });
      this.circuitBreakers.set(featureName, circuitBreaker);
    }
    
    try {
      return await circuitBreaker.call(primaryFn);
    } catch (error) {
      console.warn(`Feature ${featureName} failed, using fallback:`, error.message);
      return await fallbackFn();
    }
  }
  
  isFeatureEnabled(featureName) {
    return this.features.get(featureName)?.enabled || false;
  }
}

// Usage example
const featureManager = new FeatureManager();

// AI-powered message suggestions with fallback
const messageSuggestions = await featureManager.executeFeature(
  'ai-suggestions',
  async () => {
    // Primary: AI-powered suggestions
    return await aiService.getSuggestions(context);
  },
  async () => {
    // Fallback: Template-based suggestions
    return await templateService.getSuggestions(context);
  }
);
```

## 🔐 Security Architecture

### 1. Defense in Depth

**Security Layers**
```
┌─────────────────────────────────────┐
│ Edge Security (CDN, WAF, DDoS)     │
├─────────────────────────────────────┤
│ Network Security (VPC, Firewalls)  │
├─────────────────────────────────────┤
│ Application Security (Auth, RBAC)  │
├─────────────────────────────────────┤
│ Data Security (Encryption, Masking)│
├─────────────────────────────────────┤
│ Infrastructure (OS, Container)     │
└─────────────────────────────────────┘
```

### 2. Zero Trust Architecture

**Core Principles**
- **Never Trust, Always Verify**: Authenticate every request
- **Least Privilege Access**: Minimal required permissions
- **Assume Breach**: Design for compromise scenarios
- **Continuous Monitoring**: Real-time security assessment

**Implementation Pattern**
```javascript
class ZeroTrustGateway {
  constructor() {
    this.authService = new AuthenticationService();
    this.authzService = new AuthorizationService();
    this.riskEngine = new RiskAssessmentEngine();
    this.auditLogger = new AuditLogger();
  }
  
  async processRequest(request) {
    const startTime = Date.now();
    
    try {
      // 1. Authentication
      const identity = await this.authService.authenticate(request);
      
      // 2. Risk Assessment
      const riskScore = await this.riskEngine.assess({
        identity,
        request,
        context: this.getRequestContext(request)
      });
      
      // 3. Authorization with risk context
      const authorized = await this.authzService.authorize({
        identity,
        resource: request.resource,
        action: request.action,
        riskScore
      });
      
      if (!authorized) {
        throw new Error('Access denied');
      }
      
      // 4. Process request
      const response = await this.forwardRequest(request);
      
      // 5. Audit logging
      await this.auditLogger.log({
        identity: identity.id,
        action: request.action,
        resource: request.resource,
        result: 'success',
        riskScore,
        duration: Date.now() - startTime
      });
      
      return response;
      
    } catch (error) {
      await this.auditLogger.log({
        identity: request.identity?.id,
        action: request.action,
        resource: request.resource,
        result: 'failure',
        error: error.message,
        duration: Date.now() - startTime
      });
      
      throw error;
    }
  }
}
```

### 3. Threat Modeling

**STRIDE Threat Model**
- **Spoofing**: Identity verification
- **Tampering**: Data integrity protection
- **Repudiation**: Audit trails and logging
- **Information Disclosure**: Data encryption and access control
- **Denial of Service**: Rate limiting and resource protection
- **Elevation of Privilege**: Principle of least privilege

**Security Controls Matrix**
```
Threat Type    | Prevention | Detection | Response
---------------|------------|-----------|----------
SQL Injection  | Parameterized queries | WAF logs | Block IP
XSS            | Input sanitization | CSP violations | Content filtering
CSRF           | CSRF tokens | Unusual patterns | Session invalidation
DDoS           | Rate limiting | Traffic spikes | Auto-scaling
Data Breach    | Encryption | Access anomalies | Incident response
```

## 🏆 System Design Mastery Checklist

- [ ] Distributed systems fundamentals (CAP theorem, consensus)
- [ ] Scalability patterns (horizontal/vertical scaling)
- [ ] Microservices architecture and communication
- [ ] Event-driven architecture and streaming
- [ ] Multi-level caching strategies
- [ ] Load balancing and traffic management
- [ ] Fault tolerance and reliability patterns
- [ ] Security architecture and zero trust
- [ ] Performance optimization techniques
- [ ] Monitoring and observability

**🎉 Master these concepts to design enterprise-scale distributed systems!**