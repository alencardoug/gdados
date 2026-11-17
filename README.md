# gdados — Portal de engenharia e governança de dados

Interface navegável para compreender o projeto de dados `mvp_eng_dados_2`, continuação do
`mvp_eng_dados_1`, das origens às views de consumo,
e comparar sua estrutura de dados e sua infraestrutura local e GCP. A compreensão conceitual e
teórica tem o mesmo peso da exploração técnica: o portal deverá explicar o que o usuário encontra,
por que existe e como aparece na governança já implementada.

**Estado:** base documental criada em 10/11/2026. Viabilidade verificada sobre artefatos locais
e reconferida em 13 e 14/11/2026. E0 fechada pelo Owner em 14/11/2026; E1 e E2 autorizadas. Em
17/11/2026 o pacote de metadados da origem foi fixado na `v2.1.0` e validado contra o esquema do
mesmo commit. No mesmo dia começou a aplicação, em `portal/` (Astro): as três páginas leem o
pacote validado no build. A camada editorial da página de conceitos tem formato, inventário e a
primeira redação das explicações, a revisar pelo Owner.

## Escopo

- Navegar por perguntas de negócio, domínios, objetos e colunas.
- Explorar o dicionário e a linhagem por tabela e por coluna, com acesso às definições originais.
- Oferecer uma página própria de conceitos, termos e artefatos, com percursos de leitura e exemplos
  reais ligados ao catálogo e aos diagramas.
- Explicar conceitos, modelo lógico, implementação física, infraestrutura e organização do código.
- Comparar ambientes local e GCP, distinguindo declaração, medição histórica e estado atual verificado.
- Gerar diagramas e ilustrações por código, a partir dos artefatos do projeto.

## Mapa documental

Cada assunto tem um dono; os demais documentos apontam para ele.

| Arquivo | Responsabilidade |
|---|---|
| [AGENTS.md](AGENTS.md) | Convenções e limites para agentes neste projeto |
| [PLANO.md](PLANO.md) | Escopo da interface, etapas, entregas e critérios de aceite |
| [Página de conceitos](docs/pagina_de_conceitos.md) | Objetivos de aprendizagem, organização e critérios do conteúdo explicativo |
| [Verificação de viabilidade](docs/verificacao_de_viabilidade.md) | Evidências coletadas, lacunas e limites da avaliação |
| [Decisões](docs/decisoes.md) | Decisões de aplicação, diagramas, metadados, publicação e relação com o BI |
| [Mapeamento do pacote](docs/mapeamento_do_pacote.md) | De onde cada página tira cada informação do pacote e as lacunas do formato |
| [Alinhamento entre projetos](docs/alinhamento_entre_projetos.md) | Índice das pendências que envolvem a origem, o BI e o Owner |
| [Relatório da E3](docs/relatorio_e3.md) | Resultado datado da verificação local, com a versão avaliada e os limites |

## Fronteira com o projeto de dados

Este diretório é a base do portal. O projeto de dados é uma fonte de consulta, não um diretório de
trabalho do portal. Não duplicar aqui as políticas, os glossários ou a linhagem mantidos lá: o
portal deverá consumir exportações identificadas por versão e apontar para a fonte responsável.
A explicação didática pertence ao portal e será ligada a essas definições; sua forma de apresentação
e os exemplos não a tornam uma nova autoridade sobre regras, métricas ou decisões da origem.

