import React, { useState } from 'react';
import { Filter, RotateCcw, ChevronDown, Check, UserCheck, MapPin, Users, DollarSign, Search } from 'lucide-react';
import { FilterState } from '../types';
import { getCandidateColor } from '../utils/dataProcessor';

interface FilterPanelProps {
  filters: FilterState;
  availableZonas: string[];
  availableMunicipios: string[];
  availableCargos: string[];
  availablePartidos: string[];
  availableCandidatos: string[];
  availableSituacoes: string[];
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  availableZonas,
  availableMunicipios,
  availableCargos,
  availablePartidos,
  availableCandidatos,
  availableSituacoes,
  onChange,
  onReset,
  isOpen,
  onToggleOpen,
}) => {
  const [candSearch, setCandSearch] = useState('');
  const [munSearch, setMunSearch] = useState('');

  const activeFiltersCount =
    filters.selectedZonas.length +
    filters.selectedMunicipios.length +
    filters.selectedCargos.length +
    filters.selectedPartidos.length +
    filters.selectedSituacoes.length +
    filters.selectedCandidatos.length +
    (filters.searchQuery ? 1 : 0);

  const toggleArrayItem = (currentList: string[], item: string) => {
    return currentList.includes(item)
      ? currentList.filter((x) => x !== item)
      : [...currentList, item];
  };

  const filteredCandidatos = availableCandidatos.filter((c) => c.toLowerCase().includes(candSearch.toLowerCase()));
  const filteredMunicipios = availableMunicipios.filter((m) => m.toLowerCase().includes(munSearch.toLowerCase()));

  return (
    <div id="filter-panel" className="bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-4 shrink-0 lg:w-72">
      {/* Header Mobile / Desktop */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span className="font-bold text-slate-800 text-sm tracking-tight">Filtros Eleitorais</span>
          {activeFiltersCount > 0 && (
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <button
              id="btn-reset-filters"
              onClick={onReset}
              className="text-xs text-slate-500 hover:text-indigo-600 flex items-center space-x-1 font-medium cursor-pointer"
              title="Limpar todos os filtros"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpar</span>
            </button>
          )}

          <button
            id="btn-toggle-filter-panel"
            onClick={onToggleOpen}
            className="lg:hidden text-slate-500 hover:text-slate-800 p-1 rounded-md"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Body */}
      <div className={`space-y-5 ${isOpen ? 'block' : 'hidden lg:block'}`}>
        {/* Candidate Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span className="flex items-center space-x-1.5"><UserCheck className="w-3.5 h-3.5 text-indigo-500" /><span>Candidatos</span></span>
          </label>
          <div className="relative mb-2">
            <Search className="w-3 h-3 absolute left-2 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar candidato..."
              value={candSearch}
              onChange={(e) => setCandSearch(e.target.value)}
              className="w-full text-xs pl-7 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin pr-1">
            {filteredCandidatos.map((cand) => {
              const isSelected = filters.selectedCandidatos.includes(cand);
              const color = getCandidateColor(cand);
              return (
                <button
                  key={cand}
                  onClick={() =>
                    onChange({
                      ...filters,
                      selectedCandidatos: toggleArrayItem(filters.selectedCandidatos, cand),
                    })
                  }
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between cursor-pointer border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="truncate">{cand}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Zona Eleitoral Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
            <span>Zona Eleitoral</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {availableZonas.map((zona) => {
              const isSelected = filters.selectedZonas.includes(zona);
              return (
                <button
                  key={zona}
                  onClick={() =>
                    onChange({
                      ...filters,
                      selectedZonas: toggleArrayItem(filters.selectedZonas, zona),
                    })
                  }
                  className={`px-2 py-1.5 rounded-md text-xs font-medium text-center transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {zona}
                </button>
              );
            })}
          </div>
        </div>

        {/* Municipios Filter */}
        {availableMunicipios.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Município ({filters.selectedMunicipios.length > 0 ? filters.selectedMunicipios.length : 'Todos'})
            </label>
            <div className="relative mb-2">
              <Search className="w-3 h-3 absolute left-2 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar município..."
                value={munSearch}
                onChange={(e) => setMunSearch(e.target.value)}
                className="w-full text-xs pl-7 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="max-h-36 overflow-y-auto pr-1 space-y-1 scrollbar-thin">
              {filteredMunicipios.map((municipio) => {
                const isSelected = filters.selectedMunicipios.includes(municipio);
                return (
                  <button
                    key={municipio}
                    onClick={() =>
                      onChange({
                        ...filters,
                        selectedMunicipios: toggleArrayItem(filters.selectedMunicipios, municipio),
                      })
                    }
                    className={`w-full text-left px-2 py-1 rounded text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">{municipio}</span>
                    {isSelected && <Check className="w-3 h-3 text-indigo-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Cargo Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span>Cargo</span>
          </label>
          <div className="flex flex-wrap gap-1">
            {availableCargos.map((cargo) => {
              const isSelected = filters.selectedCargos.includes(cargo);
              return (
                <button
                  key={cargo}
                  onClick={() =>
                    onChange({
                      ...filters,
                      selectedCargos: toggleArrayItem(filters.selectedCargos, cargo),
                    })
                  }
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {cargo}
                </button>
              );
            })}
          </div>
        </div>

        {/* Partido Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Partido
          </label>
          <div className="flex flex-wrap gap-1">
            {availablePartidos.map((partido) => {
              const isSelected = filters.selectedPartidos.includes(partido);
              return (
                <button
                  key={partido}
                  onClick={() =>
                    onChange({
                      ...filters,
                      selectedPartidos: toggleArrayItem(filters.selectedPartidos, partido),
                    })
                  }
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {partido}
                </button>
              );
            })}
          </div>
        </div>

        {/* Situação Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <Check className="w-3.5 h-3.5 text-indigo-500" />
            <span>Situação</span>
          </label>
          <div className="space-y-1">
            {availableSituacoes.map((situacao) => {
              const isSelected = filters.selectedSituacoes.includes(situacao);
              return (
                <button
                  key={situacao}
                  onClick={() =>
                    onChange({
                      ...filters,
                      selectedSituacoes: toggleArrayItem(filters.selectedSituacoes, situacao),
                    })
                  }
                  className={`w-full text-left px-2 py-1 rounded text-xs font-medium transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {situacao}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
