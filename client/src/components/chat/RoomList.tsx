'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Search, Plus, Hash, Lock, Globe } from 'lucide-react';
import clsx from 'clsx';

export const RoomList: React.FC = () => {
  const { rooms, currentRoom, fetchRooms, selectRoom, isLoadingRooms, createRoom } = useChatStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '', type: 'GROUP' });

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRoom(formData);
      setFormData({ name: '', description: '', type: 'GROUP' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'PRIVATE':
        return <Lock className="w-4 h-4" />;
      case 'PUBLIC':
        return <Globe className="w-4 h-4" />;
      default:
        return <Hash className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col h-full shadow-2xl relative overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <div className="relative z-10 p-5 border-b border-white/10 backdrop-blur-sm">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent"
        >
          Chat Rooms
        </motion.h1>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="secondary"
            size="md"
            onClick={() => setShowCreateForm(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-cyan-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Room
          </Button>
        </motion.div>
      </div>

      {/* Search */}
      <div className="relative z-10 p-4 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-xl text-sm placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Room List */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {isLoadingRooms ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} className="bg-white/5" />
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 text-center"
          >
            <div className="text-5xl mb-4 opacity-50">💬</div>
            <p className="text-gray-400 text-sm">No rooms found</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {filteredRooms.map((room, index) => (
              <motion.button
                key={room.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectRoom(room.id)}
                className={clsx(
                  'w-full text-left px-4 py-4 border-b border-white/5 transition-all duration-200 relative group overflow-hidden',
                  currentRoom?.id === room.id
                    ? 'bg-gradient-to-r from-blue-600/50 to-cyan-600/50 backdrop-blur-sm'
                    : 'hover:bg-white/5'
                )}
              >
                {/* Animated Background for Active Room */}
                {currentRoom?.id === room.id && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                )}

                <div className="relative flex items-start justify-between">
                  <div className="flex-1 min-w-0 flex items-start gap-3">
                    <div
                      className={clsx(
                        'mt-1 p-2 rounded-lg transition-colors',
                        currentRoom?.id === room.id
                          ? 'bg-white/20'
                          : 'bg-white/10 group-hover:bg-white/20'
                      )}
                    >
                      {getRoomIcon(room.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate mb-1">{room.name}</p>
                      {room.description && (
                        <p className="text-xs text-gray-400 truncate line-clamp-2">
                          {room.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={room.type === 'PUBLIC' ? 'success' : room.type === 'PRIVATE' ? 'warning' : 'default'}
                    size="sm"
                    className="ml-2 flex-shrink-0"
                  >
                    {room.type}
                  </Badge>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Create Room Modal */}
      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Create New Room"
        size="md"
      >
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Name</label>
            <input
              type="text"
              placeholder="Enter room name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              placeholder="Enter room description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="GROUP">Group</option>
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">
              Create Room
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateForm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};
