'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: (DropdownItem | 'divider')[];
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className={clsx('relative', className)}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={clsx(
              'absolute top-full mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-xl backdrop-blur-xl z-50',
              'overflow-hidden',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            <div className="py-1">
              {items.map((item, index) => {
                if (item === 'divider') {
                  return (
                    <div
                      key={`divider-${index}`}
                      className="my-1 border-t border-gray-200"
                    />
                  );
                }

                const itemStyles = {
                  default: 'text-gray-700 hover:bg-gray-50',
                  danger: 'text-red-600 hover:bg-red-50',
                };

                return (
                  <button
                    key={index}
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                    className={clsx(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-left',
                      item.disabled
                        ? 'opacity-50 cursor-not-allowed'
                        : itemStyles[item.variant || 'default']
                    )}
                  >
                    {item.icon && (
                      <span className="w-5 h-5 flex items-center justify-center">
                        {item.icon}
                      </span>
                    )}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
