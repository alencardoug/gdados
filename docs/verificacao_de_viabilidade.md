# Verificação de viabilidade

| Campo | Valor |
|---|---|
| Data da avaliação | 10/11/2026 |
| Projeto consultado | `/home/doug/Projetos/mvp_eng_dados_1` |
| Commit de referência | `8e606d9` |
| Natureza | Inspeção de código, documentação e artefatos locais existentes |
| Parecer | Viável para construir o portal; completude explicativa depende de tratar e exibir as lacunas |
| Reconferência | 13/11/2026, sobre `f86b9fb`; mantém o parecer e altera premissas de D03 e do GCP (§7) |
| Fonte vigente | Desde 13/11/2026, `/home/doug/Projetos/mvp_eng_dados_2`, por commit fixado (§8) |
| Reconferência na fonte vigente | 14/11/2026, sobre `32397cc` do `mvp_eng_dados_2` (§9) |
| Pacote fixado | 17/11/2026, `v2.1.0` (`eb11709`) do `mvp_eng_dados_2`; pacote validado contra o esquema do mesmo commit (§10) |
| Pacote refixado | 18/11/2026, `v2.2.0` (`f5a5173`); pacote validado contra o esquema do mesmo commit (§11) |

As §1 a §6 descrevem a avaliação de 10/11/2026 e permanecem como fotografia daquela data.
O que mudou depois está na §7. As duas avaliações citam `8e606d9` e `f86b9fb`, que só existem no
`mvp_eng_dados_1`; a mudança de fonte está na §8.

## 1. Evidências observadas

| Artefato | Resultado observado nesta avaliação |
|---|---|
| Modelos SQLAlchemy | 40 tabelas de origem, 418 colunas |
| `dbt/target/manifest.json` | Gerado em `2026-11-09T15:23:16.533989Z`, adaptador `postgres` |
| Objetos de `analytics` no manifesto | 25: 10 fatos e 15 dimensões |
| Objetos de `consumption` no manifesto | 16 views; todas com contrato `enforced` |
| Colunas declaradas em `analytics` | 477; nenhuma sem descrição ou sensibilidade |
| Colunas declaradas em `consumption` | 188; nenhuma sem descrição ou sensibilidade |
| Responsável e domínio nessas duas camadas | Presentes em todos os objetos examinados |
| Conferência existente de SQL desatualizado | `sensitivity.stale_nodes(manifest)` retornou lista vazia |
| Exportação `models.lineage --json` | Saída com sucesso, formato 1, 199 relações e 2.983 colunas |
| Origens terminais no JSON exportado | Nenhuma coluna sem origem terminal identificada |
| Caminho de receita líquida de P01 | 15 nós e 14 ligações até colunas de `raw.order_items` e `raw_legacy.order_items` |

Os números acima descrevem os artefatos examinados. Não são inventário atualizado do banco nem
nova prova operacional do pipeline. A conferência de atualização do SQL tem os limites documentados
na origem: não cobre toda mudança possível do projeto dbt.

Também foi lido `dbt/target/run_results.json`, de `2026-11-09T15:24:47.291748Z`, contendo 200
resultados `success` e 709 `pass`. Trata-se de resultado anterior, não de testes reexecutados nesta sessão.

## 2. O que já sustenta a interface

- Catálogo como código com descrições, classificação e metadados efetivos no dbt.
- Modelos SQLAlchemy como definição da estrutura transacional.
- Glossário e perguntas de negócio associados às views.
- Exportador público de linhagem com folhas imediatas e origens terminais por coluna.
- Travessias fora do dbt descritas a partir das configurações de ingestão e streaming.
- Arquitetura, mapa de paridade, infraestrutura declarada e registro datado da fase GCP.
- Portal técnico existente por `make dbt-docs`, documentado no dicionário.

O novo portal pode reunir esses artefatos e explicar suas relações. Não precisa se tornar outro
catálogo mantido manualmente nem substituir os responsáveis pelas definições originais.

