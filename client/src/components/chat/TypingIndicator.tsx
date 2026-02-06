'use client';

import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface TypingIndicatorProps {
  users?: string[];
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users = [], className }) => {
  if (users.length === 0) return null;

  const displayText = users.length === 1
    ? `${users[0]} is typing`
    : users.length === 2
    ? `${users[0]} and ${users[1]} are typing`
    : `${users.length} people are typing`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={clsx('flex items-center gap-2 px-4 py-2', className)}
    >
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
            className="w-2 h-2 bg-blue-500 rounded-full"
          />
        ))}
      </div>
      <span className="text-sm text-gray-500 italic">{displayText}</span>
    </motion.div>
  );
};

// Simple dot indicator without text
export const TypingDots: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={clsx('flex items-center gap-1 px-3 py-2 bg-gray-200 rounded-2xl w-fit', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
          className="w-2 h-2 bg-gray-600 rounded-full"
        />
      ))}
    </div>
  );
};
