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
}

// Типизация локального пользователя
interface LocalUser {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
  name: string;
  email: string;
}

// Локальные пользователи для демонстрации (будут дополняться через админ панель)
let LOCAL_USERS: LocalUser[] = [
  {
    id: 'admin-1',
    username: 'admin',
    password: 'admin',
    role: 'admin',
    name: 'Администратор',
    email: 'admin@texteditor.com'
  }
];

// Функция для добавления нового пользователя
export const addLocalUser = (user: { username: string; password: string; name: string; email: string; role: 'admin' | 'user' }): LocalUser => {
  const newUser: LocalUser = {
    id: `user-${Date.now()}`,
    username: user.username,
    password: user.password,
    name: user.name,
    email: user.email,
    role: user.role
  };
  LOCAL_USERS.push(newUser);
  return newUser;
};

// Функция для изменения пароля пользователя
export const changeUserPassword = (username: string, newPassword: string): boolean => {
  const userIndex = LOCAL_USERS.findIndex(u => u.username === username);
  if (userIndex !== -1) {
    LOCAL_USERS[userIndex].password = newPassword;
    // Уведомляем users-store об изменении
    window.dispatchEvent(new CustomEvent('user-password-changed', { 
      detail: { username, newPassword } 
    }));
    return true;
  }
  return false;
};

// Функция для получения пользователей
export const getLocalUsers = (): LocalUser[] => [...LOCAL_USERS];

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