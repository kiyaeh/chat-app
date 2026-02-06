'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
  hasReacted?: boolean;
}

interface MessageReactionsProps {
  messageId: string;
  reactions: Reaction[];
  onReactionAdd: (messageId: string, emoji: string) => void;
  onReactionRemove: (messageId: string, emoji: string) => void;
  className?: string;
}

const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions,
  onReactionAdd,
  onReactionRemove,
  className,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleReactionClick = (reaction: Reaction) => {
    if (reaction.hasReacted) {
      onReactionRemove(messageId, reaction.emoji);
    } else {
      onReactionAdd(messageId, reaction.emoji);
    }
  };

  const handleQuickReaction = (emoji: string) => {
    onReactionAdd(messageId, emoji);
    setShowPicker(false);
  };

  return (
    <div className={clsx('relative flex flex-wrap items-center gap-1', className)}>
      {/* Existing Reactions */}
      <AnimatePresence>
        {reactions.map((reaction) => (
          <motion.button
            key={reaction.emoji}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleReactionClick(reaction)}
            className={clsx(
              'flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium transition-all duration-200',
              reaction.hasReacted
                ? 'bg-blue-100 border-2 border-blue-500 text-blue-700'
                : 'bg-gray-100 border-2 border-transparent text-gray-700 hover:bg-gray-200'
            )}
          >
            <span>{reaction.emoji}</span>
            <span className="text-xs">{reaction.count}</span>
          </motion.button>
        ))}
      </AnimatePresence>

      {/* Add Reaction Button */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPicker(!showPicker)}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
        >
          <span className="text-base">+</span>
        </motion.button>

        {/* Quick Reaction Picker */}
        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 5 }}
              className="absolute bottom-full mb-2 left-0 bg-white rounded-xl border border-gray-200 shadow-xl p-2 flex gap-1 z-10"
            >
              {quickReactions.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleQuickReaction(emoji)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-2xl transition-colors"
                >
                  {emoji}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Compact reaction display for message list
export const ReactionSummary: React.FC<{ reactions: Reaction[]; className?: string }> = ({
  reactions,
  className,
}) => {
  if (reactions.length === 0) return null;

  return (
    <div className={clsx('flex flex-wrap gap-1', className)}>
      {reactions.map((reaction) => (
        <div
          key={reaction.emoji}
          className="flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 rounded-full text-xs"
        >
          <span>{reaction.emoji}</span>
          <span className="text-gray-600">{reaction.count}</span>
        </div>
      ))}
    </div>
  );
};
