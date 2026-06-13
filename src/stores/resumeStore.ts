import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Resume, ResumeVersion } from '@/types/resume';

interface ResumeState {
  currentResume: Resume | null;
  versions: ResumeVersion[];
  isAnalyzing: boolean;
  
  importResume: (content: string) => void;
  updateSection: (section: string, data: any) => void;
  saveVersion: (name: string) => void;
  setDefaultResume: (versionId: string) => void;
  getDefaultResume: () => Resume | null;
  clearResume: () => void;
}

const createEmptyResume = (): Resume => ({
  id: crypto.randomUUID(),
  name: '新简历',
  isDefault: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  sections: {
    basic: {
      name: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
    },
    education: [],
    experience: [],
    projects: [],
    skills: [],
  },
});

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      currentResume: null,
      versions: [],
      isAnalyzing: false,
      
      importResume: (content: string) => {
        const resume = createEmptyResume();
        const lines = content.split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
          const lowerLine = line.toLowerCase();
          
          if (lowerLine.includes('邮箱') || lowerLine.includes('email')) {
            const match = line.match(/[\w.-]+@[\w.-]+\.\w+/);
            if (match) resume.sections.basic.email = match[0];
          }
          
          if (lowerLine.includes('电话') || lowerLine.includes('手机')) {
            const match = line.match(/1[3-9]\d{9}/);
            if (match) resume.sections.basic.phone = match[0];
          }
          
          if (lowerLine.includes('姓名') || /^[A-Z\u4e00-\u9fa5]{2,4}$/.test(line.trim())) {
            if (!resume.sections.basic.name && /^[A-Z\u4e00-\u9fa5]{2,4}$/.test(line.trim())) {
              resume.sections.basic.name = line.trim();
            }
          }
        });
        
        set({ currentResume: resume, isAnalyzing: false });
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
        const { versions, currentResume } = get();
        const version = versions.find(v => v.id === versionId);
        if (!version) return;
        
        const updatedVersion = {
          ...version.resume,
          isDefault: true,
        };
        
        set({
          currentResume: updatedVersion,
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
    }),
    {
      name: 'resume-storage',
    }
  )
);
