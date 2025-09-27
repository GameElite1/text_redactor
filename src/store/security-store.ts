import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SecurityLog {
  id: string;
  timestamp: number;
  userId: string;
  action: string;
  details: string;
  category: 'auth' | 'document' | 'system' | 'security';
  severity: 'info' | 'warning' | 'error' | 'critical';
  ip?: string;
  userAgent?: string;
}

interface SecurityState {
  logs: SecurityLog[];
  
  // Actions
  addLog: (log: Omit<SecurityLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  getLogsByCategory: (category: SecurityLog['category']) => SecurityLog[];
  getLogsBySeverity: (severity: SecurityLog['severity']) => SecurityLog[];
}

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set, get) => ({
      logs: [],

      addLog: (logData) => set((state) => {
        const newLog: SecurityLog = {
          ...logData,
          id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };

        // Ограничиваем количество логов (последние 1000)
        const updatedLogs = [newLog, ...state.logs].slice(0, 1000);
        
        return { logs: updatedLogs };
      }),

      clearLogs: () => set({ logs: [] }),

      getLogsByCategory: (category) => {
        return get().logs.filter(log => log.category === category);
      },

      getLogsBySeverity: (severity) => {
        return get().logs.filter(log => log.severity === severity);
      },
    }),
    {
      name: 'security-logs',
      partialize: (state) => ({
        logs: state.logs.slice(0, 100), // Сохраняем только последние 100 логов
      }),
    }
  )
);