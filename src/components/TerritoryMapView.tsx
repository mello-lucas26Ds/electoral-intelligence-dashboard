import React, { useMemo } from 'react';
import { Map, MapPin, Trophy, Users, AlertCircle, ArrowUpRight, Award } from 'lucide-react';
import { ElectoralVoteRecord } from '../types';
import { getCandidateColor } from '../utils/dataProcessor';

interface ZonaData {
  totalVotos: number;
  municipios: Record<string, number>;
  candidates: Record<string, number>;
}

interface MunicipioData {
  zona: string;
  totalVotos: number;
  candidates: Record<string, number>;
}

interface TerritoryMapViewProps {
  data: ElectoralVoteRecord[];
  onSelectMunicipio: (municipio: string) => void;
  onSelectZona: (zona: string) => void;
}

export const TerritoryMapView: React.FC<TerritoryMapViewProps> = ({
  data,
  onSelectMunicipio,
  onSelectZona,
}) => {
  // Aggregate stats by Zona and Municipio
  const territoryStats = useMemo(() => {
    const zonas: Record<string, ZonaData> = {};
    const municipios: Record<string, MunicipioData> = {};

    data.forEach((r) => {
      // Zona stats
      if (!zonas[r.zona]) {
        zonas[r.zona] = { totalVotos: 0, municipios: {}, candidates: {} };
      }
      zonas[r.zona].totalVotos += r.votos;
      zonas[r.zona].municipios[r.municipio] = (zonas[r.zona].municipios[r.municipio] || 0) + r.votos;
      zonas[r.zona].candidates[r.candidato] = (zonas[r.zona].candidates[r.candidato] || 0) + r.votos;

      // Municipio stats
      if (!municipios[r.municipio]) {
        municipios[r.municipio] = {
          zona: r.zona,
          totalVotos: 0,
          candidates: {},
        };
      }
      municipios[r.municipio].totalVotos += r.votos;
      municipios[r.municipio].candidates[r.candidato] = (municipios[r.municipio].candidates[r.candidato] || 0) + r.votos;
    });

    return { zonas, municipios };
  }, [data]);

  const { zonas, municipios } = territoryStats;

  return (
    <div id="territory-map-view" className="space-y-6">
      {/* Overview Cards by Zona Eleitoral */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Map className="w-5 h-5 text-indigo-600" />
              <span>Visão Territorial por Zonas Eleitorais</span>
            </h2>
            <p className="text-xs text-slate-500">
              Resumo da distribuição de votos e candidato dominante por Zona Eleitoral.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {(Object.entries(zonas) as [string, ZonaData][]).map(([zonaName, zInfo]) => {
            // Find leading candidate in this Zona
            let leaderCand = 'N/A';
            let leaderVotes = 0;
            Object.entries(zInfo.candidates).forEach(([cand, votes]) => {
              if (votes > leaderVotes) {
                leaderVotes = votes;
                leaderCand = cand;
              }
            });

            const leaderPct = zInfo.totalVotos > 0 ? (leaderVotes / zInfo.totalVotos) * 100 : 0;
            const candColor = getCandidateColor(leaderCand);

            return (
              <div
                key={zonaName}
                onClick={() => onSelectZona(zonaName)}
                className="bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-xl p-3.5 transition-all cursor-pointer hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 text-sm flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{zonaName}</span>
                    </span>
                    <span className="text-[10px] font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-bold">
                      {zInfo.totalVotos.toLocaleString('pt-BR')} v
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200/80">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold mb-1">
                      Líder na Zona:
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: candColor }} />
                      <span className="font-bold text-xs text-slate-900 truncate">{leaderCand.split(' ')[0]}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${leaderPct}%`, backgroundColor: candColor }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block font-mono font-medium">
                      {leaderPct.toFixed(1)}% dos votos locais
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-indigo-600 font-semibold">
                  <span>Ver Municípios</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid Map of Municipios */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Mapa 2D por Municípios & Penetração Eleitoral</span>
            </h3>
            <p className="text-xs text-slate-500">
              Cada bloco representa um município com seu candidato líder e volume total de votos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(Object.entries(municipios) as [string, MunicipioData][]).map(([municipioName, mInfo]) => {
            // Find leading candidate
            let leaderCand = 'N/A';
            let leaderVotes = 0;
            Object.entries(mInfo.candidates).forEach(([cand, v]) => {
              if (v > leaderVotes) {
                leaderVotes = v;
                leaderCand = cand;
              }
            });

            const leaderPct = mInfo.totalVotos > 0 ? (leaderVotes / mInfo.totalVotos) * 100 : 0;
            const candColor = getCandidateColor(leaderCand);

            return (
              <div
                key={municipioName}
                onClick={() => onSelectMunicipio(municipioName)}
                className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-400 rounded-xl p-4 transition-all shadow-xs hover:shadow-md cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-600 block">
                        {mInfo.zona}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                        {municipioName}
                      </h4>
                    </div>
                    <span className="bg-slate-200 group-hover:bg-indigo-100 group-hover:text-indigo-800 text-slate-800 font-mono font-bold text-xs px-2 py-0.5 rounded-full">
                      {mInfo.totalVotos.toLocaleString('pt-BR')} v
                    </span>
                  </div>

                  {/* Leader stats bar */}
                  <div className="mt-3 bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500 text-[11px]">Candidato Líder:</span>
                      <span className="font-bold text-slate-900" style={{ color: candColor }}>
                        {leaderPct.toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 shrink-0" style={{ color: candColor }} />
                      <span className="font-bold text-xs text-slate-800 truncate">{leaderCand}</span>
                    </div>

                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${leaderPct}%`, backgroundColor: candColor }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
