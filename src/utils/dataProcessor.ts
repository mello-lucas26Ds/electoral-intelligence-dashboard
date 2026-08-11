import * as XLSX from 'xlsx';
import { ElectoralVoteRecord, FilterState, AxisOption, CellDetail, StrategicPoint } from '../types';
import { CANDIDATES } from '../data/mockElectoralData';

export const AXIS_OPTIONS: AxisOption[] = [
  { key: 'municipio', label: 'Município' },
  { key: 'zona', label: 'Zona Eleitoral' },
  { key: 'cargo', label: 'Cargo' },
  { key: 'partido', label: 'Partido' },
  { key: 'candidato', label: 'Candidato' },
  { key: 'situacao', label: 'Situação' },
];

const FALLBACK_COLORS = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea', '#db2777', '#0891b2', '#4f46e5', '#ea580c', '#65a30d', '#059669', '#475569'];

export function getCandidateColor(candidato: string): string {
  const found = CANDIDATES.find((c) => c.id === candidato || c.name === candidato);
  if (found) return found.color;
  
  const hash = Array.from(candidato).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
}

export function filterDataset(data: ElectoralVoteRecord[], filters: FilterState): ElectoralVoteRecord[] {
  const query = filters.searchQuery.trim().toLowerCase();

  return data.filter((item) => {
    // Universal Text Search
    if (query) {
      const matchText = [
        item.zona,
        item.municipio,
        item.cargo,
        item.partido,
        item.candidato,
        item.situacao,
        `zona ${item.zona}`,
      ]
        .join(' ')
        .toLowerCase();

      if (!matchText.includes(query)) return false;
    }

    if (filters.selectedZonas.length > 0 && !filters.selectedZonas.includes(item.zona)) return false;
    if (filters.selectedMunicipios.length > 0 && !filters.selectedMunicipios.includes(item.municipio)) return false;
    if (filters.selectedCargos.length > 0 && !filters.selectedCargos.includes(item.cargo)) return false;
    if (filters.selectedPartidos.length > 0 && !filters.selectedPartidos.includes(item.partido)) return false;
    if (filters.selectedCandidatos.length > 0 && !filters.selectedCandidatos.includes(item.candidato)) return false;
    if (filters.selectedSituacoes.length > 0 && !filters.selectedSituacoes.includes(item.situacao)) return false;
    if (filters.minVotos > 0 && item.votos < filters.minVotos) return false;

    return true;
  });
}

export interface MatrixResult {
  rowKeys: string[];
  colKeys: string[];
  matrix: Record<string, Record<string, CellDetail>>;
  maxVotes: number;
  minVotes: number;
  totalVotesAll: number;
}

