import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Resume, ResumeVersion } from '@/types/resume';

interface ResumeState {
  currentResume: Resume | null;
  versions: ResumeVersion[];
  isAnalyzing: boolean;
  
  importResume: (resume: Resume | string) => void;
  updateSection: (section: string, data: any) => void;
  saveVersion: (name: string) => void;
  setDefaultResume: (versionId: string) => void;
  getDefaultResume: () => Resume | null;
  clearResume: () => void;
  setCurrentResume: (resume: Resume) => void;
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      currentResume: null,
      versions: [],
      isAnalyzing: false,
      
      importResume: (input: Resume | string) => {
        if (typeof input === 'string') {
          const { parseTextToResume } = require('@/utils/textParser');
          const resume = parseTextToResume(input);
          set({ currentResume: resume, isAnalyzing: false });
        } else {
          set({ currentResume: input, isAnalyzing: false });
        }
      },
      
      updateSection: (section: string, data: any) => {
        const { currentResume } = get();
        if (!currentResume) return;
        
        const updated = {
          ...currentResume,
          sections: {
            ...currentResume.sections,
            [section]: data,
          },
          updatedAt: new Date(),
        };
        
        set({ currentResume: updated });
      },
      
      saveVersion: (name: string) => {
        const { currentResume, versions } = get();
        if (!currentResume) return;
        
        const newVersion: ResumeVersion = {
          id: crypto.randomUUID(),
          resumeId: currentResume.id,
          name,
          createdAt: new Date(),
          resume: { ...currentResume, name },
        };
        
        set({ versions: [...versions, newVersion] });
      },
      
      setDefaultResume: (versionId: string) => {
        const { versions } = get();
        const version = versions.find(v => v.id === versionId);
        if (!version) return;
        
        set({
          currentResume: { ...version.resume, isDefault: true },
          versions: versions.map(v =>
            v.id === versionId
              ? { ...v, resume: { ...v.resume, isDefault: true } }
              : { ...v, resume: { ...v.resume, isDefault: false } }
          ),
        });
      },
      
      getDefaultResume: () => {
        const { versions } = get();
        return versions.find(v => v.resume.isDefault)?.resume || null;
      },
      
      clearResume: () => {
        set({ currentResume: null });
      },
      
      setCurrentResume: (resume: Resume) => {
        set({ currentResume: resume });
      },
    }),
    {
      name: 'resume-storage',
    }
  )
);
