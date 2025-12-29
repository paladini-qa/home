'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  variant?: 'default' | 'subtle' | 'strong';
  hover?: boolean;
  glow?: 'purple' | 'blue' | 'pink' | 'none';
  className?: string;
}

const variantClasses = {
  default: 'glass',
  subtle: 'glass-subtle',
  strong: 'glass-strong',
};

const glowClasses = {
  purple: 'glow-purple',
  blue: 'glow-blue',
  pink: 'glow-pink',
  none: '',
};

export function GlassCard({
  children,
  variant = 'default',
  hover = true,
  glow = 'none',
  className = '',
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={`
        rounded-2xl p-6
        ${variantClasses[variant]}
        ${hover ? 'glass-hover' : ''}
        ${glowClasses[glow]}
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

