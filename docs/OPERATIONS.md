# Operação e manutenção

## Configuração inicial

Crie um arquivo local a partir do modelo recomendado:

```bash
cp .env.example .env.local
```

Depois, preencha a chave da API no arquivo local. Como alternativa, você pode usar a variável de ambiente `DETECTA_API_KEY` ou `config/api.local.json`.

## Atualização de dados

Execute:

```bash
python3 scripts/build_data.py
```

Resultado esperado:

- atualização de `storage/prescribe_guard.sqlite`;
- publicação de `data/prescribe_guard.sqlite`.

Observação importante:

- mecanismo, recomendação e ação textual são preservados da origem;
- severidade, efeitos e sistemas afetados são enriquecidos localmente durante a publicação.

## Execução local do site

Como o frontend usa `fetch`, Worker e WebAssembly, abra o projeto com servidor estático:

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

O SQLite público em `data/prescribe_guard.sqlite` deve ser publicado. O SQLite local em `storage/` e a configuração local não devem ser publicados.

## Arquivos sensíveis e locais

Arquivos que devem permanecer fora do versionamento:

- `config/api.local.json`
- `.env`
- `.env.local`
- `storage/*.sqlite`
- `storage/*.sqlite-shm`
- `storage/*.sqlite-wal`

## Boas práticas de atualização

- evitar rodar o pipeline sem necessidade;
- revisar o SQLite público quando houver mudança grande de conteúdo;
- manter as heurísticas documentadas quando novas regras forem adicionadas;
- não mover a lógica de consulta da API para o navegador enquanto o projeto continuar em GitHub Pages.

## Evolução futura recomendada

Possíveis próximos passos:

- adicionar uma tabela de curadoria manual no SQLite para classes farmacológicas;
- adicionar uma tabela de mapeamento manual para sistemas orgânicos;
- separar o `app.js` em módulos menores quando a interface crescer;
- criar testes para o pipeline de publicação.
