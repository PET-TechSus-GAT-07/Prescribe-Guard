#!/usr/bin/env python3
"""Atualiza a base SQLite local e exporta o JSON estático usado pelo site."""

from __future__ import annotations

import argparse
import json
import os
import re
import sqlite3
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


DEFAULT_BASE_URL = "https://imses.crfmg.org.br/api"
DEFAULT_CONFIG_PATH = Path("config/api.local.json")
DEFAULT_DB_PATH = Path("storage/prescribe_guard.sqlite")
DEFAULT_OUTPUT_PATH = Path("data/app-data.json")

DRUG_CLASS_OVERRIDES = {
    "AAS": "Antiagregante / AINE",
    "Amlodipina": "Bloqueador do canal de cálcio",
    "Amiodarona": "Antiarrítmico",
    "Atorvastatina": "Estatina",
    "Ciprofloxacino": "Antibiótico fluoroquinolona",
    "Digoxina": "Glicosídeo cardíaco",
    "Eritromicina": "Antibiótico macrolídeo",
    "Fluoxetina": "ISRS (antidepressivo)",
    "Lisinopril": "IECA / Anti-hipertensivo",
    "Losartana": "BRA / Anti-hipertensivo",
    "Metformina": "Antidiabético",
    "Methotrexato": "Imunossupressor / DMARD",
    "Metoprolol": "Beta-bloqueador",
    "Omeprazol": "IBP",
    "Paracetamol": "Analgésico / Antipirético",
    "Prednisona": "Corticosteroide",
    "Sinvastatina": "Estatina",
    "Tramadol": "Opioide fraco",
    "Varfarina": "Anticoagulante",
    "Álcool": "Substância",
}

SEVERITY_PRIORITY = {
    "safe": 0,
    "minor": 1,
    "moderate": 2,
    "major": 3,
    "contraindicated": 4,
}

SEVERITY_BY_ACTION = {
    "contraindicado": "contraindicated",
    "geralmente evitar": "major",
    "evitar a associação": "major",
    "monitorizar de perto": "moderate",
    "ajustar a dose": "moderate",
}

SYSTEM_PATTERNS = {
    "cardiovascular": [
        r"\brni\b",
        r"\binr\b",
        r"bradic",
        r"bloqueio av",
        r"ecg",
        r"hemodin",
        r"arrit",
        r"cardi",
        r"sangramento",
        r"hemorrag",
    ],
    "snc": [
        r"seroton",
        r"convuls",
        r"neurol",
        r"\bsnc\b",
        r"seda",
        r"hiperterm",
        r"tontura",
        r"confus",
    ],
    "figado": [
        r"hep[aá]t",
        r"f[ií]gado",
        r"cyp\d",
        r"metaboli",
        r"transamina",
    ],
    "rins": [
        r"renal",
        r"rins?",
        r"creatinin",
        r"nefro",
        r"rabdomi[oó]lise",
        r"secre[cç][aã]o tubular",
        r"excre[cç][aã]o",
    ],
    "hematologico": [
        r"sangramento",
        r"hemorrag",
        r"mielossup",
        r"plaquet",
        r"hemat",
        r"medula [óo]ssea",
    ],
    "gastrointestinal": [
        r"gastroint",
        r"\bgi\b",
        r"mucosite",
        r"est[oô]mago",
        r"n[aá]use",
        r"v[oô]mit",
        r"intestinal",
    ],
    "respiratorio": [
        r"respirat",
        r"pulm",
        r"bronc",
        r"dispne",
    ],
}

