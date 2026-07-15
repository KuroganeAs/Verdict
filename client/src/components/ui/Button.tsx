import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = "relative inline-flex items-center justify-center font-bold rounded-2xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9f7aea] disabled:opacity-50 disabled:cursor-not-allowed select-none";
  
  const variants = {
    primary: "bg-gradient-to-r from-[#9f7aea] to-[#ed64a6] text-white shadow-lg shadow-[#9f7aea]/20 hover:shadow-[#9f7aea]/35 focus:ring-offset-black",
    secondary: "bg-[#1a1a24] text-gray-200 border border-[#222230] hover:bg-[#222230] hover:text-white focus:ring-offset-black",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-900/20 focus:ring-red-500 focus:ring-offset-black",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-900/20 focus:ring-emerald-500 focus:ring-offset-black",
    ghost: "text-gray-400 hover:text-white hover:bg-[#121217] focus:ring-offset-black"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
};
