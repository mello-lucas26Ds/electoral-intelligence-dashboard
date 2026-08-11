import React, { useState } from 'react';
import { Upload, X, FileSpreadsheet, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { parseExcelFile } from '../utils/dataProcessor';
import { ElectoralVoteRecord } from '../types';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (records: ElectoralVoteRecord[]) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose, onDataLoaded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const records = await parseExcelFile(file);
      onDataLoaded(records);
      setLoading(false);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao processar a planilha. Verifique o formato do arquivo.');
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div id="file-upload-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Importar Dados Eleitorais</h3>
              <p className="text-xs text-slate-500">Envie sua planilha Excel (.xlsx, .xls) ou CSV</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-indigo-400 bg-slate-50'
          }`}
        >
          <input
            id="file-input-excel"
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
            className="hidden"
          />
          <label htmlFor="file-input-excel" className="cursor-pointer block space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-sm block">
                Arraste seu arquivo aqui ou clique para procurar
              </span>
              <span className="text-xs text-slate-500 block mt-1">
                Suporta planilhas exportadas do Google Sheets ou Excel (.xlsx, .csv)
              </span>
            </div>
          </label>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Expected Schema Format Help */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
          <div className="flex items-center space-x-1.5 font-bold text-slate-800">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>Colunas recomendadas no seu Excel:</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
            <div>• Zona (Zona 01, ZE 1)</div>
            <div>• Bairro (Centro, Vila X)</div>
            <div>• Regiao (Norte, Sul...)</div>
            <div>• FaixaEtaria (16-24, 25-34...)</div>
            <div>• Candidato (Nome)</div>
            <div>• Votos (Quantidade)</div>
            <div>• Genero (Feminino/Masc)</div>
            <div>• Renda (Faixa)</div>
          </div>
          <p className="text-[11px] text-slate-500">
            * O sistema mapeia automaticamente os nomes das colunas com tolerancia a maiúsculas e minúsculas.
          </p>
        </div>
      </div>
    </div>
  );
};
