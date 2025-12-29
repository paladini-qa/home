import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GoogleUserInfo, Task, CalendarEvent, DriveFile, TaskList } from '@/types/google';

interface AuthState {
  accessToken: string | null;
  tokenExpiry: number | null;
  user: GoogleUserInfo | null;
  isAuthenticated: boolean;
  setAuth: (token: string, expiry: number, user: GoogleUserInfo) => void;
  clearAuth: () => void;
  isTokenValid: () => boolean;
}

interface DataState {
  taskLists: TaskList[];
  tasks: Record<string, Task[]>;
  events: CalendarEvent[];
  starredFiles: DriveFile[];
  isLoadingTasks: boolean;
  isLoadingEvents: boolean;
  isLoadingFiles: boolean;
  setTaskLists: (lists: TaskList[]) => void;
  setTasks: (listId: string, tasks: Task[]) => void;
  setEvents: (events: CalendarEvent[]) => void;
  setStarredFiles: (files: DriveFile[]) => void;
  setLoadingTasks: (loading: boolean) => void;
  setLoadingEvents: (loading: boolean) => void;
  setLoadingFiles: (loading: boolean) => void;
  updateTask: (listId: string, taskId: string, updates: Partial<Task>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      tokenExpiry: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, expiry, user) => {
        set({
          accessToken: token,
          tokenExpiry: Date.now() + expiry * 1000,
          user,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        set({
          accessToken: null,
          tokenExpiry: null,
          user: null,
          isAuthenticated: false,
        });
      },

      isTokenValid: () => {
        const { tokenExpiry } = get();
        if (!tokenExpiry) return false;
        // Add 5 minute buffer
        return Date.now() < tokenExpiry - 5 * 60 * 1000;
      },
    }),
    {
      name: 'google-auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        tokenExpiry: state.tokenExpiry,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const useDataStore = create<DataState>()((set) => ({
  taskLists: [],
  tasks: {},
  events: [],
  starredFiles: [],
  isLoadingTasks: false,
  isLoadingEvents: false,
  isLoadingFiles: false,

  setTaskLists: (lists) => set({ taskLists: lists }),
  
  setTasks: (listId, tasks) =>
    set((state) => ({
      tasks: { ...state.tasks, [listId]: tasks },
    })),

  setEvents: (events) => set({ events }),
  
  setStarredFiles: (files) => set({ starredFiles: files }),
  
  setLoadingTasks: (loading) => set({ isLoadingTasks: loading }),
  
  setLoadingEvents: (loading) => set({ isLoadingEvents: loading }),
  
  setLoadingFiles: (loading) => set({ isLoadingFiles: loading }),

  updateTask: (listId, taskId, updates) =>
    set((state) => ({
      tasks: {
        ...state.tasks,
        [listId]: state.tasks[listId]?.map((task) =>
          task.id === taskId ? { ...task, ...updates } : task
        ) ?? [],
      },
    })),
}));