## 3. Lacunas e divergências observadas

### 3.1 Documentos com estado desatualizado

O README da origem ainda descreve a fase GCP como não iniciada. O registro da fase já documenta
construção e provas em execução. O diagrama inicial da arquitetura indica 9 fatos e 17 dimensões,
enquanto os modelos atuais declaram 10 e 15.

A interface deverá mostrar a fonte e a data de cada afirmação. Corrigir o documento responsável
na origem exige trabalho separado; não corrigir o fato apenas numa cópia do portal.
Essas divergências foram corrigidas na origem depois desta avaliação (§7.2).

### 3.2 Descrições ausentes em camadas internas

Contagem sobre as colunas declaradas no manifesto examinado:

| Camada | Sem descrição |
|---|---:|
| `staging` | 5 |
| `trusted` | 125 |
| `quarantine` | 5 |
| `snapshots` | 6 |
| Total | 141 |

É possível navegar por essas colunas, mas não prometer explicação semântica integral delas.
A cobertura física precisa de conferência própria contra o banco; não foi medida agora.

### 3.3 Linhagem local e GCP têm evidências diferentes

O registro GCP §23 relata a medição de 07/11/2026: 4.399 de 4.982 arestas de valor encontradas na
captura nativa, com ausências concentradas em `trusted.legacy_presence_by_capture` e
`analytics.fact_shipment_item`. A explicação do limite está registrada lá; não foi verificada
novamente por consulta à API nesta sessão.

O módulo local preserva a origem de valor; a captura nativa pode incluir dependências de filtro e
junção. O portal não deverá misturá-las sem rótulo, nem apresentar linhagem por tabela como se
fosse por coluna.

### 3.4 Limitações de negócio permanecem

A D66, relativa à população contada por P13, continua registrada como pendência na origem.
O portal deverá exibir a definição vigente e a limitação, sem resolver modelagem por conta própria.

### 3.5 Artefatos locais não formam ainda um pacote publicável

O manifesto, o catálogo e os resultados ficam em `dbt/target/`, ignorado pelo Git. Uma nova
instalação do portal não os receberá automaticamente. É necessário definir um pacote sanitizado,
rastreável e reproduzível, com política de atualização e de vínculo com a versão do código.

## 4. Referências responsáveis

Caminhos relativos ao projeto de dados, consultados somente para leitura:

- `docs/governanca_de_dados.md`: regras de catálogo, classificação, acesso e retenção.
- `docs/dicionario_de_dados.md`: registro e linhagem, incluindo travessias externas.
- `src/mvp_ed1/models/lineage.py`: contrato do JSON de linhagem e definição das travessias.
- `src/mvp_ed1/models/sensitivity.py`: conferência existente de atualização e seus limites.
- `docs/modelo_de_dados.md`: estrutura transacional, grãos e modelagem dimensional.
- `docs/glossario_de_negocio/`: conceitos e perguntas.
- `docs/arquitetura.md`: componentes, camadas e mapa de paridade.
- `docs/registro_fase_gcp.md`, especialmente §23: evidências datadas da fase GCP.
- `docs/pendencias.md`: limitações e decisões ainda abertas.
- `terraform/` e `docker/`: infraestrutura declarada, não prova de recursos atualmente ativos.

## 5. Referência de publicação consultada

No Linkedia local (`/home/doug/Projetos/ia/revista_ia/linkedia-magazine`), foram lidos
`package.json`, `firebase.json` e `.github/workflows/deploy.yml`.

O processo observado produz um site estático com Astro, valida conteúdo e aplicação, executa
verificações de navegador e publica em Firebase Hosting. O workflow separa build, testes e deploy,
com autenticação GitHub OIDC por federação de identidade. Esse é o padrão de processo pretendido
pelo Owner; não se verificou a execução atual desse workflow nem o ambiente cloud do Linkedia.

## 6. Limites e integridade desta sessão

