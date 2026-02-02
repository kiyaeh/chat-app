const http = require('http');

// Test data
const testUser = {
  email: 'senior@dev.com',
  username: 'seniordev',
  password: 'SecurePass123'
};

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAuth() {
  console.log('🔐 Testing Enhanced Authentication System\n');

  try {
    // Test 1: Register
    console.log('1. Testing Registration...');
    const registerResult = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, testUser);

    if (registerResult.status === 201) {
      console.log('✅ Registration successful');
      console.log(`   Access Token: ${registerResult.data.access_token?.substring(0, 20)}...`);
      console.log(`   Refresh Token: ${registerResult.data.refresh_token?.substring(0, 20)}...`);
      
      const accessToken = registerResult.data.access_token;
      const refreshToken = registerResult.data.refresh_token;

      // Test 2: Get Profile
      console.log('\n2. Testing Profile Access...');
      const profileResult = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/auth/me',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (profileResult.status === 200) {
        console.log('✅ Profile access successful');
        console.log(`   User: ${profileResult.data.user.username} (${profileResult.data.user.email})`);
      } else {
        console.log('❌ Profile access failed:', profileResult.status);
      }

      // Test 3: Refresh Token
      console.log('\n3. Testing Token Refresh...');
      const refreshResult = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/auth/refresh',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, { refreshToken });

      if (refreshResult.status === 201) {
        console.log('✅ Token refresh successful');
        console.log(`   New Access Token: ${refreshResult.data.access_token?.substring(0, 20)}...`);
      } else {
        console.log('❌ Token refresh failed:', refreshResult.status);
      }

      // Test 4: Logout
      console.log('\n4. Testing Logout...');
      const logoutResult = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/auth/logout',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (logoutResult.status === 201) {
        console.log('✅ Logout successful');
      } else {
        console.log('❌ Logout failed:', logoutResult.status);
      }

    } else {
      console.log('❌ Registration failed:', registerResult.status, registerResult.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n🎯 Authentication System Test Complete!');
}

testAuth();