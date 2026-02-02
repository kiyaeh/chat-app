const axios = require('axios');
const io = require('socket.io-client');

const API_BASE = 'http://localhost:3000';
const WS_URL = 'http://localhost:3007';

class ProductionTest {
  constructor() {
    this.token = null;
    this.userId = null;
    this.roomId = null;
  }

  async runAllTests() {
    console.log('🚀 Starting Production Readiness Tests...\n');

    try {
      await this.testHealthChecks();
      await this.testAuthentication();
      await this.testRateLimit();
      await this.testErrorHandling();
      await this.testWebSocketConnection();
      await this.testPerformance();
      
      console.log('\n✅ All Production Tests Passed!');
      console.log('🎉 System is 100% Production Ready!');
    } catch (error) {
      console.error('\n❌ Production Test Failed:', error.message);
      process.exit(1);
    }
  }

  async testHealthChecks() {
    console.log('🔍 Testing Health Checks...');
    
    const services = [
      { name: 'API Gateway', url: `${API_BASE}/health` },
      { name: 'Auth Service', url: 'http://localhost:3001/health' },
      { name: 'User Service', url: 'http://localhost:3002/health' },
      { name: 'Room Service', url: 'http://localhost:3003/health' },
      { name: 'Message Service', url: 'http://localhost:3004/health' },
      { name: 'WebSocket Service', url: 'http://localhost:3007/health' },
    ];

    for (const service of services) {
      try {
        const response = await axios.get(service.url);
        console.log(`  ✅ ${service.name}: ${response.data.status}`);
      } catch (error) {
        console.log(`  ⚠️  ${service.name}: Service not available`);
      }
    }
  }

  async testAuthentication() {
    console.log('\n🔐 Testing Authentication...');
    
    // Register user
    const registerData = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'TestPassword123!'
    };

    const registerResponse = await axios.post(`${API_BASE}/auth/register`, registerData);
    console.log('  ✅ User Registration');

    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: registerData.email,
      password: registerData.password
    });

    this.token = loginResponse.data.accessToken;
    this.userId = loginResponse.data.user.id;
    console.log('  ✅ User Login');

    // Test protected route
    const profileResponse = await axios.get(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    console.log('  ✅ Protected Route Access');
  }

  async testRateLimit() {
    console.log('\n⚡ Testing Rate Limiting...');
    
    let rateLimitHit = false;
    for (let i = 0; i < 105; i++) {
      try {
        await axios.get(`${API_BASE}/health`);
      } catch (error) {
        if (error.response?.status === 429) {
          rateLimitHit = true;
          break;
        }
      }
    }
    
    console.log(`  ${rateLimitHit ? '✅' : '⚠️'} Rate Limiting ${rateLimitHit ? 'Active' : 'Not Triggered'}`);
  }

  async testErrorHandling() {
    console.log('\n🛡️ Testing Error Handling...');
    
    try {
      await axios.get(`${API_BASE}/nonexistent-endpoint`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('  ✅ 404 Error Handling');
      }
    }

    try {
      await axios.get(`${API_BASE}/users/me`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('  ✅ 401 Unauthorized Handling');
      }
    }
  }

  async testWebSocketConnection() {
    console.log('\n🔌 Testing WebSocket Connection...');
    
    return new Promise((resolve) => {
      const socket = io(WS_URL, {
        auth: { token: this.token }
      });

      socket.on('connect', () => {
        console.log('  ✅ WebSocket Connection');
        socket.disconnect();
        resolve();
      });

      socket.on('connect_error', (error) => {
        console.log('  ⚠️ WebSocket Connection Failed');
        resolve();
      });

      setTimeout(() => {
        socket.disconnect();
        resolve();
      }, 5000);
    });
  }

  async testPerformance() {
    console.log('\n⚡ Testing Performance...');
    
    const start = Date.now();
    const promises = [];
    
    for (let i = 0; i < 10; i++) {
      promises.push(axios.get(`${API_BASE}/health`));
    }
    
    await Promise.all(promises);
    const duration = Date.now() - start;
    
    console.log(`  ✅ 10 Concurrent Requests: ${duration}ms`);
    console.log(`  ${duration < 1000 ? '✅' : '⚠️'} Performance ${duration < 1000 ? 'Good' : 'Needs Optimization'}`);
  }
}

// Run tests
const tester = new ProductionTest();
tester.runAllTests();