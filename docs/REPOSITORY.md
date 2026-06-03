# Estrutura do repositório

## Raiz

- `index.html`: documento principal da interface.
- `README.md`: visão geral e ponto de entrada da documentação.
- `.gitignore`: arquivos locais e sensíveis ignorados.

## Frontend

- `assets/css/styles.css`: folha de estilos principal.
- `assets/js/app.js`: script principal do frontend.

## Dados públicos

- `data/app-data.json`: snapshot exportado para consumo no navegador.

## Configuração local

- `config/api.local.json.example`: modelo de configuração.
- `config/api.local.json`: configuração local real, não versionada.

## Pipeline de atualização

- `scripts/build_data.py`: coleta, normalização, persistência e exportação de dados.

## Dados locais

- `storage/prescribe_guard.sqlite`: base SQLite local do projeto.

## Documentação

- `docs/ARCHITECTURE.md`
- `docs/DATA_PIPELINE.md`
- `docs/OPERATIONS.md`
- `docs/REPOSITORY.md`
