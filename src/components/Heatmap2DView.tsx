import React, { useState, useMemo, useEffect } from 'react';
import { Layers, Info, Filter, ArrowRight, Eye, Sparkles, SlidersHorizontal } from 'lucide-react';
import { ElectoralVoteRecord, AxisOption, CellDetail } from '../types';
import { build2DHeatmapMatrix, AXIS_OPTIONS, getCandidateColor } from '../utils/dataProcessor';

interface Heatmap2DViewProps {
  data: ElectoralVoteRecord[];
  onSelectCell: (cell: CellDetail) => void;
  onFilterByValue: (axisKey: string, value: string) => void;
  availableCandidatos: string[];
}

export const Heatmap2DView: React.FC<Heatmap2DViewProps> = ({
  data,
  onSelectCell,
  onFilterByValue,
  availableCandidatos,
}) => {
  const [rowAxisKey, setRowAxisKey] = useState<keyof ElectoralVoteRecord>('municipio');
  const [colAxisKey, setColAxisKey] = useState<keyof ElectoralVoteRecord>('partido');
  const [colorMetric, setColorMetric] = useState<'volume' | 'dominance' | 'candidate_votes'>('volume');
  const [candidateFocus, setCandidateFocus] = useState<string>(availableCandidatos[0] || '');

  useEffect(() => {
    if (!availableCandidatos.includes(candidateFocus) && availableCandidatos.length > 0) {
      setCandidateFocus(availableCandidatos[0]);
    }
  }, [availableCandidatos, candidateFocus]);

  const matrixResult = useMemo(() => {
    return build2DHeatmapMatrix(
      data,
      rowAxisKey,
      colAxisKey,
      colorMetric === 'candidate_votes' ? candidateFocus : undefined
    );
  }, [data, rowAxisKey, colAxisKey, colorMetric, candidateFocus]);

  const { rowKeys, colKeys, matrix, maxVotes, minVotes, totalVotesAll } = matrixResult;

  // Compute color for cell based on selected metric
  const getCellColorStyle = (cell: CellDetail) => {
    if (!cell || cell.totalVotos === 0) {
      return { backgroundColor: '#f1f5f9', textColor: 'text-slate-400' };
    }

    let ratio = 0;

    if (colorMetric === 'volume') {
      ratio = maxVotes > minVotes ? (cell.totalVotos - minVotes) / (maxVotes - minVotes || 1) : 0.5;
      // Blue-Indigo scale
      if (ratio > 0.8) return { backgroundColor: '#1e1b4b', textColor: 'text-indigo-100 font-bold' };
      if (ratio > 0.6) return { backgroundColor: '#312e81', textColor: 'text-indigo-100 font-bold' };
      if (ratio > 0.4) return { backgroundColor: '#4338ca', textColor: 'text-indigo-100' };
      if (ratio > 0.2) return { backgroundColor: '#6366f1', textColor: 'text-white' };
      if (ratio > 0.1) return { backgroundColor: '#a5b4fc', textColor: 'text-indigo-950 font-medium' };
      return { backgroundColor: '#e0e7ff', textColor: 'text-indigo-900 font-medium' };
    }

    if (colorMetric === 'dominance') {
      // Color cell according to top candidate's color with intensity scaling
      const topCandId = cell.topCandidato;
      const hexColor = getCandidateColor(topCandId) || '#64748b';
      const pct = cell.topCandidatoPercent;

      let opacity = 0.2;
      if (pct > 50) opacity = 0.95;
      else if (pct > 40) opacity = 0.75;
      else if (pct > 30) opacity = 0.55;
      else opacity = 0.35;

      return {
        backgroundColor: `${hexColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
        textColor: opacity > 0.5 ? 'text-white font-bold' : 'text-slate-900 font-medium',
      };
    }

    if (colorMetric === 'candidate_votes') {
      const candVotes = cell.candidatoBreakdown[candidateFocus] || 0;
      const share = cell.totalVotos > 0 ? (candVotes / cell.totalVotos) * 100 : 0;
      const hexColor = getCandidateColor(candidateFocus) || '#2563eb';

      let opacity = 0.15;
      if (share > 45) opacity = 0.95;
      else if (share > 35) opacity = 0.75;
      else if (share > 25) opacity = 0.55;
      else if (share > 15) opacity = 0.35;

      return {
        backgroundColor: `${hexColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
        textColor: opacity > 0.5 ? 'text-white font-bold' : 'text-slate-800 font-medium',
      };
    }

    return { backgroundColor: '#f1f5f9', textColor: 'text-slate-700' };
  };

  const currentFocusCandidateName = candidateFocus;

  return (
    <div id="heatmap-2d-view" className="space-y-4">
      {/* Matrix Configuration Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-700 font-semibold bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
            <span>Configurar Eixos 2D:</span>
          </div>

          {/* Eixo Vertical Y */}
          <div className="flex items-center space-x-1.5">
            <label className="text-slate-500 font-medium">Linhas (Y):</label>
            <select
              id="select-row-axis"
              value={rowAxisKey}
              onChange={(e) => setRowAxisKey(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {AXIS_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key} disabled={opt.key === colAxisKey}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Eixo Horizontal X */}
          <div className="flex items-center space-x-1.5">
            <label className="text-slate-500 font-medium">Colunas (X):</label>
            <select
              id="select-col-axis"
              value={colAxisKey}
              onChange={(e) => setColAxisKey(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {AXIS_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key} disabled={opt.key === rowAxisKey}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Color Metric Selector */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Modo de Calor:</span>
          <div className="bg-slate-100 p-1 rounded-lg flex items-center border border-slate-200">
            <button
              id="btn-metric-volume"
              onClick={() => setColorMetric('volume')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                colorMetric === 'volume'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Volume Total
            </button>
            <button
              id="btn-metric-dominance"
              onClick={() => setColorMetric('dominance')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                colorMetric === 'dominance'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Liderança por Candidato
            </button>
            <button
              id="btn-metric-cand-votes"
              onClick={() => setColorMetric('candidate_votes')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                colorMetric === 'candidate_votes'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Foco no Candidato
            </button>
          </div>

          {colorMetric === 'candidate_votes' && (
            <select
              id="select-candidate-focus"
              value={candidateFocus}
              onChange={(e) => setCandidateFocus(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2 py-1 font-semibold text-slate-800 text-xs shadow-xs cursor-pointer"
            >
              {availableCandidatos.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Heatmap Matrix Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Mapa de Calor Matriz 2D</span>
            </h2>
            <p className="text-xs text-slate-500">
              Cruza <strong className="text-slate-800">{AXIS_OPTIONS.find((a) => a.key === rowAxisKey)?.label}</strong> nas linhas com <strong className="text-slate-800">{AXIS_OPTIONS.find((a) => a.key === colAxisKey)?.label}</strong> nas colunas. Clique em qualquer célula para detalhamento estratégico.
            </p>
          </div>

          {/* Color Scale Legend */}
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <span className="text-[11px] font-medium text-slate-400">Intensidade:</span>
            {colorMetric === 'volume' ? (
              <div className="flex items-center space-x-1">
                <span className="text-[10px]">Baixa</span>
                <div className="h-3 w-20 rounded bg-gradient-to-r from-indigo-100 via-indigo-500 to-indigo-950" />
                <span className="text-[10px] font-bold">Alta</span>
              </div>
            ) : colorMetric === 'dominance' ? (
              <div className="flex items-center space-x-2">
                {availableCandidatos.map((c) => (
                  <span key={c} className="flex items-center space-x-1 text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getCandidateColor(c) }} />
                    <span>{c.split(' ')[0]}</span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <span className="text-[10px]">% Votos de</span>
                <span className="font-bold text-slate-800">{currentFocusCandidateName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Matrix Scrollable Table */}
        {rowKeys.length === 0 || colKeys.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Nenhum dado encontrado para a combinação selecionada ou filtros aplicados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                  <th className="p-3 sticky left-0 bg-slate-100 z-10 border-r border-slate-200 min-w-[140px]">
                    {AXIS_OPTIONS.find((a) => a.key === rowAxisKey)?.label} \ {AXIS_OPTIONS.find((a) => a.key === colAxisKey)?.label}
                  </th>
                  {colKeys.map((colKey) => (
                    <th key={colKey} className="p-3 text-center border-r border-slate-200 min-w-[100px]">
                      <button
                        onClick={() => onFilterByValue(colAxisKey, colKey)}
                        className="hover:text-indigo-600 hover:underline flex items-center justify-center space-x-1 w-full cursor-pointer"
                        title={`Filtrar apenas por ${colKey}`}
                      >
                        <span>{colKey}</span>
                      </button>
                    </th>
                  ))}
                  <th className="p-3 text-center bg-slate-200/80 font-bold min-w-[90px]">Total Linha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs font-mono">
                {rowKeys.map((rowKey) => {
                  let rowTotalVotes = 0;
                  colKeys.map((colKey) => {
                    rowTotalVotes += matrix[rowKey]?.[colKey]?.totalVotos || 0;
                  });

                  return (
                    <tr key={rowKey} className="hover:bg-slate-50/80 transition-colors">
                      {/* Row Label Sticky Column */}
                      <td className="p-3 font-semibold text-slate-900 bg-white sticky left-0 z-10 border-r border-slate-200 shadow-xs">
                        <button
                          onClick={() => onFilterByValue(rowAxisKey, rowKey)}
                          className="hover:text-indigo-600 hover:underline text-left block w-full truncate cursor-pointer font-sans"
                          title={`Filtrar apenas por ${rowKey}`}
                        >
                          {rowKey}
                        </button>
                      </td>

                      {/* Cells */}
                      {colKeys.map((colKey) => {
                        const cell = matrix[rowKey]?.[colKey];
                        if (!cell) return <td key={colKey} className="p-2 border-r border-slate-200 bg-slate-50" />;

                        const style = getCellColorStyle(cell);
                        const candVotesInCell = colorMetric === 'candidate_votes'
                          ? cell.candidatoBreakdown[candidateFocus] || 0
                          : cell.totalVotos;

                        const shareInCell = cell.totalVotos > 0 ? (candVotesInCell / cell.totalVotos) * 100 : 0;

                        return (
                          <td
                            key={colKey}
                            onClick={() => onSelectCell(cell)}
                            className={`p-3 text-center border-r border-slate-200 transition-all cursor-pointer hover:ring-2 hover:ring-indigo-500 hover:z-20 ${style.textColor}`}
                            style={{ backgroundColor: style.backgroundColor }}
                            title={`${rowKey} × ${colKey}: ${cell.totalVotos.toLocaleString('pt-BR')} votos totais. Líder: ${cell.topCandidato}`}
                          >
                            <div className="flex flex-col items-center justify-center space-y-0.5">
                              <span className="text-sm tracking-tight font-extrabold font-mono">
                                {candVotesInCell.toLocaleString('pt-BR')}
                              </span>

                              {colorMetric === 'dominance' && (
                                <div className="flex w-full h-1.5 rounded-full overflow-hidden mt-1 bg-white/30">
                                  {Object.entries(cell.candidatoBreakdown)
                                    .sort((a, b) => Number(b[1]) - Number(a[1]))
                                    .slice(0, 3)
                                    .map(([cand, votes], i) => (
                                      <div
                                        key={cand}
                                        style={{
                                          width: `${(Number(votes) / cell.totalVotos) * 100}%`,
                                          backgroundColor: getCandidateColor(cand),
                                        }}
                                        title={`${cand}: ${votes} votos`}
                                      />
                                  ))}
                                </div>
                              )}

                              {colorMetric === 'candidate_votes' && (
                                <span className="text-[10px] font-sans opacity-90">
                                  {shareInCell.toFixed(1)}% do total
                                </span>
                              )}

                              {colorMetric === 'volume' && totalVotesAll > 0 && (
                                <span className="text-[10px] font-sans opacity-70">
                                  {((cell.totalVotos / totalVotesAll) * 100).toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* Row Total */}
                      <td className="p-3 text-center font-bold text-slate-900 bg-slate-100 font-mono">
                        {rowTotalVotes.toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
