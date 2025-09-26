import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchPanel({ isOpen, onClose }: SearchPanelProps) {
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
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    const matches = [];
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0]
      });
    }
    
    return matches;
  }, [caseSensitive]);

  const highlightText = useCallback((text: string, term: string, currentIndex: number) => {
    if (!term) return text;
    
    const matches = findMatches(text, term);
    setTotalMatches(matches.length);
    
    if (matches.length === 0) return text;
    
    let result = '';
    let lastIndex = 0;
    
    matches.forEach((match, index) => {
      result += text.slice(lastIndex, match.start);
      const isCurrentMatch = index === currentIndex;
      result += `<mark class="${isCurrentMatch ? 'bg-accent text-accent-foreground' : 'bg-yellow-200 text-yellow-900'}">${match.text}</mark>`;
      lastIndex = match.end;
    });
    
    result += text.slice(lastIndex);
    return result;
  }, [findMatches]);

  const handleSearch = useCallback(() => {
    const matches = findMatches(content, searchTerm);
    setTotalMatches(matches.length);
    if (matches.length > 0) {
      setCurrentMatch(0);
    }
  }, [content, searchTerm, findMatches]);

  const navigateMatch = useCallback((direction: 'next' | 'prev') => {
    if (totalMatches === 0) return;
    
    if (direction === 'next') {
      setCurrentMatch((prev) => (prev + 1) % totalMatches);
    } else {
      setCurrentMatch((prev) => (prev - 1 + totalMatches) % totalMatches);
    }
  }, [totalMatches]);

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
    handleSearch();
  }, [content, searchTerm, replaceTerm, currentMatch, findMatches, setContent, handleSearch]);

  const handleReplaceAll = useCallback(() => {
    if (!searchTerm) return;
    
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    const newContent = content.replace(regex, replaceTerm);
    
    setContent(newContent);
    setTotalMatches(0);
    setCurrentMatch(0);
  }, [content, searchTerm, replaceTerm, caseSensitive, setContent]);

  React.useEffect(() => {
    if (searchTerm) {
      handleSearch();
    } else {
      setTotalMatches(0);
      setCurrentMatch(0);
    }
  }, [searchTerm, handleSearch]);

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
                navigateMatch('next');
              } else if (e.key === 'Enter' && e.shiftKey) {
                navigateMatch('prev');
              }
            }}
          />
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateMatch('prev')}
            disabled={totalMatches === 0}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateMatch('next')}
            disabled={totalMatches === 0}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            {totalMatches > 0 ? `${currentMatch + 1}/${totalMatches}` : '0/0'}
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowReplace(!showReplace)}
          className={showReplace ? 'bg-accent text-accent-foreground' : ''}
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
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReplace}
            disabled={totalMatches === 0}
          >
            Заменить
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReplaceAll}
            disabled={totalMatches === 0}
          >
            Заменить всё
          </Button>
        </div>
      )}

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            className="rounded border-input"
          />
          Учитывать регистр
        </label>
      </div>
    </div>
  );
}