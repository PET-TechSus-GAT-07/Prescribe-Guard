# Auditoria de nomenclatura — import do RENAME

Documento objetivo com todas as inconsistências de nome de medicamento encontradas ao cruzar a planilha RENAME com o catálogo já existente (fonte: API `detecta-api`). Para cada item: como apareceu na planilha, como estava no catálogo, e o status atual.

**Status**: seções A, B e C aplicadas em `scripts/rename_synonyms.json` (revisadas e confirmadas). Seção D (Ceftriazona) segue deliberadamente **não aplicada** por falta de confirmação documentada — ver critério na própria seção.

**Fontes consultadas** para verificar cada item da seção C: Bulário Eletrônico da ANVISA (consultas.anvisa.gov.br), Wikipédia em português para os fármacos citados, e sites de referência farmacêutica brasileira (ex. InfoSUS/SC, MDSaúde, guias de hospitais). Nenhuma classificação de "confirmado" foi feita sem uma fonte específica encontrada para aquele item — onde não achei fonte, o documento diz isso explicitamente em vez de presumir.

## A. Já mesclado — sinônimo de sal/éster documentado (aplicado em `scripts/rename_synonyms.json`)

Mesma substância ativa, a única diferença é a forma de sal/éster especificada (não muda a substância nem o perfil de interação).

| Como está na planilha (RENAME) | Como estava na API | Status |
|---|---|---|
| ácido acetilsalicílico | AAS | mesclado (é a própria sigla) |
| paracetamol | Acetaminofeno | mesclado (sinônimo INN) |
| sulfato de salbutamol | Albuterol | mesclado — ver seção F sobre o nome em inglês |
| cloridrato de amitriptilina | Amitriptilina | mesclado |
| besilato / bensilato de anlodipino | Anlodipino | mesclado |
| sulfato de atropina | Atropina | mesclado |
| cloridrato de clorpromazina | Clorpromazina | mesclado |
| maleato de dexclorfeniramina | Dexclorfeniramina | mesclado |
| cloridrato de dobutamina | Dobutamina | mesclado |
| cloridrato de dopamina | Dopamina | mesclado |
| maleato de enalapril | Enalapril | mesclado |
| cloridrato de fluoxetina | Fluoxetina | mesclado |
| heparina sódica | Heparina | mesclado |
| cloridrato de metoclopramida | Metoclopramida | mesclado |
| cloridrato de ondansetrona | Ondansetrona | mesclado |
| cloridrato de prometazina | Prometazina | mesclado |
| cloridrato de propranolol | Propranolol | mesclado |
| cloridrato de verapamil | Verapamil | mesclado |

## B. Mesclado — variação de sal/éster de alta confiança, encontrada na segunda varredura

Mesmo padrão da seção A (mesma substância, só sal/éster diferente), encontradas numa varredura mais profunda feita depois do primeiro import. Aplicado em `rename_synonyms.json`.

| Como está na planilha (RENAME) | Como está hoje no catálogo (pós-import) | Recomendação |
|---|---|---|
| Acetato de hidrocortisona | Hidrocortisona | mesclar |
| Benzoato de metronidazol | Metronidazol | mesclar |
| Cloridrato de amiodarona / Cloridrato amiodarona / Cloridratro de amiodarona | Amiodarona | mesclar (as 3 grafias) |
| Cloridrato de biperideno | Biperideno | mesclar |
| Lactato de biperideno | Biperideno | mesclar (sal diferente do cloridrato, mesma base ativa) |
| Cloridrato de lidocaína | Lidocaina | mesclar |
| Fosfato sódico de prednisolona | Prednisolona | mesclar |
| Succinato de metoprolol | Metoprolol | mesclar (succinato = liberação prolongada, mesmo fármaco) |
| Tartarato de metoprolol | Metoprolol | mesclar (tartarato = liberação imediata, mesmo fármaco) |
| Succinato sódico de hidrocortisona | Hidrocortisona | mesclar |

## C. Mesclado — grafia divergente da mesma substância (fonte: planilha RENAME ou catálogo original)

**Correção registrada nesta revisão**: a primeira versão deste documento classificava todos os itens abaixo genericamente como "erro de digitação". Isso estava impreciso — pelo menos um caso (Fursemida/Furosemida) é documentado como simplificação coloquial/regional, não erro de digitação, e não pesquisei essa distinção item a item na primeira passada. Nesta revisão, cada item foi pesquisado individualmente. A coluna "Evidência" mostra exatamente o que foi encontrado e com que confiança — sem generalizar.

O que **não muda** entre os itens: a identidade da substância ativa é de alta confiança em todos os casos (são nomes de fármacos muito bem estabelecidos, com 1-3 caracteres de diferença, sem nenhum outro fármaco real correspondendo à grafia divergente). O que varia é *por que* a grafia diverge — e isso está documentado caso a caso abaixo, não presumido.

