# Auditoria de merge — interações que já existiam nas duas fontes

Quando um par de medicamentos aparecia tanto no catálogo original (API `detecta-api`) quanto na planilha RENAME, o import não substituiu o registro inteiro — reconciliou campo a campo: a severidade mais alta das duas prevalece (nunca rebaixa uma severidade já registrada), o texto mais longo/informativo entre mecanismo e recomendação prevalece, e as listas de efeitos/sistemas afetados são unidas. Nunca peguei o texto pior nem uma severidade mais branda que a já existente.

Isso afetou **52** dos 335 pares originais da API (as outras 283 interações ficaram 100% intocadas — nome, texto e severidade idênticos ao que a API tinha).

Resumo do que mudou nesses 52:
- **6** tiveram a severidade elevada (RENAME indicava uma classificação mais grave que a API).
- **48** tiveram o texto de mecanismo/recomendação substituído pelo do RENAME (por ser mais longo/informativo).
- **44** tiveram a lista de efeitos e/ou sistemas afetados ampliada pela união das duas fontes.

O texto de cada fonte em si nunca foi reescrito — a mudança é sempre "qual dos dois textos originais é usado no par", nunca uma paráfrase ou resumo feito por mim.

## Resumo

| Par | Severidade | Texto substituído? | Efeitos/sistemas ampliados? |
|---|---|---|---|
| Amiodarona × Ciprofloxacino | Contraindicada | sim | sim |
| Biperideno × Cloreto de potassio | Contraindicada | sim | sim |
| Cloreto de potassio × Dexclorfeniramina | Contraindicada | sim | sim |
| Cloreto de potassio × Prometazina | Contraindicada | sim | sim |
| Clorpromazina × Metoclopramida | Contraindicada | não | sim |
| Haloperidol × Metoclopramida | Contraindicada | não | sim |
| Metoclopramida × Prometazina | Contraindicada | sim | sim |
| Albuterol × Carvedilol | Maior | sim | não |
| Albuterol × Propranolol | Maior | sim | não |
| Amiodarona × Amitriptilina | Maior | sim | sim |
| Amiodarona × Claritromicina | Maior → **Contraindicada** | sim | sim |
| Amiodarona × Clorpromazina | Maior | sim | sim |
| Amiodarona × Fluconazol | Maior | sim | sim |
| Amiodarona × Fluoxetina | Maior | sim | sim |
| Amiodarona × Furosemida | Maior | sim | não |
| Amiodarona × Haloperidol | Maior | sim | sim |
| Amiodarona × Hidroclorotiazida | Maior | sim | não |
| Amiodarona × Ondansetrona | Maior | sim | sim |
| Amitriptilina × Epinefrina | Maior | sim | não |
| Amitriptilina × Fluoxetina | Maior | sim | sim |
| Carvedilol × Metildopa | Maior | sim | sim |
| Cloreto de potassio × Espironolactona | Maior → **Contraindicada** | não | sim |
| Fluconazol × Midazolam | Maior | sim | sim |
| Furosemida × Gentamicina | Maior | sim | não |
| Metildopa × Propranolol | Maior | sim | sim |
| Amiodarona × Carbamazepina | Moderada | sim | não |
| Amiodarona × Digoxina | Moderada → **Maior** | sim | sim |
| Amiodarona × Fenobarbital | Moderada | sim | sim |
| Amiodarona × Verapamil | Moderada | sim | sim |
| Amitriptilina × Haloperidol | Moderada | sim | sim |
| Amitriptilina × Ondansetrona | Moderada | sim | sim |
| Anlodipino × Sinvastatina | Moderada → **Maior** | sim | sim |
| Atenolol × Verapamil | Moderada | sim | sim |
| Captopril × Espironolactona | Moderada | sim | sim |
| Carbamazepina × Verapamil | Moderada → **Maior** | sim | sim |
| Carvedilol × Epinefrina | Moderada | sim | não |
| Carvedilol × Verapamil | Moderada | sim | sim |
| Ciprofloxacino × Dexametasona | Moderada | sim | sim |
| Ciprofloxacino × Haloperidol | Moderada | sim | sim |
| Ciprofloxacino × Prednisolona | Moderada | sim | sim |
| Claritromicina × Digoxina | Moderada | sim | sim |
| Claritromicina × Haloperidol | Moderada | sim | sim |
| Clorpromazina × Haloperidol | Moderada → **Maior** | sim | sim |
| Enalapril × Espironolactona | Moderada | sim | sim |
| Fenitoina × Fluconazol | Moderada | não | sim |
| Fluconazol × Haloperidol | Moderada | sim | sim |
| Fluoxetina × Ondansetrona | Moderada | sim | sim |
| Gentamicina × Sulfato de magnesio | Moderada | sim | sim |
| Haloperidol × Ondansetrona | Moderada | sim | sim |
| Haloperidol × Prometazina | Moderada | sim | sim |
| Metoprolol × Verapamil | Moderada | sim | sim |
| Propranolol × Verapamil | Moderada | sim | sim |

## Detalhe completo, par a par

### Amiodarona × Ciprofloxacino

- **Severidade**: `contraindicated` (sem mudança)

- **Mecanismo — API (antes, 86 car.)**: Aumento de intervalo QT, que pode resultar em risco elevado de arritmias ventriculares
- **Mecanismo — RENAME (depois, 183 car., prevaleceu por ser mais longo/informativo)**: Agentes que prolongam o intervalo QT (Risco Indeterminado - Evitar) podem aumentar os efeitos de prolongamento do intervalo QTc de agentes que prolongam o intervalo QT (Risco Máximo).

- **Recomendação — API (antes, 17 car.)**: Evitar associação
- **Recomendação — RENAME (depois, 416 car.)**: Monitore o prolongamento do intervalo QTc e as arritmias ventriculares (incluindo torsades de pointes) quando esses medicamentos forem combinados. Pacientes com outros fatores de risco (por exemplo, idade avançada, sexo feminino, bradicardia, hipocalemia, hipomagnesemia, doença cardíaca e concentrações mais elevadas do medicamento) provavelmente apresentam maior risco para essas toxicidades potencialmente fatais.

- **Efeitos** — antes: — | depois (união): Bradicardia
- **Sistemas afetados** — antes: cardiovascular | depois (união): cardiovascular

---

### Biperideno × Cloreto de potassio

- **Severidade**: `contraindicated` (sem mudança)

- **Mecanismo — API (antes, 102 car.)**: Risco de lesão gastrointestinal superior associada a formulações sólidas orais de cloreto de potássio.
- **Mecanismo — RENAME (depois, 124 car., prevaleceu por ser mais longo/informativo)**: Agentes com efeitos anticolinérgicos clinicamente relevantes podem aumentar os efeitos ulcerogênicos do cloreto de potássio.

- **Recomendação — API (antes, 306 car.)**: Formulações orais sólidas de cloreto de potássio é considerado contraindicado para pacientes que usam anticolinérgicos. Formulações líquidas de cloreto de potássio devem ser consideradas. Monitorizar: lesão gastrointestinal alta, como vômitos graves, dor abdominal, distensão e sangramento gastrointestinal
- **Recomendação — RENAME (depois, 924 car.)**: As formas farmacêuticas sólidas de cloreto de potássio para administração oral são contraindicadas em pacientes com esvaziamento gástrico retardado (por exemplo, devido aos efeitos de medicamentos como muitos anticolinérgicos). Pacientes em uso de medicamentos com efeitos anticolinérgicos significativos devem evitar o uso de qualquer forma farmacêutica sólida de cloreto de potássio para administração oral. Agentes com efeitos anticolinérgicos maiores (por exemplo, produtos sistêmicos) provavelmente representam maior preocupação do que agentes com efeitos anticolinérgicos menores (por exemplo, produtos inalatórios, oftálmicos ou tópicos). A bula de pelo menos uma formulação sistêmica de glicopirrolato lista o uso concomitante com formas farmacêuticas sólidas de cloreto de potássio para administração oral como contraindicado. Preparações líquidas ou efervescentes de cloreto de potássio são possíveis alternativas.

- **Efeitos** — antes: Sangramento | depois (união): Sangramento
- **Sistemas afetados** — antes: cardiovascular, hematologico, gastrointestinal | depois (união): cardiovascular, gastrointestinal, hematologico

---

### Cloreto de potassio × Dexclorfeniramina

- **Severidade**: `contraindicated` (sem mudança)

- **Mecanismo — API (antes, 177 car.)**: Risco de lesão gastrointestinal superior associada a formulações sólidas orais de cloreto de potássio. O mecanismo proposto envolve aumento do tempo de trânsito gastrointestinal
- **Mecanismo — RENAME (depois, 124 car., prevaleceu por ser mais longo/informativo)**: Agentes com efeitos anticolinérgicos clinicamente relevantes podem aumentar os efeitos ulcerogênicos do cloreto de potássio.

