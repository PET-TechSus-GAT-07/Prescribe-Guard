# Arquitetura

## Objetivo

O sistema foi desenhado para atender três restrições principais:

1. Publicação em GitHub Pages.
2. Ausência de backend em produção.
3. Consumo seguro de dados externos, sem expor chave de API no navegador.

## Desenho geral

O projeto é dividido em duas camadas:

- Camada pública: frontend estático entregue pelo GitHub Pages.
- Camada privada de atualização: script local que consulta a API, atualiza o SQLite local e publica um SQLite estático para o site.

Fluxo resumido:

`API externa -> script local -> SQLite local -> SQLite público versionado -> frontend estático com SQLite WASM`

## Frontend

Arquivos principais:

- `index.html`
- `assets/css/styles.css`
- `assets/js/app.js`
- `assets/js/sqlite-data-worker.js`
- `assets/vendor/sqlite-wasm/sqlite3.js`
- `assets/vendor/sqlite-wasm/sqlite3.wasm`
- `data/prescribe_guard.sqlite`

Responsabilidades:

- inicializar `sqlite3.js` e `sqlite3.wasm` em um Web Worker;
- abrir `data/prescribe_guard.sqlite` como artefato estático;
- sugerir medicamentos pelo catálogo local;
- consultar interações entre pares selecionados;
- renderizar grafo, mapa corporal e painel lateral;
- funcionar apenas com arquivos estáticos.

O Worker foi adotado porque a documentação oficial do SQLite WASM recomenda isolar trabalho potencialmente custoso fora da UI. A base atual é pequena, mas o Worker mantém a interface responsiva e preserva margem para crescimento do snapshot.

Consultas SQL principais:

```sql
SELECT name, COALESCE(NULLIF(drug_class, ''), 'Medicamento') AS class
FROM medications
ORDER BY name COLLATE NOCASE;
```

```sql
SELECT name, COALESCE(NULLIF(drug_class, ''), 'Medicamento') AS class
FROM medications
WHERE name = ? COLLATE NOCASE
LIMIT 1;
```

```sql
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
WHERE pair_key IN (?, ...);
```

## Camada de dados

Arquivos principais:

- `scripts/build_data.py`
- `storage/prescribe_guard.sqlite`
- `data/prescribe_guard.sqlite`

Responsabilidades:

- buscar o catálogo completo de medicamentos e interações;
- normalizar texto e deduplicar pares;
- preservar os campos clínicos vindos da origem;
- inferir severidade, efeitos e sistemas afetados quando esses campos não vierem prontos da origem;
- persistir o snapshot local em SQLite;
- publicar um SQLite compacto e autocontido para o frontend.

## O que vem da origem e o que é enriquecido

Campos trazidos diretamente da origem:

- nomes dos medicamentos;
- identificadores da origem;
- `mecanismo_efeito`;
- `recomendacoes`;
- `acao`.

Campos calculados localmente para a interface:

- `severity`;
- `effects`;
- `systems_affected`.

Essa separação existe porque a interface precisa de classificações visuais e anatômicas que não estão padronizadas no payload original.

## Motivos para o uso de SQLite no site

O SQLite foi adotado como base local e pública porque:

- é simples de transportar e inspecionar;
- permite manter um snapshot offline do projeto;
- facilita curadoria futura sem exigir backend;
- separa a camada de publicação da camada de atualização.
- GitHub Pages entrega o banco como arquivo estático;
- o navegador consulta dados relacionais sem acessar a API externa;
- a chave de API permanece fora do frontend.
