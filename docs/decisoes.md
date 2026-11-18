# Decisões de implementação e publicação

Registro das decisões do portal e do seu estado. Não são ADRs aceitos. Se o Owner determinar que
uma decisão exige ADR, registrar problema, alternativas, custo, consequências e aceite antes da
implementação.

Em 14/11/2026 o Owner respondeu às pendências pelo alinhamento central feito na origem. Fonte:
`mvp_eng_dados_2/data/medicoes/base_consumidores/avisos/resposta_gdados_20261114.md` (fora do Git),
que aponta para o commit `32397cc` do `mvp_eng_dados_2`. As decisões Q12 a Q14 constam em
`PLANO_base_dos_consumidores.md` §6, rodada 4, nesse commit. Abaixo, "resposta central" designa
esse aviso.

Em 17/11/2026 o Owner instruiu fixar o pacote na `v2.1.0` da origem, validá-lo contra o esquema do
mesmo commit e passar o portal a ler `on_zero_denominator`, a partir do aviso
`mvp_eng_dados_2/data/medicoes/base_consumidores/avisos/aviso_gdados_20261117.md` (fora do Git).
Os efeitos estão na D01, na D02 e na D03.

Ainda em 17/11/2026, o Owner aprovou as alternativas recomendadas para iniciar o desenvolvimento e,
depois das provas, adotou Astro (D01) e Mermaid com Cytoscape.js (D02). As alternativas aprovadas:
repositório Git local, provas isoladas em `provas/`, cópia do pacote versionada no gdados e metas de
desempenho registradas antes das provas. Os registros estão na D01, na D02, na D03 e no
[plano](../PLANO.md), E3.

## D01 — Estrutura da aplicação

**Estado:** **decidida em 17/11/2026:** Astro 7, adotado pelo Owner a partir da prova abaixo.

**Requisito:** aplicação navegável que gere artefatos estáticos, com dados preparados antes da
execução no navegador. O destino de hospedagem depende da D04.

**Candidata:** Astro, por alinhamento com o projeto Linkedia consultado. Componentes JavaScript
interativos podem ficar restritos às áreas que os exigem. Isso não implica copiar o tema ou os
fluxos editoriais do Linkedia.

**Alternativa:** HTML/CSS/JavaScript sem framework. Avaliar manutenção de rotas, componentes,
busca, acessibilidade e build antes de optar pela menor quantidade de ferramentas.

**Como decidir:** medir as duas opções localmente contra o pacote no commit fixado (D03), hoje
`eb11709`. Até 17/11/2026 a prova seria contra o exemplo, porque o pacote ainda não estava
fixado. A escolha é independente do protótipo da etapa 2.3 do `bi-como-codigo`, porque são dois
portais (D05).

**Onde fazer a prova (17/11/2026):** em `provas/`, uma subpasta por candidata. As dependências
instaladas ali servem só à prova e não são adoção; o código das provas é versionado, as dependências
instaladas não. As medições usam as metas do [plano](../PLANO.md), E3, item 9, e são feitas com
Playwright e Chromium instalados também só em `provas/` (aprovação do Owner em 17/11/2026).

**Resultado da prova (17/11/2026).** As duas candidatas geram as mesmas 284 páginas (catálogo,
281 relações, linhagem e travessias) a partir do pacote de `eb11709`, com os mesmos módulos de
cliente. Medição em `provas/medicao/resultados/2026-11-17T18-03-17-484Z.json`: Chrome 156 nesta máquina, cinco repetições, mediana, cache desligado;
builds repetidas três vezes. São medições locais de 17/11/2026, não desempenho publicado.

| Medida (meta do plano) | Sem framework, CPU 1× / 4× | Astro, CPU 1× / 4× |
|---|---|---|
| Build completa (até 60 s) | 0,84 s | 5,74 s |
| Catálogo: primeira renderização (até 1,5 s) | 188 / 388 ms | 192 / 288 ms |
| Catálogo: dados comprimidos (até 1 MB) | 104 KB | 104 KB |
| Busca: maior tempo por tecla (até 150 ms) | 53 / 84 ms | 41 / 73 ms |
| Linhagem: recorte inicial (até 1 s) | 275 / 800 ms | 320 / 710 ms |
| Linhagem: expandir um nível (até 500 ms) | 52 / 194 ms | 47 / 159 ms |
| Travessias: dados comprimidos (até 1 MB) | 729 KB | 634 KB |

| Estrutura | Sem framework | Astro |
|---|---|---|
| Pacotes instalados (com transitivos) | 118 (`cytoscape`, `mermaid`) | 304 (`astro`, `cytoscape`, `mermaid`) |
| Tamanho de `node_modules` | 200 MB | 367 MB |
| Código próprio da candidata | 161 linhas | 152 linhas |
| Escape do conteúdo do pacote | Manual: cada interpolação passa por `esc()` | Automático nas expressões |
| Bibliotecas no navegador | Cópia manual dos módulos e dos *chunks* do Mermaid | Empacotadas pelo Vite, com divisão e *hash* |

