import { ElectoralVoteRecord, FilterState, KpiSummary, ServiceResponse } from '../types';
import processedData from '../data/processed/electoral_processed.json';
import kpiSummaryData from '../data/processed/kpis_summary.json';
import { filterDataset } from '../utils/dataProcessor';

export class ElectoralDataService {
  private static instance: ElectoralDataService;
  private dataset: ElectoralVoteRecord[];
  private kpiSummary: KpiSummary;

  private constructor() {
    this.dataset = this.validateDataset(processedData as ElectoralVoteRecord[]);
    this.kpiSummary = kpiSummaryData as KpiSummary;
  }

  public static getInstance(): ElectoralDataService {
    if (!ElectoralDataService.instance) {
      ElectoralDataService.instance = new ElectoralDataService();
    }
    return ElectoralDataService.instance;
  }

  /**
   * Validates input schema to ensure high reliability and zero runtime exceptions.
   */
  private validateDataset(data: ElectoralVoteRecord[]): ElectoralVoteRecord[] {
    if (!Array.isArray(data)) {
      console.warn('⚠️ ElectoralDataService: Invalid data format, defaulting to empty array.');
      return [];
    }

    return data.map((item, index) => ({
      id: item.id || `REC-${index}`,
      zona: String(item.zona || '00'),
      municipio: String(item.municipio || 'MANAUS'),
      cargo: String(item.cargo || 'N/A'),
      partido: String(item.partido || 'N/A'),
      candidato: String(item.candidato || 'DESCONHECIDO'),
      situacao: String(item.situacao || 'APTO'),
      votos: typeof item.votos === 'number' && !isNaN(item.votos) ? item.votos : 0,
    }));
  }

  /**
   * Retrieves full dataset from Gold layer.
   */
  public getFullDataset(): ServiceResponse<ElectoralVoteRecord[]> {
    const start = performance.now();
    try {
      return {
        success: true,
        data: this.dataset,
        executionTimeMs: performance.now() - start,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown data retrieval error',
        executionTimeMs: performance.now() - start,
      };
    }
  }

  /**
   * Retrieves pre-computed Medallion KPIs.
   */
  public getKpiSummary(): ServiceResponse<KpiSummary> {
    const start = performance.now();
    try {
      return {
        success: true,
        data: this.kpiSummary,
        executionTimeMs: performance.now() - start,
      };
    } catch (error) {
      return {
        success: false,
        data: {
          totalRegistros: 0,
          totalVotos: 0,
          totalZonas: 0,
          totalPartidos: 0,
          totalCandidatos: 0,
          topCandidatos: [],
          topPartidos: [],
        },
        error: error instanceof Error ? error.message : 'Unknown KPI error',
        executionTimeMs: performance.now() - start,
      };
    }
  }

  /**
   * Filters dataset based on criteria with execution performance logging.
   */
  public filterData(filters: FilterState): ServiceResponse<ElectoralVoteRecord[]> {
    const start = performance.now();
    try {
      const filtered = filterDataset(this.dataset, filters);
      return {
        success: true,
        data: filtered,
        executionTimeMs: performance.now() - start,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Filter computation failed',
        executionTimeMs: performance.now() - start,
      };
    }
  }
}

export const electoralDataService = ElectoralDataService.getInstance();