export function build2DHeatmapMatrix(
  data: ElectoralVoteRecord[],
  rowAxisKey: keyof ElectoralVoteRecord,
  colAxisKey: keyof ElectoralVoteRecord,
  selectedCandidateFocus?: string
): MatrixResult {
  const rowSet = new Set<string>();
  const colSet = new Set<string>();

  // Map rowKey -> colKey -> list of records
  const cellMap: Record<string, Record<string, ElectoralVoteRecord[]>> = {};

  let totalVotesAll = 0;

  data.forEach((rec) => {
    const rowVal = String(rec[rowAxisKey] || 'N/A');
    const colVal = String(rec[colAxisKey] || 'N/A');

    rowSet.add(rowVal);
    colSet.add(colVal);

    if (!cellMap[rowVal]) cellMap[rowVal] = {};
    if (!cellMap[rowVal][colVal]) cellMap[rowVal][colVal] = [];

    cellMap[rowVal][colVal].push(rec);
    totalVotesAll += rec.votos;
  });

  const rowKeys = Array.from(rowSet).sort();
  const colKeys = Array.from(colSet).sort();

  const matrix: Record<string, Record<string, CellDetail>> = {};
  let maxVotes = 0;
  let minVotes = Infinity;

  const rowLabel = AXIS_OPTIONS.find((a) => a.key === rowAxisKey)?.label || String(rowAxisKey);
  const colLabel = AXIS_OPTIONS.find((a) => a.key === colAxisKey)?.label || String(colAxisKey);

  rowKeys.forEach((r) => {
    matrix[r] = {};
    colKeys.forEach((c) => {
      const records = cellMap[r]?.[c] || [];
      let totalVotos = 0;
      const breakdown: Record<string, number> = {};

      records.forEach((rec) => {
        totalVotos += rec.votos;
        breakdown[rec.candidato] = (breakdown[rec.candidato] || 0) + rec.votos;
      });

      // Find top candidate
      let topCand = 'Nenhum';
      let maxCandVotes = 0;
      Object.entries(breakdown).forEach(([cand, v]) => {
        if (v > maxCandVotes) {
          maxCandVotes = v;
          topCand = cand;
        }
      });

      // If candidate focus is set, value measured could be candidate's votes or share
      const effectiveVotes = selectedCandidateFocus
        ? breakdown[selectedCandidateFocus] || 0
        : totalVotos;

      if (effectiveVotes > maxVotes) maxVotes = effectiveVotes;
      if (effectiveVotes < minVotes) minVotes = effectiveVotes;

      matrix[r][c] = {
        rowVal: r,
        colVal: c,
        rowLabel,
        colLabel,
        totalVotos,
        candidatoBreakdown: breakdown,
        topCandidato: topCand,
        topCandidatoPercent: totalVotos > 0 ? (maxCandVotes / totalVotos) * 100 : 0,
        recordsCount: records.length,
      };
    });
  });

  if (minVotes === Infinity) minVotes = 0;

  return {
    rowKeys,
    colKeys,
    matrix,
    maxVotes,
    minVotes,
    totalVotesAll,
  };
}

export function generateStrategicPoints(data: ElectoralVoteRecord[]): StrategicPoint[] {
  const points: StrategicPoint[] = [];

  // Group by Candidate -> Zona (Location)
  const candZonaVotes: Record<string, Record<string, number>> = {};
  const zonaTotalVotes: Record<string, number> = {};
  const candTotals: Record<string, number> = {};

  data.forEach((r) => {
    candTotals[r.candidato] = (candTotals[r.candidato] || 0) + r.votos;
    const loc = `Zona ${r.zona} (${r.municipio})`;
    
    if (!candZonaVotes[r.candidato]) candZonaVotes[r.candidato] = {};
    candZonaVotes[r.candidato][loc] = (candZonaVotes[r.candidato][loc] || 0) + r.votos;
    zonaTotalVotes[loc] = (zonaTotalVotes[loc] || 0) + r.votos;
  });

  const candidateList = Object.keys(candTotals).filter((c) => !c.includes('Brancos') && !c.includes('Nulo') && c !== 'Indefinido');

  candidateList.forEach((cand) => {
    const zVotes = candZonaVotes[cand] || {};

    // Sort by % of votes for this candidate
    const locationStats = Object.entries(zVotes).map(([loc, v]) => ({
      location: loc,
      votos: v,
      total: zonaTotalVotes[loc] || 1,
      percent: (v / (zonaTotalVotes[loc] || 1)) * 100,
    }));

    // Strengths: Highest percentage
    const sortedByPercent = [...locationStats].sort((a, b) => b.percent - a.percent);
    
    // Opportunities: Medium percentage but high total zone volume
    // We filter out the top 3 strengths and bottom 3 weaknesses, then sort by total zone volume
    const strengthsCount = Math.min(3, sortedByPercent.length);
    const weaknessesCount = Math.min(3, Math.max(0, sortedByPercent.length - strengthsCount));
    
    const strengths = sortedByPercent.slice(0, strengthsCount);
    const weaknesses = sortedByPercent.slice(Math.max(0, sortedByPercent.length - weaknessesCount)).reverse();
    
    const remainingForOpp = sortedByPercent.filter(
      (s) => !strengths.includes(s) && !weaknesses.includes(s)
    );
    const opportunities = [...remainingForOpp].sort((a, b) => b.total - a.total).slice(0, 3);

    // Fallback if not enough locations to fill opportunities without overlap
    if (opportunities.length < 3) {
        const fallbackOpps = [...locationStats]
            .sort((a, b) => b.votos - a.votos)
            .filter(s => !strengths.includes(s) && !weaknesses.includes(s))
            .slice(0, 3 - opportunities.length);
        opportunities.push(...fallbackOpps);
    }

    strengths.forEach((st, idx) => {
      points.push({
        title: `Fortaleza ${idx + 1}`,
        candidato: cand,
        location: st.location,
        metric: `${st.percent.toFixed(1)}% dos votos`,
        description: `Local com forte dominância e alta aceitação.`,
        type: 'strength',
        votos: st.votos,
        percent: st.percent,
      });
    });

    weaknesses.forEach((wk, idx) => {
      points.push({
        title: `Dificuldade ${idx + 1}`,
        candidato: cand,
        location: wk.location,
        metric: `Apenas ${wk.percent.toFixed(1)}% dos votos`,
        description: `Região com menor penetração. Necessita reforço.`,
        type: 'weakness',
        votos: wk.votos,
        percent: wk.percent,
      });
    });

    opportunities.forEach((op, idx) => {
      points.push({
        title: `Alvo Estratégico ${idx + 1}`,
        candidato: cand,
        location: op.location,
        metric: `${op.percent.toFixed(1)}% (Vol: ${op.total})`,
        description: `Zona com bom volume total, ideal para converter indecisos.`,
        type: 'opportunity',
        votos: op.votos,
        percent: op.percent,
      });
    });
  });

  return points;
}

