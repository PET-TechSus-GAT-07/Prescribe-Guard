# Pipeline de dados

## Visão geral

O pipeline de dados é executado localmente. Ele consulta a origem externa, grava um snapshot em SQLite e publica um banco SQLite estático usado pelo frontend via WebAssembly.

## Entrada

Origem atual:

- `https://imses.crfmg.org.br/api`

Configuração:

- variável de ambiente `DETECTA_API_KEY`; ou
- arquivo `.env.local` ou `.env`; ou
- arquivo local `config/api.local.json`

O arquivo de configuração local não deve ser versionado.

## Saídas

- `storage/prescribe_guard.sqlite`
- `data/prescribe_guard.sqlite`

## Etapas do pipeline

1. Ler chave e URL base da configuração local.
2. Consultar o endpoint `/medicamentos`.
3. Percorrer medicamentos e interações retornadas.
4. Normalizar nomes e textos.
5. Deduplicar interações por par de medicamentos.
6. Inferir severidade a partir do campo `acao` e do texto clínico.
7. Inferir efeitos e sistemas afetados por heurísticas textuais.
8. Gravar tudo no SQLite.
9. Criar índices úteis para consulta no navegador.
10. Publicar `data/prescribe_guard.sqlite` com `VACUUM INTO`.

O banco público não contém chave de API. Ele contém apenas o snapshot normalizado e metadados não sensíveis, como contagem de registros e data da última sincronização.

## Campos de origem e campos derivados

Campos copiados da origem para o snapshot:

- nome e identificador dos medicamentos;
- `acao`;
- `mecanismo_efeito`;
- `recomendacoes`;
- identificador da interação na origem.

Campos derivados localmente:

- `severity`;
- `effects`;
- `systems_affected`.

Os campos derivados existem para atender necessidades da interface e não devem ser interpretados como campos nativos do serviço de origem.

## Schema consultado pelo frontend

O frontend consulta diretamente as tabelas `medications`, `interactions` e `metadata`.

Consultas principais:

- catálogo de medicamentos: `SELECT name, COALESCE(NULLIF(drug_class, ''), 'Medicamento') AS class FROM medications ORDER BY name COLLATE NOCASE`;
- localização exata por nome: `SELECT name, COALESCE(NULLIF(drug_class, ''), 'Medicamento') AS class FROM medications WHERE name = ? COLLATE NOCASE LIMIT 1`;
- interações entre pares selecionados: `SELECT ... FROM interactions WHERE pair_key IN (?, ...)`.

Os campos `effects_json` e `systems_json` continuam armazenados como JSON dentro do SQLite porque representam listas derivadas e são lidos pelo Worker antes de chegar à interface.

## Deduplicação

A mesma interação pode aparecer associada a mais de um medicamento na resposta da origem. Para evitar duplicidade visual e inconsistência de contagem, os pares são normalizados em ordem canônica e persistidos por uma chave única.

Exemplo:

- `Varfarina + AAS`
- `AAS + Varfarina`

Ambos passam a ser tratados como o mesmo par.

## Heurísticas de severidade

Como a origem não entrega um campo padronizado de severidade visual, o pipeline converte o campo `acao` em uma escala interna:

- `Contraindicado` -> `contraindicated`
- `Geralmente evitar` -> `major`
- `Evitar a associação` -> `major`
- `Monitorizar de perto` -> `moderate`
- `Ajustar a dose` -> `moderate`

Quando o campo não basta, o texto de recomendação e mecanismo é usado como reforço.

## Heurísticas de efeitos e sistemas

Como a origem também não entrega a classificação usada pelo mapa corporal, o pipeline tenta inferir:

- efeitos clínicos;
- sistemas orgânicos afetados.

Essa inferência é baseada em padrões de texto. Ela deve ser tratada como uma camada de enriquecimento do projeto, não como informação nativa da origem.

## Atualização do snapshot

Comando padrão:

```bash
python3 scripts/build_data.py
```

Fluxo recomendado:

1. Atualizar o snapshot local.
2. Revisar mudanças em `data/prescribe_guard.sqlite`.
3. Validar visualmente a aplicação.
4. Versionar apenas o que deve ser público.
