'use client';

import React, { useRef, useState } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import clsx from 'clsx';

interface SwipeableProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  threshold?: number;
  className?: string;
}

export const Swipeable: React.FC<SwipeableProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  threshold = 100,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const controls = useAnimation();
  const constraintsRef = useRef(null);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    const offset = info.offset.x;

    if (Math.abs(offset) > threshold) {
      if (offset > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (offset < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    // Snap back to center
    controls.start({ x: 0 });
  };

  return (
    <div ref={constraintsRef} className={clsx('relative overflow-hidden', className)}>
      {/* Left Action (shown when swiping right) */}
      {rightAction && (
        <div className="absolute left-0 top-0 bottom-0 flex items-center px-4 bg-blue-500 text-white">
          {rightAction}
        </div>
      )}

      {/* Right Action (shown when swiping left) */}
      {leftAction && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center px-4 bg-red-500 text-white">
          {leftAction}
        </div>
      )}

      {/* Swipeable Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 150 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        animate={controls}
        className={clsx(
          'relative bg-white touch-pan-y',
          isDragging && 'cursor-grabbing'
        )}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Message Swipe Component (specific for chat messages)
interface MessageSwipeProps {
  children: React.ReactNode;
  onReply?: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
  className?: string;
}

export const MessageSwipe: React.FC<MessageSwipeProps> = ({
  children,
  onReply,
  onDelete,
  canDelete = false,
  className,
}) => {
  return (
    <Swipeable
      className={className}
      onSwipeRight={onReply}
      onSwipeLeft={canDelete ? onDelete : undefined}
      rightAction={
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
            />
          </svg>
          <span className="font-medium">Reply</span>
        </motion.div>
      }
      leftAction={
        canDelete ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="font-medium">Delete</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </motion.div>
        ) : undefined
      }
      threshold={80}
    >
      {children}
    </Swipeable>
  );
};