export function parseExcelFile(file: File): Promise<ElectoralVoteRecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (json.length === 0) {
          throw new Error('O arquivo selecionado está vazio.');
        }

        const records: ElectoralVoteRecord[] = json.map((row, idx) => {
          const getVal = (keys: string[]): string => {
            const rowKeys = Object.keys(row);
            for (const k of keys) {
              const exact = rowKeys.find(p => p === k);
              if (exact && row[exact] !== undefined && row[exact] !== null && row[exact] !== '') return String(row[exact]).trim();
              
              const matchingProp = rowKeys.find((p) => {
                const normP = p.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const normK = k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                return normP === normK || normP.includes(normK);
              });
              if (matchingProp && row[matchingProp] !== undefined && row[matchingProp] !== null && row[matchingProp] !== '') {
                return String(row[matchingProp]).trim();
              }
            }
            return '';
          };

          const zona = getVal(['NR_ZONA', 'zona', 'ze']) || '0';
          const municipio = getVal(['NM_MUNICIPIO', 'municipio', 'cidade']) || 'Indefinido';
          const cargo = getVal(['DS_CARGO', 'cargo']) || 'Indefinido';
          const partido = getVal(['SG_PARTIDO', 'partido', 'sigla']) || 'Indefinido';
          const candidato = getVal(['NM_URNA_CANDIDATO', 'NM_CANDIDATO', 'candidato', 'nome']) || 'Indefinido';
          const situacao = getVal(['DS_SIT_TOT_TURNO', 'situacao', 'status']) || 'Indefinido';
          
          const votosVal = getVal(['QT_VOTOS_NOMINAIS', 'votos', 'qtd']);
          const votos = parseInt(votosVal.replace(/\D/g, ''), 10) || 0;

          return {
            id: `IMP-${idx + 1}`,
            zona,
            municipio,
            cargo,
            partido,
            candidato,
            situacao,
            votos,
          };
        });

        resolve(records);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

export function exportToExcel(records: ElectoralVoteRecord[], filename = 'dados_eleitorais_export.xlsx') {
  const exportData = records.map((r) => ({
    'ID': r.id,
    'Zona Eleitoral': r.zona,
    'Município': r.municipio,
    'Cargo': r.cargo,
    'Partido': r.partido,
    'Candidato': r.candidato,
    'Situação': r.situacao,
    'Quantidade de Votos': r.votos,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultados Eleitorais');
  XLSX.writeFile(workbook, filename);
}

