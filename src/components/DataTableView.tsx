import React, { useState, useMemo } from 'react';
import { Table, ArrowUpDown, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { ElectoralVoteRecord } from '../types';

interface DataTableViewProps {
  data: ElectoralVoteRecord[];
  onExport: () => void;
}

export const DataTableView: React.FC<DataTableViewProps> = ({ data, onExport }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState<keyof ElectoralVoteRecord>('votos');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const valA = a[sortField] ?? '';
      const valB = b[sortField] ?? '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }
      return sortDir === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [data, sortField, sortDir]);

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (field: keyof ElectoralVoteRecord) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  return (
    <div id="data-table-view" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Table className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">Base de Dados Eleitorais Completa</h2>
            <p className="text-xs text-slate-500">
              Total de {data.length.toLocaleString('pt-BR')} registros filtrados.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1">
            <span className="text-slate-500">Linhas por página:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-slate-800"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <button
            onClick={onExport}
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-3 py-1.5 rounded-lg flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Baixar Excel</span>
          </button>
        </div>
      </div>

      {/* Table grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <th
                onClick={() => handleSort('zona')}
                className="p-3 cursor-pointer hover:bg-slate-200 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>Zona</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('municipio')}
                className="p-3 cursor-pointer hover:bg-slate-200 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>Município</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('cargo')}
                className="p-3 cursor-pointer hover:bg-slate-200 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>Cargo</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('partido')}
                className="p-3 cursor-pointer hover:bg-slate-200 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>Partido</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('situacao')}
                className="p-3 cursor-pointer hover:bg-slate-200 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>Situação</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('candidato')}
                className="p-3 cursor-pointer hover:bg-slate-200 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>Candidato</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('votos')}
                className="p-3 cursor-pointer hover:bg-slate-200 transition-colors text-right"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Votos</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-sans">
            {paginatedData.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-semibold text-slate-900">{row.zona}</td>
                <td className="p-3 text-slate-600">{row.municipio}</td>
                <td className="p-3 font-medium text-slate-800">{row.cargo}</td>
                <td className="p-3 text-slate-600">{row.partido}</td>
                <td className="p-3 text-slate-600">{row.situacao}</td>
                <td className="p-3 font-semibold text-indigo-900">{row.candidato}</td>
                <td className="p-3 font-mono font-bold text-slate-900 text-right">
                  {row.votos.toLocaleString('pt-BR')}
                </td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
        <span className="text-slate-600">
          Página <strong className="text-slate-900">{currentPage}</strong> de{' '}
          <strong className="text-slate-900">{totalPages}</strong> ({data.length.toLocaleString('pt-BR')}{' '}
          registros)
        </span>

        <div className="flex items-center space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-slate-700" />
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      </div>
    </div>
  );
};
