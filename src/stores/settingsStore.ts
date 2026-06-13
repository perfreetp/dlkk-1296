import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  defaultResumeId: string | null;
  theme: 'light' | 'dark';
  autoSave: boolean;
  
  setDefaultResume: (id: string | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setAutoSave: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      defaultResumeId: null,
      theme: 'light',
      autoSave: true,
      
      setDefaultResume: (id) => {
        set({ defaultResumeId: id });
      },
      
      setTheme: (theme) => {
        set({ theme });
      },
      
      setAutoSave: (enabled) => {
        set({ autoSave: enabled });
      },
    }),
    {
      name: 'settings-storage',
    }
  )
);
