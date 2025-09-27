import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Mail, Lock, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

export const LoginForm: React.FC = () => {
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });
  const [emailData, setEmailData] = useState({
    email: '',
  });
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('credentials');
  
  const { loginWithCredentials, loginWithEmail, isLoading } = useAuthStore();

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!loginData.username || !loginData.password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }
    
    try {
      const success = await loginWithCredentials(loginData.username, loginData.password);
      if (!success) {
        setError('Неверное имя пользователя или пароль');
      }
    } catch (err) {
      setError('Ошибка при входе в систему');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!emailData.email) {
      setError('Пожалуйста, введите email');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(emailData.email)) {
      setError('Пожалуйста, введите корректный email');
      return;
    }
    
    try {
      await loginWithEmail(emailData.email);
    } catch (err) {
      setError('Ошибка при отправке кода');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Вход в систему
          </CardTitle>
          <CardDescription>
            Войдите в текстовый редактор
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="credentials" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Логин/Пароль
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="credentials">
              <form onSubmit={handleCredentialsLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Имя пользователя</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Введите имя пользователя"
                      value={loginData.username}
                      onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Введите пароль"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Вход...
                    </>
                  ) : (
                    'Войти'
                  )}
                </Button>
              </form>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 font-medium">Тестовый доступ администратора:</p>
                <p className="text-xs text-blue-600 mt-1">
                  Логин: <span className="font-mono font-semibold">admin</span><br />
                  Пароль: <span className="font-mono font-semibold">admin</span>
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="email">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email адрес</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Введите ваш email"
                      value={emailData.email}
                      onChange={(e) => setEmailData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    'Войти через Email'
                  )}
                </Button>
              </form>
              
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  Введите любой корректный email для быстрого входа в режиме пользователя
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
          {error && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};