EFFECT_PATTERNS = {
    "Acidose lática": [r"acidose l[aá]tica"],
    "Bloqueio AV": [r"bloqueio av"],
    "Bradicardia": [r"bradic"],
    "Complicações hemorrágicas": [r"complica[cç][õo]es hemorr"],
    "Convulsões": [r"convuls"],
    "Hepatotoxicidade": [r"hepato"],
    "Hemorragia": [r"hemorrag"],
    "Hipoglicemia": [r"hipoglic"],
    "Hipertermia": [r"hiperterm"],
    "Insuficiência renal aguda": [r"insufici[êe]ncia renal aguda"],
    "Miopatia": [r"miopati"],
    "Mielossupressão": [r"mielossup"],
    "Mucosite": [r"mucosite"],
    "Rabdomiólise": [r"rabdomi[oó]lise"],
    "Sangramento": [r"sangramento"],
    "Síndrome serotoninérgica": [r"s[ií]ndrome serotonin"],
    "Toxicidade digitálica": [r"digit[aá]l"],
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Atualiza o snapshot offline do Detecta Interações."
    )
    parser.add_argument(
        "--config",
        default=str(DEFAULT_CONFIG_PATH),
        help="Arquivo JSON local com apiKey e baseUrl.",
    )
    parser.add_argument(
        "--db",
        default=str(DEFAULT_DB_PATH),
        help="Caminho do banco SQLite local.",
    )
    parser.add_argument(
        "--output",
        default=str(DEFAULT_OUTPUT_PATH),
        help="Caminho do JSON exportado para o frontend.",
    )
    return parser.parse_args()


def normalize_text(value: str | None) -> str:
    return re.sub(r"\s+", " ", (value or "")).strip()


def load_settings(config_path: Path) -> tuple[str, str]:
    settings: dict[str, Any] = {}
    if config_path.exists():
        settings = json.loads(config_path.read_text(encoding="utf-8"))

    api_key = settings.get("apiKey") or os.getenv("DETECTA_API_KEY")
    base_url = settings.get("baseUrl") or os.getenv("DETECTA_BASE_URL") or DEFAULT_BASE_URL

    if not api_key:
        raise SystemExit(
            "Chave ausente. Defina DETECTA_API_KEY ou crie config/api.local.json."
        )

    return str(api_key), str(base_url).rstrip("/")


def fetch_json(base_url: str, path: str, api_key: str) -> Any:
    url = f"{base_url}{path}"
    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": "Prescribe-Guard Data Builder/1.0",
            "X-API-Key": api_key,
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise SystemExit(f"Erro HTTP {error.code} ao consultar {url}: {detail}") from error
    except urllib.error.URLError as error:
        raise SystemExit(f"Falha de rede ao consultar {url}: {error}") from error


def canonical_pair(drug_a: str, drug_b: str) -> tuple[str, str]:
    ordered = sorted([drug_a, drug_b], key=lambda item: item.casefold())
    return ordered[0], ordered[1]


def infer_severity(action: str, recommendation: str, mechanism: str) -> str:
    action_key = normalize_text(action).casefold()
    if action_key in SEVERITY_BY_ACTION:
        return SEVERITY_BY_ACTION[action_key]

    text = " ".join([action, recommendation, mechanism]).casefold()
    if "contraind" in text:
        return "contraindicated"
    if "evitar" in text:
        return "major"
    if "monitor" in text or "ajust" in text:
        return "moderate"
    return "minor"


def infer_labels(text: str, patterns: dict[str, list[str]]) -> list[str]:
    normalized = normalize_text(text).casefold()
    labels = []
    for label, regexes in patterns.items():
        if any(re.search(regex, normalized) for regex in regexes):
            labels.append(label)
    return labels


def enrich_interaction(action: str, recommendation: str, mechanism: str) -> tuple[str, list[str], list[str]]:
    combined = " ".join([action, recommendation, mechanism])
    severity = infer_severity(action, recommendation, mechanism)
    effects = infer_labels(combined, EFFECT_PATTERNS)
    systems = infer_labels(combined, SYSTEM_PATTERNS)

    if not systems and severity in {"major", "contraindicated"}:
        systems = ["cardiovascular"]

    return severity, effects, systems


