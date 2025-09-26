import { useEditorStore } from "@/store/editor-store";

export function StatusBar() {
  const { wordCount, characterCount, isModified } = useEditorStore();

  return (
    <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30 text-sm text-muted-foreground">
      <div className="flex items-center gap-4">
        <span>Слов: {wordCount}</span>
        <span>Символов: {characterCount}</span>
        {isModified && (
          <span className="text-accent font-medium">Несохранено</span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span>UTF-8</span>
        <span>Строка 1, Столбец 1</span>
      </div>
    </div>
  );
}