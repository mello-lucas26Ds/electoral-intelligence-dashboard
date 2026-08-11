import React from 'react';
import { X, Layers, Filter, Trophy, Users, CheckCircle2 } from 'lucide-react';
import { CellDetail } from '../types';
import { getCandidateColor } from '../utils/dataProcessor';

interface CellDetailModalProps {
  cell: CellDetail | null;
  onClose: () => void;
  onFilterByRowAndCol: (rowVal: string, colVal: string) => void;
}

export const CellDetailModal: React.FC<CellDetailModalProps> = ({
  cell,
  onClose,
  onFilterByRowAndCol,
}) => {
  if (!cell) return null;

  const sortedBreakdown = Object.entries(cell.candidatoBreakdown).sort((a, b) => Number(b[1]) - Number(a[1]));

  return (
    <div id="cell-detail-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Detalhamento 2D da Célula
              </span>
              <h3 className="font-bold text-slate-900 text-base">
                {cell.rowVal} × {cell.colVal}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Total Votos</span>
            <span className="font-mono font-extrabold text-slate-900 text-lg">
              {cell.totalVotos.toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Candidato Líder</span>
            <span className="font-bold text-slate-900 text-xs block truncate mt-1">
              {cell.topCandidato}
            </span>
            <span className="text-[10px] text-indigo-600 font-mono font-bold">
              {cell.topCandidatoPercent.toFixed(1)}% dos votos nesta célula
            </span>
          </div>
        </div>

        {/* Candidate Breakdown */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
            Divisão por Candidato nesta combinação:
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {sortedBreakdown.map(([candName, votes]) => {
              const voteCount = Number(votes);
              const pct = cell.totalVotos > 0 ? (voteCount / cell.totalVotos) * 100 : 0;
              const candColor = getCandidateColor(candName);

              return (
                <div key={candName} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center space-x-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: candColor }} />
                      <span className="font-bold text-slate-800 truncate">{candName}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900 mr-2">{voteCount.toLocaleString('pt-BR')} v</span>
                      <span className="text-[11px] text-slate-500 font-mono">({pct.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: candColor }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-100 cursor-pointer"
          >
            Fechar
          </button>
          <button
            onClick={() => {
              onFilterByRowAndCol(cell.rowVal, cell.colVal);
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center space-x-1 cursor-pointer shadow-xs"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Isolar este cruzamento no Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
