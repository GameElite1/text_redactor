import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FormattingState {
  fontSize: string;
  fontFamily: string;
  textColor: string;
  backgroundColor: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  
  // Actions
  setFontSize: (size: string) => void;
  setFontFamily: (family: string) => void;
  setTextColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  setBold: (bold: boolean) => void;
  setItalic: (italic: boolean) => void;
  setUnderline: (underline: boolean) => void;
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleUnderline: () => void;
  resetFormatting: () => void;
}

export const useFormattingStore = create<FormattingState>()(
  persist(
    (set) => ({
      fontSize: '16px',
      fontFamily: 'system',
      textColor: '#000000',
      backgroundColor: 'transparent',
      bold: false,
      italic: false,
      underline: false,

      setFontSize: (size) => set({ fontSize: size }),
      setFontFamily: (family) => set({ fontFamily: family }),
      setTextColor: (color) => set({ textColor: color }),
      setBackgroundColor: (color) => set({ backgroundColor: color }),
      setBold: (bold) => set({ bold }),
      setItalic: (italic) => set({ italic }),
      setUnderline: (underline) => set({ underline }),
      toggleBold: () => set((state) => ({ bold: !state.bold })),
      toggleItalic: () => set((state) => ({ italic: !state.italic })),
      toggleUnderline: () => set((state) => ({ underline: !state.underline })),
      resetFormatting: () => set({
        fontSize: '16px',
        fontFamily: 'system',
        textColor: '#000000',
        backgroundColor: 'transparent',
        bold: false,
        italic: false,
        underline: false,
      }),
    }),
    {
      name: 'formatting-settings',
    }
  )
);