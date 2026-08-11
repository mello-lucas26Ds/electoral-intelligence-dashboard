import React, { useMemo, useState } from 'react';
import { Target, AlertTriangle, TrendingUp, ShieldAlert, Sparkles, UserCheck, CheckCircle2, MapPin } from 'lucide-react';
import { ElectoralVoteRecord } from '../types';
import { generateStrategicPoints, getCandidateColor } from '../utils/dataProcessor';

interface StrategicMatrixViewProps {
  data: ElectoralVoteRecord[];
  onSelectCandidateFilter: (cand: string) => void;
  onSelectLocationFilter: (municipioOrZona: string) => void;
  availableCandidatos: string[];
}

export const StrategicMatrixView: React.FC<StrategicMatrixViewProps> = ({
  data,
  onSelectCandidateFilter,
  onSelectLocationFilter,
  availableCandidatos,
}) => {
  const [selectedCandTab, setSelectedCandTab] = useState<string>('ALL');

  const strategicPoints = useMemo(() => {
    return generateStrategicPoints(data);
  }, [data]);

  const filteredPoints = useMemo(() => {
    if (selectedCandTab === 'ALL') return strategicPoints;
    return strategicPoints.filter((p) => p.candidato === selectedCandTab);
  }, [strategicPoints, selectedCandTab]);

  const strengths = filteredPoints.filter((p) => p.type === 'strength');
  const weaknesses = filteredPoints.filter((p) => p.type === 'weakness');
  const opportunities = filteredPoints.filter((p) => p.type === 'opportunity');

  return (
    <div id="strategic-matrix-view" className="space-y-6">
      {/* Candidate Selector Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">Diagnóstico Estratégico de Campanha</h2>
            <p className="text-xs text-slate-500">
              Análise inteligente de acentuações, dificuldades e nichos eleitorais por candidato.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-sm font-semibold text-slate-700">Candidato:</span>
          <select
            value={selectedCandTab}
            onChange={(e) => setSelectedCandTab(e.target.value)}
            className="flex-1 sm:w-64 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Todos os Candidatos</option>
            {availableCandidatos.map((cand) => (
              <option key={cand} value={cand}>
                {cand}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Strengths vs Weaknesses vs Targeted Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Onde está mais Acentuado (Fortalezas) */}
        <div className="bg-white rounded-xl border border-emerald-200 shadow-xs overflow-hidden flex flex-col">
          <div className="bg-emerald-50/80 p-4 border-b border-emerald-100 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-emerald-950 text-sm">Onde Está Mais Acentuado?</h3>
              <p className="text-xs text-emerald-700">Locais de maior densidade e dominância</p>
            </div>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
            {strengths.length === 0 ? (
              <p className="text-xs text-slate-400">Nenhum ponto forte identificado para os filtros atuais.</p>
            ) : (
              strengths.map((pt, idx) => {
                const candColor = getCandidateColor(pt.candidato);
                return (
                  <div
                    key={idx}
                    className="bg-slate-50 hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-300 rounded-lg p-3 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {pt.candidato}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2 py-0.5 rounded-full font-mono">
                        {pt.metric}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{pt.location}</span>
                    </h4>

                    <p className="text-xs text-slate-600 mt-1">{pt.description}</p>

                    <button
                      onClick={() => onSelectLocationFilter(pt.location)}
                      className="mt-2 text-[11px] text-emerald-700 font-semibold hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Filtrar dados deste local</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Onde Tem Mais Dificuldade (Vulnerabilidades) */}
        <div className="bg-white rounded-xl border border-rose-200 shadow-xs overflow-hidden flex flex-col">
          <div className="bg-rose-50/80 p-4 border-b border-rose-100 flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="font-bold text-rose-950 text-sm">Onde Tem Mais Dificuldade?</h3>
              <p className="text-xs text-rose-700">Zonas de baixo desempenho e vulnerabilidade</p>
            </div>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
            {weaknesses.length === 0 ? (
              <p className="text-xs text-slate-400">Nenhuma dificuldade crítica mapeada.</p>
            ) : (
              weaknesses.map((pt, idx) => {
                return (
                  <div
                    key={idx}
                    className="bg-slate-50 hover:bg-rose-50/40 border border-slate-200 hover:border-rose-300 rounded-lg p-3 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {pt.candidato}
                      </span>
                      <span className="bg-rose-100 text-rose-800 text-xs font-extrabold px-2 py-0.5 rounded-full font-mono">
                        {pt.metric}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-600" />
                      <span>{pt.location}</span>
                    </h4>

                    <p className="text-xs text-slate-600 mt-1">{pt.description}</p>

                    <button
                      onClick={() => onSelectLocationFilter(pt.location)}
                      className="mt-2 text-[11px] text-rose-700 font-semibold hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Filtrar dados deste local</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Público-Alvo e Perfil Demográfico Preferencial */}
        <div className="bg-white rounded-xl border border-indigo-200 shadow-xs overflow-hidden flex flex-col">
          <div className="bg-indigo-50/80 p-4 border-b border-indigo-100 flex items-center space-x-2">
            <Target className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-indigo-950 text-sm">Perfil de Público Alvo</h3>
              <p className="text-xs text-indigo-700">Faixa etária e segmento de maior aceitação</p>
            </div>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
            {opportunities.length === 0 ? (
              <p className="text-xs text-slate-400">Nenhum nicho demográfico mapeado.</p>
            ) : (
              opportunities.map((pt, idx) => {
                return (
                  <div
                    key={idx}
                    className="bg-slate-50 hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-300 rounded-lg p-3 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {pt.candidato}
                      </span>
                      <span className="bg-indigo-100 text-indigo-800 text-xs font-extrabold px-2 py-0.5 rounded-full font-mono">
                        {pt.metric}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-1">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{pt.location}</span>
                    </h4>

                    <p className="text-xs text-slate-600 mt-1">{pt.description}</p>

                    <button
                      onClick={() => onSelectCandidateFilter(pt.candidato)}
                      className="mt-2 text-[11px] text-indigo-700 font-semibold hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Filtrar por este candidato</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
