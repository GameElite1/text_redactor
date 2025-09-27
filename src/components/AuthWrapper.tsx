import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useAuth } from '@/hooks/use-auth';
import { LoginForm } from '@/components/LoginForm';
import { Loader2, Shield } from 'lucide-react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated } = useAuthStore();
  const { checkAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Проверяем статус аутентификации
        checkAuth();
      } catch (error) {
        console.error('Ошибка проверки аутентификации:', error);
      } finally {
        setIsChecking(false);
      }
    };

    initAuth();
  }, [checkAuth]);

  // Показываем загрузку при инициализации
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-accent rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-accent-foreground" />
          </div>
          <div className="space-y-2">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Проверка авторизации...</p>
          </div>
        </div>
      </div>
    );
  }

  // Если не авторизован, показываем форму входа
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Если авторизован, показываем основное приложение
  return <>{children}</>;
}