- **Recomendação — API (antes, 162 car.)**: Formações líquidas de cloreto de potássio devem ser consideradas. A terapia deve ser interrompida se o paciente apresentar sintomas de lesão gastrointestinal alta
- **Recomendação — RENAME (depois, 924 car.)**: As formas farmacêuticas sólidas de cloreto de potássio para administração oral são contraindicadas em pacientes com esvaziamento gástrico retardado (por exemplo, devido aos efeitos de medicamentos como muitos anticolinérgicos). Pacientes em uso de medicamentos com efeitos anticolinérgicos significativos devem evitar o uso de qualquer forma farmacêutica sólida de cloreto de potássio para administração oral. Agentes com efeitos anticolinérgicos maiores (por exemplo, produtos sistêmicos) provavelmente representam maior preocupação do que agentes com efeitos anticolinérgicos menores (por exemplo, produtos inalatórios, oftálmicos ou tópicos). A bula de pelo menos uma formulação sistêmica de glicopirrolato lista o uso concomitante com formas farmacêuticas sólidas de cloreto de potássio para administração oral como contraindicado. Preparações líquidas ou efervescentes de cloreto de potássio são possíveis alternativas.

- **Efeitos** — antes: — | depois (união): —
- **Sistemas afetados** — antes: gastrointestinal | depois (união): cardiovascular, gastrointestinal

---

### Cloreto de potassio × Prometazina

- **Severidade**: `contraindicated` (sem mudança)

- **Mecanismo — API (antes, 177 car.)**: Risco de lesão gastrointestinal superior associada a formulações sólidas orais de cloreto de potássio. O mecanismo proposto envolve aumento do tempo de trânsito gastrointestinal
- **Mecanismo — RENAME (depois, 124 car., prevaleceu por ser mais longo/informativo)**: Agentes com efeitos anticolinérgicos clinicamente relevantes podem aumentar os efeitos ulcerogênicos do cloreto de potássio.

- **Recomendação — API (antes, 200 car.)**: Formações líquidas de cloreto de potássio devem ser consideradas. A terapia deve ser interrompida se o paciente apresentar sintomas de lesão gastrointestinal alta (vômito, dor, distensão, sangramento)
- **Recomendação — RENAME (depois, 924 car.)**: As formas farmacêuticas sólidas de cloreto de potássio para administração oral são contraindicadas em pacientes com esvaziamento gástrico retardado (por exemplo, devido aos efeitos de medicamentos como muitos anticolinérgicos). Pacientes em uso de medicamentos com efeitos anticolinérgicos significativos devem evitar o uso de qualquer forma farmacêutica sólida de cloreto de potássio para administração oral. Agentes com efeitos anticolinérgicos maiores (por exemplo, produtos sistêmicos) provavelmente representam maior preocupação do que agentes com efeitos anticolinérgicos menores (por exemplo, produtos inalatórios, oftálmicos ou tópicos). A bula de pelo menos uma formulação sistêmica de glicopirrolato lista o uso concomitante com formas farmacêuticas sólidas de cloreto de potássio para administração oral como contraindicado. Preparações líquidas ou efervescentes de cloreto de potássio são possíveis alternativas.

- **Efeitos** — antes: Sangramento | depois (união): Sangramento
- **Sistemas afetados** — antes: cardiovascular, hematologico, gastrointestinal | depois (união): cardiovascular, gastrointestinal, hematologico

---

### Clorpromazina × Metoclopramida

- **Severidade**: `contraindicated` (sem mudança)

- **Mecanismo/Recomendação**: sem mudança (texto da API já era mais informativo)

- **Efeitos** — antes: — | depois (união): —
- **Sistemas afetados** — antes: cardiovascular | depois (união): cardiovascular, snc

---

### Haloperidol × Metoclopramida

- **Severidade**: `contraindicated` (sem mudança)

- **Mecanismo/Recomendação**: sem mudança (texto da API já era mais informativo)

- **Efeitos** — antes: — | depois (união): —
- **Sistemas afetados** — antes: cardiovascular | depois (união): cardiovascular, snc

---

### Metoclopramida × Prometazina

- **Severidade**: `contraindicated` (sem mudança)

- **Mecanismo — API (antes, 202 car.)**: Aumento na frequência e na gravidade das reações extrapiramidais (reações distônicas agudas, discinesia tardia, acatisia, sintomas semelhantes ao Parkinson), devido a efeitos antidopaminérgicos aditivos
- **Mecanismo — RENAME (depois, 73 car., prevaleceu por ser mais longo/informativo)**: A metoclopramida pode aumentar os efeitos adversos/tóxicos da prometazina

- **Recomendação — API (antes, 91 car.)**: A metoclopramida não deve ser prescrita em combinação com outros agentes antidopaminérgicos
- **Recomendação — RENAME (depois, 225 car.)**: Evite o uso de metoclopramida em combinação com outros agentes associados ao desenvolvimento de sintomas extrapiramidais (por exemplo, discinesia tardia), síndrome neuroléptica maligna ou depressão do SNC, como a prometazina.

- **Efeitos** — antes: — | depois (união): —
- **Sistemas afetados** — antes: cardiovascular | depois (união): cardiovascular, snc

---

### Albuterol × Carvedilol

- **Severidade**: `major` (sem mudança)

- **Mecanismo — API (antes, 108 car.)**: Broncoespasmo agudo e com risco de vida em pacientes com asma ou outras doenças obstrutivas das vias aéreas.
- **Mecanismo — RENAME (depois, 100 car., prevaleceu por ser mais longo/informativo)**: Os betabloqueadores (não seletivos) podem diminuir os efeitos broncodilatadores dos agonistas beta2.

- **Recomendação — API (antes, 167 car.)**: Evitar associação, caso necessária a coadministração, geralmente é preferido um betabloqueador cardiosseletivo (por exemplo, atenolol até 50 mg, metoprolol, nebivolol)
- **Recomendação — RENAME (depois, 364 car.)**: Pacientes com asma ou DPOC em uso de agonistas beta-2 geralmente não devem ser tratados com betabloqueadores não seletivos. Caso sejam utilizados concomitantemente, monitore atentamente a possibilidade de diminuição do efeito broncodilatador do agonista beta-2. A bula canadense do metaproterenol indica que a coadministração com betabloqueadores é contraindicada.


---

### Albuterol × Propranolol

- **Severidade**: `major` (sem mudança)

- **Mecanismo — API (antes, 210 car.)**: Os betabloqueadores podem antagonizar os efeitos dos broncodilatadores adrenérgicos beta-2 e precipitar broncoespasmo agudo, com risco de vida em pacientes com asma ou outras doenças obstrutivas das vias aéreas
- **Mecanismo — RENAME (depois, 100 car., prevaleceu por ser mais longo/informativo)**: Os betabloqueadores (não seletivos) podem diminuir os efeitos broncodilatadores dos agonistas beta2.

- **Recomendação — API (antes, 178 car.)**: Evitar associação, caso necessária, usar bloqueador beta cardiosseletivo. Os betabloqueadores não seletivos são contraindicados em pacientes com doença obstrutiva das vias aéreas
- **Recomendação — RENAME (depois, 364 car.)**: Pacientes com asma ou DPOC em uso de agonistas beta-2 geralmente não devem ser tratados com betabloqueadores não seletivos. Caso sejam utilizados concomitantemente, monitore atentamente a possibilidade de diminuição do efeito broncodilatador do agonista beta-2. A bula canadense do metaproterenol indica que a coadministração com betabloqueadores é contraindicada.


---

### Amiodarona × Amitriptilina

- **Severidade**: `major` (sem mudança)

- **Mecanismo — API (antes, 133 car.)**: Pode prolongar intervalo QT, resultando em aumento do risco de arritmias ventriculares, incluindo torsades de pointes e morte súbita.
- **Mecanismo — RENAME (depois, 184 car., prevaleceu por ser mais longo/informativo)**: Agentes que prolongam o intervalo QT (Risco Indeterminado - Cuidado) podem aumentar os efeitos de prolongamento do intervalo QTc de agentes que prolongam o intervalo QT (Risco Máximo).

- **Recomendação — API (antes, 172 car.)**: Evitar associação, a menos que se espere que os benefícios superem os riscos. Caso a associação seja necessária monitorizar eletrocardiograma, hipocalemia e hipomagnesemia.
- **Recomendação — RENAME (depois, 416 car.)**: Monitore o prolongamento do intervalo QTc e as arritmias ventriculares (incluindo torsades de pointes) quando esses medicamentos forem combinados. Pacientes com outros fatores de risco (por exemplo, idade avançada, sexo feminino, bradicardia, hipocalemia, hipomagnesemia, doença cardíaca e concentrações mais elevadas do medicamento) provavelmente apresentam maior risco para essas toxicidades potencialmente fatais.

- **Efeitos** — antes: — | depois (união): Bradicardia
- **Sistemas afetados** — antes: cardiovascular | depois (união): cardiovascular

