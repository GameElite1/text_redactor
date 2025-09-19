import { useEditorStore } from "@/store/editor-store";
import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";

export function useFileOperations() {
  const { 
    content, 
    setContent, 
    fileName, 
    setFileName, 
    setModified, 
    clearDocument,
    updateStats 
  } = useEditorStore();
  const { toast } = useToast();

  const createNewDocument = useCallback(() => {
    if (content && window.confirm('Несохранённые изменения будут потеряны. Продолжить?')) {
      clearDocument();
      toast({
        title: "Новый документ",
        description: "Создан новый пустой документ",
      });
    } else if (!content) {
      clearDocument();
    }
  }, [content, clearDocument, toast]);

  const saveDocument = useCallback(() => {
    try {
      // Save to localStorage (auto-handled by zustand persist)
      setModified(false);
      toast({
        title: "Сохранено",
        description: `Документ "${fileName}" сохранён локально`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить документ",
        variant: "destructive",
      });
    }
  }, [fileName, setModified, toast]);

  const loadDocument = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const fileContent = e.target?.result as string;
          setContent(fileContent);
          setFileName(file.name);
          setModified(false);
          updateStats(fileContent);
          toast({
            title: "Файл загружен",
            description: `Открыт файл "${file.name}"`,
          });
        };
        reader.readAsText(file);
      }
    };
    
    input.click();
  }, [setContent, setFileName, setModified, updateStats, toast]);

  const downloadDocument = useCallback(() => {
    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Файл скачан",
        description: `Файл "${fileName}" сохранён на устройство`,
      });
    } catch (error) {
      toast({
        title: "Ошибка скачивания",
        description: "Не удалось скачать файл",
        variant: "destructive",
      });
    }
  }, [content, fileName, toast]);

  return {
    createNewDocument,
    saveDocument,
    loadDocument,
    downloadDocument,
  };
}