import { ElectoralVoteRecord } from '../types';
import manausData from './manaus_data.json';

export const CANDIDATES = [
  { id: 'Ana Silva (10)', name: 'Ana Silva', partido: 'Partido 10', color: '#2563eb' },
  { id: 'Carlos Souza (15)', name: 'Carlos Souza', partido: 'Partido 15', color: '#dc2626' },
  { id: 'Mariana Lima (22)', name: 'Mariana Lima', partido: 'Partido 22', color: '#16a34a' },
  { id: 'Brancos / Nulos', name: 'Brancos / Nulos', partido: 'N/A', color: '#94a3b8' },
];

export function generateInitialDataset(): ElectoralVoteRecord[] {
  return manausData as ElectoralVoteRecord[];
}