---

### Amiodarona × Claritromicina

- **Severidade**: `major` (API) → `contraindicated` (RENAME, prevaleceu por ser mais grave)

- **Mecanismo — API (antes, 132 car.)**: Pode prolongar intervalo QT, resultando em aumento do risco de arritmias ventriculares, incluindo torsades de pointes e morte súbita
- **Mecanismo — RENAME (depois, 130 car., prevaleceu por ser mais longo/informativo)**: Agentes que prolongam o intervalo QT (Risco Máximo) podem aumentar os efeitos de prolongamento do intervalo QTc da claritromicina.

- **Recomendação — API (antes, 172 car.)**: Evitar associação, a menos que se espere que os benefícios superem os riscos. Caso a associação seja necessária monitorizar eletrocardiograma, hipocalemia e hipomagnesemia.
- **Recomendação — RENAME (depois, 290 car.)**: Evite o uso concomitante de claritromicina e desses agentes de alto risco que prolongam o intervalo QT devido ao risco de prolongamento do intervalo QT e torsades de pointes (TdP). Além disso, a inibição do CYP3A4 pela claritromicina pode aumentar as concentrações de alguns desses agentes.

- **Efeitos** — antes: — | depois (união): —
- **Sistemas afetados** — antes: cardiovascular | depois (união): cardiovascular, figado

---

### Amiodarona × Clorpromazina

- **Severidade**: `major` (sem mudança)

- **Mecanismo — API (antes, 62 car.)**: Podem causar prolongamento do intervalo QT relacionado à dose.
- **Mecanismo — RENAME (depois, 135 car., prevaleceu por ser mais longo/informativo)**: Agentes diversos que prolongam o intervalo QT (risco máximo) podem aumentar os efeitos de prolongamento do intervalo QTc da amiodarona.

- **Recomendação — API (antes, 172 car.)**: Evitar associação, a menos que se espere que os benefícios superem os riscos. Caso a associação seja necessária monitorizar eletrocardiograma, hipocalemia e hipomagnesemia.
- **Recomendação — RENAME (depois, 423 car.)**: Considere alternativas a esta combinação. Se o uso for necessário, monitore o prolongamento do intervalo QTc e arritmias (incluindo torsades de pointes). Pacientes com outros fatores de risco (por exemplo, idade avançada, sexo feminino, bradicardia, hipocalemia, hipomagnesemia, doença cardíaca e concentrações mais elevadas do medicamento) provavelmente apresentam maior risco para essas toxicidades potencialmente fatais.

- **Efeitos** — antes: — | depois (união): Bradicardia
- **Sistemas afetados** — antes: cardiovascular | depois (união): cardiovascular

---

### Amiodarona × Fluconazol

- **Severidade**: `major` (sem mudança)

- **Mecanismo — API (antes, 48 car.)**: Aumento da concentração plasmática de amiodarona
- **Mecanismo — RENAME (depois, 82 car., prevaleceu por ser mais longo/informativo)**: Inibidores fortes da CYP3A4 podem aumentar as concentrações séricas de amiodarona.

- **Recomendação — API (antes, 169 car.)**: Evitar associação, se possível, dado ao potencial de eventos cardíacos adversos sérios e potencialmente fatais associados ao aumento dos níveis plasmáticos de amiodarona
- **Recomendação — RENAME (depois, 167 car.)**: Considere alternativas ao uso de amiodarona e inibidores potentes da CYP3A4. Se combinados, monitore o aumento das concentrações de amiodarona e possíveis toxicidades.

- **Efeitos** — antes: — | depois (união): —
- **Sistemas afetados** — antes: cardiovascular | depois (união): cardiovascular, figado

---

### Amiodarona × Fluoxetina

- **Severidade**: `major` (sem mudança)

- **Mecanismo — API (antes, 160 car.)**: Prolongamento do intervalo QT, que pode resultar em efeitos aditivos e aumento do risco de arritmias ventriculares, incluindo torsades de pointes e morte súbita
- **Mecanismo — RENAME (depois, 183 car., prevaleceu por ser mais longo/informativo)**: Agentes que prolongam o intervalo QT (Risco Indeterminado - Evitar) podem aumentar os efeitos de prolongamento do intervalo QTc de agentes que prolongam o intervalo QT (Risco Máximo).

- **Recomendação — API (antes, 172 car.)**: Evitar associação, a menos que se espere que os benefícios superem os riscos. Caso a associação seja necessária monitorizar eletrocardiograma, hipocalemia e hipomagnesemia.
- **Recomendação — RENAME (depois, 416 car.)**: Monitore o prolongamento do intervalo QTc e as arritmias ventriculares (incluindo torsades de pointes) quando esses medicamentos forem combinados. Pacientes com outros fatores de risco (por exemplo, idade avançada, sexo feminino, bradicardia, hipocalemia, hipomagnesemia, doença cardíaca e concentrações mais elevadas do medicamento) provavelmente apresentam maior risco para essas toxicidades potencialmente fatais.

- **Efeitos** — antes: — | depois (união): Bradicardia
- **Sistemas afetados** — antes: cardiovascular | depois (união): cardiovascular

---

### Amiodarona × Furosemida

- **Severidade**: `major` (sem mudança)

- **Mecanismo — API (antes, 230 car.)**: A coadministração com agentes que podem produzir hipocalemia e / ou hipomagnesemia pode resultar em risco elevado de arritmias ventriculares, incluindo taquicardia ventricular e torsades de pointes potencial arritmogênico aditivo.
- **Mecanismo — RENAME (depois, 99 car., prevaleceu por ser mais longo/informativo)**: Os agentes hipotensores podem aumentar os efeitos hipotensores dos agentes associados à hipotensão.

- **Recomendação — API (antes, 183 car.)**: A coadministração de amiodarona com medicamentos que podem causar distúrbios de potássio e / ou magnésio deve ser evitada. Monitorizar eletrocardiograma, hipocalemia e hipomagnesemia.
- **Recomendação — RENAME (depois, 405 car.)**: Embora o uso concomitante de dois ou mais medicamentos que podem reduzir a pressão arterial (seja com intenção terapêutica ou como efeito adverso) seja frequentemente apropriado na prática clínica, o uso dessas combinações geralmente aumenta substancialmente o risco de hipotensão. Monitore atentamente os pacientes quanto a efeitos hipotensores aditivos caso dois ou mais desses agentes sejam combinados.


---

### Amiodarona × Haloperidol

- **Severidade**: `major` (sem mudança)

- **Mecanismo — API (antes, 86 car.)**: Aumento de intervalo QT, que pode resultar em risco elevado de arritmias ventriculares
- **Mecanismo — RENAME (depois, 87 car., prevaleceu por ser mais longo/informativo)**: A amiodarona pode aumentar os efeitos de prolongamento do intervalo QTc do haloperidol.

- **Recomendação — API (antes, 104 car.)**: Evitar a associação. Se necessário associar monitorizar eletrocardiograma, hipocalemia e hipomagnesemia.
- **Recomendação — RENAME (depois, 471 car.)**: Considere alternativas a esta combinação. Se o uso for necessário, monitore o prolongamento do intervalo QTc e arritmias (incluindo torsades de pointes). Pacientes com outros fatores de risco (por exemplo, idade avançada, sexo feminino, bradicardia, hipocalemia, hipomagnesemia, doença cardíaca e concentrações mais elevadas do medicamento) ou aqueles que utilizam haloperidol intravenoso provavelmente apresentam maior risco para essas toxicidades potencialmente fatais.

- **Efeitos** — antes: — | depois (união): Bradicardia
- **Sistemas afetados** — antes: cardiovascular | depois (união): cardiovascular

---

### Amiodarona × Hidroclorotiazida

- **Severidade**: `major` (sem mudança)

- **Mecanismo — API (antes, 40 car.)**: Risco elevado de arritmias ventriculares
- **Mecanismo — RENAME (depois, 99 car., prevaleceu por ser mais longo/informativo)**: Os agentes hipotensores podem aumentar os efeitos hipotensores dos agentes associados à hipotensão.

- **Recomendação — API (antes, 102 car.)**: Evitar associação. Caso não seja possível, monitorizar eletrocardiograma, hipomagnesemia e hipocalemia
- **Recomendação — RENAME (depois, 405 car.)**: Embora o uso concomitante de dois ou mais medicamentos que podem reduzir a pressão arterial (seja com intenção terapêutica ou como efeito adverso) seja frequentemente apropriado na prática clínica, o uso dessas combinações geralmente aumenta substancialmente o risco de hipotensão. Monitore atentamente os pacientes quanto a efeitos hipotensores aditivos caso dois ou mais desses agentes sejam combinados.


---

### Amiodarona × Ondansetrona

- **Severidade**: `major` (sem mudança)

