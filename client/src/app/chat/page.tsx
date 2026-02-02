'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/api';

interface Room {
  id: string;
  name: string;
  type: string;
  members: any[];
  messages: any[];
  _count: { messages: number };
}

interface Message {
  id: string;
  content: string;
  type: string;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    avatar?: string;
  };
}

export default function ChatPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuthAndLoadRooms();
  }, []);

  const checkAuthAndLoadRooms = async () => {
    try {
      // First check if user is authenticated
      await apiService.getProfile();
      // If successful, load rooms
      await loadRooms();
    } catch (error) {
      console.error('Authentication failed:', error);
      router.push('/');
    }
  };

  const loadRooms = async () => {
    try {
      const roomsData = await apiService.getRooms();
      setRooms(roomsData);
      if (roomsData.length > 0 && !selectedRoom) {
        setSelectedRoom(roomsData[0]);
        loadMessages(roomsData[0].id);
      }
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const messagesData = await apiService.getMessages(roomId);
      setMessages(messagesData.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      const room = await apiService.createRoom({
        name: newRoomName,
        type: 'GROUP',
      });
      setRooms([...rooms, room]);
      setNewRoomName('');
      setShowCreateRoom(false);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const selectRoom = (room: Room) => {
    setSelectedRoom(room);
    loadMessages(room.id);
  };

  const logout = () => {
    apiService.removeToken();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Chat Rooms</h1>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
          <button
            onClick={() => setShowCreateRoom(true)}
            className="mt-2 w-full bg-indigo-600 text-white px-3 py-2 rounded-md text-sm hover:bg-indigo-700"
          >
            Create Room
          </button>
        </div>

        <div className="overflow-y-auto">
          {rooms.map((room) => (
            <div
              key={room.id}
              onClick={() => selectRoom(room)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedRoom?.id === room.id ? 'bg-indigo-50 border-indigo-200' : ''
              }`}
            >
              <div className="font-medium">{room.name}</div>
              <div className="text-sm text-gray-500">
                {room._count.messages} messages • {room.members.length} members
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold">{selectedRoom.name}</h2>
              <p className="text-sm text-gray-500">{selectedRoom.members.length} members</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex space-x-3">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm">
                    {message.sender.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{message.sender.username}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-900">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      // Handle send message
                      console.log('Send message:', newMessage);
                      setNewMessage('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    console.log('Send message:', newMessage);
                    setNewMessage('');
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Select a room to start chatting</p>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Create New Room</h3>
            <form onSubmit={createRoom}>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Room name"
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateRoom(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}