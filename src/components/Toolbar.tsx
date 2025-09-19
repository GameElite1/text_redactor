import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Save, 
  FolderOpen, 
  Download,
  RotateCcw,
  RotateCw,
  Eye,
  FileDown,
  Settings
} from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { useToast } from "@/hooks/use-toast";

interface ToolbarProps {
  onNewDocument: () => void;
  onSaveDocument: () => void;
  onLoadDocument: () => void;
  onDownloadDocument: () => void;
}

export function Toolbar({ 
  onNewDocument, 
  onSaveDocument, 
  onLoadDocument, 
  onDownloadDocument 
}: ToolbarProps) {
  const { fileName, setFileName, isModified } = useEditorStore();
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

      {/* File name input */}
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
    </div>
  );
}