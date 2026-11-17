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

Ainda em 17/11/2026, o Owner aprovou as alternativas recomendadas para iniciar o desenvolvimento:
repositório Git local, provas isoladas em `provas/`, cópia do pacote versionada no gdados e metas de
desempenho registradas antes das provas. Os registros estão na D01, na D02, na D03 e no
[plano](../PLANO.md), E3.

## D01 — Estrutura da aplicação

**Estado:** prova feita em 17/11/2026; recomendação: Astro. A adoção aguarda a confirmação do Owner.

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

**Pendente:** confirmação do Owner para adotar.

## D02 — Diagramas e grafos

**Estado:** prova feita em 17/11/2026; recomendação: adotar Mermaid com Cytoscape.js, com as
condições abaixo. A adoção aguarda a confirmação do Owner.

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

**Pendente:** confirmação do Owner para adotar; avaliação do layout em camadas na E2.

## D03 — Pacote e atualização de metadados

**Estado:** decidida em 14/11/2026 (resposta central §1 e §3, A4 a A6). Em 17/11/2026, o pacote foi
fixado na `v2.1.0` da origem, por instrução do Owner. A implementação está pendente na E1.

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
`origem/procedencia.json`. A lista é declarada no gdados a partir das referências do pacote
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
`relations.*.grain` nulo nas views; e `open_items` com outra composição (saem D63, D64, V5, V6 e
V7; entra a D93). Quando a tag for anunciada em Consumidores §6, o gdados refixa por este comando e
valida contra o esquema do mesmo commit. Até lá, o commit fixado continua `eb11709`.

**Leitura que não precisa ser refeita (resposta da origem, §3):**

- `description_gaps`, `environments`, `open_items` e as demais coleções são lidas com tamanho e
  identificadores variáveis; nenhuma contagem ou ID do pacote de hoje é fixado no código ou no texto
  editorial;
- campo novo do formato 1 que o portal não usa é tolerado, conforme as regras acima.

**Pendente:** implementar na E1 o comando de cópia, a validação e o tratamento acima. A validação
de 17/11/2026 foi avulsa e não escolhe a ferramenta do comando, que acompanha a D01.

## D04 — Identidade e audiência da publicação

**Estado:** pendente do Owner até a E5; conflito com a Q14 registrado em 14/11/2026.

**Diretriz de 10/11/2026:** GitHub → Firebase Hosting, seguindo o padrão do Linkedia, depois das
verificações e da avaliação locais.

**Conflito com a Q14:** o Owner decidiu em 14/11/2026 que não se cria **nenhum recurso novo no
GCP**, em nenhum projeto. Um projeto Firebase é um projeto GCP. Quando a E5 chegar, a D04 volta ao
Owner à luz da Q14: usar um projeto que já existe, outra hospedagem ou uma exceção à Q14. Nada a
fazer antes disso.

**Pendente:** hospedagem, repositório GitHub, identificação do site, domínio, audiência,
permissões do workflow e forma de aceite para publicar. O usuário citar o Linkedia não autoriza
reutilizar suas contas, seus recursos ou seus vínculos IAM.

A escolha entre acesso público e restrito afeta a solução de publicação; não assumir uma audiência.

## D05 — Relação com o portal da etapa 2.7 do `bi-como-codigo`

**Estado:** decidida pelo Owner em 14/11/2026 (Q12).

**Decisão:** **dois portais, um pacote.**

- O gdados mantém o escopo do próprio [plano](../PLANO.md), e a etapa 2.7 do BI mantém o dela.
- Os dois leem **só** o pacote da origem. A parte comum (catálogo, perguntas, vocabulário e
  linhagem) nasce do mesmo pacote e não diverge.
- Os dois andam de forma independente; nenhum espera o outro publicar.

**Consequência para o gdados:** o que for específico do gdados, como a camada editorial da página
de conceitos (E1), não vira requisito do pacote nem do portal do BI.
