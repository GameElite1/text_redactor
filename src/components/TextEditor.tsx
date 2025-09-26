import { useRef, useEffect } from "react";
import { useEditorStore } from "@/store/editor-store";
import { useFormattingStore } from "@/store/formatting-store";
import { Textarea } from "@/components/ui/textarea";

export function TextEditor() {
  const { content, setContent, updateStats } = useEditorStore();
  const { fontSize, fontFamily, textColor } = useFormattingStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    if (textareaRef.current) {
      // Auto-resize textarea based on content
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    updateStats(newContent);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle tab insertion
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newContent = content.substring(0, start) + '\t' + content.substring(end);
      setContent(newContent);
      
      // Set cursor position after tab
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 1;
        }
      }, 0);
    }

    // Handle Ctrl+S for save
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      // Trigger save functionality
      const event = new CustomEvent('editor-save');
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={handleContentChange}
        onKeyDown={handleKeyDown}
        placeholder="Начните писать..."
        className="flex-1 min-h-[500px] resize-none editor-content border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
        style={{
          fontFamily: getFontFamily(fontFamily),
          fontSize: fontSize,
          lineHeight: '1.6',
          color: textColor,
        }}
      />
    </div>
  );
}