def init_db(connection: sqlite3.Connection) -> None:
    connection.executescript(
        """
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS metadata (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS medications (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            indications TEXT NOT NULL DEFAULT '',
            drug_class TEXT NOT NULL DEFAULT '',
            source TEXT NOT NULL DEFAULT 'detecta-api',
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pair_key TEXT NOT NULL UNIQUE,
            source_interaction_id INTEGER,
            drug_a_id INTEGER,
            drug_b_id INTEGER,
            drug_a_name TEXT NOT NULL,
            drug_b_name TEXT NOT NULL,
            severity TEXT NOT NULL,
            action TEXT NOT NULL DEFAULT '',
            mechanism TEXT NOT NULL DEFAULT '',
            recommendation TEXT NOT NULL DEFAULT '',
            effects_json TEXT NOT NULL DEFAULT '[]',
            systems_json TEXT NOT NULL DEFAULT '[]',
            source TEXT NOT NULL DEFAULT 'detecta-api',
            updated_at TEXT NOT NULL
        );
        """
    )


def choose_better_record(current: dict[str, Any], candidate: dict[str, Any]) -> dict[str, Any]:
    current_score = (
        len(current["mechanism"]) + len(current["recommendation"]),
        SEVERITY_PRIORITY[current["severity"]],
        len(current["effects"]),
        len(current["systems_affected"]),
    )
    candidate_score = (
        len(candidate["mechanism"]) + len(candidate["recommendation"]),
        SEVERITY_PRIORITY[candidate["severity"]],
        len(candidate["effects"]),
        len(candidate["systems_affected"]),
    )
    return candidate if candidate_score > current_score else current


