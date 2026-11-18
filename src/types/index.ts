export type ReportCategory = 'TRAVADO' | 'TRANSVERSAL_VAZIA' | 'BLOQUEANDO_EMERGENCIA';

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export interface ActiveReport {
  id: string;
  category: ReportCategory;
  latitude: number;
  longitude: number;
  created_at: string;
  intensity: number;
}