import { useEffect, useState } from "react";
import { Toolbar } from "@/components/Toolbar";
import { TextEditor } from "@/components/TextEditor";
import { StatusBar } from "@/components/StatusBar";
import { SearchPanel } from "@/components/SearchPanel";
import { FormattingToolbar } from "@/components/FormattingToolbar";
import { SpellChecker } from "@/components/SpellChecker";
import { useFileOperations } from "@/hooks/use-file-operations";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useEditorStore } from "@/store/editor-store";

export function HomePage() {
  const { content, setContent, updateStats } = useEditorStore();
  const { 
    createNewDocument, 
    saveDocument, 
    loadDocument, 
    downloadDocument 
  } = useFileOperations();
  
  // UI state management
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFormattingOpen, setIsFormattingOpen] = useState(false);
  const [isSpellCheckEnabled, setIsSpellCheckEnabled] = useState(false);
  
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
        onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}
        onToggleFormatting={() => setIsFormattingOpen(!isFormattingOpen)}
        onToggleSpellCheck={() => setIsSpellCheckEnabled(!isSpellCheckEnabled)}
        isSearchOpen={isSearchOpen}
        isFormattingOpen={isFormattingOpen}
        isSpellCheckEnabled={isSpellCheckEnabled}
      />

      {/* Search Panel */}
      <SearchPanel 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />

      {/* Formatting Toolbar */}
      {isFormattingOpen && <FormattingToolbar />}

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TextEditor />
        
        {/* Spell Checker */}
        <SpellChecker 
          text={content}
          onTextChange={setContent}
          isEnabled={isSpellCheckEnabled}
        />
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}