Não houve edição de arquivo do repositório de dados. A modificação observada em
`docs/registro_fase_gcp.md` veio de outra sessão e foi preservada. O cache existente de derivação
mantinha data de 09/11/2026 após a verificação, sem atualização por este trabalho.

A exportação usada para examinar a linhagem foi gerada em `/tmp` antes da instrução posterior de
concentrar toda escrita em `gdados`. Ela não é dependência deste projeto. A partir dessa instrução,
todos os novos arquivos deste trabalho ficam neste diretório.

Não foram reexecutados `make check`, sincronizações, DAGs, consultas aos bancos, consultas à
infraestrutura GCP, build da interface, testes de navegador ou deploy. O plano de implementação
é uma proposta; suas validações futuras não são resultados já obtidos.

## 7. Reconferência de 13/11/2026

| Campo | Valor |
|---|---|
| Commit da origem | `f86b9fb` (13/11/2026, 03:14 -03:00), 44 commits depois de `8e606d9` |
| Árvore da origem | Sem alteração rastreada pendente no momento da leitura |
| Natureza | Leitura de Git, documentos e artefatos existentes; nenhum comando que escreva na origem |

### 7.1 Contagens reconferidas no manifesto novo

O `dbt/target/manifest.json` passou a ser o de `2026-11-13T05:28:52.298410Z` (adaptador `postgres`,
invocação `a4c8134e…`). O `run_results.json` é da mesma invocação, um `build` com 200 `success`
e 709 `pass`; é resultado registrado na origem, não teste reexecutado nesta sessão.

Contagem lida desse manifesto (modelos, snapshots e seeds, por schema):

| Verificação | 10/11 (§1 e §3.2) | 13/11 |
|---|---|---|
| `analytics` | 25 objetos: 10 fatos e 15 dimensões; 477 colunas, sem falta de descrição | Igual |
| `consumption` | 16 views com contrato `enforced`; 188 colunas, sem falta | Igual |
| Colunas sem descrição | 5 `staging`, 125 `trusted`, 5 `quarantine`, 6 `snapshots`: 141 | Igual |

Não foram reexecutados nesta reconferência: exportação `models.lineage --json`, contagem SQLAlchemy,
`stale_nodes` e o caminho da P01. Os números correspondentes da §1 continuam datados de 10/11.

O `catalog.json` continua o de `2026-11-04T14:18:25.451356Z`, de outra invocação. A diferença de
datas da G09 da origem persiste. O `dbt/target_gcp/manifest.json` é de `2026-11-10T19:32:27.937220Z`
(adaptador `bigquery`); não há `catalog.json` ao lado dele.

### 7.2 Divergências documentais corrigidas na origem

As divergências da §3.1 e os demais achados G01 a G05 do parecer da origem
(`REVISAO_GOVERNANCA.md`) constam como fechados na V2 de `docs/pendencias.md`. Foi conferido por
leitura nesta data:

- o README da origem descreve a fase GCP como autorizada, desmontada e aceita com ressalvas;
- o diagrama da Arquitetura §1 deixou de contar fatos e dimensões e aponta para o Modelo de Dados §3;
- o comentário do `docker/docker-compose.yml` descreve as duas origens numa instância Cloud SQL.

Os achados G06 a G10 seguem abertos. A origem registra G07 a G10 como requisitos do portal, a
cargo do gdados; o G06, as 141 descrições, continua planejado lá para depois do M6.

### 7.3 A origem decidiu o pacote de metadados (D91)

A D91 de `docs/pendencias.md`, decidida em 10/11/2026, estabelece um JSON determinístico
**versionado no repositório da origem**, regenerado dentro do `make catalog` e conferido em dia
pelo `check-offline`. Ele deve compor `lineage --json` (formato 1), descrições, sensibilidade e
`meta` do manifesto, perguntas do glossário, travessias, faltas da catraca de descrição e
procedência (commit, árvore limpa ou suja, `generated_at` e `invocation_id`, ambiente).

