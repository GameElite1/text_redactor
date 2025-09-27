import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { LoginForm } from "@/components/LoginForm";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { AuthWrapper } from "@/components/AuthWrapper";
import { AdminPanel } from "@/components/AdminPanel"; 
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
  const [currentView, setCurrentView] = useState<'editor' | 'admin'>('editor');
  const { isAuthenticated, isAdmin } = useAuthStore();

  const MainContent = () => {
    // Если не авторизован, показываем форму входа
    if (!isAuthenticated) {
      return <LoginForm />;
    }

    // Если администратор и выбрана панель админа
    if (currentView === 'admin' && isAdmin) {
      return (
        <div className="h-screen flex flex-col">
          {/* Заголовок панели администратора */}
          <div className="border-b bg-card px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Панель администратора
                </h1>
                <p className="text-sm text-muted-foreground">
                  Управление пользователями и безопасностью системы
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('editor')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Вернуться к редактору
              </Button>
            </div>
          </div>
          
          {/* Контент панели администратора */}
          <div className="flex-1 overflow-auto p-6">
            <AdminPanel />
          </div>
        </div>
      );
    }

    // По умолчанию показываем редактор
    return <HomePage onToggleSecurity={() => setCurrentView('admin')} />;
  };

  return (
    <TooltipProvider>
      <AuthWrapper>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainContent />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthWrapper>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
