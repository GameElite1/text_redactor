import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Bold, 
  Italic, 
  Underline, 
  Type, 
  Palette,
  Highlighter
} from 'lucide-react';
import { useFormattingStore } from '@/store/formatting-store';

const FONT_FAMILIES = [
  { value: 'system', label: 'Системный шрифт', family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  { value: 'arial', label: 'Arial', family: 'Arial, sans-serif' },
  { value: 'helvetica', label: 'Helvetica', family: 'Helvetica, Arial, sans-serif' },
  { value: 'times', label: 'Times New Roman', family: 'Times, "Times New Roman", serif' },
  { value: 'georgia', label: 'Georgia', family: 'Georgia, serif' },
  { value: 'courier', label: 'Courier New', family: '"Courier New", Courier, monospace' },
  { value: 'verdana', label: 'Verdana', family: 'Verdana, sans-serif' },
  { value: 'trebuchet', label: 'Trebuchet MS', family: '"Trebuchet MS", sans-serif' },
];

const FONT_SIZES = [
  '10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'
];

const TEXT_COLORS = [
  '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
  '#FF0000', '#FF6600', '#FFCC00', '#00FF00', '#0066FF', '#6600FF',
  '#FF3366', '#FF9900', '#FFFF00', '#33FF66', '#0099FF', '#9933FF',
  '#CC0000', '#CC6600', '#999900', '#009900', '#0066CC', '#6600CC'
];

const HIGHLIGHT_COLORS = [
  'transparent', '#FFFF00', '#00FF00', '#00FFFF', '#FF00FF', '#FFB6C1', 
  '#FFA500', '#98FB98', '#87CEEB', '#DDA0DD', '#F0E68C', '#FFE4B5'
];

export function FormattingToolbar() {
  const { 
    fontSize, 
    fontFamily, 
    textColor, 
    backgroundColor,
    isBold, 
    isItalic, 
    isUnderline,
    setFontSize,
    setFontFamily,
    setTextColor,
    setBackgroundColor,
    toggleBold,
    toggleItalic,
    toggleUnderline
  } = useFormattingStore();

  const applyFormatting = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  return (
    <div className="border-b bg-background p-2 flex items-center gap-1 flex-wrap">
      {/* Font Family */}
      <Select value={fontFamily} onValueChange={setFontFamily}>
        <SelectTrigger className="w-[160px] h-8 text-xs">
          <SelectValue placeholder="Шрифт" />
        </SelectTrigger>
        <SelectContent>
          {FONT_FAMILIES.map((font) => (
            <SelectItem key={font.value} value={font.value}>
              <span style={{ fontFamily: font.family }}>{font.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Font Size */}
      <Select value={fontSize} onValueChange={setFontSize}>
        <SelectTrigger className="w-[70px] h-8 text-xs">
          <SelectValue placeholder="Размер" />
        </SelectTrigger>
        <SelectContent>
          {FONT_SIZES.map((size) => (
            <SelectItem key={size} value={size}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Text Formatting */}
      <Button
        variant="ghost"
        size="sm"
        className={`h-8 w-8 p-0 ${isBold ? 'bg-accent text-accent-foreground' : ''}`}
        onClick={() => {
          toggleBold();
          applyFormatting('bold');
        }}
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={`h-8 w-8 p-0 ${isItalic ? 'bg-accent text-accent-foreground' : ''}`}
        onClick={() => {
          toggleItalic();
          applyFormatting('italic');
        }}
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={`h-8 w-8 p-0 ${isUnderline ? 'bg-accent text-accent-foreground' : ''}`}
        onClick={() => {
          toggleUnderline();
          applyFormatting('underline');
        }}
      >
        <Underline className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Text Color */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <div className="relative">
              <Type className="h-4 w-4" />
              <div 
                className="absolute -bottom-1 left-0 right-0 h-1 rounded"
                style={{ backgroundColor: textColor }}
              />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="space-y-2">
            <p className="text-xs font-medium">Цвет текста</p>
            <div className="grid grid-cols-6 gap-1">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setTextColor(color);
                    applyFormatting('foreColor', color);
                  }}
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Background Color / Highlight */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <div className="relative">
              <Highlighter className="h-4 w-4" />
              <div 
                className="absolute -bottom-1 left-0 right-0 h-1 rounded"
                style={{ backgroundColor: backgroundColor === 'transparent' ? '#FFFF00' : backgroundColor }}
              />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="space-y-2">
            <p className="text-xs font-medium">Выделение текста</p>
            <div className="grid grid-cols-6 gap-1">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform relative"
                  style={{ 
                    backgroundColor: color === 'transparent' ? '#FFFFFF' : color,
                    backgroundImage: color === 'transparent' ? 
                      'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none',
                    backgroundSize: color === 'transparent' ? '4px 4px' : 'auto',
                    backgroundPosition: color === 'transparent' ? '0 0, 0 2px, 2px -2px, -2px 0px' : 'auto'
                  }}
                  onClick={() => {
                    setBackgroundColor(color);
                    applyFormatting('hiliteColor', color);
                  }}
                >
                  {color === 'transparent' && (
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-red-500">
                      ✕
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}