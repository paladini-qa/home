'use client';

import { motion } from 'framer-motion';
import { TasksWidget } from './TasksWidget';
import { CalendarWidget } from './CalendarWidget';
import { DriveWidget } from './DriveWidget';
import { useAuthStore } from '@/lib/store';
import { Sparkles } from 'lucide-react';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function formatDate(): string {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
};

export function Dashboard() {
  const { user } = useAuthStore();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.header variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="text-sm text-white/50 capitalize">{formatDate()}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          {getGreeting()},{' '}
          <span className="text-gradient">{user?.given_name || user?.name?.split(' ')[0] || 'Usuário'}</span>
        </h1>
        <p className="text-white/60 mt-2">
          Aqui está um resumo do seu dia
        </p>
      </motion.header>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks - Takes 1 column */}
        <motion.div variants={itemVariants} className="lg:col-span-1 min-h-[400px]">
          <TasksWidget />
        </motion.div>

        {/* Calendar - Takes 1 column */}
        <motion.div variants={itemVariants} className="lg:col-span-1 min-h-[400px]">
          <CalendarWidget />
        </motion.div>

        {/* Drive - Takes 1 column */}
        <motion.div variants={itemVariants} className="lg:col-span-1 min-h-[400px]">
          <DriveWidget />
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        variants={itemVariants}
        className="mt-8 text-center text-white/30 text-sm"
      >
        <p>Feito com ❤️ para organizar seu dia</p>
      </motion.footer>
    </motion.div>
  );
}

