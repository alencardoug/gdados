# gdados — Portal de engenharia e governança de dados

Interface navegável para compreender o projeto de dados `mvp_eng_dados_2`, continuação do
`mvp_eng_dados_1`, das origens às views de consumo,
e comparar sua estrutura de dados e sua infraestrutura local e GCP. A compreensão conceitual e
teórica tem o mesmo peso da exploração técnica: o portal deverá explicar o que o usuário encontra,
por que existe e como aparece na governança já implementada.

**Estado:** base documental criada em 10/11/2026. Viabilidade verificada sobre artefatos locais
e reconferida em 13 e 14/11/2026. E0 fechada pelo Owner em 14/11/2026; E1 e E2 autorizadas. Em
17/11/2026 o pacote de metadados da origem foi fixado na `v2.1.0` e validado contra o esquema do
mesmo commit. A implementação da interface ainda não começou.

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
| [Alinhamento entre projetos](docs/alinhamento_entre_projetos.md) | Índice das pendências que envolvem a origem, o BI e o Owner |

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

Não há aplicação, dependências ou comando de execução definidos nesta etapa. As configurações
básicas de edição e de exclusão do Git não representam aprovação de stack.

O destino indicado em 10/11/2026 foi **GitHub → Firebase Hosting**, seguindo o padrão do Linkedia.
Em 14/11/2026 o Owner proibiu recursos novos no GCP, e um projeto Firebase é um deles; a hospedagem
volta ao Owner na E5 ([D04](docs/decisoes.md#d04--identidade-e-audiência-da-publicação)). A primeira
entrega deverá ser validada e avaliada localmente, conforme o [plano](PLANO.md).


## Retomar em uma nova sessão

Abra a sessão com `/home/doug/Projetos/gdados` como diretório de trabalho. O agente deverá ler
`AGENTS.md` e os documentos apontados ali, além da especificação da página de conceitos.
O histórico desta conversa não é necessário para compreender o escopo documentado.

O contexto está preparado; ainda não existem aplicação, dependências instaladas, comando de cópia
do pacote ou validação da interface. São entregas a construir, não pré-requisitos já atendidos.
A validação do pacote de 17/11/2026 foi avulsa, e sua cópia em `.cache/` não é versionada nem
substitui o comando da E1. A primeira execução deverá conferir novamente a disponibilidade e a
versão dos insumos locais.

O Owner fechou a E0 em 14/11/2026, pela resposta central registrada em
[Decisões](docs/decisoes.md). Estão autorizadas as provas locais da D01 e da D02, a E1 reescrita
e a E2. Em 17/11/2026 o Owner fixou o pacote na `v2.1.0` (`eb11709`) e mandou o portal ler
`on_zero_denominator`; desde então as provas e as etapas trabalham contra o pacote real, e não
contra o exemplo. A D04 volta ao Owner na E5, à luz da decisão de não criar recursos novos no GCP.
As pendências entre projetos estão no [alinhamento](docs/alinhamento_entre_projetos.md).

A sequência replanejada em 17/11/2026 e os critérios de aceite estão no plano, §5.
