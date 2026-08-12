export interface ElectoralVoteRecord {
  id: string;
  zona: string;
  municipio: string;
  cargo: string;
  partido: string;
  candidato: string;
  situacao: string;
  votos: number;
}

export interface FilterState {
  searchQuery: string;
  selectedZonas: string[];
  selectedMunicipios: string[];
  selectedCargos: string[];
  selectedPartidos: string[];
  selectedCandidatos: string[];
  selectedSituacoes: string[];
  minVotos: number;
}

export type ViewTab = 'heatmap2d' | 'territory' | 'strategic' | 'datatable';

export interface AxisOption {
  key: 'zona' | 'municipio' | 'cargo' | 'partido' | 'candidato' | 'situacao';
  label: string;
}

export interface CellDetail {
  rowVal: string;
  colVal: string;
  rowLabel: string;
  colLabel: string;
  totalVotos: number;
  candidatoBreakdown: Record<string, number>;
  topCandidato: string;
  topCandidatoPercent: number;
  recordsCount: number;
}

export interface ColumnMapping {
  zona: string;
  municipio: string;
  cargo: string;
  partido: string;
  candidato: string;
  situacao: string;
  votos: string;
}

export interface StrategicPoint {
  title: string;
  candidato: string;
  location: string;
  metric: string;
  description: string;
  type: 'strength' | 'weakness' | 'opportunity' | 'threat';
  votos: number;
  percent: number;
}

export interface CandidateMetrics {
  name: string;
  votes: number;
  share: number;
}

export interface PartyMetrics {
  party: string;
  votes: number;
  share: number;
}

export interface KpiSummary {
  totalRegistros: number;
  totalVotos: number;
  totalZonas: number;
  totalPartidos: number;
  totalCandidatos: number;
  topCandidatos: CandidateMetrics[];
  topPartidos: PartyMetrics[];
  generatedAt?: string;
}

export interface ServiceResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  executionTimeMs: number;
}
