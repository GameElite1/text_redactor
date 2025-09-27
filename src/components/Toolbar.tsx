import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Save, 
  FolderOpen, 
  Download,
  RotateCcw,
  RotateCw,
  Eye,
  FileDown,
  Settings,
  Search,
  Type,
  CheckCircle,
  Shield,
  LogOut,
  User
} from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { useAuthStore } from "@/store/auth-store";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface ToolbarProps {
  onNewDocument: () => void;
  onSaveDocument: () => void;
  onLoadDocument: () => void;
  onDownloadDocument: () => void;
  onToggleSearch: () => void;
  onToggleFormatting: () => void;
  onToggleSpellCheck: () => void;
  onToggleSecurity?: () => void;
  isSearchOpen: boolean;
  isFormattingOpen: boolean;
  isSpellCheckOpen: boolean;
}

export function Toolbar({ 
  onNewDocument, 
  onSaveDocument, 
  onLoadDocument, 
  onDownloadDocument,
  onToggleSearch,
  onToggleFormatting,
  onToggleSpellCheck,
  onToggleSecurity,
  isSearchOpen,
  isFormattingOpen,
  isSpellCheckOpen
}: ToolbarProps) {
  const { fileName, setFileName, isModified } = useEditorStore();
  const { user, isAdmin } = useAuthStore();
  const { logout } = useAuth();
  const { toast } = useToast();

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(e.target.value);
  };

  const handleUndo = () => {
    document.execCommand('undo');
  };

  const handleRedo = () => {
    document.execCommand('redo');
  };

  const handlePreview = () => {
    toast({
      title: "Предварительный просмотр",
      description: "Функция будет добавлена в следующих версиях",
    });
  };

  const handleSettings = () => {
    toast({
      title: "Настройки",
      description: "Настройки редактора будут добавлены в следующих версиях", 
    });
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center gap-2">
        {/* File operations */}
        <Button
          size="sm"
          variant="ghost"
          onClick={onNewDocument}
          className="toolbar-button"
          title="Новый документ"
        >
          <FileText className="h-4 w-4" />
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onSaveDocument}
          className="toolbar-button"
          title="Сохранить"
        >
          <Save className="h-4 w-4" />
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onLoadDocument}
          className="toolbar-button"
          title="Открыть файл"
        >
          <FolderOpen className="h-4 w-4" />
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onDownloadDocument}
          className="toolbar-button"
          title="Скачать файл"
        >
          <Download className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Edit operations */}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleUndo}
          className="toolbar-button"
          title="Отменить"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRedo}
          className="toolbar-button"
          title="Повторить"
        >
          <RotateCw className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Text tools */}
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleSearch}
          className={`toolbar-button ${isSearchOpen ? 'bg-accent text-accent-foreground' : ''}`}
          title="Поиск и замена"
        >
          <Search className="h-4 w-4" />
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleFormatting}
          className={`toolbar-button ${isFormattingOpen ? 'bg-accent text-accent-foreground' : ''}`}
          title="Форматирование текста"
        >
          <Type className="h-4 w-4" />
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleSpellCheck}
          className={`toolbar-button ${isSpellCheckOpen ? 'bg-accent text-accent-foreground' : ''}`}
          title="Проверка орфографии"
        >
          <CheckCircle className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Additional tools */}
        <Button
          size="sm"
          variant="ghost"
          onClick={handlePreview}
          className="toolbar-button"
          title="Предварительный просмотр"
        >
          <Eye className="h-4 w-4" />
        </Button>
        
        {onToggleSecurity && isAdmin && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleSecurity}
            className="toolbar-button text-purple-600 hover:bg-purple-50"
            title="Панель администратора"
          >
            <Shield className="h-4 w-4" />
          </Button>
        )}
        
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSettings}
          className="toolbar-button"
          title="Настройки"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* User info and file name */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Input
            value={fileName}
            onChange={handleFileNameChange}
            className="w-64 h-8 text-sm"
            placeholder="Название файла"
          />
          {isModified && (
            <span className="text-xs text-muted-foreground">•</span>
          )}
        </div>

        {/* User info */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-full">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">
              {user?.name || user?.email?.split('@')[0] || 'Пользователь'}
            </span>
            <Badge 
              variant={isAdmin ? "default" : "outline"} 
              className={`text-xs ${isAdmin ? 'bg-purple-600 text-white' : ''}`}
            >
              {isAdmin ? 'Администратор' : 'Пользователь'}
            </Badge>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={logout}
            className="toolbar-button text-destructive hover:bg-destructive/10"
            title="Выйти из системы"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}