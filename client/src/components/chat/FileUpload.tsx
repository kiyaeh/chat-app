'use client';

import React, { useState, useRef, DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, File, Image as ImageIcon, FileText, Film } from 'lucide-react';
import clsx from 'clsx';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
}

interface FilePreview {
  file: File;
  id: string;
  preview?: string;
  type: 'image' | 'video' | 'document' | 'other';
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  maxFiles = 5,
  maxSize = 10,
  acceptedTypes = ['image/*', 'video/*', 'application/pdf', 'application/msword', '.doc', '.docx', '.txt'],
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FilePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): FilePreview['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) return 'document';
    return 'other';
  };

  const getFileIcon = (type: FilePreview['type']) => {
    switch (type) {
      case 'image':
        return ImageIcon;
      case 'video':
        return Film;
      case 'document':
        return FileText;
      default:
        return File;
    }
  };

  const processFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles: FilePreview[] = [];
    Array.from(fileList).forEach((file) => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize}MB.`);
        return;
      }

      // Check max files
      if (files.length + newFiles.length >= maxFiles) {
        alert(`Maximum ${maxFiles} files allowed.`);
        return;
      }

      const filePreview: FilePreview = {
        file,
        id: Math.random().toString(36).substr(2, 9),
        type: getFileType(file),
      };

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          filePreview.preview = e.target?.result as string;
          setFiles((prev) => [...prev, filePreview]);
        };
        reader.readAsDataURL(file);
      } else {
        newFiles.push(filePreview);
      }
    });

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    processFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUpload = () => {
    if (files.length > 0) {
      onFileSelect(files.map((f) => f.file));
      setFiles([]);
    }
  };

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Drop Zone */}
      <motion.div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        className={clsx(
          'relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer',
          isDragging
            ? 'border-blue-500 bg-blue-50 scale-105'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center text-center">
          <motion.div
            animate={isDragging ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
            className={clsx(
              'w-16 h-16 rounded-full flex items-center justify-center mb-4',
              isDragging ? 'bg-blue-500' : 'bg-gray-200'
            )}
          >
            <Upload className={clsx('w-8 h-8', isDragging ? 'text-white' : 'text-gray-500')} />
          </motion.div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isDragging ? 'Drop files here' : 'Upload files'}
          </h3>
          <p className="text-sm text-gray-500 mb-1">
            Drag and drop files or click to browse
          </p>
          <p className="text-xs text-gray-400">
            Maximum {maxFiles} files, up to {maxSize}MB each
          </p>
        </div>
      </motion.div>

      {/* File Previews */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((filePreview) => {
              const Icon = getFileIcon(filePreview.type);
              return (
                <motion.div
                  key={filePreview.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                >
                  {filePreview.preview ? (
                    <img
                      src={filePreview.preview}
                      alt={filePreview.file.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {filePreview.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(filePreview.file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>

                  <button
                    onClick={() => removeFile(filePreview.id)}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </motion.div>
              );
            })}

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleUpload}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Upload {files.length} {files.length === 1 ? 'file' : 'files'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
