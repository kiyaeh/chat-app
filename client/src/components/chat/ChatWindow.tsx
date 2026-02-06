'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore, useAuthStore } from '@/store';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '@/components/ui/Avatar';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { MessageReactions } from './MessageReactions';
import { TypingIndicator } from './TypingIndicator';
import { MessageSearch, useMessageSearch } from './MessageSearch';
import { Dropdown } from '@/components/ui/Dropdown';
import { MoreVertical, Edit, Trash2, Copy, Search } from 'lucide-react';
import clsx from 'clsx';

export const ChatWindow: React.FC = () => {
  const { currentRoom, messages, isLoadingMessages } = useChatStore();
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const { isSearchOpen, openSearch, closeSearch } = useMessageSearch();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mock function for reactions - you'll connect this to your API
  const handleReactionAdd = (messageId: string, emoji: string) => {
    console.log('Add reaction:', messageId, emoji);
    // TODO: Implement API call
  };

  const handleReactionRemove = (messageId: string, emoji: string) => {
    console.log('Remove reaction:', messageId, emoji);
    // TODO: Implement API call
  };

  // Handle search result selection
  const handleSearchResultSelect = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement && messagesContainerRef.current) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight the message briefly
      messageElement.classList.add('bg-yellow-100');
      setTimeout(() => {
        messageElement.classList.remove('bg-yellow-100');
      }, 2000);
    }
  };

  if (!currentRoom) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
        {/* Animated Background Blobs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-10 right-10 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-pink-400/20 rounded-full blur-3xl"
        />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center z-10 backdrop-blur-sm bg-white/40 p-12 rounded-3xl border border-white/50 shadow-2xl"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-7xl mb-6"
          >
            💬
          </motion.div>
          <h2 className="text-gray-900 text-2xl font-bold mb-3">Select a room to start chatting</h2>
          <p className="text-gray-600 text-base">Choose from your rooms or create a new one</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-white relative">
      {/* Header with Glassmorphism */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-gray-200/50 p-4 backdrop-blur-xl bg-white/80 sticky top-0 z-10 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {currentRoom.name}
              <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {messages.length} messages
              </span>
            </h2>
            {currentRoom.description && (
              <p className="text-sm text-gray-600 mt-1">{currentRoom.description}</p>
            )}
          </div>
          <button
            onClick={openSearch}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Search messages (Ctrl+F)"
          >
            <Search className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </motion.div>

      {/* Message Search */}
      <MessageSearch
        messages={messages}
        onResultSelect={handleSearchResultSelect}
        isOpen={isSearchOpen}
        onClose={closeSearch}
      />

      {/* Messages with Virtual Scrolling */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
      >
        {isLoadingMessages ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center items-center h-full"
          >
            <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
              <div className="text-5xl mb-4">🎉</div>
              <p className="text-gray-700 text-lg font-semibold">No messages yet</p>
              <p className="text-gray-500 text-sm mt-2">Start the conversation!</p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => {
              const isOwnMessage = message.userId === user?.id;
              const showAvatar =
                index === 0 || messages[index - 1]?.userId !== message.userId;

              // Mock reactions data - you'll get this from your API
              const mockReactions = [
                { emoji: '👍', count: 2, users: ['user1', 'user2'], hasReacted: false },
              ];

              return (
                <motion.div
                  id={`message-${message.id}`}
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className={clsx('flex gap-3 group transition-colors duration-500', isOwnMessage && 'flex-row-reverse')}
                  onMouseEnter={() => setHoveredMessageId(message.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  {showAvatar ? (
                    <Avatar name={message.userId} size="md" status="online" />
                  ) : (
                    <div className="w-10" />
                  )}
                  <div className={clsx('flex-1 max-w-2xl', isOwnMessage && 'flex flex-col items-end')}>
                    {showAvatar && (
                      <p className="text-xs font-semibold text-gray-600 mb-1 px-2">
                        {message.userId}
                      </p>
                    )}
                    <div className="relative">
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className={clsx(
                          'inline-block px-4 py-3 rounded-2xl shadow-sm backdrop-blur-sm',
                          isOwnMessage
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
                            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                        )}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </motion.div>

                      {/* Message Actions */}
                      <AnimatePresence>
                        {hoveredMessageId === message.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={clsx(
                              'absolute -top-3 flex gap-1',
                              isOwnMessage ? 'left-0' : 'right-0'
                            )}
                          >
                            <Dropdown
                              trigger={
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="p-1.5 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                                >
                                  <MoreVertical className="w-3.5 h-3.5 text-gray-600" />
                                </motion.button>
                              }
                              items={[
                                {
                                  label: 'Copy',
                                  icon: <Copy className="w-4 h-4" />,
                                  onClick: () => navigator.clipboard.writeText(message.content),
                                },
                                {
                                  label: 'Edit',
                                  icon: <Edit className="w-4 h-4" />,
                                  onClick: () => console.log('Edit message', message.id),
                                  disabled: !isOwnMessage,
                                },
                                'divider',
                                {
                                  label: 'Delete',
                                  icon: <Trash2 className="w-4 h-4" />,
                                  onClick: () => console.log('Delete message', message.id),
                                  variant: 'danger',
                                  disabled: !isOwnMessage,
                                },
                              ]}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Reactions */}
                      <div className="mt-2">
                        <MessageReactions
                          messageId={message.id}
                          reactions={mockReactions}
                          onReactionAdd={handleReactionAdd}
                          onReactionRemove={handleReactionRemove}
                        />
                      </div>

                      <p className="text-xs text-gray-500 mt-2 px-2">
                        {formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
