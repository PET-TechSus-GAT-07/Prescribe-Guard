# Prescribe-Guard

Plataforma de consulta técnica de interações fármaco-fármaco e fármaco-nutriente, publicada como site estático no GitHub Pages (projeto do PET-TechSus / UNIFAL-MG).

## Restrições de arquitetura (não negociáveis)

1. Publicação em GitHub Pages — sem backend em produção.
2. O frontend consome apenas arquivos estáticos versionados no repositório (`index.html`, `assets/`, `data/prescribe_guard.sqlite`), lidos via SQLite WASM em um Web Worker.
3. Nenhuma chave de API ou dado bruto de terceiro chega ao navegador. A atualização de dados acontece localmente; só o snapshot já normalizado é versionado.

Detalhes em [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Pipeline de dados: duas fontes, ordem obrigatória

```bash
python3 scripts/build_data.py                          # 1. API remota — replace total
python3 scripts/import_rename.py --xlsx ../RENAME.xlsx  # 2. planilha RENAME — merge aditivo
```

`build_data.py` sempre roda primeiro porque apaga e reescreve `medications`/`interactions` do zero. Rodá-lo depois de `import_rename.py` descartaria o que veio do RENAME. Lógica compartilhada entre os dois scripts (normalização de texto, heurísticas de severidade/efeitos/sistemas, schema, publicação do SQLite) vive em `scripts/data_pipeline_common.py` — mudanças nessas heurísticas devem ser feitas ali, não duplicadas em cada script.

O dataset RENAME (`RENAME.xlsx`) é dado curado manualmente por pessoas com formação na área — não fica no repositório (mesmo princípio da chave de API: dado bruto de terceiro nunca é versionado). O texto clínico dessa fonte (mecanismo, manejo do paciente) é gravado verbatim, sem reescrita.

Detalhes completos, incluindo o mapeamento `Risco` → severidade e a tabela de sinônimos de nomes: [docs/DATA_PIPELINE.md](./docs/DATA_PIPELINE.md).

## Documentação

Antes de duplicar contexto aqui, veja:

- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — desenho geral, camadas, consultas SQL usadas pelo frontend.
- [docs/DATA_PIPELINE.md](./docs/DATA_PIPELINE.md) — as duas fontes de dados, heurísticas, schema.
- [docs/OPERATIONS.md](./docs/OPERATIONS.md) — operação e manutenção.
- [docs/REPOSITORY.md](./docs/REPOSITORY.md) — mapa de arquivos do repositório.

## Convenções

- **Idioma**: documentação, UI e texto de commit em português; nomes de código (funções, variáveis, arquivos) em inglês/termos técnicos onde já é convenção do projeto.
- **Commits**: mensagens profissionais em inglês, sem menção a ferramentas de IA na autoria.
- **Dependências**: o frontend é vanilla JS/CSS + SQLite WASM, sem framework. O build tooling (`scripts/`) é Python stdlib, com uma única exceção: `openpyxl`, usada só por `import_rename.py` para ler o `.xlsx` local — nunca roda no navegador.
- **Sem comentários desnecessários**: só comentar o que não é óbvio pelo código (uma decisão não-trivial, uma restrição escondida) — não descrever o que o código já deixa claro.