Fonte vigente desde 13/11/2026: `../mvp_eng_dados_2`, lida por commit fixado (D92 da origem,
commit `040a796`). Desde 17/11/2026 o commit fixado é `eb11709`, a tag `v2.1.0`, com o pacote no
formato 1; o registro e as trocas futuras ficam na
[D03](docs/decisoes.md#d03--pacote-e-atualização-de-metadados). O `../mvp_eng_dados_1`,
arquivado no ponto `v2.0.0` (`f86b9fb`), fica como referência histórica. As avaliações de 10 e 13/11/2026 foram feitas sobre ele e continuam
válidas como fotografias datadas daqueles commits
([Verificação §8](docs/verificacao_de_viabilidade.md#8-mudança-de-fonte-13112026)).

## Desenvolvimento e publicação

A aplicação fica em `portal/`, com `package.json` e lockfile próprios. As dependências e o motivo
de cada uma estão na [D01](docs/decisoes.md#d01--estrutura-da-aplicação). As provas da D01 e da D02
continuam em `provas/`, isoladas.

```bash
cd portal
export npm_config_cache="$PWD/../.cache/npm" TMPDIR="$PWD/../.cache/tmp"
mkdir -p "$TMPDIR" && npm ci --no-audit
npm run validar   # confere SHA-256, formato e esquema da cópia em ../origem/, sem construir
npm test          # testes de unidade (node:test)
npm run build     # gera dist/; recusa a build se a cópia ou o pacote não passarem (D03)
npm run preview   # serve dist/ localmente
```

A build lê só `origem/`, versionada no gdados; não precisa do checkout da origem nem de banco.

O destino indicado em 10/11/2026 foi **GitHub → Firebase Hosting**, seguindo o padrão do Linkedia.
Em 14/11/2026 o Owner proibiu recursos novos no GCP, e um projeto Firebase é um deles; a hospedagem
volta ao Owner na E5 ([D04](docs/decisoes.md#d04--identidade-e-audiência-da-publicação)). A primeira
entrega deverá ser validada e avaliada localmente, conforme o [plano](PLANO.md).


## Retomar em uma nova sessão

Abra a sessão com `/home/doug/Projetos/gdados` como diretório de trabalho. O agente deverá ler
`AGENTS.md` e os documentos apontados ali, além da especificação da página de conceitos.
O histórico desta conversa não é necessário para compreender o escopo documentado.

**Estado em 17/11/2026, ao fim da sessão:**

- a pasta é um repositório Git local, sem remoto (o remoto depende da D04). Commits em Conventional
  Commits, em português;
- o pacote da origem está fixado na `v2.1.0` (`eb11709`), copiado e versionado em `origem/` por
  `scripts/copiar_pacote.sh`, com os textos lidos por commit em `origem/arquivos/`;
  `scripts/copiar_pacote.sh --verificar` confere os SHA-256 (D03);
- o [mapeamento do pacote](docs/mapeamento_do_pacote.md) está feito;
- as provas da D01 e da D02 estão em `provas/`, com resultados na D01 e na D02. O Owner adotou
  **Astro** e **Mermaid com Cytoscape.js**;
- a aplicação existe em `portal/` (Astro 7, passo 3 do plano, §5): a build confere os SHA-256 da
  cópia, recusa `format` diferente de 1 e valida o pacote com o esquema do mesmo commit (ajv);
  os textos da origem passam por Markdown saneado; a linhagem usa layout em camadas próprio, sem
  extensão. Páginas: catálogo, relação, perguntas, métricas e filtros, linhagem (por relação, por
  coluna e visão geral), estado e evidência, estrutura e ambientes (com as travessias em Mermaid),
  arquivos da origem, procedência e a entrada de conceitos. São 19 testes de unidade em `portal/test/`.
  Nesta etapa a conferência no navegador foi avulsa; a verificação formal da interface é a E3;
- a origem prepara uma tag nova, sem data, com F32, F33, F34 e outras mudanças aditivas
  ([alinhamento, O8](docs/alinhamento_entre_projetos.md#3-dependências-do-mvp_eng_dados_2)). O gdados
  não espera por ela; quando for anunciada, refixar e revalidar pela D03.

- a camada editorial está em `portal/src/conteudo/` (formato na
  [página de conceitos §9](docs/pagina_de_conceitos.md#9-formato-da-camada-editorial-17112026)):
  inventário de termos com as definições da origem extraídas por commit, as primeiras explicações,
  as limitações conhecidas e a ida e volta entre objeto e explicação. Três divergências do Glossário
  Técnico da origem foram encaminhadas no [alinhamento, §7](docs/alinhamento_entre_projetos.md#7-para-a-origem);

- também em 17/11/2026: os percursos de leitura, a primeira redação das explicações de todos os
  termos do inventário, as travessias ligadas ao grafo de linhagem e os diagramas Mermaid dos
  documentos da origem desenhados no portal ([D02](docs/decisoes.md#d02--diagramas-e-grafos));

- a E3 foi feita em 17/11/2026 com a verificação em `verificacao/` (Playwright fora das dependências
  do portal, aprovado pelo Owner): 38 verificações automáticas passaram, com ressalvas e achados no
  [relatório](docs/relatorio_e3.md);

**Próximo passo:** a E4, avaliação local pelo Owner ([plano](PLANO.md), E4): a revisão conceitual das
explicações, os percursos, a ressalva do zoom no grafo inteiro e os identificadores GCP nos textos da
origem (relatório, §3 e §5). Para avaliar: `cd portal && npm run build && npm run preview`.

Os caches e temporários de npm, `uv` e Playwright ficam em `.cache/` (variáveis em
`provas/README.md`). Na origem, só leitura de arquivos e `git show`/`git log`.

O Owner fechou a E0 em 14/11/2026, pela resposta central registrada em
[Decisões](docs/decisoes.md). Estão autorizadas as provas locais da D01 e da D02, a E1 reescrita
e a E2. Em 17/11/2026 o Owner fixou o pacote na `v2.1.0` (`eb11709`) e mandou o portal ler
`on_zero_denominator`; desde então as provas e as etapas trabalham contra o pacote real, e não
contra o exemplo. A D04 volta ao Owner na E5, à luz da decisão de não criar recursos novos no GCP.
As pendências entre projetos estão no [alinhamento](docs/alinhamento_entre_projetos.md).

A sequência replanejada em 17/11/2026 e os critérios de aceite estão no plano, §5.
