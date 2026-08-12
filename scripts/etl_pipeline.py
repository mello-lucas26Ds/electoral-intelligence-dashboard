import json
import os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_PATH = os.path.join(BASE_DIR, 'data', 'raw', 'electoral_raw.json')
CLEAN_PATH = os.path.join(BASE_DIR, 'data', 'clean', 'electoral_clean.json')
PROCESSED_PATH = os.path.join(BASE_DIR, 'data', 'processed', 'electoral_processed.json')
SRC_PROCESSED_PATH = os.path.join(BASE_DIR, 'src', 'data', 'processed', 'electoral_processed.json')
KPIS_SUMMARY_PATH = os.path.join(BASE_DIR, 'src', 'data', 'processed', 'kpis_summary.json')

def run_pipeline():
    print("🚀 [Python] Starting Medallion Data Pipeline ETL...")

    if not os.path.exists(RAW_PATH):
        print(f"❌ Error: Raw data file not found at: {RAW_PATH}")
        return

    with open(RAW_PATH, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)

    print(f"📥 [Python] Ingested {len(raw_data)} raw records.")

    # Clean stage
    clean_data = []
    for idx, item in enumerate(raw_data):
        votos = max(0, int(item.get('votos', 0)))
        zona = str(item.get('zona', '00')).zfill(2).strip()
        municipio = str(item.get('municipio', 'MANAUS')).strip().upper()
        cargo = str(item.get('cargo', 'NÃO INFORMADO')).strip()
        partido = str(item.get('partido', 'N/A')).strip().upper()
        candidato = str(item.get('candidato', 'DESCONHECIDO')).strip()
        situacao = str(item.get('situacao', 'APTO')).strip()

        clean_data.append({
            "id": item.get('id', f"REC-{str(idx + 1).zfill(5)}"),
            "zona": zona,
            "municipio": municipio,
            "cargo": cargo,
            "partido": partido,
            "candidato": candidato,
            "situacao": situacao,
            "votos": votos
        })

    with open(CLEAN_PATH, 'w', encoding='utf-8') as f:
        json.dump(clean_data, f, ensure_ascii=False, indent=2)

    print(f"🧹 [Python] Cleaned data saved ({len(clean_data)} records).")

    # Processed / Aggregation stage
    total_votos = sum(r['votos'] for r in clean_data)
    partidos_map = {}
    candidatos_map = {}
    zonas_set = set()

    for rec in clean_data:
        p = rec['partido']
        c = rec['candidato']
        v = rec['votos']
        partidos_map[p] = partidos_map.get(p, 0) + v
        candidatos_map[c] = candidatos_map.get(c, 0) + v
        zonas_set.add(rec['zona'])

    top_candidatos = sorted(
        [{"name": k, "votes": v, "share": round((v / total_votos) * 100, 2) if total_votos > 0 else 0}
         for k, v in candidatos_map.items()],
        key=lambda x: x['votes'], reverse=True
    )[:10]

    top_partidos = sorted(
        [{"party": k, "votes": v, "share": round((v / total_votos) * 100, 2) if total_votos > 0 else 0}
         for k, v in partidos_map.items()],
        key=lambda x: x['votes'], reverse=True
    )[:10]

    kpis = {
        "totalRegistros": len(clean_data),
        "totalVotos": total_votos,
        "totalZonas": len(zonas_set),
        "totalPartidos": len(partidos_map),
        "totalCandidatos": len(candidatos_map),
        "topCandidatos": top_candidatos,
        "topPartidos": top_partidos,
        "generatedAt": datetime.now().isoformat()
    }

    with open(PROCESSED_PATH, 'w', encoding='utf-8') as f:
        json.dump(clean_data, f, ensure_ascii=False)

    with open(SRC_PROCESSED_PATH, 'w', encoding='utf-8') as f:
        json.dump(clean_data, f, ensure_ascii=False)

    with open(KPIS_SUMMARY_PATH, 'w', encoding='utf-8') as f:
        json.dump(kpis, f, ensure_ascii=False, indent=2)

    print("🎉 [Python] Medallion ETL completed successfully!")

if __name__ == '__main__':
    run_pipeline()
