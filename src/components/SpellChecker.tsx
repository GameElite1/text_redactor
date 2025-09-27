import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, BookOpen, X } from 'lucide-react';

interface SpellCheckerProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

interface SpellError {
  word: string;
  position: number;
  suggestions: string[];
}

// Расширенный словарь русских слов и правил
const russianDict = new Set([
  // Основные слова
  'и', 'в', 'не', 'на', 'я', 'быть', 'он', 'с', 'что', 'а', 'по', 'это', 'она', 'этот', 'к', 'но', 'они', 'мы', 'как', 'из', 'у', 'который', 'то', 'за', 'свой', 'что', 'её', 'так', 'вы', 'сказать', 'мочь', 'если', 'о', 'все', 'год', 'от', 'го', 'его', 'для', 'да', 'уж', 'или', 'ни', 'быт', 'первый', 'до', 'там', 'при', 'над', 'сила', 'где', 'дом', 'день', 'дело', 'лет', 'даже', 'только', 'такой', 'нет', 'под', 'можно', 'жить', 'очень', 'один', 'самый', 'просто', 'знать', 'стать', 'хотеть', 'работа', 'человек', 'время', 'раз', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять', 'десять',
  
  // Часто используемые слова
  'текст', 'редактор', 'поиск', 'замена', 'шрифт', 'цвет', 'размер', 'файл', 'сохранить', 'открыть', 'создать', 'удалить', 'копировать', 'вставить', 'выделить', 'форматирование', 'документ', 'страница', 'абзац', 'строка', 'слово', 'символ', 'проверка', 'орфография', 'ошибка', 'исправление',
  
  // Технические термины
  'компьютер', 'программа', 'система', 'настройки', 'опции', 'меню', 'кнопка', 'панель', 'окно', 'интерфейс', 'пользователь', 'данные', 'информация', 'контент', 'элемент', 'компонент', 'функция', 'метод', 'свойство', 'значение', 'параметр', 'конфигурация',
  
  // Действия
  'написать', 'прочитать', 'изменить', 'добавить', 'убрать', 'переместить', 'скопировать', 'удалить', 'найти', 'заменить', 'выбрать', 'отменить', 'повторить', 'сохранить', 'загрузить', 'экспортировать', 'импортировать', 'печатать', 'просмотреть', 'редактировать',
  
  // Прилагательные
  'новый', 'старый', 'большой', 'маленький', 'хороший', 'плохой', 'красивый', 'простой', 'сложный', 'быстрый', 'медленный', 'правильный', 'неправильный', 'полный', 'пустой', 'открытый', 'закрытый', 'активный', 'неактивный', 'доступный', 'недоступный',
]);

// Правила для русского языка
const russianRules = {
  // Окончания существительных
  endings: [
    'а', 'я', 'ы', 'и', 'о', 'е', 'у', 'ю', 'ой', 'ей', 'ом', 'ем', 'ам', 'ям', 'ах', 'ях',
    'ов', 'ев', 'ий', 'ый', 'ая', 'яя', 'ое', 'ее', 'ые', 'ие', 'ого', 'его', 'ому', 'ему',
    'ать', 'ять', 'ить', 'еть', 'оть', 'уть', 'ют', 'ат', 'ет', 'ит', 'ут', 'ла', 'ло', 'ли'
  ],
  
  // Суффиксы
  suffixes: [
    'ость', 'ние', 'ение', 'ание', 'тель', 'щик', 'чик', 'ист', 'изм', 'ция', 'сия'
  ],
  
  // Префиксы
  prefixes: [
    'не', 'пре', 'при', 'под', 'над', 'от', 'до', 'за', 'вы', 'по', 'про', 'пере', 'с', 'со', 'в', 'во', 'раз', 'рас', 'без', 'бес'
  ]
};

