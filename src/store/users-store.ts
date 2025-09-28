import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: number;
  lastLogin?: number;
  isActive: boolean;
}

interface UsersState {
  users: AppUser[];
  isLoading: boolean;
  
  // Actions
  addUser: (userData: Omit<AppUser, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<AppUser>) => void;
  deleteUser: (id: string) => void;
  toggleUserStatus: (id: string) => void;
  loadUsers: () => void;
  setLoading: (loading: boolean) => void;
}

// Начальные пользователи для демонстрации
const INITIAL_USERS: AppUser[] = [
  {
    id: 'admin-1',
    username: 'admin',
    email: 'admin@texteditor.com',
    name: 'Администратор',
    role: 'admin',
    createdAt: Date.now() - 86400000, // 1 день назад
    lastLogin: Date.now() - 3600000, // 1 час назад
    isActive: true,
  },
  {
    id: 'user-1',
    username: 'editor1',
    email: 'editor1@example.com',
    name: 'Редактор 1',
    role: 'user',
    createdAt: Date.now() - 3600000,
    isActive: true,
  },
  {
    id: 'user-2',
    username: 'writer1',
    email: 'writer1@example.com',
    name: 'Писатель 1',
    role: 'user',
    createdAt: Date.now() - 7200000,
    lastLogin: Date.now() - 1800000,
    isActive: false,
  }
];

export const useUsersStore = create<UsersState>()(
  persist(
    (set, get) => {
      // Слушатель изменений паролей
      if (typeof window !== 'undefined') {
        window.addEventListener('user-password-changed', ((event: CustomEvent) => {
          const { username, newPassword } = event.detail;
          console.log(`Пароль изменён для пользователя: ${username}`);
          // Дополнительно можно обновить время последнего изменения пароля
        }) as EventListener);
      }

      return {
        users: INITIAL_USERS,
        isLoading: false,

        addUser: (userData) => {
          const newUser: AppUser = {
            ...userData,
            id: `user-${Date.now()}`,
            createdAt: Date.now(),
          };
          
          set(state => ({
            users: [...state.users, newUser]
          }));
        },

        updateUser: (id, updates) => {
          set(state => ({
            users: state.users.map(user =>
              user.id === id ? { ...user, ...updates } : user
            )
          }));
        },

        deleteUser: (id) => {
          set(state => ({
            users: state.users.filter(user => user.id !== id)
          }));
        },

        toggleUserStatus: (id) => {
          set(state => ({
            users: state.users.map(user =>
              user.id === id ? { ...user, isActive: !user.isActive } : user
            )
          }));
        },

        loadUsers: () => {
          // В реальном приложении здесь был бы API вызов
          set({ isLoading: false });
        },

        setLoading: (loading) => set({ isLoading: loading }),
      };
    },
    {
      name: 'users-store',
    }
  )
);