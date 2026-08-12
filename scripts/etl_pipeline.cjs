const fs = require('fs');
const path = require('path');

// Paths definition for Medallion Architecture
const RAW_PATH = path.join(__dirname, '../data/raw/electoral_raw.json');
const CLEAN_PATH = path.join(__dirname, '../data/clean/electoral_clean.json');
const PROCESSED_PATH = path.join(__dirname, '../data/processed/electoral_processed.json');
const SRC_PROCESSED_PATH = path.join(__dirname, '../src/data/processed/electoral_processed.json');
const KPIS_SUMMARY_PATH = path.join(__dirname, '../src/data/processed/kpis_summary.json');

console.log('🚀 Starting Medallion Data Pipeline ETL...');

// --- STAGE 1: RAW INGESTION ---
console.log('📥 Stage 1: Ingesting Raw Data...');
if (!fs.existsSync(RAW_PATH)) {
  console.error('❌ Error: Raw data file not found at:', RAW_PATH);
  process.exit(1);
}

const rawData = JSON.parse(fs.readFileSync(RAW_PATH, 'utf8'));
console.log(`✅ Ingested ${rawData.length} raw records.`);

// --- STAGE 2: CLEANING & SANITIZATION (SILVER) ---
console.log('🧹 Stage 2: Cleaning, Typing & Sanitizing Data...');

const cleanData = rawData.map((item, idx) => {
  const votos = Math.max(0, parseInt(item.votos || 0, 10));
  const zona = String(item.zona || '00').padStart(2, '0').trim();
  const municipio = (item.municipio || 'MANAUS').trim().toUpperCase();
  const cargo = (item.cargo || 'NÃO INFORMADO').trim();
  const partido = (item.partido || 'N/A').trim().toUpperCase();
  const candidato = (item.candidato || 'DESCONHECIDO').trim();
  const situacao = (item.situacao || 'APTO').trim();

  return {
    id: item.id || `REC-${String(idx + 1).padStart(5, '0')}`,
    zona,
    municipio,
    cargo,
    partido,
    candidato,
    situacao,
    votos
  };
});

fs.writeFileSync(CLEAN_PATH, JSON.stringify(cleanData, null, 2));
console.log(`✅ Cleaned data saved to ${CLEAN_PATH} (${cleanData.length} records).`);

// --- STAGE 3: AGGREGATION & MODELING (GOLD / PROCESSED) ---
console.log('📊 Stage 3: Aggregating KPIs & Modeling Gold Layer...');

let totalVotos = 0;
const partidosMap = {};
const zonasMap = {};
const candidatosMap = {};

cleanData.forEach((rec) => {
  totalVotos += rec.votos;

  // Party aggregation
  partidosMap[rec.partido] = (partidosMap[rec.partido] || 0) + rec.votos;

  // Zone aggregation
  if (!zonasMap[rec.zona]) {
    zonasMap[rec.zona] = { totalVotos: 0, candidatos: {} };
  }
  zonasMap[rec.zona].totalVotos += rec.votos;
  zonasMap[rec.zona].candidatos[rec.candidato] = (zonasMap[rec.zona].candidatos[rec.candidato] || 0) + rec.votos;

  // Candidate aggregation
  candidatosMap[rec.candidato] = (candidatosMap[rec.candidato] || 0) + rec.votos;
});

// Top candidates ranking
const topCandidatos = Object.entries(candidatosMap)
  .map(([name, votes]) => ({ name, votes, share: totalVotos > 0 ? (votes / totalVotos) * 100 : 0 }))
  .sort((a, b) => b.votes - a.votes);

// Top parties ranking
const topPartidos = Object.entries(partidosMap)
  .map(([party, votes]) => ({ party, votes, share: totalVotos > 0 ? (votes / totalVotos) * 100 : 0 }))
  .sort((a, b) => b.votes - a.votes);

const kpisSummary = {
  totalRegistros: cleanData.length,
  totalVotos,
  totalZonas: Object.keys(zonasMap).length,
  totalPartidos: Object.keys(partidosMap).length,
  totalCandidatos: Object.keys(candidatosMap).length,
  topCandidatos: topCandidatos.slice(0, 10),
  topPartidos: topPartidos.slice(0, 10),
  generatedAt: new Date().toISOString()
};

fs.writeFileSync(PROCESSED_PATH, JSON.stringify(cleanData));
fs.writeFileSync(SRC_PROCESSED_PATH, JSON.stringify(cleanData));
fs.writeFileSync(KPIS_SUMMARY_PATH, JSON.stringify(kpisSummary, null, 2));

console.log(`✅ Processed Gold dataset saved to ${PROCESSED_PATH}`);
console.log(`✅ Processed KPIs summary saved to ${KPIS_SUMMARY_PATH}`);
console.log('🎉 Medallion Data Pipeline executed successfully!');
