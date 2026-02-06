'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useChatStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { EmojiPicker } from './EmojiPicker';
import { Paperclip, Send, X, Image as ImageIcon } from 'lucide-react';
import clsx from 'clsx';

export const MessageInput: React.FC = () => {
  const { currentRoom, sendMessage } = useChatStore();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && attachedFiles.length === 0) || !currentRoom) return;

    setIsLoading(true);
    try {
      // TODO: Handle file uploads to your API
      if (attachedFiles.length > 0) {
        console.log('Upload files:', attachedFiles);
        // Implement file upload logic here
      }

      if (message.trim()) {
        await sendMessage(message);
      }

      setMessage('');
      setAttachedFiles([]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    textareaRef.current?.focus();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachedFiles((prev) => [...prev, ...files.slice(0, 5 - prev.length)]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  if (!currentRoom) return null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-t border-gray-200 bg-white shadow-lg"
    >
      {/* Attached Files Preview */}
      {attachedFiles.length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 pt-3 pb-2 border-b border-gray-200"
        >
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="relative group"
              >
                <div className="flex items-center gap-2 pl-3 pr-8 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700 font-medium max-w-[150px] truncate">
                    {file.name}
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors shadow-md"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <div className="relative bg-gray-50 rounded-2xl border-2 border-gray-200 focus-within:border-blue-500 focus-within:bg-white transition-all duration-200">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="w-full px-4 py-3 bg-transparent resize-none focus:outline-none text-sm max-h-[120px] scrollbar-thin"
                rows={1}
                disabled={isLoading}
              />

              {/* Emoji & File Buttons */}
              <div className="absolute bottom-2 right-2 flex items-center gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <motion.button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600"
                  disabled={attachedFiles.length >= 5}
                >
                  <Paperclip className="w-5 h-5" />
                </motion.button>
                <EmojiPicker onEmojiSelect={handleEmojiSelect} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 px-1">
              Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-700">Enter</kbd> to send,{' '}
              <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-700">Shift + Enter</kbd> for new line
            </p>
          </div>

          {/* Send Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="submit"
              isLoading={isLoading}
              size="lg"
              disabled={(!message.trim() && attachedFiles.length === 0) || isLoading}
              className="rounded-2xl shadow-lg hover:shadow-xl px-6"
            >
              <Send className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
};
