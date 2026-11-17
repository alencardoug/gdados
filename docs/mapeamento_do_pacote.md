# Mapeamento do pacote para as páginas

| Campo | Valor |
|---|---|
| Etapa | E1, parte independente da stack ([plano](../PLANO.md), §5) |
| Data | 17/11/2026 |
| Pacote | Cópia em `origem/`; commit e SHA-256 em `origem/procedencia.json` (hoje `v2.1.0`, `eb11709`) |
| Regras de leitura | [D03](decisoes.md#d03--pacote-e-atualização-de-metadados): formato, ausência, estado, chave desconhecida, coleções de tamanho variável |

Este documento diz de onde cada página tira cada informação e como trata a falta dela. Os
significados dos campos são os da especificação da origem (`docs/pacote_de_metadados.md` no commit
fixado); aqui não se redefine nenhum. As contagens citadas descrevem o pacote de `eb11709`
([Verificação §10.2](verificacao_de_viabilidade.md#102-o-que-o-pacote-declara)) e servem só para
dimensionar; o código e o texto editorial não as fixam.

## 1. Seções do pacote

Páginas: **G** governança (catálogo e linhagem), **E** estrutura e ambientes, **C** conceitos e
artefatos. Toda página mostra o rodapé de procedência.

| Seção | Páginas | Uso | Ausência e estado |
|---|---|---|---|
| `provenance` | Todas | Rodapé e painel de procedência: commit fixado (de `origem/procedencia.json`), data de cópia, versão do dbt, adaptador, `manifest_generated_at`, `run_results_generated_at`, `invocation_id` e procedência do armazém | `warehouse.status` exibido como está; com `not_verified`, o `reason`. `tree_dirty_at_generation: true` é explicado como normal do fluxo, não como defeito |
| `relations` | G, E, C | Catálogo: tipo (`resource_type`), materialização, descrição, grão, papéis com leitura (`grants_select`), `meta` (domínio, dono, escritores, retenção) e colunas com descrição, tipo, sensibilidade e `meta` | `null` = ausente. `data_type` só vem declarado em `analytics` e `consumption`; nas demais camadas, "tipo não declarado no pacote", não um tipo inferido. Domínio e dono faltam nas *sources* de `raw` e `raw_legacy` |
| `relations.*.columns.*.meta` | G, C | `value_domain`, `values` (valor → significado, sempre texto) e `null_meaning` como tabela de valores; `description_inherited`/`description_from` como origem da descrição; `sensitivity_reason` | Chaves de `meta` variam por coluna (repassadas do dbt); o portal mostra as que conhece e ignora as outras |
| `lineage` | G | Linhagem por coluna: `leaves` (insumo imediato) e `origins` com `kind` (`source`, `seed`, `generated`) | `seed` e `generated` são terminais válidos, nunca quebra de linhagem. As *sources* não têm entrada: são origem |
| `crossings` | G, E | Travessias fora do dbt, ligadas às camadas de destino; o texto é Markdown | Sem precisão por coluna: a ligação é por camada, como o pacote declara |
| `questions` | G, C | Entrada por pergunta (P01 a P16): título, view, fatos, dimensões e medidas com aditividade e nota | — |
| `metrics` | G, C | Painel da medida ou métrica: tipo, aditividade, fonte, agregado, expressão, filtros, partes da razão ou diferença, escala, arredondamento, colunas que a publicam | Ler `on_zero_denominator`, nunca `zero_denominator` (D03). `null` em `on_zero_denominator` = não se aplica. Expressões são declaração em SQL, exibidas como texto, não SQL compilado |
| `filters` | G, C | Filtros citados pelas medidas: rótulo, predicado, relação e ligação ao conceito do glossário | O conceito é link relativo a `provenance.link_base`; resolvido como texto lido por commit (§3) |
| `view_rules` | G, C | Montagem de cada view: grão, fontes, combinação, papel de cada coluna; na view conferida por referência, o teste e o motivo | `combine: null` com uma fonte; `sources: []` na view por referência |
| `description_gaps` | G | Marca "sem descrição" na relação ou coluna e lista de faltas | É a falta **declarada**, não inventário físico do banco |
| `tests` | G | Testes de cada relação e coluna, com tipo, origem da declaração e resultado | `result: null` = sem resultado. Os três estados da especificação: declarado, executado com sucesso numa data, problema em aberto |
| `checks` | G, E | Verificações do `pytest` por módulo, com o resumo e o resultado | `skipped` exibido como tal; a causa não está no pacote. `layer: null` = não declarada |
| `view_audits` | G | Estado da auditoria de cada view, commit, critérios, referência e achados | Estado exibido como está |
| `open_items` | G, C | Decisões e verificações em aberto, com estado e âncora no documento | `objects: null` = não declarado; o portal não liga o item a objetos por conta própria |
| `environments` | E | Lista de artefatos da página de estrutura e ambientes, com repositório, caminho, forma de entrega, congelamento e nota | `not_available` exibido como indisponível, com a nota. A lista é lida, não fixada no código |

## 2. Por página

### 2.1 Governança

- **Catálogo:** `relations`, filtrado por camada (prefixo do identificador), domínio, sensibilidade e
  tipo; marca de falta por `description_gaps`; testes e auditorias por relação.
- **Pergunta → view → fatos e dimensões:** `questions` e `view_rules`, com `metrics` e `filters`
  para explicar cada coluna da view.
- **Linhagem:** `lineage` por coluna; a visão por relação agrega as colunas. O caminho da P01 parte
  das colunas da view e segue `leaves` até `origins`. `crossings` liga as camadas de origem às
  travessias.
- **Estado e evidência:** `tests`, `checks`, `view_audits` e `open_items`, sempre com a data e a
  execução de `provenance`.

### 2.2 Estrutura e ambientes

- **Física:** `relations` (materialização, tipo das colunas em `analytics` e `consumption`,
  papéis com leitura).
- **Infraestrutura e documentos:** cada entrada de `environments`, lida por commit (§3).
- **Comparação local ↔ GCP:** declaração (`terraform`, mapa de paridade) e evidência datada
  (`registro_fase_gcp`); `evidencias_gcp` indisponível.
- **Lógica:** entidades e grãos de `relations`; os relacionamentos dependem da lacuna L1 (§4).

### 2.3 Conceitos e artefatos

- Exemplos reais por identificador estável do pacote: relação (`schema.nome`), coluna
  (`schema.relação.coluna`), pergunta (`Pnn`), teste (`unique_id`), métrica e filtro (nome).
- Termos do vocabulário do pacote que pedem explicação: grão, aditividade, sensibilidade, origem
  terminal, seed, coluna gerada, travessia, contrato, razão e denominador zero, procedência.

## 3. O que o portal lê por commit, fora do pacote

O pacote aponta para arquivos da origem que ele não carrega:

| Referência no pacote | Exemplo |
|---|---|
| `environments[].path` | `docker/docker-compose.yml`, `terraform/`, `docs/arquitetura.md` |
| `filters.*.concept` e links nos textos Markdown | `glossario_de_negocio/ciclo_de_entrega.md`, relativo a `link_base` |
| `open_items[].anchor` | `docs/pendencias.md#d63--…` |
| `view_audits.*.reference` | `tests/auditoria/<view>.sql` |
| `tests.*.declared_in` e `checks.*.module` | `dbt/models/analytics/_analytics__models.yml`, `tests/test_acesso.py` |
| Decisões já tomadas, como a D66 | `docs/adr/0053-…`, `docs/pendencias.md` |

Esses textos chegam ao portal pela cópia da D03, em `origem/arquivos/`, a partir de
`scripts/arquivos_da_origem.txt`.

## 4. Lacunas do formato para as páginas

| # | Lacuna | Efeito | Encaminhamento |
|---|---|---|---|
| L1 | O pacote não traz o destino das chaves estrangeiras: os testes `relationships` (76) informam a relação e a coluna testadas, mas não a relação e a coluna referenciadas; as PKs e FKs declaradas em `analytics` (ADR-0056 da origem) também não constam | Sem isso, o diagrama entidade-relacionamento da página de estrutura teria de inferir a ligação pelo nome do teste, o que o portal não faz | **Aceito pela origem como F34** (17/11/2026), para a tag seguinte à `v2.1.0`. Até lá, a página mostra entidades e grãos e marca os relacionamentos como "não declarados na `v2.1.0`"; quando os campos existirem, passa a lê-los sem mudar a regra de não inferir |

Não são lacunas a pedir, porque o formato as declara: `data_type` fora de `analytics` e `consumption`,
`open_items.*.objects`, `checks.*.layer`, evidências do GCP e domínio e dono das *sources*.

## 5. Em aberto no gdados

- **Textos lidos por commit (§3):** decidido em 17/11/2026 na D03, cópia por lista.
- **Inventário de termos e lacunas editoriais** e **formato da camada editorial**: próximos
  entregáveis da E1 independentes da stack.
