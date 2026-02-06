'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useChatStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ChatPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout, initAuth } = useAuthStore();
  const { rooms, currentRoom, messages, fetchRooms, selectRoom, sendMessage, createRoom } = useChatStore();
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', description: '' });

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      fetchRooms();
    }
  }, [isAuthenticated, router, fetchRooms]);

  if (!isAuthenticated) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentRoom) return;
    await sendMessage(messageInput);
    setMessageInput('');
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.name.trim()) return;
    await createRoom({ name: newRoom.name, description: newRoom.description, type: 'GROUP' });
    setNewRoom({ name: '', description: '' });
    setShowCreateRoom(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const filteredRooms = rooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="font-bold text-gray-900">{user?.username}</h1>
                <p className="text-xs text-gray-500">Online</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              ↪️
            </Button>
          </div>
          <Button 
            onClick={() => setShowCreateRoom(!showCreateRoom)} 
            className="w-full"
            size="sm"
          >
            + New Room
          </Button>
        </div>

        {/* Create Room Form */}
        {showCreateRoom && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <form onSubmit={handleCreateRoom} className="space-y-3">
              <Input
                placeholder="Room name"
                value={newRoom.name}
                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
              />
              <Input
                placeholder="Description"
                value={newRoom.description}
                onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="flex-1">Create</Button>
                <Button type="button" variant="secondary" size="sm" className="flex-1" onClick={() => setShowCreateRoom(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <Input
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Rooms List */}
        <div className="flex-1 overflow-y-auto">
          {filteredRooms.map(room => (
            <button
              key={room.id}
              onClick={() => selectRoom(room.id)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                currentRoom?.id === room.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
              }`}
            >
              <p className="font-semibold text-gray-900 text-sm">{room.name}</p>
              {room.description && <p className="text-xs text-gray-500 truncate">{room.description}</p>}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentRoom ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">{currentRoom.name}</h2>
              {currentRoom.description && <p className="text-sm text-gray-600">{currentRoom.description}</p>}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {msg.userId[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-900">{msg.userId}</p>
                    <p className="text-sm text-gray-700 mt-1">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-white">
              <div className="flex gap-3">
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm">Send</Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 text-lg">Select a room to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
