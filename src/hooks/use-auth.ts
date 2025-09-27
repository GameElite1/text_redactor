import { useCallback } from 'react';
import { auth } from '@devvai/devv-code-backend';
import { useAuthStore } from '@/store/auth-store';
import { useSecurityStore } from '@/store/security-store';
import { useToast } from '@/hooks/use-toast';

export function useAuth() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    setUser, 
    clearAuth, 
    setLoading, 
    checkAuthStatus 
  } = useAuthStore();
  const { addLog } = useSecurityStore();
  const { toast } = useToast();

  const sendOTP = useCallback(async (email: string) => {
    setLoading(true);
    addLog({
      userId: 'anonymous',
      action: 'login_attempt',
      details: `Запрос OTP кода для email: ${email}`,
      category: 'auth',
      severity: 'info',
    });

    try {
      await auth.sendOTP(email);
      toast({
        title: "Код отправлен",
        description: `Проверьте почту ${email} и введите код подтверждения`,
      });
      return true;
    } catch (error: any) {
      console.error('Ошибка отправки OTP:', error);
      addLog({
        userId: 'anonymous',
        action: 'login_failed',
        details: `Ошибка отправки OTP для ${email}: ${error.message}`,
        category: 'auth',
        severity: 'error',
      });
      toast({
        title: "Ошибка отправки",
        description: error.message || "Не удалось отправить код подтверждения",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, addLog, toast]);

  const verifyOTP = useCallback(async (email: string, code: string) => {
    setLoading(true);
    try {
      const response = await auth.verifyOTP(email, code);
      
      // Добавляем роль пользователя для SDK пользователей
      const userWithRole = {
        ...response.user,
        role: 'user' as const
      };
      setUser(userWithRole, response.sid);
      
      addLog({
        userId: response.user.uid,
        action: 'login_success',
        details: `Успешная авторизация пользователя ${response.user.email}`,
        category: 'auth',
        severity: 'info',
      });
      
      toast({
        title: "Добро пожаловать!",
        description: `Вы успешно вошли как ${response.user.name || response.user.email}`,
      });
      
      return true;
    } catch (error: any) {
      console.error('Ошибка проверки OTP:', error);
      addLog({
        userId: 'anonymous',
        action: 'login_failed',
        details: `Неудачная попытка входа с email ${email}: ${error.message}`,
        category: 'auth',
        severity: 'warning',
      });
      toast({
        title: "Неверный код",
        description: error.message || "Проверьте правильность введённого кода",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading, addLog, toast]);

  const logout = useCallback(async () => {
    setLoading(true);
    const currentUser = user;
    
    try {
      await auth.logout();
      
      if (currentUser) {
        addLog({
          userId: currentUser.uid,
          action: 'logout',
          details: `Пользователь ${currentUser.email} вышел из системы`,
          category: 'auth',
          severity: 'info',
        });
      }
      
      clearAuth();
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из системы",
      });
    } catch (error: any) {
      console.error('Ошибка выхода:', error);
      // Очищаем локальное состояние даже при ошибке
      clearAuth();
      toast({
        title: "Выход выполнен",
        description: "Сессия завершена",
      });
    } finally {
      setLoading(false);
    }
  }, [clearAuth, setLoading, addLog, user, toast]);

  const checkAuth = useCallback(() => {
    return checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    user,
    isAuthenticated,
    isLoading,
    sendOTP,
    verifyOTP,
    logout,
    checkAuth,
  };
}