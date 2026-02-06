'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface Message {
  id: string;
  content: string;
  userId: string;
  createdAt: Date;
}

interface MessageSearchProps {
  messages: Message[];
  onResultSelect: (messageId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const MessageSearch: React.FC<MessageSearchProps> = ({
  messages,
  onResultSelect,
  isOpen,
  onClose,
  className,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Message[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setCurrentIndex(0);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const filtered = messages.filter((msg) =>
        msg.content.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setCurrentIndex(0);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, messages]);

  const handleNext = useCallback(() => {
    if (results.length === 0) return;
    const nextIndex = (currentIndex + 1) % results.length;
    setCurrentIndex(nextIndex);
    onResultSelect(results[nextIndex].id);
  }, [currentIndex, results, onResultSelect]);

  const handlePrevious = useCallback(() => {
    if (results.length === 0) return;
    const prevIndex = (currentIndex - 1 + results.length) % results.length;
    setCurrentIndex(prevIndex);
    onResultSelect(results[prevIndex].id);
  }, [currentIndex, results, onResultSelect]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        handlePrevious();
      } else {
        handleNext();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setCurrentIndex(0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className={clsx(
            'bg-white border-b border-gray-200 shadow-lg backdrop-blur-xl bg-white/95',
            className
          )}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            {/* Search Icon */}
            <div className="text-gray-400">
              {isSearching ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </div>

            {/* Search Input */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search messages..."
              autoFocus
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder-gray-400 text-gray-900"
            />

            {/* Results Counter */}
            {results.length > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2"
              >
                <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
                  {currentIndex + 1} of {results.length}
                </span>

                {/* Navigation Buttons */}
                <div className="flex gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePrevious}
                    disabled={results.length === 0}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Previous (Shift + Enter)"
                  >
                    <ArrowUp className="w-4 h-4 text-gray-600" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleNext}
                    disabled={results.length === 0}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Next (Enter)"
                  >
                    <ArrowDown className="w-4 h-4 text-gray-600" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Clear Button */}
            {query && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClear}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4 text-gray-600" />
              </motion.button>
            )}

            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              title="Close search (Esc)"
            >
              <X className="w-4 h-4 text-gray-600" />
            </motion.button>
          </div>

          {/* No Results Message */}
          {query && !isSearching && results.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-4 py-3 border-t border-gray-100 bg-gray-50"
            >
              <p className="text-sm text-gray-500 text-center">
                No messages found for "{query}"
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook for managing search state
export const useMessageSearch = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);
  const toggleSearch = useCallback(() => setIsSearchOpen((prev) => !prev), []);

  return { isSearchOpen, openSearch, closeSearch, toggleSearch };
};

// Compact Search Button Component
interface SearchButtonProps {
  onClick: () => void;
  className?: string;
}

export const SearchButton: React.FC<SearchButtonProps> = ({ onClick, className }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={clsx(
        'p-2 rounded-lg hover:bg-gray-100 transition-colors group',
        className
      )}
      title="Search messages (Ctrl+F)"
    >
      <Search className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
    </motion.button>
  );
};