- **Mecanismo — API (antes, 123 car.)**: Prolongamento do intervalo QT com aumento do risco de arritmias ventriculares, incluindo torsades de pointes e morte súbita
- **Mecanismo — RENAME (depois, 88 car., prevaleceu por ser mais longo/informativo)**: A amiodarona pode aumentar os efeitos de prolongamento do intervalo QTc da ondansetrona.

- **Recomendação — API (antes, 102 car.)**: Evitar associação. Caso não seja possível, monitorizar eletrocardiograma, hipomagnesemia e hipocalemia
- **Recomendação — RENAME (depois, 848 car.)**: Considere alternativas a esta combinação. Se o uso for necessário, monitore o prolongamento do intervalo QTc e arritmias (incluindo torsades de pointes). Pacientes com outros fatores de risco (por exemplo, idade avançada, sexo feminino, bradicardia, hipocalemia, hipomagnesemia, doença cardíaca e concentrações mais elevadas do medicamento) ou aqueles que utilizam ondansetrona intravenosa provavelmente apresentam maior risco para essas toxicidades potencialmente fatais. Alosetrona e palonosetrona são antieméticos antagonistas seletivos do receptor 5-HT3 alternativos que não apresentam interações medicamentosas clinicamente significativas conhecidas com a amiodarona ou efeitos de prolongamento do intervalo QT. Além disso, espera-se que a ondansetrona oral tenha menor efeito de prolongamento do intervalo QT do que a ondansetrona parenteral.

- **Efeitos** — antes: — | depois (união): Bradicardia
- **Sistemas afetados** — antes: cardiovascular | depois (união): cardiovascular

---

### Amitriptilina × Epinefrina

- **Severidade**: `major` (sem mudança)

- **Mecanismo — API (antes, 29 car.)**: Resposta pressórica aumentada
- **Mecanismo — RENAME (depois, 95 car., prevaleceu por ser mais longo/informativo)**: Os antidepressivos tricíclicos podem aumentar os efeitos vasopressores dos agonistas alfa/beta.

- **Recomendação — API (antes, 156 car.)**: Evitar associação, exceto em casos de emergência (por exemplo, tratamento de anafilaxia). Se for necessário o uso concomitante, deve ser monitorado de perto
- **Recomendação — RENAME (depois, 333 car.)**: Evite, se possível, o uso de agonistas alfa/beta em pacientes que estejam recebendo antidepressivos tricíclicos. Caso sejam utilizados, monitore a presença de sinais de aumento do efeito pressor (por exemplo, aumento da pressão arterial, dor no peito, cefaleia). Além disso, considere a redução da dose inicial do agonista alfa/beta.


---

### Amitriptilina × Fluoxetina

- **Severidade**: `major` (sem mudança)

- **Mecanismo — API (antes, 76 car.)**: Aumento da concentração de amitriptilina e risco de síndrome serotoninérgica
- **Mecanismo — RENAME (depois, 172 car., prevaleceu por ser mais longo/informativo)**: A fluoxetina pode aumentar os efeitos serotoninérgicos dos antidepressivos tricíclicos. A fluoxetina pode aumentar as concentrações séricas dos antidepressivos tricíclicos.

- **Recomendação — API (antes, 102 car.)**: Evitar a associação. Caso não seja possível, monitorizar sinais e sintomas de síndrome serotoninérgica
- **Recomendação — RENAME (depois, 669 car.)**: Monitore atentamente os sinais e sintomas da síndrome serotoninérgica/toxicidade serotoninérgica (p. ex., hiperreflexia, clonus, hipertermia, diaforese, tremor, instabilidade autonômica, alterações do estado mental) quando esses medicamentos forem combinados. Considere alternativas para pacientes com outros fatores de risco (p. ex., concentrações/doses mais elevadas dos medicamentos, maior número de agentes serotoninérgicos) que provavelmente apresentam risco ainda maior para essas toxicidades potencialmente fatais. Além disso, monitore o aumento das concentrações e dos efeitos dos antidepressivos tricíclicos (ADTs). Pode ser necessário reduzir a dose dos ADTs.

- **Efeitos** — antes: Síndrome serotoninérgica | depois (união): Hipertermia, Síndrome serotoninérgica
- **Sistemas afetados** — antes: snc | depois (união): snc

---

### Carvedilol × Metildopa

- **Severidade**: `major` (sem mudança)

- **Mecanismo — API (antes, 20 car.)**: Crises hipertensivas
- **Mecanismo — RENAME (depois, 307 car., prevaleceu por ser mais longo/informativo)**: Os betabloqueadores podem aumentar os efeitos hipertensivos de rebote dos agonistas alfa-2. Esse efeito pode ocorrer quando o agonista alfa-2 é interrompido abruptamente. Os agonistas alfa-2 podem aumentar os efeitos de bloqueio AV dos betabloqueadores. A disfunção do nó sinusal também pode ser exacerbada.

- **Recomendação — API (antes, 224 car.)**: Evitar essa combinação. Se não for possível, a pressão arterial deve ser monitorada junto com os sintomas precoces de uma crise hipertensiva (náusea, vômito, sudorese, rubor, rigidez no pescoço, dor de cabeça ou palpitações)
- **Recomendação — RENAME (depois, 519 car.)**: Monitore atentamente a frequência cardíaca em pacientes que recebem clonidina em combinação com betabloqueadores. Se possível, suspenda o betabloqueador alguns dias antes da suspensão gradual da clonidina e monitore a pressão arterial de perto. A bula da rilmenidina indica que o uso concomitante com betabloqueadores em pacientes com insuficiência cardíaca não é recomendado. Não há recomendações específicas disponíveis para outros agonistas alfa2. Betabloqueadores oftálmicos provavelmente apresentam risco reduzido.

- **Efeitos** — antes: — | depois (união): Bloqueio AV
- **Sistemas afetados** — antes: gastrointestinal | depois (união): cardiovascular, gastrointestinal

---

### Cloreto de potassio × Espironolactona

- **Severidade**: `major` (API) → `contraindicated` (RENAME, prevaleceu por ser mais grave)

- **Mecanismo/Recomendação**: sem mudança (texto da API já era mais informativo)

- **Efeitos** — antes: — | depois (união): —
- **Sistemas afetados** — antes: rins | depois (união): cardiovascular, rins

---

### Fluconazol × Midazolam

- **Severidade**: `major` (sem mudança)

- **Mecanismo — API (antes, 47 car.)**: Aumento na concentração plasmática do midazolam
- **Mecanismo — RENAME (depois, 86 car., prevaleceu por ser mais longo/informativo)**: Inibidores da CYP3A4 (Moderados) podem aumentar as concentrações séricas de midazolam.

- **Recomendação — API (antes, 145 car.)**: Evitar associação. Se associação for necessária, monitorar eventos relacionados à depresssão do SNC e reduzir dose de midazolam, caso necessário.
- **Recomendação — RENAME (depois, 393 car.)**: Evite o uso concomitante de midazolam nasal e inibidores moderados da CYP3A4. Considere alternativas para uso com midazolam oral sempre que possível e considere o uso de doses menores de midazolam. Monitore atentamente os pacientes quanto ao aumento e prolongamento dos efeitos e toxicidades do midazolam (por exemplo, sedação, depressão respiratória) caso esses medicamentos sejam combinados.

- **Efeitos** — antes: — | depois (união): —
- **Sistemas afetados** — antes: snc | depois (união): figado, respiratorio, snc

---

### Furosemida × Gentamicina

- **Severidade**: `major` (sem mudança)

- **Mecanismo — API (antes, 35 car.)**: Aumento de risco de nefrotoxicidade
- **Mecanismo — RENAME (depois, 132 car., prevaleceu por ser mais longo/informativo)**: Diuréticos de alça podem aumentar os efeitos adversos/tóxicos dos aminoglicosídeos, especificamente nefrotoxicidade e ototoxicidade.

- **Recomendação — API (antes, 87 car.)**: Evitar o uso em associação, sobretudo por via intravenosa. Monitorizar nefrotoxicidade.
- **Recomendação — RENAME (depois, 491 car.)**: Monitore os efeitos tóxicos dos aminoglicosídeos (ou seja, ototoxicidade ou nefrotoxicidade) se um diurético de alça for iniciado ou se a dose for aumentada. Isso provavelmente é mais preocupante se o diurético for administrado em altas doses por períodos prolongados. A bula de alguns diuréticos de alça ou aminoglicosídeos recomenda evitar o uso concomitante, exceto em situações de risco de vida. A bula da netilmicina recomenda evitar a administração concomitante com diuréticos de alça.


---

### Metildopa × Propranolol

- **Severidade**: `major` (sem mudança)