export function SpellChecker({ isOpen, onClose, content }: SpellCheckerProps) {
  const [errors, setErrors] = useState<SpellError[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [currentErrorIndex, setCurrentErrorIndex] = useState(0);

  // Функция для получения предложений по исправлению
  const getSuggestions = useCallback((word: string): string[] => {
    const suggestions: string[] = [];
    const lowercaseWord = word.toLowerCase();
    
    // Поиск похожих слов в словаре (простое редактирование)
    for (const dictWord of russianDict) {
      if (dictWord.length > 0 && Math.abs(dictWord.length - word.length) <= 2) {
        const distance = getLevenshteinDistance(lowercaseWord, dictWord);
        if (distance <= 2 && distance > 0) {
          suggestions.push(dictWord);
        }
      }
    }
    
    // Проверка с учетом морфологии
    const stem = getWordStem(lowercaseWord);
    if (stem.length > 2) {
      for (const dictWord of russianDict) {
        if (dictWord.startsWith(stem) && dictWord !== lowercaseWord) {
          suggestions.push(dictWord);
        }
      }
    }
    
    // Общие исправления ошибок
    const commonFixes = getCommonFixes(lowercaseWord);
    suggestions.push(...commonFixes);
    
    // Убираем дубликаты и сортируем по релевантности
    return [...new Set(suggestions)].slice(0, 5);
  }, []);

  // Расстояние Левенштейна для поиска похожих слов
  const getLevenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  // Получение основы слова (упрощенный стемминг)
  const getWordStem = (word: string): string => {
    let stem = word;
    
    // Убираем окончания
    for (const ending of russianRules.endings) {
      if (stem.endsWith(ending) && stem.length > ending.length + 2) {
        stem = stem.slice(0, -ending.length);
        break;
      }
    }
    
    return stem;
  };

  // Общие исправления типичных ошибок
  const getCommonFixes = (word: string): string[] => {
    const fixes: string[] = [];
    
    // Замена английских букв на русские
    const engToRus: Record<string, string> = {
      'a': 'а', 'e': 'е', 'o': 'о', 'p': 'р', 'c': 'с', 'y': 'у', 'x': 'х', 'k': 'к', 'h': 'н', 'm': 'м', 't': 'т', 'b': 'в'
    };
    
    let fixedWord = word;
    let hasChanges = false;
    for (const [eng, rus] of Object.entries(engToRus)) {
      if (fixedWord.includes(eng)) {
        fixedWord = fixedWord.replace(new RegExp(eng, 'g'), rus);
        hasChanges = true;
      }
    }
    
    if (hasChanges && russianDict.has(fixedWord)) {
      fixes.push(fixedWord);
    }
    
    // Исправление удвоенных согласных
    const withoutDoubles = word.replace(/([бвгджзклмнпрстфхцчшщ])\1+/g, '$1');
    if (withoutDoubles !== word && russianDict.has(withoutDoubles)) {
      fixes.push(withoutDoubles);
    }
    
    return fixes;
  };

  // Проверка, является ли слово корректным
  const isWordCorrect = useCallback((word: string): boolean => {
    const cleanWord = word.toLowerCase().replace(/[^\u0400-\u04FF]/g, '');
    if (cleanWord.length < 2) return true; // Пропускаем очень короткие слова
    
    // Проверяем в словаре
    if (russianDict.has(cleanWord)) return true;
    
    // Проверяем с учетом морфологии
    const stem = getWordStem(cleanWord);
    if (stem.length > 2) {
      for (const dictWord of russianDict) {
        if (dictWord.startsWith(stem)) return true;
      }
    }
    
    // Проверяем числа
    if (/^\d+$/.test(cleanWord)) return true;
    
    // Проверяем сокращения (заглавные буквы)
    if (/^[А-ЯЁ]{2,}$/.test(word)) return true;
    
    return false;
  }, []);

  // Основная функция проверки орфографии
  const checkSpelling = useCallback(() => {
    setIsChecking(true);
    const foundErrors: SpellError[] = [];
    
    // Разбиваем текст на слова с сохранением позиций
    const wordRegex = /[а-яё]+/gi;
    let match;
    
    while ((match = wordRegex.exec(content)) !== null) {
      const word = match[0];
      const position = match.index;
      
      if (!isWordCorrect(word)) {
        const suggestions = getSuggestions(word);
        foundErrors.push({
          word,
          position,
          suggestions
        });
      }
    }
    
    setErrors(foundErrors);
    setCurrentErrorIndex(0);
    setIsChecking(false);
  }, [content, isWordCorrect, getSuggestions]);

  // Исправление ошибки
  const fixError = useCallback((errorIndex: number, replacement: string) => {
    const error = errors[errorIndex];
    if (!error) return;
    
    // Создаем событие для обновления текста
    const fixEvent = new CustomEvent('spell-fix', {
      detail: {
        position: error.position,
        word: error.word,
        replacement: replacement
      }
    });
    window.dispatchEvent(fixEvent);
    
    // Убираем исправленную ошибку из списка
    const newErrors = errors.filter((_, index) => index !== errorIndex);
    setErrors(newErrors);
    
    if (currentErrorIndex >= newErrors.length && newErrors.length > 0) {
      setCurrentErrorIndex(newErrors.length - 1);
    }
  }, [errors, currentErrorIndex]);

  // Пропуск ошибки
  const skipError = useCallback((errorIndex: number) => {
    const newErrors = errors.filter((_, index) => index !== errorIndex);
    setErrors(newErrors);
    
    if (currentErrorIndex >= newErrors.length && newErrors.length > 0) {
      setCurrentErrorIndex(newErrors.length - 1);
    }
  }, [errors, currentErrorIndex]);

  // Автоматическая проверка при изменении контента
  useEffect(() => {
    if (isOpen && content) {
      const timeoutId = setTimeout(() => {
        checkSpelling();
      }, 500); // Задержка для предотвращения частых проверок
      
      return () => clearTimeout(timeoutId);
    }
  }, [content, isOpen, checkSpelling]);

  if (!isOpen) return null;

  const currentError = errors[currentErrorIndex];

  return (
    <div className="border-b bg-secondary/50 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          <h3 className="text-sm font-medium">Проверка орфографии</h3>
          {isChecking && (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={checkSpelling}
          disabled={isChecking}
        >
          {isChecking ? 'Проверка...' : 'Проверить заново'}
        </Button>
        
        <Badge variant={errors.length > 0 ? "destructive" : "default"} className="gap-1">
          {errors.length > 0 ? (
            <XCircle className="h-3 w-3" />
          ) : (
            <CheckCircle className="h-3 w-3" />
          )}
          {errors.length === 0 ? 'Ошибок не найдено' : `Найдено ошибок: ${errors.length}`}
        </Badge>
      </div>

      {errors.length > 0 && currentError && (
        <div className="space-y-3 p-3 border rounded-lg bg-background">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Ошибка {currentErrorIndex + 1} из {errors.length}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentErrorIndex(Math.max(0, currentErrorIndex - 1))}
                disabled={currentErrorIndex === 0}
              >
                ←
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentErrorIndex(Math.min(errors.length - 1, currentErrorIndex + 1))}
                disabled={currentErrorIndex === errors.length - 1}
              >
                →
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">Неправильно:</span>
              <Badge variant="destructive">{currentError.word}</Badge>
            </div>

            {currentError.suggestions.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm">Предложения:</span>
                <div className="flex flex-wrap gap-2">
                  {currentError.suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => fixError(currentErrorIndex, suggestion)}
                      className="text-sm"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => skipError(currentErrorIndex)}
              >
                Пропустить
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
        💡 <strong>Совет:</strong> Проверка орфографии анализирует русский текст и предлагает исправления. 
        Используйте кнопки навигации для просмотра всех найденных ошибок.
      </div>
    </div>
  );
}