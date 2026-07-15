import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'purple' | 'pink' | 'none';
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glow = 'none',
  onClick,
  hoverable = false
}) => {
  const glowStyles = {
    purple: 'glow-purple border-[#9f7aea]/30',
    pink: 'glow-pink border-[#ed64a6]/30',
    none: ''
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      whileHover={hoverable && !onClick ? { y: -2 } : (onClick && hoverable) ? { scale: 1.01, y: -2 } : {}}
      whileTap={onClick ? { scale: 0.99 } : {}}
      onClick={onClick}
      className={`glass rounded-3xl p-6 transition-all duration-200 ${glowStyles[glow]} ${hoverable ? 'glass-hover cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
};
