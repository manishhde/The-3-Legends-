import React from 'react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'blue' | 'gold' | 'none';
  delay?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  glowColor = 'none',
  delay = 0 
}) => {
  const glowClass = glowColor === 'blue' ? 'neon-glow-blue' : glowColor === 'gold' ? 'neon-glow-gold' : '';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "glass rounded-2xl p-6 relative overflow-hidden",
        glowClass,
        className
      )}
    >
      {children}
    </motion.div>
  );
};
