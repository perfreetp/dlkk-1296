import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DeliveryRecord, DeliveryStats } from '@/types/delivery';

interface DeliveryState {
  records: DeliveryRecord[];
  
  addRecord: (record: Omit<DeliveryRecord, 'id' | 'updatedAt'>) => void;
  updateRecord: (id: string, updates: Partial<DeliveryRecord>) => void;
  deleteRecord: (id: string) => void;
  getStats: () => DeliveryStats;
}

export const useDeliveryStore = create<DeliveryState>()(
  persist(
    (set, get) => ({
      records: [],
      
      addRecord: (record) => {
        const newRecord: DeliveryRecord = {
          ...record,
          id: crypto.randomUUID(),
          updatedAt: new Date(),
        };
        
        set(state => ({ records: [...state.records, newRecord] }));
      },
      
      updateRecord: (id, updates) => {
        set(state => ({
          records: state.records.map(r =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
          ),
        }));
      },
      
      deleteRecord: (id) => {
        set(state => ({
          records: state.records.filter(r => r.id !== id),
        }));
      },
      
      getStats: () => {
        const { records } = get();
        const total = records.length;
        const pending = records.filter(r => r.status === 'pending').length;
        const interview = records.filter(r => r.status === 'interview').length;
        const offer = records.filter(r => r.status === 'offer').length;
        const rejected = records.filter(r => r.status === 'rejected').length;
        
        const conversionRate = total > 0 ? (interview / total) * 100 : 0;
        
        return { total, pending, interview, offer, rejected, conversionRate };
      },
    }),
    {
      name: 'delivery-storage',
    }
  )
);