- **Mecanismo — API (antes, 40 car.)**: Pode ocorrer picos graves de hipertensão
- **Mecanismo — RENAME (depois, 307 car., prevaleceu por ser mais longo/informativo)**: Os betabloqueadores podem aumentar os efeitos hipertensivos de rebote dos agonistas alfa-2. Esse efeito pode ocorrer quando o agonista alfa-2 é interrompido abruptamente. Os agonistas alfa-2 podem aumentar os efeitos de bloqueio AV dos betabloqueadores. A disfunção do nó sinusal também pode ser exacerbada.

- **Recomendação — API (antes, 145 car.)**: Evitar essa combinação. Se realmente for necessária, monitorizar a pressão arterial¸ principalmente quando descontinuar tratamento com metildopa.
- **Recomendação — RENAME (depois, 519 car.)**: Monitore atentamente a frequência cardíaca em pacientes que recebem clonidina em combinação com betabloqueadores. Se possível, suspenda o betabloqueador alguns dias antes da suspensão gradual da clonidina e monitore a pressão arterial de perto. A bula da rilmenidina indica que o uso concomitante com betabloqueadores em pacientes com insuficiência cardíaca não é recomendado. Não há recomendações específicas disponíveis para outros agonistas alfa2. Betabloqueadores oftálmicos provavelmente apresentam risco reduzido.

- **Efeitos** — antes: — | depois (união): Bloqueio AV
- **Sistemas afetados** — antes: rins | depois (união): cardiovascular, rins

---

### Amiodarona × Carbamazepina

- **Severidade**: `moderate` (sem mudança)

- **Mecanismo — API (antes, 127 car.)**: Redução da concentração sérica de amiodarona e seu metabólito desetilamiodarona (DEA), o que pode resultar em falha terapêutica
- **Mecanismo — RENAME (depois, 216 car., prevaleceu por ser mais longo/informativo)**: A amiodarona pode aumentar as concentrações séricas de carbamazepina. A carbamazepina pode diminuir as concentrações séricas de amiodarona. A carbamazepina pode diminuir a exposição ao metabólito ativo da amiodarona.

- **Recomendação — API (antes, 286 car.)**: Recomenda-se Monitorizar os níveis séricos de amiodarona e DEA e o estado clínico do paciente, se os indutores de CYP450 3A4 forem adicionados ou excluídos de um esquema estável de medicamentos que inclua amiodarona. Terapia alternativa ou ajustes de dose também podem ser considerados.
- **Recomendação — RENAME (depois, 665 car.)**: Monitore a redução das concentrações e da eficácia da amiodarona, bem como o aumento dos níveis e da toxicidade da carbamazepina (por exemplo, ataxia, sonolência, vertigem, diplopia) quando esses medicamentos forem combinados. Aumentos na dose de amiodarona podem ser necessários para manter os efeitos terapêuticos, e reduções na dose de carbamazepina também podem ser necessárias. Espera-se que a redução máxima na exposição à amiodarona ocorra após a administração de múltiplas doses de carbamazepina, dentro de dias a semanas após o início do tratamento. Os efeitos indutores da carbamazepina também podem persistir por dias a semanas após a sua descontinuação.


---

### Amiodarona × Digoxina

- **Severidade**: `moderate` (API) → `major` (RENAME, prevaleceu por ser mais grave)

- **Mecanismo — API (antes, 92 car.)**: Aumento da concentração sérica de digoxina em até 100%, resultando em intoxicação digitálica
- **Mecanismo — RENAME (depois, 77 car., prevaleceu por ser mais longo/informativo)**: A amiodarona pode aumentar as concentrações séricas de glicosídeos cardíacos.

- **Recomendação — API (antes, 154 car.)**: Reduzir dose de digoxina de um terço a metade. Monitorizar níveis séricos de digoxina e fazer observação clínica sobre para avaliar intoxicação digitálica
- **Recomendação — RENAME (depois, 329 car.)**: Reduza a dose de glicosídeos cardíacos em 30% a 50% ou diminua a frequência de administração ao iniciar terapia concomitante com amiodarona. Monitore o paciente quanto ao aumento da concentração sérica e efeitos tóxicos (por exemplo, sintomas gastrointestinais, distúrbios visuais, arritmias cardíacas) dos glicosídeos cardíacos.

- **Efeitos** — antes: Toxicidade digitálica | depois (união): Toxicidade digitálica
- **Sistemas afetados** — antes: — | depois (união): cardiovascular, gastrointestinal

---

### Amiodarona × Fenobarbital

- **Severidade**: `moderate` (sem mudança)

- **Mecanismo — API (antes, 121 car.)**: Diminuição da concentração sérica de amiodarona e seu metabólito desetilamiodarona (DEA), resultando em falha terapêutica
- **Mecanismo — RENAME (depois, 103 car., prevaleceu por ser mais longo/informativo)**: Os barbitúricos podem aumentar os efeitos hipotensores dos medicamentos para baixar a pressão arterial.

- **Recomendação — API (antes, 185 car.)**: Monitorizar os níveis séricos de amiodarona e DEA e o estado clínico do paciente, sobretudo quando fenobarbital for adicionado ou retirado de um esquema. Monitorizar frequência cardíaca
- **Recomendação — RENAME (depois, 238 car.)**: Monitore as alterações hemodinâmicas, especialmente os sinais de hipotensão, caso esteja utilizando barbitúricos concomitantemente com medicamentos anti-hipertensivos. Hipotensão persistente ou grave pode exigir intervenção farmacológica.

- **Efeitos** — antes: — | depois (união): —
- **Sistemas afetados** — antes: — | depois (união): cardiovascular

---

### Amiodarona × Verapamil

- **Severidade**: `moderate` (sem mudança)

- **Mecanismo — API (antes, 115 car.)**: Efeitos farmacodinâmicos aditivos que pode causar parada sinusal, redução da contratilidade miocárdica e hipotensão
- **Mecanismo — RENAME (depois, 112 car., prevaleceu por ser mais longo/informativo)**: Bloqueadores dos canais de cálcio (não diidropiridínicos) podem aumentar os efeitos bradicárdicos da amiodarona.

- **Recomendação — API (antes, 114 car.)**: Monitorizar o estado hemodinâmico e eletrocardiográfico do paciente, especialmente durante o início de amiodarona.
- **Recomendação — RENAME (depois, 243 car.)**: Monitore o aumento dos efeitos e da toxicidade (por exemplo, bradicardia, parada sinusal, diminuição do débito cardíaco) se a amiodarona for combinada com um bloqueador dos canais de cálcio não diidropiridínico (ou seja, diltiazem, verapamil).

- **Efeitos** — antes: — | depois (união): Bradicardia
- **Sistemas afetados** — antes: cardiovascular | depois (união): cardiovascular

---

### Amitriptilina × Haloperidol

- **Severidade**: `moderate` (sem mudança)

- **Mecanismo — API (antes, 120 car.)**: Prolongamento do intervalo QT relacionado com a dose do haloperidol, provocando risco elevado de arritmias ventriculares
- **Mecanismo — RENAME (depois, 87 car., prevaleceu por ser mais longo/informativo)**: O haloperidol pode aumentar os efeitos depressores do SNC de outros depressores do SNC.

- **Recomendação — API (antes, 93 car.)**: Evitar associação, se não for possível evitar doses elevadas de haloperidol e uso intravenoso
- **Recomendação — RENAME (depois, 156 car.)**: Considere monitorar a depressão do SNC (por exemplo, sedação, sonolência) se o haloperidol for administrado concomitantemente com outros depressores do SNC.

- **Efeitos** — antes: — | depois (união): —
- **Sistemas afetados** — antes: cardiovascular | depois (união): cardiovascular, snc

---

### Amitriptilina × Ondansetrona

- **Severidade**: `moderate` (sem mudança)

- **Mecanismo — API (antes, 76 car.)**: Risco de síndrome serotoninérgica e prolongamento de intervalo QT e arritmia
- **Mecanismo — RENAME (depois, 153 car., prevaleceu por ser mais longo/informativo)**: A ondansetrona pode aumentar os efeitos serotoninérgicos de outros agentes serotoninérgicos (alto risco). Isso pode resultar em síndrome serotoninérgica.

- **Recomendação — API (antes, 72 car.)**: Monitorizar sinais e sintomas da síndrome serotoninérgica e intervalo QT
- **Recomendação — RENAME (depois, 481 car.)**: Monitore os sinais e sintomas da síndrome serotoninérgica/toxicidade serotoninérgica (por exemplo, hiperreflexia, clonus, hipertermia, diaforese, tremor, instabilidade autonômica, alterações do estado mental) quando esses medicamentos forem combinados. Pacientes com outros fatores de risco (por exemplo, concentrações/doses mais elevadas dos medicamentos, maior número de agentes serotoninérgicos) provavelmente apresentam maior risco para essas toxicidades potencialmente fatais.

- **Efeitos** — antes: Síndrome serotoninérgica | depois (união): Hipertermia, Síndrome serotoninérgica
- **Sistemas afetados** — antes: cardiovascular, snc | depois (união): cardiovascular, snc

---

### Anlodipino × Sinvastatina

