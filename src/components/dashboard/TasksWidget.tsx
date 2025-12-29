'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Plus,
  ListTodo,
  Loader2,
  ChevronDown,
  X,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuthStore, useDataStore } from '@/lib/store';
import { getTaskLists, getTasks, updateTask, createTask } from '@/lib/google-api';
import type { Task } from '@/types/google';

export function TasksWidget() {
  const { accessToken } = useAuthStore();
  const {
    taskLists,
    tasks,
    isLoadingTasks,
    setTaskLists,
    setTasks,
    setLoadingTasks,
    updateTask: updateTaskInStore,
  } = useDataStore();

  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const loadTasks = useCallback(async () => {
    if (!accessToken) return;

    setLoadingTasks(true);
    try {
      const listsResponse = await getTaskLists(accessToken);
      setTaskLists(listsResponse.items || []);

      if (listsResponse.items?.length) {
        const firstListId = listsResponse.items[0].id;
        setSelectedListId(firstListId);

        const tasksResponse = await getTasks(accessToken, firstListId);
        setTasks(firstListId, tasksResponse.items || []);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  }, [accessToken, setTaskLists, setTasks, setLoadingTasks]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleSelectList = async (listId: string) => {
    setSelectedListId(listId);
    setIsDropdownOpen(false);

    if (!tasks[listId] && accessToken) {
      setLoadingTasks(true);
      try {
        const tasksResponse = await getTasks(accessToken, listId);
        setTasks(listId, tasksResponse.items || []);
      } catch (error) {
        console.error('Failed to load tasks for list:', error);
      } finally {
        setLoadingTasks(false);
      }
    }
  };

  const handleToggleTask = async (task: Task) => {
    if (!accessToken || !selectedListId) return;

    const newStatus = task.status === 'completed' ? 'needsAction' : 'completed';
    updateTaskInStore(selectedListId, task.id, { status: newStatus });

    try {
      await updateTask(accessToken, selectedListId, task.id, { status: newStatus });
    } catch (error) {
      console.error('Failed to update task:', error);
      // Revert on error
      updateTaskInStore(selectedListId, task.id, { status: task.status });
    }
  };

  const handleAddTask = async () => {
    if (!accessToken || !selectedListId || !newTaskTitle.trim()) return;

    try {
      const newTask = await createTask(accessToken, selectedListId, {
        title: newTaskTitle.trim(),
      });
      setTasks(selectedListId, [...(tasks[selectedListId] || []), newTask]);
      setNewTaskTitle('');
      setIsAddingTask(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const currentList = taskLists.find((l) => l.id === selectedListId);
  const currentTasks = selectedListId ? tasks[selectedListId] || [] : [];
  const pendingTasks = currentTasks.filter((t) => t.status === 'needsAction');

  return (
    <GlassCard className="h-full flex flex-col" glow="purple">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20">
            <ListTodo className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Tasks</h2>
            <p className="text-xs text-white/50">
              {pendingTasks.length} pendente{pendingTasks.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddingTask(true)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
        >
          <Plus className="w-5 h-5 text-white/70" />
        </button>
      </div>

      {/* List Selector */}
      {taskLists.length > 0 && (
        <div className="relative mb-4">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full glass-subtle rounded-xl px-4 py-2 flex items-center justify-between text-sm text-white/80 hover:text-white transition-colors"
          >
            <span>{currentList?.title || 'Selecionar lista'}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 top-full left-0 right-0 mt-2 glass-strong rounded-xl overflow-hidden"
              >
                {taskLists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => handleSelectList(list.id)}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                      list.id === selectedListId
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {list.title}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Add Task Form */}
      <AnimatePresence>
        {isAddingTask && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="glass-subtle rounded-xl p-3 flex items-center gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                placeholder="Nova tarefa..."
                className="flex-1 bg-transparent text-white text-sm placeholder:text-white/40 outline-none"
                autoFocus
              />
              <button
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim()}
                className="p-1.5 rounded-lg bg-purple-500/30 hover:bg-purple-500/50 disabled:opacity-50 disabled:hover:bg-purple-500/30 transition-colors"
              >
                <Plus className="w-4 h-4 text-purple-300" />
              </button>
              <button
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskTitle('');
                }}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-white/50" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-2">
        {isLoadingTasks ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
          </div>
        ) : pendingTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-white/40">
            <CheckCircle2 className="w-10 h-10 mb-2" />
            <p className="text-sm">Todas as tarefas concluídas!</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {pendingTasks.map((task, index) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="group glass-subtle rounded-xl p-3 flex items-start gap-3 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleToggleTask(task)}
              >
                <button className="mt-0.5 text-white/40 group-hover:text-purple-400 transition-colors">
                  <Circle className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/90 group-hover:text-white transition-colors">
                    {task.title}
                  </p>
                  {task.notes && (
                    <p className="text-xs text-white/40 mt-1 line-clamp-2">{task.notes}</p>
                  )}
                  {task.due && (
                    <p className="text-xs text-purple-400/70 mt-1">
                      {new Date(task.due).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </GlassCard>
  );
}

