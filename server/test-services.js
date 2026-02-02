const http = require('http');

// Test configuration
const tests = [
  { name: 'API Gateway Health', url: 'http://localhost:3000/health', method: 'GET' },
  { name: 'Auth Service Health', url: 'http://localhost:3001/health', method: 'GET' },
  { name: 'User Service Health', url: 'http://localhost:3002/health', method: 'GET' },
  { name: 'Room Service Health', url: 'http://localhost:3003/health', method: 'GET' },
  { name: 'Message Service Health', url: 'http://localhost:3004/health', method: 'GET' },
];

// Test function
function testEndpoint(test) {
  return new Promise((resolve) => {
    const url = new URL(test.url);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: test.method,
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          name: test.name,
          status: res.statusCode,
          success: res.statusCode >= 200 && res.statusCode < 300,
          response: data
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        name: test.name,
        status: 'ERROR',
        success: false,
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: test.name,
        status: 'TIMEOUT',
        success: false,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

// Run all tests
async function runTests() {
  console.log('🚀 Testing Chat App Microservices...\n');
  
  const results = await Promise.all(tests.map(testEndpoint));
  
  console.log('📊 Test Results:');
  console.log('================');
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name}`);
    if (!result.success) {
      console.log(`   Error: ${result.error || `HTTP ${result.status}`}`);
    }
  });
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`\n📈 Summary: ${passed}/${total} services healthy`);
  
  if (passed === total) {
    console.log('🎉 All services are running correctly!');
  } else {
    console.log('⚠️  Some services need attention.');
  }
}

runTests().catch(console.error);