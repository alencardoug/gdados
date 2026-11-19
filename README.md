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
primeira redação das explicações, a revisar pelo Owner. Em 18/11/2026 o pacote foi refixado na
`v2.2.0`, e o portal passou a mostrar as chaves e o diagrama entidade-relacionamento; no mesmo dia
começou a publicação em <https://governadados.web.app>.

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
commit `040a796`). Desde 18/11/2026 o commit fixado é `f5a5173`, a tag `v2.2.0` (antes, `eb11709`,
a `v2.1.0`), com o pacote no formato 1; o registro e as trocas futuras ficam na
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

A publicação é **GitHub → Firebase Hosting**, no projeto "Extras", sem faturamento, aberto pelo Owner
em 18/11/2026 como exceção à Q14: cada push no `main` passa pelo build e pelos testes e publica em
<https://governadados.web.app> ([D04](docs/decisoes.md#d04--identidade-e-audiência-da-publicação)).
Toda mudança é validada localmente antes do push, conforme o [plano](PLANO.md).


## Retomar em uma nova sessão

Abra a sessão com `/home/doug/Projetos/gdados` como diretório de trabalho. O agente deverá ler
`AGENTS.md` e os documentos apontados ali, além da especificação da página de conceitos.
O histórico desta conversa não é necessário para compreender o escopo documentado.

**Estado em 18/11/2026, ao fim da sessão:**

- a pasta é um repositório Git com remoto público `alencardoug/gdados` (D04). Commits em Conventional
  Commits, em português, um assunto por commit;
- o pacote da origem está fixado na `v2.2.0` (`f5a5173`, desde 18/11/2026), copiado e versionado em `origem/` por
  `scripts/copiar_pacote.sh`, com os textos lidos por commit em `origem/arquivos/` (inclusive o
  Glossário Técnico); `scripts/copiar_pacote.sh --verificar` confere os SHA-256 (D03);
- o portal está em `portal/` (Astro 7; dependências na D01). A build valida a cópia e o pacote e
  gera 475 páginas: governança (catálogo, relação com chaves, perguntas, métricas, linhagem com
  travessias, estado e evidência), estrutura e ambientes (com o diagrama entidade-relacionamento),
  conceitos e artefatos, arquivos da origem e procedência. São 35 testes de unidade em `portal/test/`;
- a camada editorial está em `portal/src/conteudo/` (formato na
  [página de conceitos §9](docs/pagina_de_conceitos.md#9-formato-da-camada-editorial-17112026)):
  62 termos com a primeira redação das explicações, 4 percursos e 10 limitações conhecidas. Três
  divergências do Glossário Técnico da origem foram encaminhadas no
  [alinhamento, §7](docs/alinhamento_entre_projetos.md#7-para-a-origem);
- a E3 foi feita com a verificação em `verificacao/`: 38 verificações automáticas passaram, com uma
  ressalva (zoom no grafo inteiro) e um achado para a D04 (identificadores GCP nos textos da origem),
  no [relatório](docs/relatorio_e3.md);
- a E4 começou: o Owner achou o site ótimo e fez dois pedidos, registrados no
  [plano](PLANO.md), E4: um **roteiro de aprendizado**, viável sem dependência nova
  ([página de conceitos §10](docs/pagina_de_conceitos.md#10-roteiro-de-aprendizado-pedido-de-17112026)),
  e **amostras de linhas** por tabela, que contrariam regras atuais e dependem de decisão
  ([D06](docs/decisoes.md#d06--amostras-de-registros-no-portal));
- em 18/11/2026 o Owner aprovou o conteúdo e o portal para a fase atual e definiu que o roteiro
  cresce **um degrau por vez**, conforme aprende. No mesmo dia, uma leitura do GCP e as opções de
  hospedagem gratuita foram registradas na
  [D04](docs/decisoes.md#d04--identidade-e-audiência-da-publicação). O Owner criou o projeto
  "Extras", sem faturamento, e o site vazio `governadados.web.app`; o deploy fica para a E5;
- em 18/11/2026 a origem publicou a `v2.2.0` (F32 a F34) e o gdados a refixou e validou
  ([Verificação §11](docs/verificacao_de_viabilidade.md#11-pacote-refixado-na-v220-18112026)); a
  verificação da E3 foi repetida ([relatório](docs/relatorio_e3.md), §7). A origem prepara outra tag,
  sem data, com a correção do F36 ([alinhamento, O9](docs/alinhamento_entre_projetos.md#3-dependências-do-mvp_eng_dados_2));
  quando for anunciada, refixar e revalidar pela D03 e repetir a verificação.

**Publicação (E5, 18/11/2026):** o portal sai em <https://governadados.web.app> a cada push no
`main`, pelo workflow `.github/workflows/deploy.yml`, depois do build e dos testes.

**Próximo passo:** o primeiro degrau do roteiro, que aguarda o "pode fazer" do Owner (página de
conceitos §10). Seguem pendentes do Owner a D06 (amostras) e a meta de zoom no grafo inteiro
(relatório da E3, §3). Para avaliar o portal localmente: `cd portal && npm run build && npm run preview`. Para
repetir a verificação: [`verificacao/README.md`](verificacao/README.md).

Os caches e temporários de npm, `uv` e Playwright ficam em `.cache/` (variáveis em
`provas/README.md`). Na origem, só leitura de arquivos e `git show`/`git log`.

O Owner fechou a E0 em 14/11/2026, pela resposta central registrada em
[Decisões](docs/decisoes.md). Estão autorizadas as provas locais da D01 e da D02, a E1 reescrita
e a E2. Em 17/11/2026 o Owner fixou o pacote na `v2.1.0` (`eb11709`) e mandou o portal ler
`on_zero_denominator`; desde então as provas e as etapas trabalham contra o pacote real, e não
contra o exemplo. A D04 volta ao Owner na E5, à luz da decisão de não criar recursos novos no GCP.
As pendências entre projetos estão no [alinhamento](docs/alinhamento_entre_projetos.md).

A sequência replanejada em 17/11/2026 e os critérios de aceite estão no plano, §5.
