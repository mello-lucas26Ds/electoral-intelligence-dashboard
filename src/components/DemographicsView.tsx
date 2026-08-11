import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Users, PieChart as PieIcon, MapPin, Briefcase } from 'lucide-react';
import { ElectoralVoteRecord } from '../types';
import { getCandidateColor } from '../utils/dataProcessor';

interface DemographicsViewProps {
  data: ElectoralVoteRecord[];
  availableCandidatos: string[];
}

export const DemographicsView: React.FC<DemographicsViewProps> = ({ data, availableCandidatos }) => {

  // Zona breakdown per candidate
  const zonaData = useMemo(() => {
    const zonaMap: Record<string, Record<string, number>> = {};

    data.forEach((r) => {
      if (!zonaMap[r.zona]) zonaMap[r.zona] = {};
      zonaMap[r.zona][r.candidato] = (zonaMap[r.zona][r.candidato] || 0) + r.votos;
    });

    return Object.entries(zonaMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([zona, candObj]) => {
        return {
          zona,
          ...candObj,
        };
      });
  }, [data]);

  // Cargo breakdown
  const cargoData = useMemo(() => {
    const cargoMap: Record<string, Record<string, number>> = {};

    data.forEach((r) => {
      if (!cargoMap[r.cargo]) cargoMap[r.cargo] = {};
      cargoMap[r.cargo][r.candidato] = (cargoMap[r.cargo][r.candidato] || 0) + r.votos;
    });

    return Object.entries(cargoMap).map(([cargo, candObj]) => ({
      cargo,
      ...candObj,
    }));
  }, [data]);

  // Overall Share Pie Chart
  const overallPieData = useMemo(() => {
    const candTotals: Record<string, number> = {};
    let total = 0;
    data.forEach((r) => {
      candTotals[r.candidato] = (candTotals[r.candidato] || 0) + r.votos;
      total += r.votos;
    });

    return Object.entries(candTotals).map(([cName, votes]) => ({
      name: cName,
      value: votes,
      percent: total > 0 ? (votes / total) * 100 : 0,
      color: getCandidateColor(cName),
    }));
  }, [data]);

  return (
    <div id="demographics-view" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Pie Share */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <PieIcon className="w-5 h-5 text-indigo-600" />
              <span>Intenção / Votos Totais</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">Divisão geral dos votos por candidato</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overallPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {overallPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${Number(value).toLocaleString('pt-BR')} votos`,
                    name,
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs max-h-40 overflow-y-auto scrollbar-thin">
            {overallPieData.map((d) => (
              <div key={d.name} className="flex items-center justify-between py-0.5">
                <div className="flex items-center space-x-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="font-semibold text-slate-800 truncate">{d.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900 pl-2">{d.percent.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Zona Distribution Stacked Bar */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <span>Votos por Zona Eleitoral</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Desempenho dos candidatos distribuído pelas Zonas
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zonaData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="zona" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                {availableCandidatos.map((cand) => (
                  <Bar
                    key={cand}
                    dataKey={cand}
                    name={cand}
                    stackId="a"
                    fill={getCandidateColor(cand)}
                    radius={[0, 0, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cargo Distribution */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 mb-1">
          <Briefcase className="w-5 h-5 text-indigo-600" />
          <span>Votos por Cargo</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Distribuição dos candidatos entre os Cargos
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cargoData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="cargo" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {availableCandidatos.map((cand) => (
                <Bar
                  key={cand}
                  dataKey={cand}
                  name={cand}
                  fill={getCandidateColor(cand)}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
