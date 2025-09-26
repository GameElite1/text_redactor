import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EditorState {
  content: string;
  fileName: string;
  isModified: boolean;
  wordCount: number;
  characterCount: number;
  
  // Actions
  setContent: (content: string) => void;
  setFileName: (fileName: string) => void;
  setModified: (modified: boolean) => void;
  updateStats: (content: string) => void;
  clearDocument: () => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      content: '',
      fileName: 'Новый документ.txt',
      isModified: false,
      wordCount: 0,
      characterCount: 0,

      setContent: (content: string) => {
        set({ content, isModified: true });
        get().updateStats(content);
      },

      setFileName: (fileName: string) => {
        set({ fileName });
      },

      setModified: (modified: boolean) => {
        set({ isModified: modified });
      },

      updateStats: (content: string) => {
        const characterCount = content.length;
        const wordCount = content.trim() === '' ? 0 : content.trim().split(/\s+/).length;
        set({ characterCount, wordCount });
      },

      clearDocument: () => {
        set({
          content: '',
          fileName: 'Новый документ.txt',
          isModified: false,
          wordCount: 0,
          characterCount: 0,
        });
      },
    }),
    {
      name: 'text-editor-storage',
      partialize: (state) => ({
        content: state.content,
        fileName: state.fileName,
        isModified: state.isModified,
      }),
    }
  )
);