| Grafia divergente | Nome correto (já existe no catálogo) | Onde está a grafia divergente | Evidência |
|---|---|---|---|
| Fursemida | Furosemida | planilha RENAME | **Confirmado**: simplificação coloquial/regional documentada (elisão da vogal átona "o"), mesma substância. |
| Hidraclorotiazida | Hidroclorotiazida | planilha RENAME | **Confirmado como mesma substância**: fontes descrevem "hidraclorotiazida" como variação ortográfica menos comum do mesmo fármaco. Não encontrei fonte que classifique especificamente como erro de digitação vs. variação regional. |
| Dexametaxona | Dexametasona | planilha RENAME | Mesma substância, sem dúvida. Evidência fraca de que a troca s/x é um padrão de fala popular já documentado para outros pares de palavras em português — não achei confirmação específica para este par. |
| Clatitromicina | Claritromicina | planilha RENAME | Mesma substância, sem dúvida (é o único macrolídeo com esse padrão de nome). Não encontrei essa grafia documentada em nenhuma fonte oficial ou farmácia — sem confirmação de ser erro de digitação ou variação informal. |
| Clatritromicina | Claritromicina | planilha RENAME | Mesmo caso do item acima. |
| Digoxicina | Digoxina | planilha RENAME | Mesma substância, sem dúvida. Fontes de saúde tratam "digoxicina" como "variação ou erro de escrita" sem definir qual dos dois. |
| Cabamazepina | Carbamazepina | planilha RENAME | Mesma substância, sem dúvida (não existe outro fármaco com esse padrão de nome). Não encontrei nenhuma fonte documentando essa grafia. |
| Cloridrato de propanolol | Propranolol | planilha RENAME | Mesma substância, sem dúvida. Não encontrei fonte específica classificando a omissão do "r" como erro de digitação ou simplificação de fala — mas segue o mesmo padrão fonético de elisão do caso confirmado da Fursemida. |
| Cloridrato de propanol | Propranolol | planilha RENAME | Mesmo caso do item acima. |
| Cloridrato de clorprimazina | Clorpromazina | planilha RENAME | Mesma substância, sem dúvida. Sem fonte específica sobre a origem da grafia. |
| Cloridrato de amitrptilina | Amitriptilina | planilha RENAME | Mesma substância, sem dúvida (falta uma vogal "i" no meio da palavra). Sem fonte específica sobre a origem da grafia. |
| Cloridrato d lidocaína | Lidocaina | planilha RENAME | Mesma substância, sem dúvida — aqui a divergência é a preposição "de" abreviada para "d", não o nome do fármaco em si. |
| Diazepam. (com ponto sobrando) | Diazepam | planilha RENAME | Mesma substância, sem dúvida — divergência é só pontuação, não é questão de nomenclatura/fonética. |
| Monoitrato de isossorbida | — | **catálogo original (API)**: falta a sílaba "no" (o nome correto é "Mononitrato de isossorbida"). A planilha RENAME tem a grafia correta; foi o catálogo já existente que trouxe essa divergência. Mesclado mantendo o nome de exibição do catálogo original (com a grafia divergente) — corrigir a grafia exibida é uma limpeza cosmética separada, fora do escopo deste import. | Mesma substância, sem dúvida — mononitrato e dinitrato de isossorbida são fármacos diferentes (isso já era considerado desde a primeira análise, por isso não foi confundido com "Dinitrato de isossorbida", que é uma entrada separada e correta no catálogo). |

Em nenhum destes 14 itens a mescla decorre de presumir "são o mesmo fármaco porque parecem parecidos" — a identidade da substância foi verificada pelo nome (fármacos únicos, sem outro candidato real correspondendo à grafia). O que ficou mais bem fundamentado nesta revisão foi separar essa certeza farmacológica da certeza sobre *a origem* da grafia divergente, que é uma pergunta diferente e, para a maioria dos itens, permanece sem fonte documentada.

## D. Caso incerto — mantido separado por falta de confirmação documentada

| Grafia | Fonte | Observação |
|---|---|---|
| Ceftriazona | catálogo original (API) | grafia sem registro localizado |
| Ceftriaxona | planilha RENAME | grafia correta, documentada na ANVISA |
| Cefitriaxona | planilha RENAME | outra grafia, também sem registro localizado |

Busquei "Ceftriazona" na ANVISA e na literatura e não encontrei nenhum registro de substância com esse nome — só resultados de "Ceftriaxona". O fato de existirem *duas* grafias diferentes divergindo de "Ceftriaxona" (a do catálogo e a "Cefitriaxona" da própria planilha) reforça que provavelmente são erro de digitação da mesma substância, mas isso continua sendo inferência minha, não confirmação documentada — por isso ficam como 3 entradas separadas no catálogo até alguém da farmácia confirmar.

Nota trazida por vocês: cientificamente, "ceftriaxona sódica" e "ceftriaxona dissódica" são a mesma molécula estabilizada — isso confirma que variação de sal/forma farmacêutica da ceftriaxona não seria motivo de separar entradas, mas não resolve a dúvida específica sobre se "Ceftriazona" é erro de digitação ou outra coisa.

## E. Falso positivo da varredura — NÃO é duplicata, nenhuma ação necessária

| Nome 1 | Nome 2 | Por que não é duplicata |
|---|---|---|
| Norepinefrina | Epinefrina | São fármacos diferentes (noradrenalina x adrenalina) — mesma classe (catecolaminas), seletividade de receptor e uso clínico diferentes. O algoritmo de similaridade de texto aproximou os dois só por causa da substring comum "epinefrina"; mantidos como entradas separadas corretamente.

## F. Nome em inglês mantido por decisão do time

| Grafia | Fonte | Decisão |
|---|---|---|
| Albuterol | catálogo original (API), pré-existente | Nome padrão no Brasil/DCB seria "Salbutamol" (mesma substância, INN x USAN). Decisão: manter "Albuterol" como está — não é erro de dado, é preferência de nomenclatura já presente no catálogo original antes deste trabalho.

## G. Duplicata pré-existente na própria API — fora de escopo, não alterada

| Nome 1 | Nome 2 | Observação |
|---|---|---|
| Acetaminofeno | Paracetamol | Ambas já existiam como entradas separadas no catálogo original (`detecta-api`) **antes** de qualquer alteração deste trabalho — não foi introduzida pelo import do RENAME. O sinônimo `paracetamol -> Acetaminofeno` (seção A) só define para onde o dado *novo* do RENAME é direcionado; não mescla as duas entradas antigas entre si. Deduplicar essas duas ficaria fora do escopo do import do RENAME (mexeria em dado da fonte original, não da planilha).