def build_snapshot(api_payload: dict[str, Any], fetched_at: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    medications: list[dict[str, Any]] = []
    interactions_by_pair: dict[str, dict[str, Any]] = {}

    for medication in api_payload.get("medicamentos", []):
        name = normalize_text(medication.get("nome"))
        if not name:
            continue

        medications.append(
            {
                "id": medication.get("id"),
                "name": name,
                "indications": normalize_text(medication.get("indicacoes")),
                "class": DRUG_CLASS_OVERRIDES.get(name, ""),
                "updated_at": fetched_at,
            }
        )

        for interaction in medication.get("interacoes", []):
            med1 = interaction.get("medicamento1") or {}
            med2 = interaction.get("medicamento2") or {}
            raw_name_a = normalize_text(med1.get("nome")) or name
            raw_name_b = normalize_text(med2.get("nome")) or name
            if not raw_name_a or not raw_name_b or raw_name_a.casefold() == raw_name_b.casefold():
                continue

            drug_a, drug_b = canonical_pair(raw_name_a, raw_name_b)
            pair_key = f"{drug_a.casefold()}||{drug_b.casefold()}"

            action = normalize_text(interaction.get("acao"))
            mechanism = normalize_text(interaction.get("mecanismo_efeito"))
            recommendation = normalize_text(interaction.get("recomendacoes"))
            severity, effects, systems = enrich_interaction(action, recommendation, mechanism)

            candidate = {
                "pair_key": pair_key,
                "source_interaction_id": interaction.get("id"),
                "drug_a_id": med1.get("id") if raw_name_a.casefold() == drug_a.casefold() else med2.get("id"),
                "drug_b_id": med2.get("id") if raw_name_b.casefold() == drug_b.casefold() else med1.get("id"),
                "drug_a": drug_a,
                "drug_b": drug_b,
                "severity": severity,
                "action": action,
                "mechanism": mechanism,
                "recommendation": recommendation,
                "effects": effects,
                "systems_affected": systems,
                "updated_at": fetched_at,
            }

            existing = interactions_by_pair.get(pair_key)
            interactions_by_pair[pair_key] = (
                choose_better_record(existing, candidate) if existing else candidate
            )

    medications.sort(key=lambda item: item["name"].casefold())
    interactions = sorted(
        interactions_by_pair.values(),
        key=lambda item: (
            -SEVERITY_PRIORITY[item["severity"]],
            item["drug_a"].casefold(),
            item["drug_b"].casefold(),
        ),
    )
    return medications, interactions


def write_snapshot_to_db(
    connection: sqlite3.Connection,
    medications: list[dict[str, Any]],
    interactions: list[dict[str, Any]],
    fetched_at: str,
    base_url: str,
) -> None:
    with connection:
        connection.execute("DELETE FROM medications")
        connection.execute("DELETE FROM interactions")

        connection.executemany(
            """
            INSERT INTO medications (id, name, indications, drug_class, source, updated_at)
            VALUES (?, ?, ?, ?, 'detecta-api', ?)
            """,
            [
                (
                    item["id"],
                    item["name"],
                    item["indications"],
                    item["class"],
                    item["updated_at"],
                )
                for item in medications
            ],
        )

        connection.executemany(
            """
            INSERT INTO interactions (
                pair_key,
                source_interaction_id,
                drug_a_id,
                drug_b_id,
                drug_a_name,
                drug_b_name,
                severity,
                action,
                mechanism,
                recommendation,
                effects_json,
                systems_json,
                source,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'detecta-api', ?)
            """,
            [
                (
                    item["pair_key"],
                    item["source_interaction_id"],
                    item["drug_a_id"],
                    item["drug_b_id"],
                    item["drug_a"],
                    item["drug_b"],
                    item["severity"],
                    item["action"],
                    item["mechanism"],
                    item["recommendation"],
                    json.dumps(item["effects"], ensure_ascii=False),
                    json.dumps(item["systems_affected"], ensure_ascii=False),
                    item["updated_at"],
                )
                for item in interactions
            ],
        )

        connection.executemany(
            """
            INSERT INTO metadata (key, value)
            VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
            """,
            [
                ("last_synced_at", fetched_at),
                ("source_base_url", base_url),
                ("medications_count", str(len(medications))),
                ("interactions_count", str(len(interactions))),
            ],
        )


def export_frontend_data(connection: sqlite3.Connection, output_path: Path) -> dict[str, Any]:
    medication_rows = connection.execute(
        """
        SELECT name, drug_class
        FROM medications
        ORDER BY lower(name)
        """
    ).fetchall()

    interaction_rows = connection.execute(
        """
        SELECT
            drug_a_name,
            drug_b_name,
            severity,
            action,
            mechanism,
            recommendation,
            effects_json,
            systems_json,
            source_interaction_id
        FROM interactions
        ORDER BY
            CASE severity
                WHEN 'contraindicated' THEN 4
                WHEN 'major' THEN 3
                WHEN 'moderate' THEN 2
                WHEN 'minor' THEN 1
                ELSE 0
            END DESC,
            lower(drug_a_name),
            lower(drug_b_name)
        """
    ).fetchall()

    metadata_rows = connection.execute("SELECT key, value FROM metadata").fetchall()
    metadata = {row[0]: row[1] for row in metadata_rows}

    app_data = {
        "generatedAt": metadata.get("last_synced_at"),
        "source": "sqlite-offline-snapshot",
        "drugCatalog": [
            {"name": row[0], "class": row[1] or "Medicamento"}
            for row in medication_rows
        ],
        "interactions": [
            {
                "drug_a": row[0],
                "drug_b": row[1],
                "severity": row[2],
                "source_action": row[3],
                "mechanism": row[4],
                "recommendation": row[5],
                "effects": json.loads(row[6]),
                "systems_affected": json.loads(row[7]),
                "source_id": row[8],
            }
            for row in interaction_rows
        ],
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(app_data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return app_data


def main() -> int:
    args = parse_args()
    config_path = Path(args.config)
    db_path = Path(args.db)
    output_path = Path(args.output)

    api_key, base_url = load_settings(config_path)
    fetched_at = datetime.now(UTC).replace(microsecond=0).isoformat()

    payload = fetch_json(base_url, "/medicamentos", api_key)
    medications, interactions = build_snapshot(payload, fetched_at)

    db_path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(db_path)
    try:
        init_db(connection)
        write_snapshot_to_db(connection, medications, interactions, fetched_at, base_url)
        app_data = export_frontend_data(connection, output_path)
    finally:
        connection.close()

    print(
        f"Snapshot atualizado: {len(app_data['drugCatalog'])} medicamentos, "
        f"{len(app_data['interactions'])} interações."
    )
    print(f"SQLite: {db_path}")
    print(f"JSON: {output_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
