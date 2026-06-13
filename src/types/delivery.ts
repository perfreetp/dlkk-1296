export type DeliveryStatus = 'pending' | 'interview' | 'offer' | 'rejected' | 'no-response';

export interface DeliveryRecord {
  id: string;
  companyName: string;
  position: string;
  deliveryDate: Date;
  status: DeliveryStatus;
  resumeVersionId: string;
  notes: string;
  updatedAt: Date;
}

export interface DeliveryStats {
  total: number;
  pending: number;
  interview: number;
  offer: number;
  rejected: number;
  conversionRate: number;
}
