import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#030303]">
      {/* Radial ambient background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(159,122,234,0.06)_0%,rgba(3,3,3,0)_70%)]" />

      {/* Floating glowing blobs */}
      <motion.div
        className="absolute -top-40 -left-40 h-[40vw] w-[40vw] rounded-full bg-[#9f7aea]/10 blur-[100px]"
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -50, 60, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute -bottom-40 -right-40 h-[45vw] w-[45vw] rounded-full bg-[#ed64a6]/5 blur-[120px]"
        animate={{
          x: [0, -100, 50, 0],
          y: [0, 60, -80, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute top-1/2 left-1/3 h-[30vw] w-[30vw] rounded-full bg-[#319795]/5 blur-[80px]"
        animate={{
          x: [0, 50, -50, 0],
          y: [0, -60, 60, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};
