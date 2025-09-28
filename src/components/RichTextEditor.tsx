import { useRef, useEffect, useState, useCallback } from "react";
import { useEditorStore } from "@/store/editor-store";
import { useFormattingStore } from "@/store/formatting-store";

interface RichTextEditorProps {
  searchTerm?: string;
  currentSearchIndex?: number;
}

export function RichTextEditor({ searchTerm = '', currentSearchIndex = 0 }: RichTextEditorProps) {
  const { content, setContent, updateStats } = useEditorStore();
  const { fontSize, fontFamily, textColor } = useFormattingStore();
  const editorRef = useRef<HTMLDivElement>(null);
  const [lastContent, setLastContent] = useState(content);

  // Маппинг значений fontFamily к CSS font-family
  const getFontFamily = (family: string) => {
    const fontMap: Record<string, string> = {
      'system': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'arial': 'Arial, sans-serif',
      'helvetica': 'Helvetica, Arial, sans-serif',
      'times': 'Times, "Times New Roman", serif',
      'georgia': 'Georgia, serif',
      'courier': '"Courier New", Courier, monospace',
      'verdana': 'Verdana, sans-serif',
      'trebuchet': '"Trebuchet MS", sans-serif',
    };
    return fontMap[family] || fontMap.system;
  };

  // Сохранение позиции курсора
  const saveCaretPosition = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return null;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    const caretOffset = preCaretRange.toString().length;

    return caretOffset;
  }, []);

  // Восстановление позиции курсора
  const restoreCaretPosition = useCallback((caretOffset: number) => {
    if (!editorRef.current) return;

    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );

    let currentOffset = 0;
    let node;

    while ((node = walker.nextNode())) {
      const nodeLength = node.textContent?.length || 0;
      if (currentOffset + nodeLength >= caretOffset) {
        const range = document.createRange();
        const selection = window.getSelection();
        
        if (selection) {
          range.setStart(node, caretOffset - currentOffset);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        break;
      }
      currentOffset += nodeLength;
    }
  }, []);

  // Применение форматирования к выделенному тексту
  const applyFormatting = useCallback((formatType: 'bold' | 'italic' | 'underline') => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return; // Нет выделения

    // Используем execCommand для форматирования
    document.execCommand(formatType, false, '');
    
    // Обновляем контент
    const textContent = editorRef.current.innerText || '';
    setContent(textContent);
    updateStats(textContent);
  }, [setContent, updateStats]);

  // Подсветка поиска
  const highlightSearchTerms = useCallback(() => {
    if (!searchTerm || !editorRef.current) return;
    
    const caretPosition = saveCaretPosition();
    const textContent = editorRef.current.innerText;
    
    if (!textContent) return;

    // Удаляем предыдущие выделения
    const existingMarks = editorRef.current.querySelectorAll('mark');
    existingMarks.forEach(mark => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
        parent.normalize();
      }
    });

    // Находим совпадения
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const matches = [...textContent.matchAll(regex)];
    
    if (matches.length === 0) return;

    // Применяем выделение с конца, чтобы не сбивать индексы
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      const startIndex = match.index!;
      const endIndex = startIndex + match[0].length;
      
      const walker = document.createTreeWalker(
        editorRef.current,
        NodeFilter.SHOW_TEXT,
        null
      );

      let currentOffset = 0;
      let node;

      while ((node = walker.nextNode())) {
        const nodeLength = node.textContent?.length || 0;
        
        if (currentOffset <= startIndex && currentOffset + nodeLength > startIndex) {
          const range = document.createRange();
          const nodeStartIndex = startIndex - currentOffset;
          const nodeEndIndex = Math.min(nodeStartIndex + (endIndex - startIndex), nodeLength);
          
          if (nodeEndIndex > nodeStartIndex) {
            range.setStart(node, nodeStartIndex);
            range.setEnd(node, nodeEndIndex);
            
            const mark = document.createElement('mark');
            mark.className = i === currentSearchIndex 
              ? 'bg-accent text-accent-foreground ring-2 ring-accent' 
              : 'bg-yellow-200 text-yellow-900';
            
            try {
              range.surroundContents(mark);
            } catch {
              // Если не удается обернуть, пропускаем
            }
          }
          break;
        }
        currentOffset += nodeLength;
      }
    }

    // Восстанавливаем курсор
    if (caretPosition !== null) {
      setTimeout(() => restoreCaretPosition(caretPosition), 0);
    }

    // Прокручиваем к текущему совпадению
    const currentMark = editorRef.current.querySelector('.bg-accent');
    if (currentMark) {
      currentMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [searchTerm, currentSearchIndex, saveCaretPosition, restoreCaretPosition]);

  // Обработка ввода
  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    
    const textContent = editorRef.current.innerText || '';
    setContent(textContent);
    updateStats(textContent);
    setLastContent(textContent);
  }, [setContent, updateStats]);

  // Обработка вставки текста
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    
    // Вставляем как обычный текст
    document.execCommand('insertText', false, text);
  }, []);

  // Обработка клавиш
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Tab для отступа
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '    ');
      return;
    }

    // Ctrl+S для сохранения
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      const event = new CustomEvent('editor-save');
      window.dispatchEvent(event);
      return;
    }

    // Горячие клавиши для форматирования
    if (e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          applyFormatting('bold');
          break;
        case 'i':
          e.preventDefault();
          applyFormatting('italic');
          break;
        case 'u':
          e.preventDefault();
          applyFormatting('underline');
          break;
      }
    }
  }, [applyFormatting]);

  // Применение шрифта к выделенному тексту
  const applyFontFamily = useCallback((fontFamily: string) => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return; // Нет выделения

    // Создаем span с нужным шрифтом
    const span = document.createElement('span');
    span.style.fontFamily = fontFamily;
    
    try {
      const contents = range.extractContents();
      span.appendChild(contents);
      range.insertNode(span);
    } catch (error) {
      // Если не удается обернуть, используем execCommand
      document.execCommand('fontName', false, fontFamily);
    }
    
    // Обновляем контент
    const textContent = editorRef.current.innerText || '';
    setContent(textContent);
    updateStats(textContent);
  }, [setContent, updateStats]);

  // Применение размера шрифта к выделенному тексту
  const applyFontSize = useCallback((fontSize: string) => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      alert('Пожалуйста, выделите текст для изменения размера шрифта');
      return;
    }

    const range = selection.getRangeAt(0);
    if (range.collapsed) {
      alert('Пожалуйста, выделите текст для изменения размера шрифта');
      return;
    }

    const caretPosition = saveCaretPosition();

    // Создаем span с нужным размером
    const span = document.createElement('span');
    span.style.fontSize = fontSize;
    
    try {
      const contents = range.extractContents();
      span.appendChild(contents);
      range.insertNode(span);
      // Очищаем выделение
      selection.removeAllRanges();
      
    } catch (error) {
      console.error('Ошибка применения размера шрифта:', error);
      // Fallback: используем execCommand если поддерживается
      try {
        document.execCommand('fontSize', false, '7');
        // Затем корректируем размер
        const fontElements = editorRef.current.querySelectorAll('font[size="7"]');
        fontElements.forEach(el => {
          (el as HTMLElement).style.fontSize = fontSize;
          el.removeAttribute('size');
        });
      } catch (cmdError) {
        alert('Не удалось применить размер шрифта к выделенному тексту');
      }
    }
    
    // Обновляем контент
    const textContent = editorRef.current.innerText || '';
    setContent(textContent);
    updateStats(textContent);
    
    // Восстанавливаем позицию курсора
    setTimeout(() => {
      if (caretPosition) restoreCaretPosition(caretPosition);
    }, 10);
  }, [setContent, updateStats, saveCaretPosition, restoreCaretPosition]);

  // Экспорт методов форматирования для FormattingToolbar
  useEffect(() => {
    (window as any).editorFormatting = {
      applyBold: () => applyFormatting('bold'),
      applyItalic: () => applyFormatting('italic'),
      applyUnderline: () => applyFormatting('underline'),
      applyFontFamily: applyFontFamily,
      applyFontSize: applyFontSize,
    };
  }, [applyFormatting, applyFontFamily, applyFontSize]);

  // Инициализация контента только при первой загрузке
  useEffect(() => {
    if (editorRef.current && content !== lastContent && editorRef.current.innerText !== content) {
      editorRef.current.innerText = content;
      setLastContent(content);
    }
  }, [content, lastContent]);

  // Подсветка поиска при изменении параметров поиска
  useEffect(() => {
    highlightSearchTerms();
  }, [highlightSearchTerms]);

  return (
    <div className="flex-1 flex flex-col relative">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        className="flex-1 min-h-[500px] p-4 focus:outline-none rich-editor border-0 overflow-y-auto"
        style={{
          fontFamily: getFontFamily(fontFamily),
          fontSize: fontSize,
          lineHeight: '1.6',
          color: textColor,
        }}
        data-placeholder="Начните писать..."
      />
    </div>
  );
}