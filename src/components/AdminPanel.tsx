import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Shield, 
  UserCheck, 
  UserX,
  Calendar,
  Clock,
  Mail,
  User,
  Key,
  Lock
} from 'lucide-react';
import { useUsersStore, type AppUser } from '@/store/users-store';
import { changeUserPassword, getLocalUsers, addLocalUser } from '@/store/auth-store';

export const AdminPanel: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, toggleUserStatus, isLoading } = useUsersStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [passwordChangeUser, setPasswordChangeUser] = useState<AppUser | null>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    name: '',
    role: 'user' as 'admin' | 'user',
    isActive: true,
    password: '',
    confirmPassword: '',
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleAddUser = () => {
    setError('');
    
    // Валидация
    if (!newUser.username || !newUser.email || !newUser.name || !newUser.password || !newUser.confirmPassword) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    if (newUser.password.length < 3) {
      setError('Пароль должен содержать минимум 3 символа');
      return;
    }
    
    if (newUser.password !== newUser.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      setError('Пожалуйста, введите корректный email');
      return;
    }
    
    // Проверяем уникальность
    const existingUser = users.find(u => 
      u.username === newUser.username || u.email === newUser.email
    );
    
    if (existingUser) {
      setError('Пользователь с таким именем или email уже существует');
      return;
    }
    
    // Проверяем среди локальных пользователей
    const localUsers = getLocalUsers();
    const existingLocalUser = localUsers.find(u => 
      u.username === newUser.username || u.email === newUser.email
    );
    
    if (existingLocalUser) {
      setError('Пользователь с таким именем или email уже существует в системе');
      return;
    }
    
    // Добавляем пользователя в локальную систему авторизации
    const localUser = addLocalUser({
      username: newUser.username,
      password: newUser.password,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });
    
    // Добавляем пользователя в UI систему
    addUser({
      username: newUser.username,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      isActive: newUser.isActive
    });
    
    // Сброс формы
    setNewUser({
      username: '',
      email: '',
      name: '',
      role: 'user',
      isActive: true,
      password: '',
      confirmPassword: '',
    });
    setIsAddDialogOpen(false);
  };

  const handleEditUser = (user: AppUser) => {
    setEditingUser(user);
    setNewUser({
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      password: '',
      confirmPassword: '',
    });
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    
    setError('');
    
    if (!newUser.username || !newUser.email || !newUser.name) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      setError('Пожалуйста, введите корректный email');
      return;
    }
    
    // Проверяем уникальность (исключая текущего пользователя)
    const existingUser = users.find(u => 
      u.id !== editingUser.id && 
      (u.username === newUser.username || u.email === newUser.email)
    );
    
    if (existingUser) {
      setError('Пользователь с таким именем или email уже существует');
      return;
    }
    
    updateUser(editingUser.id, newUser);
    
    // Сброс формы
    setEditingUser(null);
    setNewUser({
      username: '',
      email: '',
      name: '',
      role: 'user',
      isActive: true,
      password: '',
      confirmPassword: '',
    });
  };

  const handlePasswordChange = () => {
    if (!passwordChangeUser) return;
    
    setPasswordError('');
    
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Пожалуйста, заполните все поля');
      return;
    }
    
    if (passwordData.newPassword.length < 3) {
      setPasswordError('Пароль должен содержать минимум 3 символа');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Пароли не совпадают');
      return;
    }
    
    // Изменяем пароль в локальной системе
    const success = changeUserPassword(passwordChangeUser.username, passwordData.newPassword);
    
    if (success) {
      // Сброс формы
      setPasswordChangeUser(null);
      setPasswordData({
        newPassword: '',
        confirmPassword: '',
      });
      alert('Пароль успешно изменён');
    } else {
      setPasswordError('Не удалось изменить пароль');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ru-RU');
  };

  const getTotalUsers = () => users.length;
  const getActiveUsers = () => users.filter(u => u.isActive).length;
  const getAdminUsers = () => users.filter(u => u.role === 'admin').length;

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-slate-600">Всего пользователей</p>
              <p className="text-2xl font-bold text-slate-900">{getTotalUsers()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <UserCheck className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-slate-600">Активных</p>
              <p className="text-2xl font-bold text-slate-900">{getActiveUsers()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Shield className="h-8 w-8 text-purple-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-slate-600">Администраторов</p>
              <p className="text-2xl font-bold text-slate-900">{getAdminUsers()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Управление пользователями */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Управление пользователями
              </CardTitle>
              <CardDescription>
                Добавляйте, редактируйте и управляйте пользователями системы
              </CardDescription>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Добавить пользователя
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить нового пользователя</DialogTitle>
                  <DialogDescription>
                    Заполните информацию о новом пользователе
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Имя пользователя *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="username"
                        placeholder="Введите имя пользователя"
                        value={newUser.username}
                        onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Введите email"
                        value={newUser.email}
                        onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Полное имя *</Label>
                    <Input
                      id="name"
                      placeholder="Введите полное имя"
                      value={newUser.name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Роль</Label>
                    <Select value={newUser.role} onValueChange={(value: 'admin' | 'user') => setNewUser(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Пользователь</SelectItem>
                        <SelectItem value="admin">Администратор</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Пароль *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Введите пароль"
                        value={newUser.password}
                        onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Подтвердите пароль *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Подтвердите пароль"
                        value={newUser.confirmPassword}
                        onChange={(e) => setNewUser(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleAddUser}>
                    Добавить пользователя
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пользователь</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Создан</TableHead>
                <TableHead>Последний вход</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                        <User className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-slate-500">@{user.username}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Активен' : 'Неактивен'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Calendar className="h-3 w-3" />
                      {formatDate(user.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? (
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <Clock className="h-3 w-3" />
                        {formatDate(user.lastLogin)}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">Не входил</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        title="Редактировать пользователя"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPasswordChangeUser(user)}
                        title="Изменить пароль"
                      >
                        <Key className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleUserStatus(user.id)}
                        title={user.isActive ? 'Деактивировать' : 'Активировать'}
                      >
                        {user.isActive ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteUser(user.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Удалить пользователя"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Диалог редактирования */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать пользователя</DialogTitle>
            <DialogDescription>
              Изменить информацию о пользователе
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Имя пользователя *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="edit-username"
                  placeholder="Введите имя пользователя"
                  value={newUser.username}
                  onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="Введите email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-name">Полное имя *</Label>
              <Input
                id="edit-name"
                placeholder="Введите полное имя"
                value={newUser.name}
                onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-role">Роль</Label>
              <Select value={newUser.role} onValueChange={(value: 'admin' | 'user') => setNewUser(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Пользователь</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Отмена
            </Button>
            <Button onClick={handleUpdateUser}>
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог изменения пароля */}
      <Dialog open={!!passwordChangeUser} onOpenChange={(open) => !open && setPasswordChangeUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Изменить пароль
            </DialogTitle>
            <DialogDescription>
              Изменить пароль для пользователя: <strong>{passwordChangeUser?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Новый пароль *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Введите новый пароль"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Подтвердите пароль *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Подтвердите новый пароль"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            {passwordError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {passwordError}
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setPasswordChangeUser(null);
              setPasswordData({ newPassword: '', confirmPassword: '' });
              setPasswordError('');
            }}>
              Отмена
            </Button>
            <Button onClick={handlePasswordChange}>
              Изменить пароль
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};