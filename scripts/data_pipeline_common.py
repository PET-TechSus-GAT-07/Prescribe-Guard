"""Lógica compartilhada entre os importadores de dados do Prescribe-Guard.

Reúne normalização de texto, heurísticas de severidade/efeitos/sistemas
afetados, deduplicação de pares e a publicação do SQLite estático — usado
tanto por `build_data.py` (fonte remota, API) quanto por `import_rename.py`
(fonte local, planilha RENAME).
"""

from __future__ import annotations

import re
import sqlite3
from pathlib import Path
from typing import Any


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


def normalize_text(value: str | None) -> str:
    return re.sub(r"\s+", " ", (value or "")).strip()


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


def _add_column_if_missing(connection: sqlite3.Connection, table: str, column: str, ddl: str) -> None:
    existing = {row[1] for row in connection.execute(f"PRAGMA table_info({table})")}
    if column not in existing:
        connection.execute(f"ALTER TABLE {table} ADD COLUMN {ddl}")


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

        CREATE INDEX IF NOT EXISTS idx_medications_name_nocase
            ON medications(name COLLATE NOCASE);

        CREATE INDEX IF NOT EXISTS idx_interactions_pair_key
            ON interactions(pair_key);
        """
    )
    # Coluna adicionada depois da criação original da tabela; migração aditiva
    # para não quebrar bancos locais já existentes.
    _add_column_if_missing(connection, "medications", "atc_code", "atc_code TEXT NOT NULL DEFAULT ''")


def publish_frontend_database(connection: sqlite3.Connection, public_db_path: Path) -> None:
    """Create a compact, self-contained SQLite artifact for static hosting."""
    public_db_path.parent.mkdir(parents=True, exist_ok=True)
    if public_db_path.exists():
        public_db_path.unlink()

    connection.execute("PRAGMA optimize")
    connection.execute("VACUUM main INTO ?", (str(public_db_path),))

    public_connection = sqlite3.connect(public_db_path)
    try:
        with public_connection:
            public_connection.execute(
                "DELETE FROM metadata WHERE key = 'source_base_url'"
            )
    finally:
        public_connection.close()
