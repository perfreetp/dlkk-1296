import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProjectMaterial } from '@/types/material';

interface MaterialState {
  materials: ProjectMaterial[];
  
  addMaterial: (material: Omit<ProjectMaterial, 'id' | 'createdAt'>) => void;
  updateMaterial: (id: string, updates: Partial<ProjectMaterial>) => void;
  deleteMaterial: (id: string) => void;
  searchMaterials: (query: string) => ProjectMaterial[];
}

export const useMaterialStore = create<MaterialState>()(
  persist(
    (set, get) => ({
      materials: [],
      
      addMaterial: (material) => {
        const newMaterial: ProjectMaterial = {
          ...material,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        };
        
        set(state => ({ materials: [...state.materials, newMaterial] }));
      },
      
      updateMaterial: (id, updates) => {
        set(state => ({
          materials: state.materials.map(m =>
            m.id === id ? { ...m, ...updates } : m
          ),
        }));
      },
      
      deleteMaterial: (id) => {
        set(state => ({
          materials: state.materials.filter(m => m.id !== id),
        }));
      },
      
      searchMaterials: (query) => {
        const { materials } = get();
        if (!query.trim()) return materials;
        
        const lowerQuery = query.toLowerCase();
        return materials.filter(m =>
          m.title.toLowerCase().includes(lowerQuery) ||
          m.description.toLowerCase().includes(lowerQuery) ||
          m.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
          m.techStack.some(tech => tech.toLowerCase().includes(lowerQuery))
        );
      },
    }),
    {
      name: 'material-storage',
    }
  )
);