Nome, caminho, versão do formato e tratamento de artefato incompleto serão definidos na
implementação, com a E1 do gdados como consumidor. A implementação estava prevista para depois do
M6. A busca por `portal` e `gdados` no conteúdo rastreado de `f86b9fb` não encontrou alvo ou módulo
que a implemente; só o comentário do alvo `gcp-evidencias`. A consequência para a D03 está em
[Decisões](decisoes.md#d03--pacote-e-atualização-de-metadados).

### 7.4 O ambiente GCP foi desmontado

O Registro GCP §58 da origem documenta o desmonte em 13/11/2026 e o pedido de exclusão dos dois
projetos (`DELETE_REQUESTED`). O M6 foi aceito com ressalvas no mesmo dia; a V3 das pendências lista
o que ficou sem medição, incluindo o fechamento de custo previsto para 16/11/2026.

Efeitos para o portal:

- não há mais como obter "estado atual verificado" do GCP; a página de ambientes contará com
  infraestrutura declarada em Terraform e evidências históricas datadas;
- o Registro GCP §59 mede a paridade do `analytics` depois do desmonte, sobre uma cópia Parquet
  de 11/11. Ele registra divergência na chave substituta das quatro dimensões SCD tipo 2 entre os
  armazéns, sem causa isolada (V3, item 7). A comparação local ↔ GCP deve exibir esse limite, sem
  resolvê-lo;
- 20 capturas de console estão versionadas em `docs/registro_fase_gcp/capturas/`. São evidência
  datada e não fonte dos diagramas do portal.

### 7.5 Evidências GCP fora do Git

O alvo `gcp-evidencias` gravou duas coletas brutas antes do desmonte em
`data/medicoes/etapa_13/evidencias/`:

| Coleta | Commit | Conteúdo listado no manifesto da coleta |
|---|---|---|
| `20261110T211313Z` | `5120fbc` | `INFORMATION_SCHEMA` (tabelas e colunas) dos datasets, endereços Terraform, inventário de recursos; `linhagem_paridade.json` com `FALHOU` |
| `20261111T213339Z` | `db0d91e` | Os mesmos itens, todos `ok`; a paridade de linhagem traz os ausentes no relatório |

O comentário do alvo declara que esses dados se destinam também ao portal. Mas `data/` é ignorado
pelo Git da origem, e a composição da D91 registrada não os inclui. Um clone limpo não os recebe,
o que repete para o GCP o problema da G09/G10. Seu conteúdo não foi aberto nesta reconferência.
Inventários de recursos podem trazer identificadores de contas e projetos; seria preciso sanitizar
antes de qualquer uso no portal.

### 7.6 Limites desta reconferência

Leituras feitas com `git --no-optional-locks` e Python em modo isolado, sem gravar na origem.
Não houve `make`, dbt, consulta a banco, consulta ao GCP, exportação de linhagem nem build.
Nada foi escrito fora de `gdados`.

## 8. Mudança de fonte (13/11/2026)

Registrada a partir do aviso da origem
(`mvp_eng_dados_2/data/medicoes/base_consumidores/avisos/aviso_gdados.md`) e conferida por leitura.

| Fato | Evidência conferida |
|---|---|
| O `mvp_eng_dados_1` foi arquivado no ponto `v2.0.0` (`f86b9fb`) e fica como referência histórica | D92 em `docs/pendencias.md` do `mvp_eng_dados_2` |
| O trabalho continua no `mvp_eng_dados_2`, criado sem histórico | Commit inicial `a35a8cb` com a mesma árvore de `f86b9fb` (`bc2051b…`) |
| Os consumidores, inclusive o gdados, leem do `mvp_eng_dados_2` por commit fixado | D92, commit `040a796` |
| O banco local é o mesmo; os artefatos novos só existem no `mvp_eng_dados_2` | Declarado na D92; não conferido, pois o portal não lê banco |
| As evidências GCP da §7.5 não foram copiadas para o `mvp_eng_dados_2` | `data/medicoes/etapa_13/evidencias/` inexistente lá |

Consequências:

- As §1 a §7 continuam válidas como fotografias datadas de `8e606d9` e `f86b9fb`. Esses commits e
  os comandos `git show` correspondentes só funcionam no `mvp_eng_dados_1`.
- Ainda não há reconferência sobre um commit do `mvp_eng_dados_2`. As contagens da §7.1 não podem
  ser atribuídas a ele, embora a árvore inicial seja idêntica: os commits seguintes podem mudá-las.
  A origem já anuncia mudanças de valores e textos antes do pacote (D03).
- A origem confirmou o §7.5 e vai registrá-lo como lacuna do contrato do pacote. A solução
  depende da origem e está na D03 como pendência.
- A origem levantou a relação com o portal da etapa 2.7 do `bi-como-codigo`; a pergunta está na D05.

## 9. Reconferência sobre `32397cc` (14/11/2026)

| Campo | Valor |
|---|---|
| Repositório | `/home/doug/Projetos/mvp_eng_dados_2` |
| Commit fixado | `32397cc`, presente em `origin/main` na leitura |
| Autorização | Resposta central do Owner de 14/11/2026, item G1 |
| Natureza | Somente `git show`, `git ls-tree`, `git diff` e `git branch -r` sobre arquivos rastreados |

A regra de leitura da origem (`docs/consumidores.md` §2, no mesmo commit) proíbe comandos do
projeto e indica como fonte de metadados o pacote ou, até ele existir, o esquema e o exemplo. Por
isso, esta reconferência não leu `dbt/target/` nem outro artefato fora do Git. Ela também não
repete as contagens de manifesto das §1 e §7.1.

### 9.1 O que mudou desde a `v2.0.0`

Entre o commit inicial `a35a8cb`, de árvore idêntica a `f86b9fb` (§8), e `32397cc`, nenhum arquivo
rastreado mudou em `dbt/`, `src/`, `docker/` ou `terraform/`. Mudaram documentos (`README.md`,
`PLANO_base_dos_consumidores.md`, `docs/pendencias.md`, `docs/achados_nl_sql.md`,
`docs/consumidores.md` e os três arquivos do pacote) e um teste novo, `tests/test_pacote_de_metadados.py`.

As declarações dos dados em `32397cc` são, portanto, as da `v2.0.0`. As correções anunciadas pela
origem (Blocos 1 a 3) ainda não entraram nesse commit.

### 9.2 Declarações conferidas no commit

| Verificação | Resultado em `32397cc` |
|---|---|
| Modelos SQL em `dbt/models/analytics` | 10 `fact_*` e 15 `dim_*` |
| Modelos SQL em `dbt/models/consumption` | 16; `enforced: true` aparece 16 vezes em `_consumption__models.yml` |
| Tetos de colunas sem descrição em `tests/test_descricao.py` | `staging` 5, `trusted` 125, `quarantine` 5, `snapshots` 6; demais camadas 0 (total 141) |

São contagens de declaração, não de manifesto nem de banco. A coincidência com as fotografias de
10 e 13/11 é coerente com a ausência de mudança em `dbt/` e `tests/test_descricao.py`.

### 9.3 O formato do pacote no commit

- A especificação declara o formato 1 em estado de **especificação**; `docs/pacote_de_metadados.json`
  não existe no commit.
- O exemplo tem `format: 1` e as chaves `provenance`, `relations`, `lineage`, `crossings`, `questions`,
  `description_gaps`, `tests`, `view_audits` e `environments`. É um recorte: 4 relações, 1 pergunta,
  1 falta de descrição, 1 teste e 1 auditoria de view.
- `provenance.dbt` do exemplo aponta para o manifesto de `2026-11-13T22:21:52.217488Z` e para
  `run_results` da mesma invocação (`8eeff407…`), com `postgres` e dbt 1.12.3.
- `provenance.warehouse` é `not_verified`.
- `environments` lista nove entradas. Oito são `read_by_commit` no `mvp_eng_dados_2`, das quais
  `terraform` e `registro_fase_gcp` estão congeladas em 13/11/2026. A nona, `evidencias_gcp`, é
  `not_available` e fica no `mvp_eng_dados_1`.

Validar o exemplo contra o esquema fica para a E1: o ambiente desta sessão não tem validador de
JSON Schema instalado, e a escolha da ferramenta pertence à D01. A origem declara que o exemplo
passa no esquema no `check-offline` dela; isso não foi reexecutado aqui.

### 9.4 Limites

Não foram executados `make`, dbt, testes, consultas a banco ou ao GCP, nem exportação de linhagem.
Nenhum arquivo do `mvp_eng_dados_2` foi alterado, e nada foi escrito fora do gdados.

## 10. Pacote fixado na `v2.1.0` (17/11/2026)

| Campo | Valor |
|---|---|
| Repositório | `/home/doug/Projetos/mvp_eng_dados_2` |
| Commit fixado | `eb11709` (`eb117098e2b73370cf8ce027da1ffefa6acf01a7`), tag anotada `v2.1.0`, de 17/11/2026 03:42 -03:00; presente em `origin/main` na leitura |
| Origem do pedido | Aviso `mvp_eng_dados_2/data/medicoes/base_consumidores/avisos/aviso_gdados_20261117.md` (fora do Git), trazido pelo Owner; `docs/consumidores.md` §6 marca a tag para o gdados a partir de `3ac4385`, posterior a ela |
| Natureza | `git show`, `git log`, `git branch -r` e `git rev-parse` na origem; leitura e validação das cópias dentro do gdados |

Os arquivos foram extraídos por `git show eb11709:docs/<arquivo>` para `.cache/origem_eb11709/`,
ignorado pelo Git. Essa extração serve só a esta verificação: não é o comando de cópia da
[D03](decisoes.md#d03--pacote-e-atualização-de-metadados), que continua a construir na E1.

| Arquivo em `eb11709` | Blob Git | SHA-256 da cópia | Bytes |
|---|---|---|---:|
| `docs/pacote_de_metadados.json` | `378afa1` | `5fe93e964fe007e3748f850ff6a5a21b3d9f534a1cc37a0cad019c5a10184a7e` | 5.303.811 |
| `docs/pacote_de_metadados.schema.json` | `2bdecbb` | `34c13dfef9a51fcbb92dede3c9260df95ba25cee7ba9801d809576283d7c4cd9` | 51.162 |
| `docs/pacote_de_metadados.exemplo.json` | `dab3876` | `0b70bf3808f7066294e0b5d7cd8d016c5f0cf366885808293479ad36af92b3f8` | 21.986 |

### 10.1 Validação contra o esquema do mesmo commit

Validador: biblioteca Python `jsonschema` 4.23.0, classe `Draft202012Validator`, executada uma vez
num ambiente temporário do `uv` com cache em `.cache/uv/`. **Não é dependência adotada**: a ferramenta
do comando de validação da E1 continua a cargo da D01.

| Verificação | Resultado |
|---|---|
| O esquema é um JSON Schema 2020-12 válido (`check_schema`) | Sim |
| `format` do pacote e do exemplo | `1` nos dois |
| Pacote contra o esquema, sem e com asserção de `format` (`FORMAT_CHECKER`) | 0 erros nos dois modos |
| Exemplo contra o esquema, sem e com asserção de `format` | 0 erros nos dois modos |
| Controle negativo: no pacote, `on_zero_denominator` de uma razão trocado por `"zero"` e removido de outra | 3 erros; o validador recusa |

A validação pelo esquema não alcança o calendário dos instantes nem as regras que o gerador confere
entre seções (especificação §2, regra 6, e §3 da origem).

### 10.2 O que o pacote declara

Contagens lidas do pacote em 17/11/2026. São o que o pacote declara, não inventário do banco nem
testes reexecutados nesta sessão.

| Parte | Conteúdo em `eb11709` |
|---|---|
| Chaves de primeiro nível | `format` e 14 seções: `checks`, `crossings`, `description_gaps`, `environments`, `filters`, `lineage`, `metrics`, `open_items`, `provenance`, `questions`, `relations`, `tests`, `view_audits`, `view_rules` |
| `provenance.dbt` | dbt 1.12.3, `postgres`; manifesto de `2026-11-17T04:47:06.850606Z` e `run_results` de `2026-11-17T04:50:29.647499Z`, da mesma invocação `04d4af3f-8e6b-4d3e-abee-a37c0e4f841d` |
| `provenance.warehouse` | `verified`, construído do commit `4137dc7` em `2026-11-17T04:50:29.631409Z` pela mesma invocação; `reason` nulo |
| `provenance` (demais) | 421 insumos; `tree_dirty_at_generation: true`, o normal do fluxo segundo a especificação; `link_base` `docs/`; `dbt_target` `local` |
| `relations` | 281: 193 modelos, 81 *sources*, 4 *snapshots* e 3 *seeds*; 4.219 colunas |
| `lineage` | Formato 1, do mesmo manifesto; 200 relações e 3.019 colunas |
| `metrics` | 44: 36 `measure`, 7 `ratio` e 1 `difference` |
| `on_zero_denominator` | `"returns_null"` nas 7 razões; `null` nas outras 37. O `zero_denominator` antigo vale `"null"` (texto) nas razões e `null` nas demais |
| `filters`, `view_rules`, `questions`, `crossings` | 6, 16, 16 (P01 a P16) e 4 |
| `description_gaps` | 123, todas de relação (`column: null`): 40 `raw_legacy`, 30 `raw`, 29 `trusted`, 19 `staging`, 4 `snapshots`, 1 `quarantine`. Nenhuma coluna declarada sem descrição |
| `tests` | 873, todos `pass`, da mesma invocação do manifesto |
| `checks` | 1.753: 1.734 `pass` e 19 `skipped` |
| `view_audits` | 16, todas `audited` |
| `open_items` | 9: D63 e D64 `pending`; D43, V1, V2, V3, V5, V6 e V7 `deferred`. A D66 não consta: foi decidida em 14/11/2026 (ADR-0053 da origem) |
| `environments` | 9, como no exemplo de `32397cc` (§9.3): oito `read_by_commit` e `evidencias_gcp` `not_available` |

### 10.3 Consequências registradas

- A fonte do portal deixa de ser o exemplo e passa a ser o pacote em `eb11709`; o registro está na
  [D03](decisoes.md#d03--pacote-e-atualização-de-metadados) e a sequência, no [plano](../PLANO.md).
- Desde `32397cc`, o formato 1 ganhou campos sem mudar de número: `grants_select`, `grain`,
  `checks`, `open_items`, `metrics`, `filters`, `view_rules`, o `meta` de domínio das colunas, os
  campos da procedência do armazém e `on_zero_denominator`. A origem anuncia que o `zero_denominator`
  sai no próximo formato.
- O que dependia do pacote real (contagens, desempenho com o grafo, fidelidade) deixa de esperar a
  origem. Segundo o aviso, a fase da origem está fechada e não há trabalho planejado lá.
- A mudança de valor das 16 views pelo dado regerado não foi medida view a view pela origem (Q63;
  Consumidores §5). O portal não lê valores das views, mas não deve apresentar números anteriores
  como atuais.

### 10.4 Limites

Não foram executados `make`, dbt, testes, consultas a banco ou ao GCP na origem. Nenhum arquivo do
`mvp_eng_dados_2` foi alterado. As escritas ficaram em `.cache/`, dentro do gdados.

## 11. Pacote refixado na `v2.2.0` (18/11/2026)

| Campo | Valor |
|---|---|
| Repositório | `/home/doug/Projetos/mvp_eng_dados_2` |
| Commit fixado | `f5a5173` (`f5a517355336ed2b039bd43642bdb4ec07bc7a31`), tag anotada `v2.2.0`, de 18/11/2026 20:37 -03:00; presente em `origin/main` na leitura |
| Origem do pedido | Aviso `aviso_gdados_20261118.md` da pasta de avisos da origem (fora do Git), deixado na caixa de correio do gdados pela sessão da origem a pedido do Owner |
| Natureza | `git show` e `git log` na origem, pelo `scripts/copiar_pacote.sh v2.2.0`; validação das cópias dentro do gdados |

| Arquivo em `f5a5173` | Blob Git | SHA-256 da cópia | Bytes |
|---|---|---|---:|
| `docs/pacote_de_metadados.json` | `fb2485a` | `d450b35bcf6654cdbbd82d488828044735bac5dde29ff8ce51da468490c103b1` | 5.467.819 |
| `docs/pacote_de_metadados.schema.json` | `578008b` | `ccbea528be9c80e93c40df7d04b1aa3ad8c9c5c6390c0c9890c20926347632d1` | 54.989 |
| `docs/pacote_de_metadados.exemplo.json` | `e912fcf` | `6c8643c30c1de67b1610e60da68c197ac5924bda416709feaaea1ddbb1a8af60` | 23.738 |

### 11.1 Validação

Pelo comando da D03 (`npm run validar` e a build, com ajv, D01): os 94 arquivos copiados conferem
com `origem/procedencia.json`, `format` é 1 e o pacote passa no esquema do mesmo commit. A lista de
arquivos lidos por commit ganhou a ADR-0056 da origem, citada nas páginas que mostram as chaves.

### 11.2 O que mudou no pacote

Contagens lidas do pacote em 18/11/2026; descrevem o que ele declara, não o banco.

| Parte | Em `f5a5173` | Diferença para `eb11709` |
|---|---|---|
| `provenance.dbt` | manifesto de `2026-11-18T22:15:51Z` e `run_results` de `2026-11-18T22:19:03Z`, mesma invocação | execução nova |
| `provenance.warehouse` | `verified`, construído do commit `7e5065a` | build novo |
| `relations` | 282: 193 modelos, 81 *sources*, 4 *snapshots* e 4 *seeds*; 4.226 colunas | `trusted.f31_legacy_sale_exceptions` nova (seed) |
| `relations.*.primary_key` e `foreign_keys` (F34) | 26 relações com chave primária e 58 chaves estrangeiras, todas em `analytics`; listas vazias nas demais | campos novos |
| `tests` | 884, todos `pass`; os 76 `relationships` trazem `references_relation` e `references_column` (58 em `analytics`, 18 em `staging`) | campos novos |
| `lineage` | 201 relações e 3.026 colunas | +1 relação |
| `description_gaps` | 0 (F32) | eram 123 relações |
| `checks` | 1.846: 1.827 `pass` e 19 `skipped` | +93 |
| `view_audits` | 16 `audited`; `checks` (26 ids) e `data_tests` (1 id) | campos novos |
| `open_items` | 7, todos `deferred`: D43, V1, V2, V3, V5, V6 e V7 | D63 e D64 saíram |
| `environments` | 10: nove `read_by_commit` e `evidencias_gcp` `not_available` | `custo_gcp` nova; nota de `registro_fase_gcp` atualizada (F33) |
| `metrics`, `filters`, `view_rules`, `questions`, `crossings` | 44, 6, 16, 16 e 4 | sem mudança de quantidade |

Conferido no build: toda chave estrangeira aponta para a chave primária do destino
(`portal/test/er.test.mjs`).

### 11.3 Limites

O aviso diz que a sanitização dos identificadores GCP foi feita na origem depois da tag (`ebd8157`);
o arquivo da `v2.2.0` ainda tem o texto antigo, e a troca na exibição do portal continua (D04). O
achado F36 da origem (ponto de reposição fixo da P12) está aberto e virou limitação conhecida no
portal. Não foram executados comandos do projeto na origem, e nada foi escrito fora do gdados.
