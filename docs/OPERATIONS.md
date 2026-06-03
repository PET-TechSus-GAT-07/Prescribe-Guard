# Operação e manutenção

## Configuração inicial

Crie um arquivo local a partir do modelo:

```bash
cp config/api.local.json.example config/api.local.json
```

Depois, preencha a chave da API no arquivo local ou use a variável de ambiente `DETECTA_API_KEY`.

## Atualização de dados

Execute:

```bash
python3 scripts/build_data.py
```

Resultado esperado:

- atualização de `storage/prescribe_guard.sqlite`;
- atualização de `data/app-data.json`.

Observação importante:

- mecanismo, recomendação e ação textual são preservados da origem;
- severidade, efeitos e sistemas afetados são enriquecidos localmente durante a exportação.

## Execução local do site

Como o frontend usa `fetch`, abra o projeto com servidor estático:

```bash
python3 -m http.server 8000
```

Acesso:

- `http://127.0.0.1:8000`

## Publicação

Para publicação em GitHub Pages, os arquivos relevantes são:

- `index.html`
- `assets/`
- `data/`

O SQLite e a configuração local não precisam ser publicados.

## Arquivos sensíveis e locais

Arquivos que devem permanecer fora do versionamento:

- `config/api.local.json`
- `storage/*.sqlite`
- `storage/*.sqlite-shm`
- `storage/*.sqlite-wal`

## Boas práticas de atualização

- evitar rodar o pipeline sem necessidade;
- revisar o JSON exportado quando houver mudança grande de conteúdo;
- manter as heurísticas documentadas quando novas regras forem adicionadas;
- não mover a lógica de consulta da API para o navegador enquanto o projeto continuar em GitHub Pages.

## Evolução futura recomendada

Possíveis próximos passos:

- adicionar uma tabela de curadoria manual no SQLite para classes farmacológicas;
- adicionar uma tabela de mapeamento manual para sistemas orgânicos;
- separar o `app.js` em módulos menores quando a interface crescer;
- criar testes para o pipeline de exportação.
