# Arquitetura

## Objetivo

O sistema foi desenhado para atender três restrições principais:

1. Publicação em GitHub Pages.
2. Ausência de backend em produção.
3. Consumo seguro de dados externos, sem expor chave de API no navegador.

## Desenho geral

O projeto é dividido em duas camadas:

- Camada pública: frontend estático entregue pelo GitHub Pages.
- Camada privada de atualização: script local que consulta a API, atualiza o SQLite e exporta JSON.

Fluxo resumido:

`API externa -> script local -> SQLite -> JSON versionado -> frontend estático`

## Frontend

Arquivos principais:

- `index.html`
- `assets/css/styles.css`
- `assets/js/app.js`
- `data/app-data.json`

Responsabilidades:

- carregar a base local exportada em `data/app-data.json`;
- sugerir medicamentos pelo catálogo local;
- calcular interações a partir do snapshot exportado;
- renderizar grafo, mapa corporal e painel lateral;
- funcionar apenas com arquivos estáticos.

## Camada de dados

Arquivos principais:

- `scripts/build_data.py`
- `storage/prescribe_guard.sqlite`

Responsabilidades:

- buscar o catálogo completo de medicamentos e interações;
- normalizar texto e deduplicar pares;
- preservar os campos clínicos vindos da origem;
- inferir severidade, efeitos e sistemas afetados quando esses campos não vierem prontos da origem;
- persistir o snapshot local em SQLite;
- exportar a versão pública para JSON.

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

## Motivos para o uso de SQLite

O SQLite foi adotado como base local porque:

- é simples de transportar e inspecionar;
- permite manter um snapshot offline do projeto;
- facilita curadoria futura sem exigir backend;
- separa a camada de publicação da camada de atualização.

## Motivos para o uso de JSON no site

O frontend publicado consome JSON porque:

- GitHub Pages entrega arquivos estáticos sem backend;
- o navegador não precisa acessar a API externa;
- a chave de API não fica exposta em produção;
- o comportamento do site permanece previsível e fácil de depurar.
