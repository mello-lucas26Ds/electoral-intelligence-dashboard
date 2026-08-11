import React from 'react';
import { Vote, Users, MapPin, Award, Zap, Building2, TrendingUp } from 'lucide-react';
import { KpiSummary, CandidateMetrics } from '../types';

interface KpiCardsSectionProps {
  totalFilteredVotes: number;
  filteredRecordsCount: number;
  totalRecordsCount: number;
  kpiSummary: KpiSummary;
  executionTimeMs: number;
  topCandidateFiltered?: { name: string; votes: number; share: number };
}

export const KpiCardsSection: React.FC<KpiCardsSectionProps> = ({
  totalFilteredVotes,
  filteredRecordsCount,
  totalRecordsCount,
  kpiSummary,
  executionTimeMs,
  topCandidateFiltered,
}) => {
  const percentOfTotalVotes = kpiSummary.totalVotos > 0 
    ? ((totalFilteredVotes / kpiSummary.totalVotos) * 100).toFixed(1) 
    : '0';

  const topCandidate = topCandidateFiltered || (kpiSummary.topCandidatos && kpiSummary.topCandidatos[0]) || {
    name: 'N/A',
    votes: 0,
    share: 0,
  };

  return (
    <section id="kpi-cards-section" className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Total Votos */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total de Votos
          </span>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Vote className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-900 font-mono">
            {totalFilteredVotes.toLocaleString('pt-BR')}
          </span>
          <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
            <TrendingUp className="w-3 h-3 mr-0.5" />
            {percentOfTotalVotes}% do Total
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Universo total: {kpiSummary.totalVotos.toLocaleString('pt-BR')} votos
        </p>
      </div>

      {/* KPI 2: Registros & Latência */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Linhas / Performance
          </span>
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-900 font-mono">
            {filteredRecordsCount.toLocaleString('pt-BR')}
          </span>
          <span className="inline-flex items-center text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
            <Zap className="w-3 h-3 mr-0.5 text-indigo-500" />
            {executionTimeMs < 1 ? '<1' : executionTimeMs.toFixed(1)} ms SLA
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Exibindo {filteredRecordsCount} de {totalRecordsCount} registros
        </p>
      </div>

      {/* KPI 3: Cobertura de Zonas e Partidos */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Zonas / Partidos
          </span>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-900 font-mono">
            {kpiSummary.totalZonas} Zonas
          </span>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            {kpiSummary.totalPartidos} Partidos
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Município: Manaus (AM) - Eleições Gerais 2022
        </p>
      </div>

      {/* KPI 4: Líder de Votação */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Líder da Visão
          </span>
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Award className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-base font-bold text-slate-900 truncate block">
            {topCandidate.name}
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs font-mono font-semibold text-amber-700">
              {topCandidate.votes.toLocaleString('pt-BR')} votos
            </span>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
              {topCandidate.share.toFixed(1)}% share
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
