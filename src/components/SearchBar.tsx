import React, { useRef, useEffect } from 'react';
import { Search, X, MapPin, Users, User, Tag } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
  suggestions?: string[];
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onClear }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus shortcut '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const QUICK_CHIPS = [
    { label: 'Zona 40', type: 'zona', query: 'zona 40' },
    { label: 'Manaus', type: 'municipio', query: 'manaus' },
    { label: 'Deputado Estadual', type: 'cargo', query: 'deputado estadual' },
    { label: 'União', type: 'partido', query: 'união' },
  ];

  return (
    <div id="search-bar-container" className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input field */}
        <div className="relative flex-1 max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 h-4 text-indigo-600" />
          </div>
          <input
            id="input-universal-search"
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder='Busca rápida ex: "Zona 40", "Manaus", "Deputado Estadual", "União"... (Pressione "/" para buscar)'
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium shadow-inner"
          />
          {value && (
            <button
              id="btn-clear-search"
              onClick={onClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
          <span className="text-slate-400 font-medium text-[11px] whitespace-nowrap uppercase tracking-wider">Atalhos:</span>
          {QUICK_CHIPS.map((chip, idx) => {
            const queryVal = chip.query || chip.label;
            const isSelected = value.toLowerCase().includes(queryVal.toLowerCase());
            return (
              <button
                key={idx}
                id={`chip-search-${idx}`}
                onClick={() => {
                  if (isSelected) onClear();
                  else onChange(queryVal);
                }}
                className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center space-x-1 cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                {chip.type === 'municipio' || chip.type === 'zona' ? (
                  <MapPin className="w-3 h-3 opacity-70" />
                ) : chip.type === 'partido' ? (
                  <Users className="w-3 h-3 opacity-70" />
                ) : (
                  <User className="w-3 h-3 opacity-70" />
                )}
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
