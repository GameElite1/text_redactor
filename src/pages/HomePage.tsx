import { useState, useCallback, useEffect } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { useFileOperations } from '@/hooks/use-file-operations';
import { useAutoSave } from '@/hooks/use-auto-save';
import { useSecurityLogger } from '@/hooks/use-security-logger';
import { useAuthStore } from '@/store/auth-store';
import { Toolbar } from '@/components/Toolbar';
import { RichTextEditor } from '@/components/RichTextEditor';
import { StatusBar } from '@/components/StatusBar';
import { SearchPanel } from '@/components/SearchPanel';
import { FormattingToolbar } from '@/components/FormattingToolbar';
import { SpellChecker } from '@/components/SpellChecker';

interface HomePageProps {
  onToggleSecurity?: () => void;
}

export function HomePage({ onToggleSecurity }: HomePageProps) {
  const { content } = useEditorStore();
  const { user } = useAuthStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFormattingOpen, setIsFormattingOpen] = useState(false);
  const [isSpellCheckOpen, setIsSpellCheckOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);

  const {
    createNewDocument,
    saveDocument,
    loadDocument,
    downloadDocument,
  } = useFileOperations();

  // Системы безопасности
  const { logDocument, logSecurity } = useSecurityLogger();

  // Автосохранение
  useAutoSave();

  // Обработчики для панели инструментов
  const handleNewDocument = useCallback(() => {
    createNewDocument();
    logDocument('document_create', 'Создан новый документ');
  }, [createNewDocument, logDocument]);

  const handleSaveDocument = useCallback(() => {
    saveDocument();
    logDocument('document_save', `Документ сохранен пользователем ${user?.email || 'неизвестный'}`);
  }, [saveDocument, logDocument, user]);

  const handleLoadDocument = useCallback(() => {
    loadDocument();
    logDocument('document_load', 'Загружен файл пользователем');
  }, [loadDocument, logDocument]);

  const handleDownloadDocument = useCallback(() => {
    downloadDocument();
    logDocument('file_download', 'Файл скачан пользователем');
  }, [downloadDocument, logDocument]);

  // Управление панелями
  const handleToggleSearch = useCallback(() => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchTerm('');
      setCurrentSearchIndex(0);
    }
  }, [isSearchOpen]);

  const handleToggleFormatting = useCallback(() => {
    setIsFormattingOpen(!isFormattingOpen);
  }, [isFormattingOpen]);

  const handleToggleSpellCheck = useCallback(() => {
    setIsSpellCheckOpen(!isSpellCheckOpen);
  }, [isSpellCheckOpen]);

  // Обработка поиска
  const handleSearch = useCallback((term: string, index: number) => {
    setSearchTerm(term);
    setCurrentSearchIndex(index);
    if (term) {
      logDocument('search_performed', `Выполнен поиск: "${term}"`);
    }
  }, [logDocument]);

  // Слушатель событий для сохранения
  useEffect(() => {
    const handleSaveEvent = () => {
      saveDocument();
    };

    window.addEventListener('editor-save', handleSaveEvent);
    return () => window.removeEventListener('editor-save', handleSaveEvent);
  }, [saveDocument]);

  // Слушатель событий для исправления орфографии
  useEffect(() => {
    const handleSpellFix = (event: CustomEvent) => {
      const { position, word, replacement } = event.detail;
      const newContent = 
        content.slice(0, position) + 
        replacement + 
        content.slice(position + word.length);
      
      // Обновляем содержимое через store
      useEditorStore.getState().setContent(newContent);
    };

    window.addEventListener('spell-fix', handleSpellFix as EventListener);
    return () => window.removeEventListener('spell-fix', handleSpellFix as EventListener);
  }, [content]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Заголовок приложения */}
      <div className="border-b bg-card px-6 py-3">
        <h1 className="text-xl font-semibold text-foreground">
          Текстовый Редактор
        </h1>
        <p className="text-sm text-muted-foreground">
          Профессиональный редактор с поддержкой форматирования и проверки орфографии
        </p>
      </div>

      {/* Панель инструментов */}
      <Toolbar
        onNewDocument={handleNewDocument}
        onSaveDocument={handleSaveDocument}
        onLoadDocument={handleLoadDocument}
        onDownloadDocument={handleDownloadDocument}
        onToggleSearch={handleToggleSearch}
        onToggleFormatting={handleToggleFormatting}
        onToggleSpellCheck={handleToggleSpellCheck}
        onToggleSecurity={onToggleSecurity}
        isSearchOpen={isSearchOpen}
        isFormattingOpen={isFormattingOpen}
        isSpellCheckOpen={isSpellCheckOpen}
      />

      {/* Панель поиска */}
      <SearchPanel
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearch}
      />

      {/* Панель форматирования */}
      <FormattingToolbar
        isOpen={isFormattingOpen}
      />

      {/* Проверка орфографии */}
      <SpellChecker
        isOpen={isSpellCheckOpen}
        onClose={() => setIsSpellCheckOpen(false)}
        content={content}
      />

      {/* Основная область редактора */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <RichTextEditor
          searchTerm={searchTerm}
          currentSearchIndex={currentSearchIndex}
        />
      </div>

      {/* Строка состояния */}
      <StatusBar />
    </div>
  );
}