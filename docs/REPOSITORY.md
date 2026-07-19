# Estrutura do repositório

## Raiz

- `index.html`: documento principal da interface.
- `README.md`: visão geral e ponto de entrada da documentação.
- `.gitignore`: arquivos locais e sensíveis ignorados.

## Frontend

- `assets/css/styles.css`: folha de estilos principal.
- `assets/js/app.js`: script principal do frontend.
- `assets/js/sqlite-data-worker.js`: camada de acesso a dados via SQLite WASM.
- `assets/vendor/sqlite-wasm/`: artefatos oficiais `sqlite3.js` e `sqlite3.wasm`.

## Dados públicos

- `data/prescribe_guard.sqlite`: snapshot SQLite publicado para consumo no navegador.

## Configuração local

- `config/api.local.json.example`: modelo de configuração.
- `config/api.local.json`: configuração local real, não versionada.

## Pipeline de atualização

- `scripts/build_data.py`: coleta, normalização, persistência e exportação de dados da API remota (replace total).
- `scripts/import_rename.py`: importação aditiva do dataset RENAME (planilha local, não versionada).
- `scripts/data_pipeline_common.py`: lógica compartilhada entre os dois scripts acima (normalização, heurísticas de severidade/efeitos/sistemas, schema, publicação do SQLite).
- `scripts/rename_synonyms.json`: tabela de sinônimos de nomes usada pelo import do RENAME.

## Dados locais

- `storage/prescribe_guard.sqlite`: base SQLite local do projeto.

## Documentação

- `docs/ARCHITECTURE.md`
- `docs/DATA_PIPELINE.md`
- `docs/OPERATIONS.md`
- `docs/REPOSITORY.md`
