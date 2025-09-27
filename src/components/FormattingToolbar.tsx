import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useFormattingStore } from "@/store/formatting-store";
import { Bold, Italic, Underline, Palette, Type } from "lucide-react";

interface FormattingToolbarProps {
  isOpen: boolean;
}

export function FormattingToolbar({ isOpen }: FormattingToolbarProps) {
  const { 
    fontSize, 
    fontFamily, 
    textColor, 
    setFontSize, 
    setFontFamily, 
    setTextColor 
  } = useFormattingStore();

  const fontFamilies = [
    { value: 'system', label: 'System Default' },
    { value: 'arial', label: 'Arial' },
    { value: 'helvetica', label: 'Helvetica' },
    { value: 'times', label: 'Times New Roman' },
    { value: 'georgia', label: 'Georgia' },
    { value: 'courier', label: 'Courier New' },
    { value: 'verdana', label: 'Verdana' },
    { value: 'trebuchet', label: 'Trebuchet MS' },
  ];

  const predefinedColors = [
    '#000000', '#333333', '#666666', '#999999',
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080'
  ];

  const handleBold = () => {
    const editorFormatting = (window as any).editorFormatting;
    if (editorFormatting?.applyBold) {
      editorFormatting.applyBold();
    }
  };

  const handleItalic = () => {
    const editorFormatting = (window as any).editorFormatting;
    if (editorFormatting?.applyItalic) {
      editorFormatting.applyItalic();
    }
  };

  const handleUnderline = () => {
    const editorFormatting = (window as any).editorFormatting;
    if (editorFormatting?.applyUnderline) {
      editorFormatting.applyUnderline();
    }
  };

  const handleColorChange = (color: string) => {
    setTextColor(color);
    
    // Применяем цвет к выделенному тексту
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.getRangeAt(0).collapsed) {
      document.execCommand('foreColor', false, color);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="border-b bg-muted/50 p-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* Выбор шрифта */}
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Шрифт:</Label>
          <Select value={fontFamily} onValueChange={setFontFamily}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontFamilies.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Размер шрифта */}
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Размер:</Label>
          <Input
            type="number"
            min="8"
            max="72"
            value={parseInt(fontSize)}
            onChange={(e) => setFontSize(`${e.target.value}px`)}
            className="w-16"
          />
        </div>

        {/* Кнопки форматирования */}
        <div className="flex items-center gap-1 border-l pl-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBold}
            className="hover:bg-accent"
            title="Жирный (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleItalic}
            className="hover:bg-accent"
            title="Курсив (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUnderline}
            className="hover:bg-accent"
            title="Подчеркнутый (Ctrl+U)"
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>

        {/* Цвет текста */}
        <div className="flex items-center gap-2 border-l pl-2">
          <Label className="text-sm font-medium">Цвет:</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-12 h-8 p-0">
                <div 
                  className="w-full h-full rounded border"
                  style={{ backgroundColor: textColor }}
                  title="Выбрать цвет"
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-3">
                <div className="grid grid-cols-6 gap-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded border-2 border-muted-foreground/20 hover:border-accent transition-colors"
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                      title={color}
                    />
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Свой цвет:</Label>
                  <Input
                    type="color"
                    value={textColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-12 h-8 p-0 border-0"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}