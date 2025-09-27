import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  projectId: string;
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdTime: number;
  lastLoginTime: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  sessionId: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  
  // Actions
  setUser: (user: User, sessionId: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  checkAuthStatus: () => boolean;
  loginWithCredentials: (username: string, password: string) => Promise<boolean>;
  loginWithEmail: (email: string) => Promise<void>;
}

// Локальные пользователи для демонстрации
const LOCAL_USERS = [
  {
    username: 'admin',
    password: 'admin',
    role: 'admin' as const,
    name: 'Администратор',
    email: 'admin@texteditor.com'
  }
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      sessionId: null,
      isLoading: false,
      isAdmin: false,

      setUser: (user, sessionId) => set({
        user,
        sessionId,
        isAuthenticated: true,
        isAdmin: user.role === 'admin',
        isLoading: false,
      }),

      clearAuth: () => set({
        user: null,
        sessionId: null,
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
      }),

      setLoading: (loading) => set({ isLoading: loading }),

      checkAuthStatus: () => {
        const state = get();
        const localSessionId = localStorage.getItem('text-editor-session');
        
        if (localSessionId && state.user) {
          return true;
        }
        
        if (!localSessionId && state.isAuthenticated) {
          // Session expired, clear auth
          get().clearAuth();
        }
        
        return false;
      },

      loginWithCredentials: async (username: string, password: string) => {
        set({ isLoading: true });
        
        try {
          // Проверяем локальных пользователей
          const localUser = LOCAL_USERS.find(
            u => u.username === username && u.password === password
          );
          
          if (localUser) {
            const sessionId = `local-${Date.now()}`;
            const user: User = {
              projectId: 'local',
              uid: `local-${localUser.username}`,
              name: localUser.name,
              email: localUser.email,
              role: localUser.role,
              createdTime: Date.now(),
              lastLoginTime: Date.now(),
            };
            
            localStorage.setItem('text-editor-session', sessionId);
            get().setUser(user, sessionId);
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      loginWithEmail: async (email: string) => {
        set({ isLoading: true });
        
        try {
          // Эмуляция email авторизации для обычных пользователей
          const sessionId = `email-${Date.now()}`;
          const user: User = {
            projectId: 'email',
            uid: `email-${email}`,
            name: email.split('@')[0],
            email: email,
            role: 'user',
            createdTime: Date.now(),
            lastLoginTime: Date.now(),
          };
          
          localStorage.setItem('text-editor-session', sessionId);
          get().setUser(user, sessionId);
        } catch (error) {
          console.error('Email login error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        sessionId: state.sessionId,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
);