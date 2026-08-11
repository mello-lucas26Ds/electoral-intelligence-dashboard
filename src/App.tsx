import React, { useState, useMemo, useEffect } from 'react';
import {
  Layers,
  Map,
  Sparkles,
  Users,
  Table,
  RotateCcw,
  X,
  Filter,
  BarChart2,
  TrendingUp,
  MapPin,
  HelpCircle,
} from 'lucide-react';
import { ElectoralVoteRecord, FilterState, ViewTab, CellDetail } from './types';
import { generateInitialDataset } from './data/mockElectoralData';
import { exportToExcel } from './utils/dataProcessor';
import { electoralDataService } from './services/electoralDataService';

import { HeaderNav } from './components/HeaderNav';
import { SearchBar } from './components/SearchBar';
import { FilterPanel } from './components/FilterPanel';
import { KpiCardsSection } from './components/KpiCardsSection';
import { Heatmap2DView } from './components/Heatmap2DView';
import { TerritoryMapView } from './components/TerritoryMapView';
import { StrategicMatrixView } from './components/StrategicMatrixView';
import { DataTableVIew } from './components/DataTableVIew';
import { FileUploadModal } from './components/FileUploadModal';
import { CellDetailModal } from './components/CellDetailModal';

export default function App() {
  // Dataset state
  const [rawDataset, setRawDataset] = useState<ElectoralVoteRecord[]>([]);
  const [isCustomDataset, setIsCustomDataset] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Service KPI Summary
  const kpiSummary = useMemo(() => {
    return electoralDataService.getKpiSummary().data;
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('electoral_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRawDataset(parsed);
          setIsCustomDataset(true);
        } else {
          setRawDataset(electoralDataService.getFullDataset().data);
        }
      } catch (e) {
        setRawDataset(electoralDataService.getFullDataset().data);
      }
    } else {
      setRawDataset(electoralDataService.getFullDataset().data);
    }
    setIsDataLoaded(true);
  }, []);

  // Save to localStorage when dataset changes and it is custom
  useEffect(() => {
    if (isDataLoaded && isCustomDataset && rawDataset.length > 0) {
      localStorage.setItem('electoral_data', JSON.stringify(rawDataset));
    }
  }, [rawDataset, isCustomDataset, isDataLoaded]);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<ViewTab>('heatmap2d');

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedZonas: [],
    selectedMunicipios: [],
    selectedCargos: [],
    selectedPartidos: [],
    selectedCandidatos: [],
    selectedSituacoes: [],
    minVotos: 0,
  });

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedCellDetail, setSelectedCellDetail] = useState<CellDetail | null>(null);

  // Extract available distinct fields for filter pickers
  const availableZonas = useMemo(() => {
    return Array.from(new Set(rawDataset.map((d) => d.zona))).sort();
  }, [rawDataset]);

  const availableMunicipios = useMemo(() => {
    return Array.from(new Set(rawDataset.map((d) => d.municipio))).sort();
  }, [rawDataset]);

  const availableCargos = useMemo(() => {
    return Array.from(new Set(rawDataset.map((d) => d.cargo))).sort();
  }, [rawDataset]);

  const availablePartidos = useMemo(() => {
    return Array.from(new Set(rawDataset.map((d) => d.partido))).sort();
  }, [rawDataset]);

  const availableCandidatos = useMemo(() => {
    return Array.from(new Set(rawDataset.map((d) => d.candidato))).sort();
  }, [rawDataset]);

  const availableSituacoes = useMemo(() => {
    return Array.from(new Set(rawDataset.map((d) => d.situacao))).sort();
  }, [rawDataset]);

  // Filtered dataset via ElectoralDataService with latency tracking
  const filterResponse = useMemo(() => {
    if (!isCustomDataset) {
      return electoralDataService.filterData(filters);
    }
    const start = performance.now();
    const filtered = rawDataset.filter((r) => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesQuery =
          r.candidato.toLowerCase().includes(query) ||
          r.partido.toLowerCase().includes(query) ||
          r.municipio.toLowerCase().includes(query) ||
          r.cargo.toLowerCase().includes(query) ||
          r.zona.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }
      if (filters.selectedZonas.length > 0 && !filters.selectedZonas.includes(r.zona)) return false;
      if (filters.selectedMunicipios.length > 0 && !filters.selectedMunicipios.includes(r.municipio)) return false;
      if (filters.selectedCargos.length > 0 && !filters.selectedCargos.includes(r.cargo)) return false;
      if (filters.selectedPartidos.length > 0 && !filters.selectedPartidos.includes(r.partido)) return false;
      if (filters.selectedCandidatos.length > 0 && !filters.selectedCandidatos.includes(r.candidato)) return false;
      if (filters.selectedSituacoes.length > 0 && !filters.selectedSituacoes.includes(r.situacao)) return false;
      if (filters.minVotos > 0 && r.votos < filters.minVotos) return false;
      return true;
    });
    return {
      success: true,
      data: filtered,
      executionTimeMs: performance.now() - start,
    };
  }, [rawDataset, filters, isCustomDataset]);

  const filteredRecords = filterResponse.data;
  const executionTimeMs = filterResponse.executionTimeMs;

  const totalFilteredVotes = useMemo(() => {
    return filteredRecords.reduce((acc, curr) => acc + curr.votos, 0);
  }, [filteredRecords]);

  // Top candidate in current filter
  const topCandidateFiltered = useMemo(() => {
    if (filteredRecords.length === 0) return undefined;
    const candMap: Record<string, number> = {};
    filteredRecords.forEach((r) => {
      candMap[r.candidato] = (candMap[r.candidato] || 0) + r.votos;
    });
    const sorted = Object.entries(candMap).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return undefined;
    const [name, votes] = sorted[0];
    const share = totalFilteredVotes > 0 ? (votes / totalFilteredVotes) * 100 : 0;
    return { name, votes, share };
  }, [filteredRecords, totalFilteredVotes]);

  // Handlers
  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      selectedZonas: [],
      selectedMunicipios: [],
      selectedCargos: [],
      selectedPartidos: [],
      selectedCandidatos: [],
      selectedSituacoes: [],
      minVotos: 0,
    });
  };

  const handleDataLoaded = (newRecords: ElectoralVoteRecord[]) => {
    setRawDataset(newRecords);
    setIsCustomDataset(true);
    handleResetFilters();
  };

  const handleResetToSample = () => {
    setRawDataset(generateInitialDataset());
    setIsCustomDataset(false);
    handleResetFilters();
  };

  const handleExport = () => {
    exportToExcel(filteredRecords, 'resultado_eleitoral_filtrado.xlsx');
  };

  const handleFilterByValue = (axisKey: string, value: string) => {
    if (axisKey === 'zona') {
      setFilters((prev) => ({ ...prev, selectedZonas: [value] }));
    } else if (axisKey === 'municipio') {
      setFilters((prev) => ({ ...prev, selectedMunicipios: [value] }));
    } else if (axisKey === 'cargo') {
      setFilters((prev) => ({ ...prev, selectedCargos: [value] }));
    } else if (axisKey === 'partido') {
      setFilters((prev) => ({ ...prev, selectedPartidos: [value] }));
    } else if (axisKey === 'candidato') {
      setFilters((prev) => ({ ...prev, selectedCandidatos: [value] }));
    } else if (axisKey === 'situacao') {
      setFilters((prev) => ({ ...prev, selectedSituacoes: [value] }));
    } else {
      setFilters((prev) => ({ ...prev, searchQuery: value }));
    }
  };

  const handleFilterByRowAndCol = (rowVal: string, colVal: string) => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: `${rowVal} ${colVal}`,
    }));
  };

  // Check if any filter active
  const hasActiveFilters =
    filters.selectedZonas.length > 0 ||
    filters.selectedMunicipios.length > 0 ||
    filters.selectedCargos.length > 0 ||
    filters.selectedPartidos.length > 0 ||
    filters.selectedSituacoes.length > 0 ||
    filters.selectedCandidatos.length > 0 ||
    filters.searchQuery.length > 0;

  return (
    <div id="app-container" className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col antialiased">
      {/* Header */}
      <HeaderNav
        totalRecords={rawDataset.length}
        filteredRecordsCount={filteredRecords.length}
        totalVotes={totalFilteredVotes}
        onOpenUpload={() => setIsUploadOpen(true)}
        onExport={handleExport}
        onResetDataset={handleResetToSample}
        isCustomDataset={isCustomDataset}
      />

      {/* Universal Search Bar */}
      <SearchBar
        value={filters.searchQuery}
        onChange={(val) => setFilters((prev) => ({ ...prev, searchQuery: val }))}
        onClear={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
      />

      {/* Active Filter Pills Bar */}
      {hasActiveFilters && (
        <div id="active-filter-pills" className="bg-indigo-950 text-indigo-100 py-2 px-4 sm:px-6 border-b border-indigo-900 text-xs flex flex-wrap items-center gap-2">
          <span className="font-bold flex items-center space-x-1 text-indigo-300">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Filtros Ativos:</span>
          </span>

          {filters.searchQuery && (
            <span className="bg-indigo-800/80 text-white px-2.5 py-0.5 rounded-full flex items-center space-x-1 border border-indigo-700">
              <span>Busca: "{filters.searchQuery}"</span>
              <button
                onClick={() => setFilters((p) => ({ ...p, searchQuery: '' }))}
                className="hover:text-rose-300 ml-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.selectedCandidatos.map((c) => (
            <span key={c} className="bg-indigo-800/80 text-white px-2.5 py-0.5 rounded-full flex items-center space-x-1 border border-indigo-700">
              <span>{c}</span>
              <button
                onClick={() =>
                  setFilters((p) => ({
                    ...p,
                    selectedCandidatos: p.selectedCandidatos.filter((x) => x !== c),
                  }))
                }
                className="hover:text-rose-300 ml-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {filters.selectedZonas.map((z) => (
            <span key={z} className="bg-indigo-800/80 text-white px-2.5 py-0.5 rounded-full flex items-center space-x-1 border border-indigo-700">
              <span>Zona: {z}</span>
              <button
                onClick={() =>
                  setFilters((p) => ({
                    ...p,
                    selectedZonas: p.selectedZonas.filter((x) => x !== z),
                  }))
                }
                className="hover:text-rose-300 ml-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {filters.selectedMunicipios.map((b) => (
            <span key={b} className="bg-indigo-800/80 text-white px-2.5 py-0.5 rounded-full flex items-center space-x-1 border border-indigo-700">
              <span>Mun: {b}</span>
              <button
                onClick={() =>
                  setFilters((p) => ({
                    ...p,
                    selectedMunicipios: p.selectedMunicipios.filter((x) => x !== b),
                  }))
                }
                className="hover:text-rose-300 ml-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {filters.selectedPartidos.map((fe) => (
            <span key={fe} className="bg-indigo-800/80 text-white px-2.5 py-0.5 rounded-full flex items-center space-x-1 border border-indigo-700">
              <span>Partido: {fe}</span>
              <button
                onClick={() =>
                  setFilters((p) => ({
                    ...p,
                    selectedPartidos: p.selectedPartidos.filter((x) => x !== fe),
                  }))
                }
                className="hover:text-rose-300 ml-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <button
            onClick={handleResetFilters}
            className="text-indigo-300 hover:text-white underline font-semibold ml-auto flex items-center space-x-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Resetar Todos</span>
          </button>
        </div>
      )}

      {/* Main View Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center space-x-1 sm:space-x-4 overflow-x-auto scrollbar-none py-2 text-xs font-semibold">
          <button
            id="tab-heatmap2d"
            onClick={() => setActiveTab('heatmap2d')}
            className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'heatmap2d'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Mapa de Calor 2D</span>
          </button>

          <button
            id="tab-territory"
            onClick={() => setActiveTab('territory')}
            className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'territory'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Visão Territorial (Zonas/Bairros)</span>
          </button>

          <button
            id="tab-strategic"
            onClick={() => setActiveTab('strategic')}
            className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'strategic'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Diagnóstico Estratégico</span>
          </button>

          <button
            id="tab-datatable"
            onClick={() => setActiveTab('datatable')}
            className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'datatable'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Tabela de Dados ({filteredRecords.length})</span>
          </button>
        </div>
      </div>

      {/* App Body (Sidebar Filter + Main View Content) */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
        {/* Left Filter Sidebar */}
        <FilterPanel
          filters={filters}
          availableZonas={availableZonas}
          availableMunicipios={availableMunicipios}
          availableCargos={availableCargos}
          availablePartidos={availablePartidos}
          availableCandidatos={availableCandidatos}
          availableSituacoes={availableSituacoes}
          onChange={setFilters}
          onReset={handleResetFilters}
          isOpen={isFilterPanelOpen}
          onToggleOpen={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
        />

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          {/* Executive KPI Bar */}
          <KpiCardsSection
            totalFilteredVotes={totalFilteredVotes}
            filteredRecordsCount={filteredRecords.length}
            totalRecordsCount={rawDataset.length}
            kpiSummary={kpiSummary}
            executionTimeMs={executionTimeMs}
            topCandidateFiltered={topCandidateFiltered}
          />

          {activeTab === 'heatmap2d' && (
            <Heatmap2DView
              data={filteredRecords}
              onSelectCell={(cell) => setSelectedCellDetail(cell)}
              onFilterByValue={handleFilterByValue}
              availableCandidatos={availableCandidatos}
            />
          )}

          {activeTab === 'territory' && (
            <TerritoryMapView
              data={filteredRecords}
              onSelectMunicipio={(municipio) => {
                setFilters((prev) => ({ ...prev, selectedMunicipios: [municipio] }));
                setActiveTab('heatmap2d');
              }}
              onSelectZona={(zona) => {
                setFilters((prev) => ({ ...prev, selectedZonas: [zona] }));
                setActiveTab('heatmap2d');
              }}
            />
          )}

          {activeTab === 'strategic' && (
            <StrategicMatrixView
              data={filteredRecords}
              onSelectCandidateFilter={(cand) =>
                setFilters((prev) => ({ ...prev, selectedCandidatos: [cand] }))
              }
              onSelectLocationFilter={(loc) => setFilters((prev) => ({ ...prev, searchQuery: loc }))}
              availableCandidatos={availableCandidatos}
            />
          )}

          {activeTab === 'datatable' && (
            <DataTableVIew data={filteredRecords} onExport={handleExport} />
          )}
        </main>
      </div>

      {/* Modals */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataLoaded={handleDataLoaded}
      />

      <CellDetailModal
        cell={selectedCellDetail}
        onClose={() => setSelectedCellDetail(null)}
        onFilterByRowAndCol={handleFilterByRowAndCol}
      />
    </div>
  );
}