- **Severidade**: `moderate` (API) → `major` (RENAME, prevaleceu por ser mais grave)

- **Mecanismo — API (antes, 84 car.)**: Aumenta concentrações plasmáticas de sinvastatina, potencializando risco de miopatia
- **Mecanismo — RENAME (depois, 68 car., prevaleceu por ser mais longo/informativo)**: A amlodipina pode aumentar as concentrações séricas de sinvastatina.

- **Recomendação — API (antes, 107 car.)**: Não ultrapassar 20 mg/dia sinvastatina ou substituir terapia por rosuvastatina, pravastatina e fluvastatina
- **Recomendação — RENAME (depois, 637 car.)**: Avalie cuidadosamente os potenciais benefícios e riscos desta combinação. Limite a dose de sinvastatina a 20 mg por dia se administrada concomitantemente com anlodipino. Caso sinvastatina e anlodipino sejam administrados concomitantemente, é necessário monitoramento laboratorial e clínico rigoroso para detectar sinais e sintomas de rabdomiólise (por exemplo, creatina fosfoquinase, dores musculares). Atorvastatina, fluvastatina, pitavastatina, pravastatina e rosuvastatina são inibidores alternativos da HMG-CoA redutase (estatinas) que não apresentam interações medicamentosas clinicamente significativas conhecidas com o anlodipino.

- **Efeitos** — antes: Miopatia | depois (união): Miopatia, Rabdomiólise
- **Sistemas afetados** — antes: — | depois (união): rins

---

### Atenolol × Verapamil

- **Severidade**: `moderate` (sem mudança)

- **Mecanismo — API (antes, 85 car.)**: Reduções aditivas na frequência cardíaca, condução cardíaca e contratilidade cardíaca
- **Mecanismo — RENAME (depois, 112 car., prevaleceu por ser mais longo/informativo)**: Agentes que causam bradicardia podem aumentar os efeitos bradicárdicos de outros agentes que causam bradicardia.

- **Recomendação — API (antes, 132 car.)**: Recomenda-se a monitorização clínica rigorosa da resposta hemodinâmica e da tolerância do paciente. Ajustar dose de um dos fármacos.
- **Recomendação — RENAME (depois, 343 car.)**: É necessário redobrar a cautela com o uso concomitante de múltiplos medicamentos que possam causar ou agravar a bradicardia. Monitore a frequência cardíaca e a pressão arterial com mais atenção e alerte os pacientes sobre o potencial de surgimento ou agravamento da bradicardia e suas consequências clínicas (por exemplo, síncope, hipotensão).

- **Efeitos** — antes: — | depois (união): Bradicardia
- **Sistemas afetados** — antes: cardiovascular | depois (união): cardiovascular

---

### Captopril × Espironolactona

- **Severidade**: `moderate` (sem mudança)

- **Mecanismo — API (antes, 32 car.)**: Aumento no risco de hipercalemia
- **Mecanismo — RENAME (depois, 127 car., prevaleceu por ser mais longo/informativo)**: Diuréticos poupadores de potássio podem aumentar os efeitos hipercalêmicos dos inibidores da enzima conversora de angiotensina.

- **Recomendação — API (antes, 28 car.)**: Monitorar níveis de potássio
- **Recomendação — RENAME (depois, 493 car.)**: Monitore o potássio sérico e observe sinais e sintomas de hipercalemia durante o uso concomitante de inibidores da enzima conversora de angiotensina (ECA) e diuréticos poupadores de potássio. Tenha cautela redobrada e monitore com maior frequência os níveis séricos de potássio em pacientes que apresentem outros fatores de risco potenciais para hipercalemia, como função renal reduzida, diabetes, insuficiência cardíaca ou uso de outros medicamentos que possam contribuir para a hipercalemia.

- **Efeitos** — antes: — | depois (união): —
- **Sistemas afetados** — antes: — | depois (união): rins

---

### Carbamazepina × Verapamil

- **Severidade**: `moderate` (API) → `major` (RENAME, prevaleceu por ser mais grave)

- **Mecanismo — API (antes, 52 car.)**: Aumento da concentração plasmática de carbamazepina.
- **Mecanismo — RENAME (depois, 304 car., prevaleceu por ser mais longo/informativo)**: Os bloqueadores dos canais de cálcio (não diidropiridínicos) podem aumentar as concentrações séricas de carbamazepina. A carbamazepina pode diminuir as concentrações séricas de bloqueadores dos canais de cálcio (não diidropiridínicos). Gravidade: Moderada. Classificação de confiabilidade: Intermediária.

- **Recomendação — API (antes, 90 car.)**: Ajustar dose carbamazepina, reduzindo a quantidade diária utilizada em aproximadamente 50%
- **Recomendação — RENAME (depois, 215 car.)**: Considere alternativas a esta combinação sempre que possível. Se combinada, monitore o aumento das concentrações de carbamazepina e a toxicidade, bem como a diminuição da eficácia do bloqueador dos canais de cálcio.

- **Efeitos** — antes: — | depois (união): —
- **Sistemas afetados** — antes: — | depois (união): cardiovascular

---

### Carvedilol × Epinefrina

- **Severidade**: `moderate` (sem mudança)

- **Mecanismo — API (antes, 80 car.)**: Os betabloqueadores não cardiosseletivos podem aumentar a resposta da epinefrina
- **Mecanismo — RENAME (depois, 118 car., prevaleceu por ser mais longo/informativo)**: Betabloqueadores (com propriedades alfabloqueadoras) podem diminuir os efeitos terapêuticos da epinefrina (sistêmica).

- **Recomendação — API (antes, 122 car.)**: Cuidado extremo e monitoramento rigoroso do estado cardiovascular. Verificar necessidade de redução da dose de epinefrina.
- **Recomendação — RENAME (depois, 445 car.)**: Monitore os pacientes quanto à diminuição da resposta aos efeitos da epinefrina, incluindo efeitos antianafiláticos, durante o tratamento com qualquer betabloqueador. O uso concomitante desses agentes é recomendado em algumas circunstâncias (por exemplo, uso de epinefrina em casos de superdosagem de alguns betabloqueadores) e a epinefrina deve ser administrada em casos de anafilaxia, independentemente do uso concomitante de betabloqueadores.


---

### Carvedilol × Verapamil

- **Severidade**: `moderate` (sem mudança)

- **Mecanismo — API (antes, 58 car.)**: Reduções na frequência, condução e contratilidade cardíaca
- **Mecanismo — RENAME (depois, 112 car., prevaleceu por ser mais longo/informativo)**: Agentes que causam bradicardia podem aumentar os efeitos bradicárdicos de outros agentes que causam bradicardia.

- **Recomendação — API (antes, 322 car.)**: Monitorização clínica rigorosa da resposta, caso esses medicamentos sejam utilizados em conjunto, a dose de um ou de ambos os devem ser ajustadas conforme a necessidade. Monitorizar os seguintes sintomas: fadiga, dor de cabeça, síncope, edema das extremidades, ganho de peso, falta de ar, dor no peito, frequência cardíaca
- **Recomendação — RENAME (depois, 343 car.)**: É necessário redobrar a cautela com o uso concomitante de múltiplos medicamentos que possam causar ou agravar a bradicardia. Monitore a frequência cardíaca e a pressão arterial com mais atenção e alerte os pacientes sobre o potencial de surgimento ou agravamento da bradicardia e suas consequências clínicas (por exemplo, síncope, hipotensão).

- **Efeitos** — antes: — | depois (união): Bradicardia
- **Sistemas afetados** — antes: — | depois (união): cardiovascular

---

### Ciprofloxacino × Dexametasona

- **Severidade**: `moderate` (sem mudança)

- **Mecanismo — API (antes, 54 car.)**: Potencializar o risco de tendinite e ruptura do tendão
- **Mecanismo — RENAME (depois, 164 car., prevaleceu por ser mais longo/informativo)**: Os corticosteroides (sistêmicos) podem aumentar os efeitos adversos/tóxicos das quinolonas. Especificamente, o risco de tendinite e ruptura do tendão pode aumentar.

- **Recomendação — API (antes, 223 car.)**: Recomenda-se cautela se as fluoroquinolonas forem prescritas em combinação com corticosteroides, particularmente em pacientes com outros fatores de risco (idosos e pacientes transplantados). Evitar exercício na área afetada
- **Recomendação — RENAME (depois, 339 car.)**: Monitore atentamente os pacientes que recebem antibióticos quinolônicos e corticosteroides sistêmicos quanto ao surgimento de novas dores nos tendões ou articulações. O risco de tendinite e ruptura de tendão pode ser ainda maior em pacientes idosos (geralmente com mais de 60 anos) e em receptores de transplantes de coração, pulmão e rim.

- **Efeitos** — antes: — | depois (união): —
- **Sistemas afetados** — antes: — | depois (união): respiratorio

---

