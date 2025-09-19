import { useEffect } from "react";
import { useEditorStore } from "@/store/editor-store";
import { useToast } from "@/hooks/use-toast";

export function useAutoSave(intervalMs = 30000) { // Auto-save every 30 seconds
  const { content, isModified, setModified } = useEditorStore();
  const { toast } = useToast();

  useEffect(() => {
    if (!isModified) return;

    const autoSaveTimer = setTimeout(() => {
      // Auto-save logic - zustand persist handles saving to localStorage
      setModified(false);
      
      // Show subtle notification
      toast({
        title: "Автосохранение",
        description: "Документ автоматически сохранён",
        duration: 2000,
      });
    }, intervalMs);

    return () => clearTimeout(autoSaveTimer);
  }, [content, isModified, setModified, toast, intervalMs]);
}