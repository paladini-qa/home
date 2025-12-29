'use client';

import { motion } from 'framer-motion';
import { GoogleLogin } from '@/components/auth/GoogleLogin';
import { Calendar, ListTodo, HardDrive, Sparkles, Shield, Zap } from 'lucide-react';

const features = [
  {
    icon: ListTodo,
    title: 'Google Tasks',
    description: 'Visualize e gerencie suas tarefas',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  {
    icon: Calendar,
    title: 'Google Calendar',
    description: 'Próximos eventos da sua agenda',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  {
    icon: HardDrive,
    title: 'Google Drive',
    description: 'Arquivos fixados com estrela',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
  },
];

const benefits = [
  {
    icon: Shield,
    text: 'Seus dados ficam apenas no seu navegador',
  },
  {
    icon: Zap,
    text: 'Acesso direto às APIs do Google',
  },
];

export function WelcomeScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="max-w-2xl w-full text-center">
        {/* Logo/Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-white/70">Dashboard Pessoal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Seu <span className="text-gradient">dia organizado</span>
            <br />em um só lugar
          </h1>
          <p className="text-lg text-white/60 max-w-md mx-auto">
            Conecte sua conta Google para visualizar suas tarefas, eventos e arquivos importantes
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="glass rounded-2xl p-6 text-left"
            >
              <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-sm text-white/50">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Login Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center mb-8"
        >
          <GoogleLogin />
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap justify-center gap-6"
        >
          {benefits.map((benefit) => (
            <div
              key={benefit.text}
              className="flex items-center gap-2 text-white/40 text-sm"
            >
              <benefit.icon className="w-4 h-4" />
              <span>{benefit.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

