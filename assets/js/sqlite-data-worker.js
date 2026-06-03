const params = new URL(self.location.href).searchParams;
const sqliteDir = (params.get('sqlite3.dir') || '../vendor/sqlite-wasm').replace(/\/+$/, '');

importScripts(`${sqliteDir}/sqlite3.js`);

const DB_FILENAME = '/prescribe_guard.sqlite';

let sqlite3Api = null;
let db = null;
let metadata = {};

function postSuccess(id, result) {
    self.postMessage({ id, ok: true, result });
}

function postFailure(id, error) {
    self.postMessage({
        id,
        ok: false,
        error: {
            message: error?.message || String(error),
            name: error?.name || 'Error',
        },
    });
}

function rows(sql, bind) {
    return db.exec({
        sql,
        bind,
        rowMode: 'object',
        returnValue: 'resultRows',
    }).map(row => ({ ...row }));
}

function parseJsonList(value) {
    try {
        const parsed = JSON.parse(value || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function mapInteraction(row) {
    return {
        pair_key: row.pair_key,
        drug_a: row.drug_a,
        drug_b: row.drug_b,
        severity: row.severity,
        source_action: row.source_action,
        mechanism: row.mechanism,
        recommendation: row.recommendation,
        effects: parseJsonList(row.effects_json),
        systems_affected: parseJsonList(row.systems_json),
        source_id: row.source_id,
    };
}

async function initDatabase(dbUrl) {
    if (db) return { metadata };
    if (!dbUrl) throw new Error('Caminho do banco SQLite não informado.');

    sqlite3Api = sqlite3Api || await sqlite3InitModule();

    const response = await fetch(dbUrl, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`Falha ao carregar ${dbUrl}: HTTP ${response.status}`);
    }

    const bytes = new Uint8Array(await response.arrayBuffer());
    sqlite3Api.capi.sqlite3_js_posix_create_file(DB_FILENAME, bytes);
    db = new sqlite3Api.oo1.DB(DB_FILENAME, 'r');

    metadata = Object.fromEntries(
        rows('SELECT key, value FROM metadata').map(row => [row.key, row.value])
    );

    const requiredTables = rows(
        `
        SELECT name
        FROM sqlite_schema
        WHERE type = 'table'
          AND name IN ('metadata', 'medications', 'interactions')
        `
    ).map(row => row.name);

    if (requiredTables.length !== 3) {
        throw new Error('Banco SQLite público não tem o schema esperado.');
    }

    return { metadata };
}

function loadCatalog() {
    return rows(
        `
        SELECT
            name,
            COALESCE(NULLIF(drug_class, ''), 'Medicamento') AS class
        FROM medications
        ORDER BY name COLLATE NOCASE
        `
    );
}

function findDrugByName(name) {
    const [match] = rows(
        `
        SELECT
            name,
            COALESCE(NULLIF(drug_class, ''), 'Medicamento') AS class
        FROM medications
        WHERE name = ? COLLATE NOCASE
        LIMIT 1
        `,
        [name]
    );
    return match || null;
}

function findInteractionsForPairs(pairKeys) {
    if (!Array.isArray(pairKeys) || pairKeys.length === 0) return [];

    const uniqueKeys = [...new Set(pairKeys)];
    const placeholders = uniqueKeys.map(() => '?').join(', ');
    return rows(
        `
        SELECT
            pair_key,
            drug_a_name AS drug_a,
            drug_b_name AS drug_b,
            severity,
            action AS source_action,
            mechanism,
            recommendation,
            effects_json,
            systems_json,
            source_interaction_id AS source_id
        FROM interactions
        WHERE pair_key IN (${placeholders})
        ORDER BY
            CASE severity
                WHEN 'contraindicated' THEN 4
                WHEN 'major' THEN 3
                WHEN 'moderate' THEN 2
                WHEN 'minor' THEN 1
                ELSE 0
            END DESC,
            drug_a_name COLLATE NOCASE,
            drug_b_name COLLATE NOCASE
        `,
        uniqueKeys
    ).map(mapInteraction);
}

self.addEventListener('message', async event => {
    const { id, type, payload = {} } = event.data || {};

    try {
        if (type === 'init') {
            postSuccess(id, await initDatabase(payload.dbUrl));
        } else if (type === 'loadCatalog') {
            postSuccess(id, loadCatalog());
        } else if (type === 'findDrugByName') {
            postSuccess(id, findDrugByName(payload.name));
        } else if (type === 'findInteractionsForPairs') {
            postSuccess(id, findInteractionsForPairs(payload.pairKeys));
        } else {
            throw new Error(`Operação desconhecida: ${type}`);
        }
    } catch (error) {
        postFailure(id, error);
    }
});
