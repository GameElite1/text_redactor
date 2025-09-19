import { useEffect } from "react";
import { Toolbar } from "@/components/Toolbar";
import { TextEditor } from "@/components/TextEditor";
import { StatusBar } from "@/components/StatusBar";
import { useFileOperations } from "@/hooks/use-file-operations";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useEditorStore } from "@/store/editor-store";

export function HomePage() {
  const { content, updateStats } = useEditorStore();
  const { 
    createNewDocument, 
    saveDocument, 
    loadDocument, 
    downloadDocument 
  } = useFileOperations();
  
  // Enable auto-save
  useAutoSave();

  // Initialize stats on mount
  useEffect(() => {
    updateStats(content);
  }, []);

  // Listen for Ctrl+S save events
  useEffect(() => {
    const handleSave = () => {
      saveDocument();
    };

    window.addEventListener('editor-save', handleSave);
    return () => window.removeEventListener('editor-save', handleSave);
  }, [saveDocument]);

  return (
    <div className="h-screen flex flex-col">
      {/* Application Header */}
      <div className="bg-primary text-primary-foreground px-4 py-2">
        <h1 className="text-lg font-semibold">Текстовый Редактор</h1>
      </div>

      {/* Toolbar */}
      <Toolbar
        onNewDocument={createNewDocument}
        onSaveDocument={saveDocument}
        onLoadDocument={loadDocument}
        onDownloadDocument={downloadDocument}
      />

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TextEditor />
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}