**Análise.** O desempenho no navegador não distingue as candidatas: o código de cliente é o
mesmo, e as diferenças ficam na variação entre rodadas. As duas cumprem as metas da D01 com
folga. A diferença está na manutenção. Sem framework, a ferramenta é menor e a build é mais
rápida, mas cada valor do pacote precisa ser escapado à mão: esquecer um `esc()` passa HTML da
origem para a página, contra a regra de tratar o conteúdo como texto. O Astro escapa por padrão,
oferece componentes e rotas por dados (`getStaticPaths`), empacota o Mermaid com menos dados
transferidos e é o padrão de processo do Linkedia. O suporte do Astro a Markdown, útil para a
página de conceitos e para os textos lidos por commit, não foi medido nesta prova.

**Recomendação:** Astro 7, com a versão fixada no lockfile. Custo aceito: mais dependências e
build de alguns segundos.

**Decisão (17/11/2026):** o Owner confirmou a recomendação. O portal é construído com Astro 7, com
versão fixada no lockfile.

**Dependências do portal (17/11/2026).** Ao criar `portal/`, o Owner aprovou as alternativas
recomendadas para as duas peças que o Astro, o Mermaid e o Cytoscape.js não cobrem:

| Pacote | Versão | Para quê | Alternativas descartadas |
|---|---|---|---|
| `astro` | 7.4.5 | Aplicação (esta decisão) | — |
| `cytoscape` | 3.34.4 | Linhagem ([D02](#d02--diagramas-e-grafos)) | — |
| `mermaid` | 12.2.0 | Diagramas declarativos (D02) | — |
| `ajv` | 8.20.0 | Validação do pacote com o esquema JSON Schema 2020-12 do mesmo commit ([D03](#d03--pacote-e-atualização-de-metadados)), em modo estrito menos `strictTypes`; o único `format` do esquema, `date`, é conferido por código próprio, sem `ajv-formats` | `jsonschema` em Python, que poria Python e `uv` na build; adiar a validação |
| `@astrojs/markdown-satteri` | 0.4.6 | Processador de Markdown do próprio Astro 7, na versão que ele usa, declarado para receber o plugin de saneamento do portal (`portal/src/lib/markdown.mjs`): HTML bruto vira texto, só ficam elementos do Markdown, links só para âncora, http(s) ou arquivo copiado da origem | Mostrar só texto, perdendo listas, tabelas e links; `rehype-sanitize`, dependência nova que não se encaixa no satteri |

**Pendente:** nada nesta decisão. As versões seguem a regra da prova: a mais recente publicada há pelo
menos duas semanas, fixada no lockfile.

## D02 — Diagramas e grafos

**Estado:** **decidida em 17/11/2026:** Mermaid com Cytoscape.js, adotados pelo Owner a partir da
prova abaixo, com as três condições da recomendação.

**Requisito do Owner:** recursos suficientes de diagramação, ilustração e esquemas via código,
evitando figuras estáticas.

**Candidatas complementares:**

- Mermaid para fluxos, arquitetura e entidade-relacionamento declarativos. O projeto de dados
  já possui diagramas gerados nesse formato.
- Cytoscape.js para explorar a linhagem como grafo, com zoom, deslocamento, seleção, agrupamento
  e layouts automáticos. A expansão de nós e os filtros do produto serão comportamento da aplicação.

Antes de adotar, comprovar localmente legibilidade e desempenho com recortes do grafo real,
compatibilidade com a aplicação escolhida e navegação alternativa por lista/tabela. O suporte a
exportação vetorial e as eventuais extensões precisam ser avaliados por biblioteca; não se presume
que todo recurso exista no núcleo delas.

**Insumos da prova:** desde 17/11/2026, o pacote no commit fixado (D03), para legibilidade e
desempenho. A seção `lineage` traz 200 relações e 3.019 colunas
([Verificação §10.2](verificacao_de_viabilidade.md#102-o-que-o-pacote-declara)). A cópia datada
`linhagem_20261113.json`, prevista em 14/11/2026 só para o desempenho enquanto o pacote não estava
fixado, deixa de ser necessária.

Fontes primárias consultadas em 10/11/2026:

- [Sintaxe do Mermaid](https://mermaid.js.org/intro/syntax-reference).
- [Acessibilidade do Mermaid](https://mermaid.js.org/config/accessibility).
- [Documentação do Cytoscape.js](https://js.cytoscape.org/index.html).

**Onde fazer a prova (17/11/2026):** em `provas/`, como na D01, com as mesmas metas.

**Resultado da prova (17/11/2026).** Versões: `cytoscape` 3.34.4 e `mermaid` 12.2.0, só o núcleo,
sem extensão. Medições em `provas/medicao/resultados/2026-11-17T18-03-17-484Z.json`; legibilidade avaliada por capturas de tela
(`provas/medicao/capturar.mjs`).

| Verificação | Resultado |
|---|---|
| Recorte por relação (P01, relação e vizinhos) | Legível; desenhado em 275 a 320 ms (1×) e 710 a 800 ms (4×) |
| Expandir um nível | 47 a 52 ms (1×); 159 a 194 ms (4×) |
| Linhagem por coluna | Legível com camadas da esquerda para a direita e rótulos ao lado; maior recorte de um nível dentro do limite: `analytics.fact_shipment_item`, 78 nós |
| Recorte acima de 300 nós | `trusted.legacy_records` daria 665 nós; a interface mostra só as colunas e avisa |
| Grafo inteiro (281 relações, 465 ligações) | Desenhado em 747 a 789 ms (1×) e 2,2 a 2,6 s (4×), dentro da meta de 3 s; **ilegível** sem zoom |
| Zoom e deslocamento | Recorte de 78 nós: maior intervalo de 17 a 33 ms (1×), dentro da meta; 100 a 117 ms (4×). Grafo inteiro: 50 ms (Astro) e 67 ms (sem framework) em 1×; 250 a 283 ms em 4×. Numa rodada anterior com o mesmo layout, não registrada, foi 50 ms nas duas. **A meta de 50 ms não é cumprida de forma estável no grafo inteiro** |
| Alternativa em tabela | As mesmas ligações, em tabela, nas duas visões |
| Mermaid, travessias | Legível; título acessível presente no SVG (`accTitle`); texto do pacote como rótulo escapado, `securityLevel: "strict"`; pronto em 0,87 a 1,11 s (1×); 634 a 729 KB comprimidos |

**Achados da prova:**

- o layout `breadthfirst` do núcleo posiciona cada nó pela menor distância a uma raiz. Como
  `dim_date` não tem insumo, views de `consumption` aparecem ao lado de `staging`, sugerindo uma
  ordem do pipeline que não existe. A visão por camadas exige posição por camada ou um layout em
  camadas por caminho mais longo (extensões `cytoscape-dagre` ou `cytoscape-elk`, a avaliar);
- a limpeza de Markdown da primeira versão removia `_` dos identificadores (`raw_legacy` virava
  `rawlegacy`); foi corrigida antes da medição final, e o caso fica como teste obrigatório na E3.

**Recomendação:** adotar a combinação, com três condições para a E2:

1. a abertura da linhagem é sempre um recorte. O grafo inteiro fica como visão geral, com
   agrupamento por camada e zoom, e não como entrada;
2. as camadas do grafo seguem a ordem do pipeline, por posição declarada ou por extensão avaliada
   antes de ser adotada;
3. o Mermaid só é carregado nas páginas que têm diagrama, por causa do peso.

**Decisão (17/11/2026):** o Owner confirmou a recomendação, com as três condições.

**Layout em camadas (17/11/2026):** resolvido **sem extensão**, em código próprio
(`portal/src/cliente/camadas.js`, com testes). A camada de cada relação é o caminho mais longo desde
um nó sem insumo, calculado no build sobre o grafo inteiro. Um nó sem insumo é puxado para a camada
anterior ao seu primeiro consumidor, e por isso `dim_date` não aparece mais ao lado de `raw` nem
arrasta as views para perto de `staging`. O navegador posiciona o recorte com o layout `preset` do
núcleo: x pela camada e y pela camada do schema e pelo nome. Na linhagem por coluna, a coluna fica
na camada da sua relação. Nenhum nome de camada é fixado no código, e a ordem e as cores da legenda
saem do próprio grafo. Conferido no navegador em 17/11/2026: recorte inicial, expansão, recorte por
coluna, aviso acima de 300 nós e visão geral. A medição formal fica para a E3, item 9.

**Travessias no grafo (17/11/2026, PLANO §2.2):** as travessias de `crossings` entram na linhagem
por relação e na visão geral como nós próprios (losangos), ligados por linha tracejada às *sources*.
O destino declarado como relação liga só a ela; o destino declarado como camada liga às *sources*
dessa camada que não têm travessia própria, e a ligação é rotulada como "travessia declarada para a
camada". O grafo por coluna não as mostra, porque o pacote não declara travessia por coluna. A regra
está em `portal/src/lib/travessias.mjs`, com teste contra o pacote fixado.

**Diagramas dos documentos da origem (17/11/2026):** os blocos Mermaid que a origem já publica nos
documentos lidos por commit, como os diagramas entidade-relacionamento do modelo transacional
(Modelo de Dados §2.11), são desenhados no navegador com `securityLevel: "strict"`. A definição
continua visível como texto, e o Mermaid só é carregado nas páginas que têm esses blocos (condição 3).

**Zoom no grafo inteiro (E3, 17/11/2026):** na visão geral, o núcleo do Cytoscape.js passa a
desenhar textura durante o zoom e o deslocamento, esconder as ligações enquanto a área se move e não
desenhar rótulos abaixo de 8 px na tela (`textureOnViewport`, `hideEdgesOnViewport`,
`min-zoomed-font-size`), sem extensão. A mediana do maior quadro caiu de 83 ms para 33 ms com CPU
normal, mas duas de cinco rodadas passaram de 50 ms ([relatório da E3](relatorio_e3.md), §3). A meta
volta ao Owner na E4.

**Pendente:** nada nesta decisão. `cytoscape-dagre` e `cytoscape-elk` não foram adotados; se a E3 ou
a E4 mostrarem que o layout próprio não basta, a extensão é avaliada e registrada aqui antes de entrar.

## D03 — Pacote e atualização de metadados

**Estado:** decidida em 14/11/2026 (resposta central §1 e §3, A4 a A6). Em 17/11/2026, o pacote foi
fixado na `v2.1.0` da origem, por instrução do Owner. Implementada no portal no mesmo dia.

**Contrato:** o formato 1 do pacote da origem, especificado antes da geração por decisão do Owner
(Q13) e gerado pela origem desde 14/11/2026.

**Commit fixado:** `eb11709`, tag `v2.1.0` do `mvp_eng_dados_2`, o fechamento da fase da base dos
consumidores. A origem o marca em `docs/consumidores.md` §6 como o marco a preferir; o aviso dela é
`data/medicoes/base_consumidores/avisos/aviso_gdados_20261117.md`, fora do Git. O commit anterior,
`32397cc`, só publicava a especificação, o esquema e o exemplo. A validação de 17/11/2026 e o
inventário do pacote estão na [Verificação §10](verificacao_de_viabilidade.md#10-pacote-fixado-na-v210-17112026).

| Arquivo da origem em `eb11709` | O que é |
|---|---|
| `docs/pacote_de_metadados.json` | O pacote, fonte do portal |
| `docs/pacote_de_metadados.schema.json` | Esquema JSON Schema 2020-12; o pacote é validado com o **deste** commit |
| `docs/pacote_de_metadados.md` | Especificação: campos, regras que o consumidor pode presumir, o que a versão 1 não leva |
| `docs/pacote_de_metadados.exemplo.json` | Recorte ilustrativo de 13/11/2026; não é regenerado. Serve a testes de mecanismo, não a conteúdo exibido |

O site deve funcionar sem conexão com bancos ou credenciais no navegador.

A geração e o gatilho pertencem à origem (D91 de lá, herdada pelo `mvp_eng_dados_2`). O gdados
não gera pacote nem o completa: o que faltar no formato para alguma página é pedido à origem pelo
[arquivo de alinhamento](alinhamento_entre_projetos.md), e a origem acrescenta o campo sem quebrar o
formato. Trocar o commit fixado é decisão registrada aqui, depois de validar o pacote novo.

**Distribuição (A4):** cópia para o gdados por **comando local explícito**, que lê o commit fixado
com `git show` e registra ao lado o commit e o SHA-256 de cada arquivo. Copiam-se o pacote e o
esquema; o exemplo, se servir aos testes. Desde 17/11/2026, por aprovação do Owner, a cópia e o
registro ficam **versionados no Git do gdados**, em `origem/`, para que a build funcione num clone
limpo sem o checkout da origem. O comando é `scripts/copiar_pacote.sh`.

**Textos lidos por commit (17/11/2026, aprovação do Owner):** o mesmo comando copia, no mesmo
commit, os arquivos da origem que o portal lê fora do pacote, listados em
`scripts/arquivos_da_origem.txt`, para `origem/arquivos/`, com o SHA-256 de cada um em
`origem/procedencia.json`. Em 17/11/2026, a lista ganhou `docs/glossario.md`, o Glossário
Técnico, fonte das definições da página de conceitos, e a cópia foi refeita no mesmo commit. A lista é declarada no gdados a partir das referências do pacote
([mapeamento §3](mapeamento_do_pacote.md#3-o-que-o-portal-lê-por-commit-fora-do-pacote)). O comando
recusa `.env`, estados e variáveis do Terraform, chaves, credenciais e endereços de e-mail fora dos
domínios reservados para exemplo. Os identificadores dos projetos GCP já excluídos aparecem no
Registro da fase GCP; sua exposição é revista na E3 (item 10) e na D04, antes de publicar. Ficam descartados a leitura do checkout da origem durante
o build, a leitura de `dbt/target/` e o artefato de release com hash.

**Pacote incompleto ou desatualizado (A6):** regras do formato (especificação §2) que o portal aplica:

- `format` diferente de `1` recusa o build;
- o pacote é validado com o esquema **do mesmo commit**;
- `null` é exibido como **ausente**, nunca como zero ou texto vazio;
- `result: null` de um teste ou de um `check` é exibido como **sem resultado**;
- `provenance.warehouse.status` é exibido como está: `verified`, com commit e data do build, ou
  `not_verified`, com o motivo;
- a data dos artefatos e o commit fixado ficam sempre visíveis;
- a chave desconhecida é ignorada.

A especificação também garante que não existe pacote parcial e que campo novo não muda o número do
formato.

**Denominador zero das métricas (17/11/2026):** o portal lê `metrics.*.on_zero_denominator`:
`"returns_null"` diz que a razão resulta nula quando o denominador é zero; `null` diz que o caso não
se aplica (medida, diferença), e não deve ser exibido como ausência de informação. O
`zero_denominator` antigo **não é lido**: a origem o mantém só por compatibilidade e o retira no
próximo formato, que o portal recusará até ser adaptado.

**Conteúdo:** em `eb11709`, o formato 1 traz `provenance`, `relations` (com `grain` e
`grants_select`), `lineage` (o `lineage --json` sem alteração), `crossings`, `questions`,
`metrics`, `filters`, `view_rules`, `description_gaps`, `tests`, `checks` (resultados do `pytest`),
`open_items` (decisões e verificações em aberto), `view_audits` e `environments`. Continuam fora:
o texto de documentos, ADRs e glossário, os objetos tocados por item em aberto
(`open_items.*.objects` é `null`, e o portal não infere) e as evidências do GCP. O portal lê os
textos por commit fixado e mostra o resto como indisponível. Decisão já tomada na origem, como a
D66 (ADR-0053), não está em `open_items`: é lida no documento responsável. Mudanças de valor ou
texto que o portal exibe são anunciadas em `docs/consumidores.md` §5 da origem.

**Evidências GCP:** registradas pela origem como L10. Em `eb11709` aparecem como `not_available` em
`environments` (`evidencias_gcp`); se entram e como são sanitizadas, é decisão pendente da origem.

**Próxima troca do commit fixado:** a resposta da origem de 17/11/2026
(`resposta_gdados_20261117.md`, fora do Git) anuncia uma fase curta de correções que termina numa
tag nova, sem data, com mudanças aditivas no formato 1: `description_gaps` sem relações faltando
(F32); entrada nova em `environments` para a Capacidade §2.14 e nota de `registro_fase_gcp`
atualizada (F33); `view_audits` com os ids das verificações em `checks`; na especificação, a chave
de uma view como a união das colunas `grain` e `identity` de `view_rules`, com
`relations.*.grain` nulo nas views; `open_items` com outra composição, em que cada item só sai com
evidência e aceite (a V6 pode continuar aberta); e as chaves de `analytics` e o destino dos testes
`relationships` (F34; `resposta_gdados_20261117b.md`), com nomes finais na especificação da tag. Quando a tag for anunciada em Consumidores §6, o gdados refixa por este comando e
valida contra o esquema do mesmo commit. Até lá, o commit fixado continua `eb11709`.

**Leitura que não precisa ser refeita (resposta da origem, §3):**

- `description_gaps`, `environments`, `open_items` e as demais coleções são lidas com tamanho e
  identificadores variáveis; nenhuma contagem ou ID do pacote de hoje é fixado no código ou no texto
  editorial;
- campo novo do formato 1 que o portal não usa é tolerado, conforme as regras acima.

**Implementação (17/11/2026):** o comando de cópia é `scripts/copiar_pacote.sh`. A leitura fica em
`portal/src/lib/origem.mjs` e roda em toda build (`npm run build`) e em `npm run validar`. Ela confere
o SHA-256 de cada arquivo registrado em `origem/procedencia.json`, recusa `format` diferente de 1 e
valida o pacote com o esquema do mesmo commit, usando ajv (D01). Qualquer falha interrompe a build.
O tratamento de ausência e de estado acima está nas páginas: `null` como ausente, `result: null` como
sem resultado, `warehouse.status` como está e o rodapé de procedência em toda página. As métricas
leem `on_zero_denominator`. Os testes ficam em `portal/test/origem.test.mjs`.

**Pendente:** nada na implementação. A troca do commit fixado segue a regra acima quando a tag nova
for anunciada.

## D04 — Identidade e audiência da publicação

**Estado:** hospedagem e site decididos em 18/11/2026 (`governadados.web.app`, exceção à Q14); o resto pendente do Owner até a E5.

**Diretriz de 10/11/2026:** GitHub → Firebase Hosting, seguindo o padrão do Linkedia, depois das
verificações e da avaliação locais.

**Conflito com a Q14:** o Owner decidiu em 14/11/2026 que não se cria **nenhum recurso novo no
GCP**, em nenhum projeto. Um projeto Firebase é um projeto GCP. Quando a E5 chegar, a D04 volta ao
Owner à luz da Q14: usar um projeto que já existe, outra hospedagem ou uma exceção à Q14. Nada a
fazer antes disso.

**Opção levantada em 18/11/2026: Claude Artifacts.** O Owner perguntou se o portal cabe em um
artifact do claude.ai. Avaliação: não cria recurso no GCP (compatível com a Q14) e nasce privado,
mas o build de 18/11/2026 não entra como está — 789 arquivos (o limite é 511 por versão e 255 por
envio) e links absolutos (`/conceitos/`), que exigiriam base relativa e menos arquivos (por
exemplo, juntar os JSON). Enviar é publicar: fica para a E5, com a E4.5 resolvida antes.

**Leitura do GCP em 18/11/2026** [medido com `gcloud` só de leitura, a pedido do Owner; nada criado
nem alterado]. O Owner informou que os créditos acabaram e os custos passaram a ser reais.

- A conta de faturamento `0199D3-…` está aberta e ligada a três projetos, sem relação com o gdados:
  `analisador-de-risco`, `da-voz-ao-produto` e `customer-care-prod`. `mvp-ed1-gcp`, `mvp-ed1-estudo`
  e `nl2sql-0ee96a` estão em exclusão, sem faturamento.
- Nos três projetos: quatro serviços do Cloud Run sem instância mínima e com acesso público (só
  cobram com tráfego acima da cota gratuita), *buckets* com cerca de 170 MB em `us-east1` (dentro da
  cota gratuita), 12 versões ativas de segredos e cerca de 1,6 GB de imagens no Artifact Registry.
  Não há Compute Engine, Cloud SQL, App Engine nem conjuntos no BigQuery.
- O que passa da cota gratuita, pela tabela pública de preços e não por fatura: as imagens além de
  0,5 GB e os segredos além de 6 versões, algo abaixo de US$ 1 por mês [estimado].
- O gasto real e os orçamentos não foram lidos: a API de orçamentos está desligada e o valor só
  aparece em Faturamento > Relatórios, na consola.

**Hospedagem gratuita.** O build tem 19 MB. Os projetos `linked-ia` e `portfolio-douglas-alencar`
já usam Firebase Hosting **sem conta de faturamento** (plano Spark, que não gera cobrança) e já têm
mais de um site. Um site novo em um deles cabe na cota gratuita (10 GB armazenados, 360 MB/dia de
transferência) sem criar projeto, mas continua sendo recurso novo no GCP: exige a decisão do Owner
sobre a Q14 na E5. Fora do GCP: GitHub Pages (gratuito com repositório público) e o artifact acima.

**Limpeza em 18/11/2026, a pedido do Owner** [medido]. Foram apagadas do Artifact Registry as três
imagens sem *tag* e fora de uso: duas do `dcra` (`analisador-de-risco`) e uma do
`customer-care-backend` (`customer-care-prod`). Ficaram as quatro `latest`, usadas pelas revisões
com 100% do tráfego; voltar a uma revisão antiga desses serviços deixou de ser possível. O Secret
Manager ficou como estava: os 12 segredos são lidos pelos serviços ativos e cada um tem uma versão.

**Direção do Owner (18/11/2026): projeto "extras".** A Q14 proíbe projeto novo, mas o Owner pretende
criar um projeto "extras" na cota gratuita para reunir o que for além dos projetos atuais.
Avaliação:

- sem conta de faturamento ligada, o projeto não tem como gerar cobrança; o Firebase fica no plano
  Spark, que basta para um site estático (até 36 sites por projeto, mesma cota de Hosting citada
  acima) e para a federação de identidade do deploy na E5 (IAM não cobra);
- ligar a conta de faturamento abriria a cota gratuita de Cloud Run, BigQuery e outros, mas o excesso
  passaria a ser cobrado, e orçamento só avisa, não bloqueia. Recomendação: manter o "extras" **sem
  faturamento** e tratar qualquer ligação como decisão à parte;
- os três projetos em exclusão ainda contam na cota de projetos da conta até serem removidos (cerca de
  30 dias após o pedido), o que pode impedir a criação; a cota não foi lida;
- é uma exceção à Q14, decidida pelo Owner: a origem registra a Q14, então a mudança deve chegar a ela
  pelo alinhamento. A criação do projeto é ato do Owner; publicar continua dependendo da E5.

**Decisão do Owner (18/11/2026): hospedagem e site.** "Vamos seguir. Projeto 'Extras', criar site
governadados.web.app." Feito no mesmo dia [medido]:

- projeto `extras-douglas-alencar`, nome "Extras", **sem conta de faturamento** (`billingEnabled:
  False` conferido depois da criação), com Firebase no plano Spark;
- site do Firebase Hosting `governadados`, em `https://governadados.web.app`, criado vazio (responde
  404); o projeto tem também o site padrão `extras-douglas-alencar.web.app`, sem uso;
- nenhum deploy, conta de serviço ou IAM configurado.

Com isso, a hospedagem e a identificação do site estão decididas. Seguem pendentes para a E5: a E4.5,
o repositório GitHub, a audiência, as permissões do workflow e a forma de aceite para publicar.

**Pendente:** hospedagem, repositório GitHub, identificação do site, domínio, audiência,
permissões do workflow e forma de aceite para publicar. O usuário citar o Linkedia não autoriza
reutilizar suas contas, seus recursos ou seus vínculos IAM.

A escolha entre acesso público e restrito afeta a solução de publicação; não assumir uma audiência.

**Insumo da E3 (17/11/2026):** os textos da origem copiados por commit, e por isso presentes em
`dist/`, citam identificadores de projetos GCP do Owner, inclusive três sem relação com o projeto de
dados, e o prefixo truncado de uma conta de faturamento ([relatório da E3](relatorio_e3.md), §5).
Antes de publicar, decidir entre publicar como está, retirar esses documentos da lista de cópia ou
pedir à origem uma versão sanitizada.

**Avaliação da E4.5 (18/11/2026), a pedido do Owner.** O portal não acrescenta esses identificadores:
eles vêm de três textos copiados por commit (`registro_fase_gcp.md`, `capacidade_e_recuperacao.md`,
`terraform.tfvars.example`). Um ID de projeto não dá acesso (o acesso é do IAM), e o
`mvp_eng_dados_2` já é público no GitHub com esses mesmos textos. Mesmo assim, os três projetos sem
relação e o prefixo da conta de faturamento não ensinam nada sobre o projeto de dados.
**Recomendação:** no build, trocar só esses quatro por um marcador ("projeto não relacionado",
"conta de faturamento"), com aviso na página, um teste que falha se algum aparecer em `dist/` e um
pedido à origem para sanitizar na fonte; `mvp-ed1-gcp` e `mvp-ed1-estudo`, que são o próprio
projeto de dados, ficam. **Aguarda o Owner.**

**Repositório (18/11/2026, Owner):** "GH repo público se não houver vazamento de chaves e informações
privadas minhas." Varredura de 18/11/2026 nos 254 arquivos versionados [medido]: nenhuma chave,
token ou credencial; o `.gitignore` já cobre `.env`, chaves, contas de serviço e estado Terraform.
Achados: os 33 commits têm como autor o e-mail pessoal do Owner (a origem pública já o expõe em 208
commits); os documentos citam caminhos locais `/home/doug/...`; IDs de projeto trazem o nome do
Owner, como os demais projetos dele. **Recomendação:** antes do primeiro *push*, reescrever o autor
dos commits para o endereço `noreply` do GitHub (o repositório nunca foi enviado, então nada se
perde fora daqui) e configurar esse endereço no gdados. **Aguarda o "pode fazer".**

**Deploy (18/11/2026, Owner):** semelhante aos dos outros projetos, avisando oportunidades de
refino. Há dois modelos nos projetos do Owner [lido]:

- `portfolio`, `ia-lider`, `contos` e `corno`: o workflow gerado pela CLI do Firebase, com a **chave
  JSON de uma conta de serviço guardada como segredo do GitHub** (credencial de longa duração) e
  *actions* por *tag* móvel (`@v0`, `@v4`);
- Linkedia (`linkedia-magazine-publish`): sem chave, por federação de identidade restrita ao
  repositório, ao `main` e ao *push*; *actions* fixadas por SHA; o deploy publica o artefato do build
  testado; teste de fumaça depois.

**Proposta para o gdados:** o modelo do Linkedia, já previsto na E5, com `npm run build`, os testes
do portal e a verificação da E3 antes do deploy. Refinos encontrados, a levar a cada projeto na sua
própria sessão:

1. migrar os quatro sites do primeiro modelo para a federação e apagar as chaves JSON;
2. limitar as versões guardadas pelo Firebase Hosting: hoje é ilimitado (`maxVersions` 999999 ou
   padrão) e há 38 versões no `linkedia`, 24 no `ia-lider` e 100 ou mais no `portfolio`
   [medido]. No Spark não há cobrança, mas as versões ocupam os 10 GB da cota. Proposta: guardar 5,
   inclusive no `governadados`;
3. nos projetos com Cloud Run, trocar a revisão manual por regras automáticas: política de limpeza
   no Artifact Registry (manter a imagem mais recente de cada serviço) e regra de ciclo de vida nos
   *buckets* `run-sources-*` (apagar fontes de deploy com mais de 7 dias). Uma conferência mensal
   confirma que as regras funcionam;
4. Secret Manager: a alternativa gratuita segura é juntar os segredos de cada projeto em um só (um
   JSON por projeto, 3 versões, dentro das 6 gratuitas), o que exige mudar o código dos três
   aplicativos. Variável de ambiente comum é gratuita, mas deixa as chaves visíveis a quem lê a
   configuração do serviço; não recomendada. A economia é de cerca de US$ 0,36 por mês [estimado].
   O gdados não precisa de segredo nenhum.

**Aplicado em 18/11/2026, com o Owner aprovando todas as propostas acima** [medido]:

- E4.5: os três projetos sem relação e a conta de faturamento são trocados por marcador na exibição
  (`portal/src/lib/mascara.mjs`, que guarda só o SHA-256 dos IDs); a página diz quantos foram
  trocados e que o SHA-256 é o do original; o teste `mascara.test.mjs` e a verificação 10 da E3
  falham se algum chegar a `dist/`. Os nomes continuam no histórico e nos resultados da E3 deste
  repositório, como já estão no `mvp_eng_dados_2` público;
- `governadados` guarda no máximo 5 versões (`maxVersions: 5`);
- os refinos dos outros projetos seguem pelos avisos na caixa de correio de cada um
  ([alinhamento](alinhamento_entre_projetos.md)).

**Segredos em variáveis de ambiente (18/11/2026).** O Owner perguntou se "qualquer pessoa" se
resume a quem acessa o projeto. Quase: a configuração do Cloud Run, com os valores, aparece para
quem tem acesso de leitura ao projeto, nos logs de auditoria do projeto, na saída de quem descreve o
serviço (inclusive uma IA, cujo histórico vai ao provedor dela) e onde o valor passar no deploy
(histórico do terminal, logs de CI). O Owner considera o risco aceitável para liberar o Secret
Manager a um projeto que precise dele; os avisos pedem os valores por arquivo fora do Git, nunca na
linha de comando, e limite de gasto nas contas dos provedores de API.

## D05 — Relação com o portal da etapa 2.7 do `bi-como-codigo`

**Estado:** decidida pelo Owner em 14/11/2026 (Q12).

**Decisão:** **dois portais, um pacote.**

- O gdados mantém o escopo do próprio [plano](../PLANO.md), e a etapa 2.7 do BI mantém o dela.
- Os dois leem **só** o pacote da origem. A parte comum (catálogo, perguntas, vocabulário e
  linhagem) nasce do mesmo pacote e não diverge.
- Os dois andam de forma independente; nenhum espera o outro publicar.

**Consequência para o gdados:** o que for específico do gdados, como a camada editorial da página
de conceitos (E1), não vira requisito do pacote nem do portal do BI.

## D06 — Amostras de registros no portal

**Estado:** pendente do Owner, aberta em 17/11/2026 (E4.2).

**Pedido do Owner:** mostrar as cinco primeiras linhas de cada tabela, com todas as colunas, para ver
exemplos de preenchimento na própria página da relação.

**Avaliação (17/11/2026):** tecnicamente viável, porque os dados são sintéticos e cinco linhas por
relação cabem nas metas de tamanho. Mas contraria três regras em vigor:

1. o [AGENTS.md](../AGENTS.md) proíbe copiar "amostras de registros para o portal";
2. o portal não lê banco ([alinhamento, §1](alinhamento_entre_projetos.md#1-direção-decidida); PLANO,
   E1), e o armazém da origem não está de pé para isso;
3. o pacote é só metadado, e o gdados não o completa: um campo novo é pedido à origem, que decide
   (D03).

**Para fazer, seria preciso:** (a) o Owner alterar a regra de amostras do AGENTS.md; (b) pedir à
origem, pelo [alinhamento](alinhamento_entre_projetos.md), que exporte amostras com data e commit,
pelo caminho que ela aceitar; (c) decidir o tratamento das colunas `personal` e dos *payloads* JSON
do legado em `raw_legacy`; (d) levar o efeito à D04, porque dado com aparência de pessoal num site
publicado é decisão de exposição, ainda que sintético (Governança §4 da origem: classificar não é
expor).

**Alternativa sem decisão nova:** destacar, por coluna, o que o pacote já declara sobre o
preenchimento: tipo, domínio de valores e significado de cada valor, valores não observados e
impossíveis e significado do nulo. Não equivale a ver linhas reais.

**Pendente:** decisão do Owner entre manter a regra (com ou sem a alternativa) ou abrir a exceção
pelos passos acima.
