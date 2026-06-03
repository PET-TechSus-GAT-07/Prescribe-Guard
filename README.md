# Prescribe-Guard

Plataforma de consulta técnica baseada em evidências para o mapeamento de interações fármaco-fármaco e fármaco-nutriente.

## Visão geral

O projeto foi estruturado para publicação em GitHub Pages, sem dependência de backend em produção. A aplicação publicada consome apenas arquivos estáticos versionados no repositório. A atualização dos dados acontece fora do navegador, com geração controlada de um snapshot local em SQLite e exportação para JSON.

## Documentação

- [Arquitetura](./docs/ARCHITECTURE.md)
- [Pipeline de dados](./docs/DATA_PIPELINE.md)
- [Operação e manutenção](./docs/OPERATIONS.md)
- [Estrutura do repositório](./docs/REPOSITORY.md)

## Estrutura principal

- `index.html`: documento principal da aplicação.
- `assets/css/styles.css`: estilos da interface.
- `assets/js/app.js`: comportamento da interface.
- `data/app-data.json`: base estática consumida pelo frontend.
- `scripts/build_data.py`: atualização offline da base.
- `storage/prescribe_guard.sqlite`: base local de curadoria e snapshot.
- `config/api.local.json.example`: modelo de configuração local.

## Atualização segura dos dados

O site publicado no GitHub Pages **não consulta a API diretamente**. A atualização acontece fora do navegador:

1. Defina a chave em `DETECTA_API_KEY` ou crie `config/api.local.json` a partir de `config/api.local.json.example`.
2. Execute:

```bash
python3 scripts/build_data.py
```

Isso faz uma leitura controlada do endpoint `/medicamentos`, salva o snapshot em `storage/prescribe_guard.sqlite` e exporta `data/app-data.json`.

## Origem dos campos

Nem todos os campos usados pelo frontend existem prontos na API de origem.

Campos preservados da origem:

- descrição do mecanismo da interação;
- recomendação clínica;
- ação textual informada pela origem.

Campos enriquecidos localmente durante a exportação:

- severidade visual usada na interface;
- efeitos clínicos listados no painel;
- sistemas orgânicos afetados usados no mapa corporal.

Os campos enriquecidos são derivados por regras locais documentadas no pipeline de dados.

## Desenvolvimento local

Como o frontend usa `fetch` para ler o JSON local, rode um servidor estático simples em vez de abrir o HTML por `file://`:

```bash
python3 -m http.server 8000
```

Depois, abra `http://127.0.0.1:8000`.
