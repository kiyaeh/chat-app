'use client';

import { useState } from 'react';
import { apiService } from '@/services/api';

export default function SimpleChatApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('test2@example.com');
  const [password, setPassword] = useState('password123');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiService.login(email, password);
      setUser(response.user);
      setIsLoggedIn(true);
      
      // Try to load rooms
      try {
        const roomsData = await apiService.getRooms();
        setRooms(roomsData);
      } catch (roomError) {
        console.error('Failed to load rooms:', roomError);
        setError('Logged in but failed to load rooms: ' + roomError.message);
      }
    } catch (err) {
      setError('Login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    try {
      const room = await apiService.createRoom({
        name: 'Test Room',
        type: 'GROUP',
      });
      setRooms([...rooms, room]);
    } catch (err) {
      setError('Failed to create room: ' + err.message);
    }
  };

  const handleLogout = () => {
    apiService.removeToken();
    setIsLoggedIn(false);
    setUser(null);
    setRooms([]);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to Chat App
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Chat App</h1>
              {user && (
                <span className="ml-4 text-gray-600">Welcome, {user.username}!</span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Your Rooms ({rooms.length})
              </h3>
              
              {error && (
                <div className="mb-4 text-red-600 text-sm">{error}</div>
              )}

              <button
                onClick={handleCreateRoom}
                className="mb-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Create Test Room
              </button>

              {rooms.length > 0 ? (
                <div className="space-y-2">
                  {rooms.map((room) => (
                    <div key={room.id} className="bg-white p-4 rounded-lg shadow">
                      <h4 className="font-medium">{room.name}</h4>
                      <p className="text-sm text-gray-500">
                        {room.members?.length || 0} members • {room._count?.messages || 0} messages
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No rooms yet. Create one to get started!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}