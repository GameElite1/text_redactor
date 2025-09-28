import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (term: string, currentIndex: number) => void;
}

export function SearchPanel({ isOpen, onClose, onSearch }: SearchPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [caseSensitive, setCaseSensitive] = useState(false);
  
  const { content, setContent } = useEditorStore();

  const findMatches = useCallback((text: string, term: string) => {
    if (!term) return [];
    
    const flags = caseSensitive ? 'g' : 'gi';
    try {
      const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      const matches = [];
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0]
        });
        // Предотвращаем бесконечный цикл для пустых совпадений
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }
      }
      
      return matches;
    } catch (error) {
      console.error('Ошибка в регулярном выражении:', error);
      return [];
    }
  }, [caseSensitive]);

  const handleSearch = useCallback(() => {
    if (!searchTerm) {
      setTotalMatches(0);
      setCurrentMatch(0);
      onSearch('', 0);
      return;
    }

    const matches = findMatches(content, searchTerm);
    setTotalMatches(matches.length);
    
    if (matches.length > 0) {
      setCurrentMatch(0);
      onSearch(searchTerm, 0);
    } else {
      setCurrentMatch(0);
      onSearch(searchTerm, 0);
    }
  }, [content, searchTerm, findMatches, onSearch]);

  const navigateMatch = useCallback((direction: 'next' | 'prev') => {
    if (totalMatches === 0) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentMatch + 1) % totalMatches;
    } else {
      newIndex = (currentMatch - 1 + totalMatches) % totalMatches;
    }
    
    setCurrentMatch(newIndex);
    onSearch(searchTerm, newIndex);
  }, [totalMatches, currentMatch, searchTerm, onSearch]);

  const handleReplace = useCallback(() => {
    if (!searchTerm || totalMatches === 0) return;
    
    const matches = findMatches(content, searchTerm);
    if (matches.length === 0) return;
    
    const match = matches[currentMatch];
    const newContent = 
      content.slice(0, match.start) + 
      replaceTerm + 
      content.slice(match.end);
    
    setContent(newContent);
    
    // Обновляем поиск после замены
    setTimeout(() => {
      handleSearch();
    }, 100);
  }, [content, searchTerm, replaceTerm, currentMatch, findMatches, setContent, handleSearch]);

  const handleReplaceAll = useCallback(() => {
    if (!searchTerm) return;
    
    const flags = caseSensitive ? 'g' : 'gi';
    try {
      const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      const newContent = content.replace(regex, replaceTerm);
      
      setContent(newContent);
      setTotalMatches(0);
      setCurrentMatch(0);
      onSearch('', 0);
    } catch (error) {
      console.error('Ошибка при замене:', error);
    }
  }, [content, searchTerm, replaceTerm, caseSensitive, setContent, onSearch]);

  // Обновляем поиск при изменении параметров с задержкой, чтобы не сбрасывать фокус
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      handleSearch();
    }, 300); // Добавляем задержку для предотвращения частых обновлений
    
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, caseSensitive, handleSearch]);

  // Сброс при закрытии панели
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setReplaceTerm('');
      setShowReplace(false);
      setCurrentMatch(0);
      setTotalMatches(0);
      onSearch('', 0);
    }
  }, [isOpen, onSearch]);

  if (!isOpen) return null;

  return (
    <div className="border-b bg-secondary/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Поиск и замена</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Найти текст..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                navigateMatch('next');
              } else if (e.key === 'Enter' && e.shiftKey) {
                e.preventDefault();
                navigateMatch('prev');
              } else if (e.key === 'Escape') {
                onClose();
              }
            }}
            autoFocus
          />
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateMatch('prev')}
            disabled={totalMatches === 0}
            title="Предыдущее совпадение (Shift+Enter)"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateMatch('next')}
            disabled={totalMatches === 0}
            title="Следующее совпадение (Enter)"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-2 min-w-[50px] text-center">
            {totalMatches > 0 ? `${currentMatch + 1}/${totalMatches}` : '0/0'}
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowReplace(!showReplace)}
          className={showReplace ? 'bg-accent text-accent-foreground' : ''}
          title="Показать замену"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {showReplace && (
        <div className="flex gap-2">
          <Input
            placeholder="Заменить на..."
            value={replaceTerm}
            onChange={(e) => setReplaceTerm(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleReplace();
              }
            }}
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReplace}
            disabled={totalMatches === 0}
            title="Заменить текущее совпадение"
          >
            Заменить
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReplaceAll}
            disabled={totalMatches === 0}
            title="Заменить все совпадения"
          >
            Заменить всё
          </Button>
        </div>
      )}

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            className="rounded border-input"
          />
          Учитывать регистр
        </label>
        
        {searchTerm && totalMatches === 0 && (
          <span className="text-sm text-muted-foreground">
            Совпадений не найдено
          </span>
        )}
      </div>
    </div>
  );
}