### Ciprofloxacino × Haloperidol

- **Severidade**: `moderate` (sem mudança)

- **Mecanismo — API (antes, 115 car.)**: Prolongamento do intervalo QT, que pode resultar em efeitos aditivos e aumentar do risco de arritmias ventriculares
- **Mecanismo — RENAME (depois, 143 car., prevaleceu por ser mais longo/informativo)**: Agentes que prolongam o intervalo QT (Risco Indeterminado - Evitar) podem aumentar os efeitos de prolongamento do intervalo QTc do haloperidol.

- **Recomendação — API (antes, 153 car.)**: Se realmente necessário utilizar o haloperidol e não tiver outra alternativa Monitorizar de perto, sobretudo se o uso for parenteral e em doses elevadas.
- **Recomendação — RENAME (depois, 416 car.)**: Monitore o prolongamento do intervalo QTc e as arritmias ventriculares (incluindo torsades de pointes) quando esses medicamentos forem combinados. Pacientes com outros fatores de risco (por exemplo, idade avançada, sexo feminino, bradicardia, hipocalemia, hipomagnesemia, doença cardíaca e concentrações mais elevadas do medicamento) provavelmente apresentam maior risco para essas toxicidades potencialmente fatais.

- **Efeitos** — antes: — | depois (união): Bradicardia
- **Sistemas afetados** — antes: cardiovascular | depois (união): cardiovascular

---

### Ciprofloxacino × Prednisolona

- **Severidade**: `moderate` (sem mudança)

- **Mecanismo — API (antes, 58 car.)**: Potencial maior para causar tendinite e ruptura do tendão.
- **Mecanismo — RENAME (depois, 164 car., prevaleceu por ser mais longo/informativo)**: Os corticosteroides (sistêmicos) podem aumentar os efeitos adversos/tóxicos das quinolonas. Especificamente, o risco de tendinite e ruptura do tendão pode aumentar.

- **Recomendação — API (antes, 193 car.)**: Recomenda-se cautela se as fluoroquinolonas forem prescritas em combinação com corticosteroides, particularmente em pacientes com outros fatores de risco concomitantes (idosos e transplantados)
- **Recomendação — RENAME (depois, 339 car.)**: Monitore atentamente os pacientes que recebem antibióticos quinolônicos e corticosteroides sistêmicos quanto ao surgimento de novas dores nos tendões ou articulações. O risco de tendinite e ruptura de tendão pode ser ainda maior em pacientes idosos (geralmente com mais de 60 anos) e em receptores de transplantes de coração, pulmão e rim.

- **Efeitos** — antes: — | depois (união): —
- **Sistemas afetados** — antes: — | depois (união): respiratorio

---

### Claritromicina × Digoxina

- **Severidade**: `moderate` (sem mudança)

- **Mecanismo — API (antes, 83 car.)**: Aumento na concentração plasmática de digoxina, com risco de intoxicação digitálica
- **Mecanismo — RENAME (depois, 93 car., prevaleceu por ser mais longo/informativo)**: Os antibióticos macrolídeos podem aumentar as concentrações séricas de glicosídeos cardíacos.

- **Recomendação — API (antes, 229 car.)**: Recomenda-se precaução com uso concomitante. Os níveis séricos de digoxina e os efeitos farmacológicos devem ser monitorados de perto e a dose deve ser ajustada, particularmente após o início ou a descontinuação da claritromicina
- **Recomendação — RENAME (depois, 357 car.)**: Monitore o aumento das concentrações séricas e os efeitos tóxicos (por exemplo, desconforto gastrointestinal, fraqueza, tontura, arritmia) dos glicosídeos cardíacos se um antibiótico macrolídeo for iniciado/a dose aumentada, ou a diminuição das concentrações séricas e dos efeitos terapêuticos se um antibiótico macrolídeo for descontinuado/a dose reduzida.

- **Efeitos** — antes: Toxicidade digitálica | depois (união): Toxicidade digitálica
- **Sistemas afetados** — antes: — | depois (união): cardiovascular, gastrointestinal, snc

---

### Claritromicina × Haloperidol

- **Severidade**: `moderate` (sem mudança)

- **Mecanismo — API (antes, 132 car.)**: Pode prolongar intervalo QT, resultando em aumento do risco de arritmias ventriculares, incluindo torsades de pointes e morte súbita
- **Mecanismo — RENAME (depois, 143 car., prevaleceu por ser mais longo/informativo)**: Agentes que prolongam o intervalo QT (Risco Indeterminado - Evitar) podem aumentar os efeitos de prolongamento do intervalo QTc do haloperidol.

- **Recomendação — API (antes, 107 car.)**: Cautela no uso do haloperidol, particularmente quando administrado por via intravenosa ou em doses elevadas
- **Recomendação — RENAME (depois, 416 car.)**: Monitore o prolongamento do intervalo QTc e as arritmias ventriculares (incluindo torsades de pointes) quando esses medicamentos forem combinados. Pacientes com outros fatores de risco (por exemplo, idade avançada, sexo feminino, bradicardia, hipocalemia, hipomagnesemia, doença cardíaca e concentrações mais elevadas do medicamento) provavelmente apresentam maior risco para essas toxicidades potencialmente fatais.

- **Efeitos** — antes: — | depois (união): Bradicardia
- **Sistemas afetados** — antes: cardiovascular | depois (união): cardiovascular

---

### Clorpromazina × Haloperidol

- **Severidade**: `moderate` (API) → `major` (RENAME, prevaleceu por ser mais grave)

- **Mecanismo — API (antes, 78 car.)**: O haloperidol pode causar prolongamento do intervalo QT relacionado com a dose
- **Mecanismo — RENAME (depois, 136 car., prevaleceu por ser mais longo/informativo)**: Agentes diversos que prolongam o intervalo QT (risco máximo) podem aumentar os efeitos de prolongamento do intervalo QTc do haloperidol.

- **Recomendação — API (antes, 120 car.)**: Recomenda-se cautela se o haloperidol for usado em combinação com outros medicamentos que possam prolongar intervalo QT,
- **Recomendação — RENAME (depois, 470 car.)**: Considere alternativas a esta combinação. Se o uso for necessário, monitore o prolongamento do intervalo QTc e arritmias (incluindo torsades de pointes). Pacientes com outros fatores de risco (por exemplo, idade avançada, sexo feminino, bradicardia, hipocalemia, hipomagnesemia, doença cardíaca e concentrações mais elevadas do medicamento) e aqueles que utilizam haloperidol intravenoso provavelmente apresentam maior risco para essas toxicidades potencialmente fatais.

- **Efeitos** — antes: — | depois (união): Bradicardia
- **Sistemas afetados** — antes: — | depois (união): cardiovascular

---

### Enalapril × Espironolactona

- **Severidade**: `moderate` (sem mudança)

- **Mecanismo — API (antes, 32 car.)**: Aumento no risco de hipercalemia
- **Mecanismo — RENAME (depois, 127 car., prevaleceu por ser mais longo/informativo)**: Diuréticos poupadores de potássio podem aumentar os efeitos hipercalêmicos dos inibidores da enzima conversora de angiotensina.

- **Recomendação — API (antes, 30 car.)**: Monitorizar níveis de potássio
- **Recomendação — RENAME (depois, 493 car.)**: Monitore o potássio sérico e observe sinais e sintomas de hipercalemia durante o uso concomitante de inibidores da enzima conversora de angiotensina (ECA) e diuréticos poupadores de potássio. Tenha cautela redobrada e monitore com maior frequência os níveis séricos de potássio em pacientes que apresentem outros fatores de risco potenciais para hipercalemia, como função renal reduzida, diabetes, insuficiência cardíaca ou uso de outros medicamentos que possam contribuir para a hipercalemia.

- **Efeitos** — antes: — | depois (união): —
- **Sistemas afetados** — antes: — | depois (união): rins

---

### Fenitoina × Fluconazol

- **Severidade**: `moderate` (sem mudança)

- **Mecanismo/Recomendação**: sem mudança (texto da API já era mais informativo)

- **Efeitos** — antes: — | depois (união): —
- **Sistemas afetados** — antes: gastrointestinal | depois (união): figado, gastrointestinal

---

### Fluconazol × Haloperidol

- **Severidade**: `moderate` (sem mudança)

- **Mecanismo — API (antes, 132 car.)**: Pode prolongar intervalo QT, resultando em aumento do risco de arritmias ventriculares, incluindo torsades de pointes e morte súbita
- **Mecanismo — RENAME (depois, 157 car., prevaleceu por ser mais longo/informativo)**: Inibidores moderados da CYP3A4 com prolongamento do intervalo QT (risco moderado) podem aumentar os efeitos de prolongamento do intervalo QTc do haloperidol.

