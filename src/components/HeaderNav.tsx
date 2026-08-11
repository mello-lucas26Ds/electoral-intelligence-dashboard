import React from 'react';
import { Upload, Download, RefreshCw, BarChart2, Layers, Search, Sparkles, Database } from 'lucide-react';

interface HeaderNavProps {
  totalRecords: number;
  filteredRecordsCount: number;
  totalVotes: number;
  onOpenUpload: () => void;
  onExport: () => void;
  onResetDataset: () => void;
  isCustomDataset: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  totalRecords,
  filteredRecordsCount,
  totalVotes,
  onOpenUpload,
  onExport,
  onResetDataset,
  isCustomDataset,
}) => {
  return (
    <header id="header-nav" className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Title */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 p-0.5 shadow-md flex items-center justify-center">
              <div className="h-full w-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg text-slate-100 tracking-tight">
                  Dashboard Eleitoral 2D
                </h1>
                <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full border border-indigo-500/30 font-mono font-medium">
                  Tableau Standard
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Análise Estratégica por Zonas, Bairros, Faixa Etária e Candidatos
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="hidden lg:flex items-center space-x-6 text-xs text-slate-300">
            <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
              <Database className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Total Registros</span>
                <span className="font-mono font-bold text-emerald-300">{filteredRecordsCount.toLocaleString('pt-BR')} / {totalRecords.toLocaleString('pt-BR')}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Votos Filtrados</span>
                <span className="font-mono font-bold text-amber-300">{totalVotes.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              id="btn-import-excel"
              onClick={onOpenUpload}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
              title="Importar planilha do Excel (.xlsx, .csv)"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Importar Excel / CSV</span>
              <span className="md:hidden">Importar</span>
            </button>

            <button
              id="btn-export-excel"
              onClick={onExport}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-2 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Exportar visão atual para Excel"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Exportar</span>
            </button>

            {isCustomDataset && (
              <button
                id="btn-reset-data"
                onClick={onResetDataset}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-rose-900/40 text-rose-300 text-xs font-medium px-2.5 py-2 rounded-lg border border-rose-800/40 transition-colors cursor-pointer"
                title="Restaurar dados de exemplo"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Restaurar Exemplo</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
