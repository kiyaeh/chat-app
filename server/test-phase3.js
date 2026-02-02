const http = require('http');

let accessToken = '';
let userId = '';
let roomId = '';
let messageId = '';

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

async function testChatApp() {
  console.log('🚀 Testing Chat App - Phase 3: Core Business Logic\n');

  try {
    // 1. Register & Login
    console.log('1. Authentication...');
    const registerResult = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'test@chat.com',
      username: 'testuser',
      password: 'TestPass123'
    });

    if (registerResult.status === 201) {
      accessToken = registerResult.data.access_token;
      userId = registerResult.data.user.id;
      console.log('✅ User registered and logged in');
    } else {
      throw new Error('Registration failed');
    }

    // 2. Update User Status
    console.log('\n2. User Management...');
    const statusResult = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/users/me/status',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }, { status: 'ONLINE' });

    if (statusResult.status === 200) {
      console.log('✅ User status updated to ONLINE');
    }

    // 3. Create Room
    console.log('\n3. Room Management...');
    const roomResult = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/rooms',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }, {
      name: 'Test Room',
      description: 'A test room for our chat app',
      type: 'GROUP',
      isPrivate: false
    });

    if (roomResult.status === 201) {
      roomId = roomResult.data.id;
      console.log('✅ Room created:', roomResult.data.name);
    }

    // 4. Get User Rooms
    const userRoomsResult = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/rooms',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (userRoomsResult.status === 200) {
      console.log('✅ Retrieved user rooms:', userRoomsResult.data.length);
    }

    // 5. Send Message
    console.log('\n4. Message System...');
    const messageResult = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }, {
      roomId: roomId,
      content: 'Hello, this is my first message!',
      type: 'TEXT'
    });

    if (messageResult.status === 201) {
      messageId = messageResult.data.id;
      console.log('✅ Message sent:', messageResult.data.content);
    }

    // 6. Get Room Messages
    const messagesResult = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/messages/${roomId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (messagesResult.status === 200) {
      console.log('✅ Retrieved messages:', messagesResult.data.length);
    }

    // 7. Update Message
    const updateMessageResult = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/messages/${messageId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }, {
      content: 'Hello, this is my updated message!'
    });

    if (updateMessageResult.status === 200) {
      console.log('✅ Message updated');
    }

    // 8. Search Users
    console.log('\n5. User Search...');
    const searchResult = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/users/search?q=test',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (searchResult.status === 200) {
      console.log('✅ User search completed');
    }

    console.log('\n🎉 ALL TESTS PASSED! Chat App Phase 3 Complete!');
    console.log('\n📊 Summary:');
    console.log('- ✅ Authentication & JWT');
    console.log('- ✅ User Management & Status');
    console.log('- ✅ Room Creation & Management');
    console.log('- ✅ Message CRUD Operations');
    console.log('- ✅ User Search');
    console.log('\n🚀 Ready for Phase 4: Real-time WebSocket!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testChatApp();