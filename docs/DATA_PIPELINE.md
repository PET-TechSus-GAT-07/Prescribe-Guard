# Pipeline de dados

## Visão geral

O pipeline de dados é executado localmente. Ele consulta as origens configuradas, grava um snapshot em SQLite e publica um banco SQLite estático usado pelo frontend via WebAssembly.

Há duas origens independentes, cada uma com seu próprio script:

- `scripts/build_data.py` — origem remota (API), faz **replace total** das tabelas.
- `scripts/import_rename.py` — origem local (planilha RENAME), faz **merge aditivo**.

Lógica comum aos dois scripts (normalização de texto, heurísticas de severidade/efeitos/sistemas, deduplicação de pares, publicação do SQLite estático) vive em `scripts/data_pipeline_common.py`.

## Origem 1: API remota (`build_data.py`)

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

## Origem 2: planilha RENAME (`import_rename.py`)

Origem atual:

- `RENAME.xlsx`, arquivo local mantido **fora do repositório** (mesmo princípio da API: só o snapshot processado é versionado, nunca o dado bruto de terceiro).

A planilha reúne, em duas abas, a Relação Nacional de Medicamentos Essenciais e interações medicamentosas levantadas manualmente a partir do UpToDate/Lexicomp por pessoas com formação na área. Por ser dado curado à mão, o texto clínico (`Resumo` e `Manejo do paciente`) é gravado **verbatim** no banco — o script não reescreve, resume ou reinterpreta esse conteúdo.

Configuração:

- `--xlsx <caminho>` (obrigatório): caminho local do `RENAME.xlsx`.
- `--synonyms` (opcional, padrão `scripts/rename_synonyms.json`): tabela de sinônimos usada para unificar nomes que aparecem com grafias diferentes nas duas fontes (ex.: `AAS` / `ácido acetilsalicílico`).

Comando:

```bash
python3 scripts/import_rename.py --xlsx ../RENAME.xlsx
```

### Etapas do import

1. Ler a aba `RENAME (original)` (lista oficial de medicamentos essenciais, com código ATC) e a aba `RENAME (com IM)` (interações).
2. Resolver o nome de cada medicamento: reutiliza o nome já existente no catálogo se houver correspondência exata (ignorando acento/maiúsculas); senão consulta `scripts/rename_synonyms.json`; senão cria uma entrada nova com o nome do RENAME.
3. Mapear a coluna `Risco` (rating padrão Lexi-Interact) para a escala de severidade interna:
   - `A: Nenhuma interação conhecida` -> `safe`
   - `B: Nenhuma ação necessária` -> `minor`
   - `C: Monitorar a terapia` -> `moderate`
   - `D: Considerar modificação da terapia` -> `major`
   - `X: Evite a combinação` -> `contraindicated`
   - Quando o campo vem vazio, usa a mesma heurística textual do `build_data.py` como reforço.
   - Linhas com `Risco` preenchido mas fora desse padrão (colunas deslocadas na planilha de origem) são puladas e contabilizadas no resumo impresso pelo script.
4. Inferir efeitos e sistemas afetados sobre o texto de `Resumo`/`Manejo do paciente`, reaproveitando as mesmas heurísticas de `build_data.py`.
5. Enriquecer `medications.atc_code` e `drug_class` a partir do código ATC da aba `RENAME (original)` — só quando esses campos ainda estiverem vazios (não sobrescreve classificação manual já existente).
6. **Merge aditivo**: para pares que já existem no banco (vindos da API), em vez de substituir, reconcilia campo a campo — mantém a severidade mais alta entre as duas fontes, mantém o texto mais longo/informativo entre mecanismo/recomendação, e une as listas de efeitos/sistemas afetados. O `source` do par mesclado não muda.
7. Publicar `data/prescribe_guard.sqlite` com `VACUUM INTO`, reaproveitando a mesma rotina usada por `build_data.py`.

### Ordem de execução obrigatória

```bash
python3 scripts/build_data.py                          # 1. refresh total a partir da API
python3 scripts/import_rename.py --xlsx ../RENAME.xlsx  # 2. merge aditivo do RENAME por cima
```

`build_data.py` sempre roda **antes**, porque ele apaga e reescreve as tabelas `medications`/`interactions` do zero. Rodá-lo depois de `import_rename.py` descartaria tudo que veio do RENAME.

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

Comando padrão (ordem obrigatória — ver seção "Origem 2" acima):

```bash
python3 scripts/build_data.py
python3 scripts/import_rename.py --xlsx ../RENAME.xlsx
```

Fluxo recomendado:

1. Atualizar o snapshot local com os dois comandos, nessa ordem.
2. Revisar mudanças em `data/prescribe_guard.sqlite`.
3. Validar visualmente a aplicação.
4. Versionar apenas o que deve ser público.

## Tabela de sinônimos de nomes

`scripts/rename_synonyms.json` mapeia grafias do RENAME (DCB completo, forma de sal) para o nome já usado no catálogo do Prescribe-Guard, evitando entradas duplicadas do mesmo fármaco (ex.: `AAS` e `ácido acetilsalicílico` viram uma única entrada). A lista atual é deliberadamente conservadora: só inclui equivalências 1:1 de alta confiança. Casos ambíguos (mais de um sal presente no RENAME, ex. losartana sódica/potássica) ou produtos combinados (ex. sulfametoxazol + trimetoprima) foram deixados de fora de propósito.

Essa tabela foi montada por comparação de nomenclatura farmacológica geral, não por alguém com formação clínica — recomenda-se revisão por alguém da área de farmácia/saúde antes de expandi-la ou de considerá-la definitiva. Uma fusão incorreta juntaria interações de dois fármacos diferentes sob o mesmo nome.
