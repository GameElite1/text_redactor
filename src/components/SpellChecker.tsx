import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

interface SpellError {
  word: string;
  position: number;
  suggestions: string[];
}

interface SpellCheckerProps {
  text: string;
  onTextChange: (newText: string) => void;
  isEnabled: boolean;
}

// Простые правила для русского языка (базовая проверка)
const RUSSIAN_SPELL_RULES = {
  // Частые ошибки в русском языке
  common_mistakes: {
    'что-бы': 'чтобы',
    'по этому': 'поэтому',
    'так же': 'также',
    'в течении': 'в течение',
    'в продолжении': 'в продолжение',
    'на счет': 'насчет',
    'из за': 'из-за',
    'по середине': 'посередине',
    'с зади': 'сзади',
    'в переди': 'впереди',
  },
  
  // Проверка двойных пробелов и лишних символов
  whitespace_errors: /\s{2,}/g,
  
  // Проверка на ё/е (частая ошибка)
  yo_errors: /([жшчщц])е/g,
  
  // Простая проверка на повторяющиеся слова
  duplicate_words: /\b(\w+)\s+\1\b/gi,
};

export function SpellChecker({ text, onTextChange, isEnabled }: SpellCheckerProps) {
  const [errors, setErrors] = useState<SpellError[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const checkSpelling = useCallback((content: string) => {
    if (!isEnabled || !content.trim()) {
      setErrors([]);
      return;
    }

    setIsChecking(true);
    const foundErrors: SpellError[] = [];

    // Проверка частых ошибок
    Object.entries(RUSSIAN_SPELL_RULES.common_mistakes).forEach(([wrong, correct]) => {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      let match;
      while ((match = regex.exec(content)) !== null) {
        foundErrors.push({
          word: match[0],
          position: match.index,
          suggestions: [correct]
        });
      }
    });

    // Проверка двойных пробелов
    let match;
    while ((match = RUSSIAN_SPELL_RULES.whitespace_errors.exec(content)) !== null) {
      foundErrors.push({
        word: match[0],
        position: match.index,
        suggestions: [' ']
      });
    }

    // Проверка повторяющихся слов
    RUSSIAN_SPELL_RULES.duplicate_words.lastIndex = 0;
    while ((match = RUSSIAN_SPELL_RULES.duplicate_words.exec(content)) !== null) {
      foundErrors.push({
        word: match[0],
        position: match.index,
        suggestions: [match[1]]
      });
    }

    // Проверка ё/е после шипящих (упрощенная)
    RUSSIAN_SPELL_RULES.yo_errors.lastIndex = 0;
    while ((match = RUSSIAN_SPELL_RULES.yo_errors.exec(content)) !== null) {
      const suggestion = match[0].replace('е', 'ё');
      foundErrors.push({
        word: match[0],
        position: match.index,
        suggestions: [suggestion]
      });
    }

    // Удаление дубликатов и сортировка по позиции
    const uniqueErrors = foundErrors
      .filter((error, index, arr) => 
        arr.findIndex(e => e.position === error.position && e.word === error.word) === index
      )
      .sort((a, b) => a.position - b.position);

    setErrors(uniqueErrors);
    setIsChecking(false);
  }, [isEnabled]);

  const applySuggestion = useCallback((error: SpellError, suggestion: string) => {
    const beforeError = text.substring(0, error.position);
    const afterError = text.substring(error.position + error.word.length);
    const newText = beforeError + suggestion + afterError;
    
    onTextChange(newText);
    
    // Обновляем позиции оставшихся ошибок
    const lengthDiff = suggestion.length - error.word.length;
    setErrors(prevErrors => 
      prevErrors
        .filter(e => !(e.position === error.position && e.word === error.word))
        .map(e => ({
          ...e,
          position: e.position > error.position ? e.position + lengthDiff : e.position
        }))
    );
  }, [text, onTextChange]);

  const ignoreError = useCallback((error: SpellError) => {
    setErrors(prevErrors => 
      prevErrors.filter(e => !(e.position === error.position && e.word === error.word))
    );
  }, []);

  useEffect(() => {
    if (isEnabled) {
      const timeoutId = setTimeout(() => {
        checkSpelling(text);
      }, 1000); // Debounce проверки

      return () => clearTimeout(timeoutId);
    } else {
      setErrors([]);
    }
  }, [text, isEnabled, checkSpelling]);

  if (!isEnabled || errors.length === 0) {
    return null;
  }

  return (
    <div className="border-t bg-red-50 dark:bg-red-950/20 p-3">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <span className="text-sm font-medium text-red-700 dark:text-red-400">
          Найдено орфографических ошибок: {errors.length}
        </span>
        {isChecking && (
          <Badge variant="secondary" className="text-xs">
            Проверка...
          </Badge>
        )}
      </div>

      <div className="space-y-2 max-h-32 overflow-y-auto">
        {errors.slice(0, 10).map((error, index) => (
          <div key={`${error.position}-${error.word}-${index}`} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border text-sm">
            <Badge variant="destructive" className="text-xs font-mono">
              {error.word}
            </Badge>
            
            <div className="flex gap-1 flex-wrap">
              {error.suggestions.map((suggestion, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => applySuggestion(error, suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 ml-auto"
              onClick={() => ignoreError(error)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        
        {errors.length > 10 && (
          <p className="text-xs text-muted-foreground text-center">
            И ещё {errors.length - 10} ошибок...
          </p>
        )}
      </div>
    </div>
  );
}