- **Recomendação — API (antes, 109 car.)**: Cautela no uso do haloperidol, particularmente quando administrado por via intravenosa e/ou em doses elevadas
- **Recomendação — RENAME (depois, 464 car.)**: Monitore o prolongamento do intervalo QTc e as arritmias ventriculares (incluindo torsades de pointes) quando esses medicamentos forem combinados. Pacientes com outros fatores de risco (por exemplo, idade avançada, sexo feminino, bradicardia, hipocalemia, hipomagnesemia, doença cardíaca e concentrações mais elevadas do medicamento) ou aqueles que utilizam haloperidol intravenoso provavelmente apresentam maior risco para essas toxicidades potencialmente fatais.

- **Efeitos** — antes: — | depois (união): Bradicardia
- **Sistemas afetados** — antes: cardiovascular | depois (união): cardiovascular, figado

---

### Fluoxetina × Ondansetrona

- **Severidade**: `moderate` (sem mudança)

- **Mecanismo — API (antes, 65 car.)**: Risco de síndrome serotoninérgica e prolongamento do intervalo QT
- **Mecanismo — RENAME (depois, 153 car., prevaleceu por ser mais longo/informativo)**: A ondansetrona pode aumentar os efeitos serotoninérgicos de outros agentes serotoninérgicos (alto risco). Isso pode resultar em síndrome serotoninérgica.

- **Recomendação — API (antes, 95 car.)**: Monitorar sintomas da síndrome serotoninérgica, eletrocardiograma, hipomagnesemia e hipocalemia
- **Recomendação — RENAME (depois, 481 car.)**: Monitore os sinais e sintomas da síndrome serotoninérgica/toxicidade serotoninérgica (por exemplo, hiperreflexia, clonus, hipertermia, diaforese, tremor, instabilidade autonômica, alterações do estado mental) quando esses medicamentos forem combinados. Pacientes com outros fatores de risco (por exemplo, concentrações/doses mais elevadas dos medicamentos, maior número de agentes serotoninérgicos) provavelmente apresentam maior risco para essas toxicidades potencialmente fatais.

- **Efeitos** — antes: Síndrome serotoninérgica | depois (união): Hipertermia, Síndrome serotoninérgica
- **Sistemas afetados** — antes: cardiovascular, snc | depois (união): cardiovascular, snc

---

### Gentamicina × Sulfato de magnesio

- **Severidade**: `moderate` (sem mudança)

- **Mecanismo — API (antes, 176 car.)**: Risco de depressão respiratória grave e / ou prolongada, devido ao feito dos aminoglicosídeos de bloquear atividade neuromuscular, que pode ser aditiva a do magnésio parenteral
- **Mecanismo — RENAME (depois, 192 car., prevaleceu por ser mais longo/informativo)**: Os sais de magnésio podem aumentar os efeitos bloqueadores neuromusculares dos aminoglicosídeos. Isso é particularmente preocupante em pacientes com concentrações séricas elevadas de magnésio.

- **Recomendação — API (antes, 190 car.)**: Recomenda-se monitorização cuidadosa especialmente em pacientes com insuficiência renal e / ou com níveis elevados de magnésio. Evitar uso de aminoglicosídeos em crianças com hipermagnesemia
- **Recomendação — RENAME (depois, 236 car.)**: Monitore os efeitos respiratórios negativos caso um aminoglicosídeo seja utilizado em um paciente com concentração sérica elevada de magnésio, ou em um paciente no qual a suplementação de magnésio seja iniciada ou a dose seja aumentada.

- **Efeitos** — antes: — | depois (união): —
- **Sistemas afetados** — antes: rins, respiratorio | depois (união): respiratorio, rins

---

### Haloperidol × Ondansetrona

- **Severidade**: `moderate` (sem mudança)

- **Mecanismo — API (antes, 123 car.)**: Prolongamento do intervalo QT com aumento do risco de arritmias ventriculares, incluindo torsades de pointes e morte súbita
- **Mecanismo — RENAME (depois, 89 car., prevaleceu por ser mais longo/informativo)**: A ondansetrona pode aumentar os efeitos de prolongamento do intervalo QTc do haloperidol.

- **Recomendação — API (antes, 138 car.)**: Evitar associação, se não for possível evitar doses elevadas de haloperidol. Verificar possibilidade de outro antimético, como domperidona
- **Recomendação — RENAME (depois, 855 car.)**: Monitore o prolongamento do intervalo QTc e arritmias ventriculares (incluindo torsades de pointes) quando esses medicamentos forem combinados. Pacientes com outros fatores de risco (por exemplo, idade avançada, sexo feminino, bradicardia, hipocalemia, hipomagnesemia, doença cardíaca e concentrações mais elevadas do medicamento) ou aqueles que utilizam haloperidol ou ondansetrona intravenosos provavelmente apresentam maior risco para essas toxicidades potencialmente fatais. Alosetrona e palonosetrona são antieméticos antagonistas seletivos alternativos do receptor 5-HT3 que não apresentam interações medicamentosas clinicamente significativas conhecidas com o haloperidol ou efeitos de prolongamento do intervalo QT. Além disso, espera-se que a ondansetrona oral tenha menor efeito de prolongamento do intervalo QT do que a ondansetrona parenteral.

- **Efeitos** — antes: — | depois (união): Bradicardia
- **Sistemas afetados** — antes: cardiovascular | depois (união): cardiovascular

---

### Haloperidol × Prometazina

- **Severidade**: `moderate` (sem mudança)

- **Mecanismo — API (antes, 183 car.)**: Prolongamento do intervalo QT relacionado com a dose, podendo resultar em efeitos aditivos e aumento do risco de arritmias ventriculares, incluindo torsades de pointes e morte súbita.
- **Mecanismo — RENAME (depois, 219 car., prevaleceu por ser mais longo/informativo)**: A prometazina pode aumentar os efeitos anticolinérgicos do haloperidol. A prometazina pode aumentar os efeitos depressores do haloperidol sobre o SNC. A prometazina pode aumentar as concentrações séricas de haloperidol.

- **Recomendação — API (antes, 75 car.)**: Evitar associação, se não for possível evitar doses elevadas de haloperidol
- **Recomendação — RENAME (depois, 189 car.)**: Monitorar o paciente quanto ao aumento dos efeitos do haloperidol (por exemplo, prolongamento do intervalo QTc, efeitos anticolinérgicos, depressão do SNC) quando combinado com prometazina.

- **Efeitos** — antes: — | depois (união): —
- **Sistemas afetados** — antes: cardiovascular | depois (união): cardiovascular, snc

---

### Metoprolol × Verapamil

- **Severidade**: `moderate` (sem mudança)

- **Mecanismo — API (antes, 85 car.)**: Reduções aditivas na frequência cardíaca, condução cardíaca e contratilidade cardíaca
- **Mecanismo — RENAME (depois, 112 car., prevaleceu por ser mais longo/informativo)**: Agentes que causam bradicardia podem aumentar os efeitos bradicárdicos de outros agentes que causam bradicardia.

- **Recomendação — API (antes, 234 car.)**: Recomenda-se a monitorização clínica rigorosa da resposta hemodinâmica e da tolerância do paciente, caso esses agentes sejam utilizados em conjunto, e a dose de um ou de ambos os medicamentos devem ser ajustadas conforme a necessidade
- **Recomendação — RENAME (depois, 343 car.)**: É necessário redobrar a cautela com o uso concomitante de múltiplos medicamentos que possam causar ou agravar a bradicardia. Monitore a frequência cardíaca e a pressão arterial com mais atenção e alerte os pacientes sobre o potencial de surgimento ou agravamento da bradicardia e suas consequências clínicas (por exemplo, síncope, hipotensão).

- **Efeitos** — antes: — | depois (união): Bradicardia
- **Sistemas afetados** — antes: cardiovascular | depois (união): cardiovascular

---

### Propranolol × Verapamil

- **Severidade**: `moderate` (sem mudança)

- **Mecanismo — API (antes, 85 car.)**: Reduções aditivas na frequência cardíaca, condução cardíaca e contratilidade cardíaca
- **Mecanismo — RENAME (depois, 112 car., prevaleceu por ser mais longo/informativo)**: Agentes que causam bradicardia podem aumentar os efeitos bradicárdicos de outros agentes que causam bradicardia.

- **Recomendação — API (antes, 132 car.)**: Recomenda-se a monitorização clínica rigorosa da resposta hemodinâmica e da tolerância do paciente. Ajustar dose de um dos fármacos.
- **Recomendação — RENAME (depois, 343 car.)**: É necessário redobrar a cautela com o uso concomitante de múltiplos medicamentos que possam causar ou agravar a bradicardia. Monitore a frequência cardíaca e a pressão arterial com mais atenção e alerte os pacientes sobre o potencial de surgimento ou agravamento da bradicardia e suas consequências clínicas (por exemplo, síncope, hipotensão).

- **Efeitos** — antes: — | depois (união): Bradicardia
- **Sistemas afetados** — antes: cardiovascular | depois (união): cardiovascular
