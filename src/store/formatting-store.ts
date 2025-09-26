import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FormattingState {
  fontSize: string;
  fontFamily: string;
  textColor: string;
  backgroundColor: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  
  // Actions
  setFontSize: (size: string) => void;
  setFontFamily: (family: string) => void;
  setTextColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
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
      isBold: false,
      isItalic: false,
      isUnderline: false,

      setFontSize: (size) => set({ fontSize: size }),
      setFontFamily: (family) => set({ fontFamily: family }),
      setTextColor: (color) => set({ textColor: color }),
      setBackgroundColor: (color) => set({ backgroundColor: color }),
      toggleBold: () => set((state) => ({ isBold: !state.isBold })),
      toggleItalic: () => set((state) => ({ isItalic: !state.isItalic })),
      toggleUnderline: () => set((state) => ({ isUnderline: !state.isUnderline })),
      resetFormatting: () => set({
        fontSize: '16px',
        fontFamily: 'system',
        textColor: '#000000',
        backgroundColor: 'transparent',
        isBold: false,
        isItalic: false,
        isUnderline: false,
      }),
    }),
    {
      name: 'formatting-settings',
    }
  )
);