# Página de conceitos e artefatos

| Campo | Informação |
|---|---|
| Estado | Formato da camada editorial e inventário definidos e implementados em 17/11/2026 (§9); primeira redação das explicações feita no mesmo dia, a revisar pelo Owner na E4 |
| Pedido do Owner | Tornar compreensível a governança existente, dando à parte conceitual e teórica o mesmo peso da técnica |
| Escopo deste arquivo | Objetivos de aprendizagem, organização da página e critérios editoriais |

Este documento especifica a terceira página do portal. Não é o glossário final nem redefine as
políticas do projeto de dados. O escopo e a sequência de entrega vivem no [plano](../PLANO.md).

## 1. Objetivo

Dar ao usuário condições de interpretar o catálogo, os diagramas, a linhagem e os ambientes.
A navegação prática deve responder também ao significado, à finalidade e às consequências do
que está sendo mostrado.

A primeira explicação deve ser acessível a quem conhece o contexto do negócio, mas ainda não
domina engenharia de dados. O aprofundamento deve permitir consultar a base conceitual, as escolhas
reais do projeto e suas limitações, sem simplificações que mudem o significado técnico.

## 2. Acesso e navegação

- Entrada própria **Conceitos e artefatos** na navegação principal.
- Busca por expressão em português, nome técnico em inglês, sigla e sinônimo pertinente.
- Índice por assunto e consulta alfabética; os percursos orientados são uma opção adicional.
- Ligações contextuais a partir de colunas, relações, controles e componentes dos diagramas.
- Links permanentes para cada explicação e indicação de conceitos prévios para aprofundamento.
- Retorno ao mesmo objeto, filtro e recorte depois de consultar uma explicação.
- Acesso em texto e por teclado; o conteúdo não pode depender de tooltip, hover ou diagrama.

Uma explicação contextual curta poderá abrir perto do objeto; o texto completo terá endereço
próprio dentro da página. Consultar uma definição não deve obrigar o usuário a reiniciar sua análise.

## 3. Estrutura editorial de uma explicação

Cada entrada deverá reunir, quando aplicável:

1. **O que é:** apresentação breve e precisa em linguagem simples.
2. **Qual problema resolve:** propósito e consequência prática de sua ausência ou uso incorreto.
3. **Como funciona:** fundamentos e relações com outros conceitos; detalhamento teórico progressivo.
4. **O que não confundir:** diferenças relevantes, com exemplo de interpretação equivocada.
5. **Como aparece neste projeto:** objeto, arquivo, regra ou componente real e sua função.
6. **Explore na prática:** ligação para o catálogo, diagrama, métrica ou artefato relacionado.
7. **Escolha e limites do projeto:** decisões particulares e restrições conhecidas, quando existirem.
8. **Fontes e aprofundamento:** definição responsável, versão e referências primárias necessárias.

Usar os campos que ajudam a compreender o assunto, sem transformar toda entrada em formulário
repetitivo. Termos simples podem ter explicações curtas; conceitos centrais precisam de exemplos
e aprofundamento. A extensão deverá acompanhar a dificuldade real, sem uma meta artificial de palavras.

## 4. Inventário inicial de assuntos

A lista abaixo é um roteiro de cobertura editorial, não a declaração de que todos os textos já
existem ou de que todos os artefatos citados estão implementados. A existência e o estado de cada
item deverão ser conferidos no inventário da etapa E1.

| Grupo | Termos e questões a explicar | Fontes iniciais na origem |
|---|---|---|
| Governança e responsabilidades | Governança, gestão de dados, metadado, catálogo, dicionário, glossário, domínio, responsável e papéis de custódia | Política de governança, glossário técnico e Termo de Abertura |
| Classificação e controles | Sensibilidade, exposição, permissão, acesso por papel, retenção, auditoria e qualidade | Política de governança, ADRs pertinentes e qualidade de dados |
| Perspectivas de modelagem | Conceitual, lógico, físico, entidade, relacionamento, cardinalidade, chave, normalização e integridade | Modelo de dados, modelos SQLAlchemy e glossário técnico |
| Análise dimensional e métricas | Fato, dimensão, grão, medida, métrica, razão e denominador zero, aditividade, SCD e população de um indicador | Modelo de dados, perguntas de negócio e glossário de negócio |
| Fluxo e camadas | Origem, réplica, ingestão, transformação, batch, camadas raw/staging/trusted/analytics/consumption, quarentena, auditoria e histórico | Arquitetura, materialização e origem legada |
| Linhagem e procedência | Dependência por tabela, origem de valor por coluna, join/filtro, origem terminal, seed, valor gerado e travessia externa | Dicionário §3 e módulos de linhagem |
| Streaming | Evento, CDC, WAL, tópico, assinatura, tempo de evento, watermark, janela e idempotência | Streaming, contrato do evento e código do pipeline |
| Artefatos e execução | YAML, modelo SQL, source/ref do dbt, seed, snapshot, manifest, catalog, run_results, teste, contrato, migração, DAG e certificado de captura | Projeto dbt, modelos, migrações, orquestração e origem legada |
| Ambientes e infraestrutura | Banco, schema, dataset, tabela, view, contêiner, instância, serviço gerenciado, Terraform e paridade local/GCP | Arquitetura, Docker, Terraform e registro GCP |
| Evidência e decisões | Proposta, declaração, derivado, execução observada, teste, medição histórica, aceite, princípio, ADR e pendência | Convenções, princípios, ADRs, pendências e registros de execução |

Ferramentas também precisam de entradas: o problema que cada uma resolve, seu papel concreto e a
ligação com os artefatos que produz ou consome. Nomes de produtos não substituirão a explicação
de ingestão, transformação, orquestração, armazenamento ou controle de acesso.

## 5. Percursos explicativos propostos

### 5.1 Entender a governança que está sendo visualizada

Dados e metadados → catálogo, dicionário e glossário → responsáveis e políticas → classificação,
permissões e retenção → qualidade, auditoria e evidência.

**Prática prevista:** abrir um objeto real e localizar seu significado, classificação, responsável
e definição de acesso, distinguindo esses atributos. Mostrar ausências quando a fonte não as fornecer.

### 5.2 Acompanhar uma pergunta de negócio até as fontes

Pergunta → definição e população da métrica → grão → view → fatos e dimensões → transformações →
fontes e travessias de ingestão.

**Prática prevista:** usar a receita líquida para explorar o caminho real da P01. Apresentar o caso
de P13/D66, decidido na origem em 14/11/2026 (ADR-0053 de lá), como exemplo de por que nome,
linhagem e população não são suficientes isoladamente para interpretar uma métrica. O texto
didático exibe a decisão como a origem a registra, sem reinterpretá-la; os itens ainda em aberto vêm
de `open_items` do pacote.

### 5.3 Comparar as perspectivas e os ambientes

Conceito → modelo lógico → materialização física → infraestrutura → artefatos de código que
mantêm essas definições.

**Prática prevista:** acompanhar uma camada nos dois ambientes, identificando o que mantém o
significado e o que muda em sua implementação. Explicar separadamente namespace, banco e instância;
não presumir isolamento de armazenamento apenas pelo nome de um schema ou dataset.

### 5.4 Compreender um fluxo contínuo

Evento de negócio → captura de mudança → transporte → processamento por tempo de evento → destino →
reconciliação com o caminho batch.

**Prática prevista:** percorrer o estoque com as evidências disponíveis, respeitando diferenças
entre ligação por tabela e por coluna e entre configuração e execução medida.

Os percursos são sugestões de navegação. Não obrigar a conclusão de um curso antes de explorar
o catálogo e não criar exercícios que executem serviços, SQL ou infraestrutura.

## 6. Diagramas e exemplos

As ilustrações seguirão a diretriz do portal: esquemas definidos por código ou dados declarativos,
com legenda e equivalente textual. Diagramas curtos podem comparar conceitos antes de abrir o
grafo técnico completo.

Identificar dois tipos de exemplo:

- **Aplicação real:** vinculada a um objeto ou artefato existente e ao commit de referência.
- **Exemplo didático:** simplificação explicitamente rotulada, sem números ou relações apresentados
  como medição do projeto.

Ilustrações conceituais podem simplificar detalhes, mas não devem parecer prova da execução real.
Valores didáticos, se necessários, serão identificados como tais e não entrarão nos indicadores do portal.

## 7. Responsabilidade sobre o conteúdo

O projeto de dados continua dono das definições de negócio, regras de governança, modelos e decisões.
O portal é dono da organização pedagógica, da linguagem de apresentação e dos percursos de exploração.

- Reutilizar as definições disponíveis nos glossários técnico e de negócio, com origem e versão.
- Para termos sem explicação suficiente, registrar a lacuna e planejar complementação didática.
- Para teoria geral adicional, pesquisar e citar referências primárias adequadas durante a autoria;
  esta especificação não declara essa pesquisa nem a redação final como concluídas.
- Diferenciar teoria geral, decisão particular do projeto e evidência efetivamente observada.
- Não transformar uma prática particular em regra universal ou um controle declarado em garantia medida.
- Não deduzir que uma classificação concede ou nega acesso; manter a distinção da política responsável.
- Não atribuir ao glossário de origem um texto explicativo novo escrito no portal.
- Em caso de divergência entre fontes, apontar a divergência e seu responsável, sem escolher uma regra
  nova silenciosamente.

A redação e a revisão conceitual fazem parte da entrega. Uma extração automática de descrições não
substitui o trabalho editorial necessário para explicar os fundamentos.

## 8. Critérios de avaliação local

Além das verificações técnicas previstas no [plano](../PLANO.md), avaliar se a experiência permite:

- encontrar o significado dos termos usados pelas outras páginas sem conhecimento prévio de toda a stack;
- partir da explicação e localizar um exemplo real, e fazer o caminho inverso;
- comparar conceitos próximos sem tratá-los como sinônimos por conveniência;
- identificar o que é geral, o que é decisão do projeto e o que foi medido;
- reconhecer limitações e conteúdo pendente sem receber uma impressão de completude artificial;
- consultar e retomar o contexto da exploração em telas menores e com navegação por teclado.

Registrar as dúvidas surgidas na avaliação do Owner e corrigir as explicações correspondentes.
Testes automatizados podem conferir links e estrutura, mas não provar a compreensão do leitor.

## 9. Formato da camada editorial (17/11/2026)

A camada editorial fica no portal, em `portal/src/conteudo/`, como *content collections* do próprio
Astro (D01), sem dependência nova. O esquema de cada parte está em `portal/src/content.config.mjs`;
um arquivo fora do esquema recusa a build.

| Arquivo | O que é |
|---|---|
| `grupos.yml` | Os grupos da §4, na mesma ordem |
| `inventario.yml` | O inventário dos termos e artefatos que a interface expõe. Cada item tem um identificador estável (o endereço `/conceitos/<id>/`), o grupo, os termos de busca (português, identificador em inglês, sigla), os pré-requisitos e onde a origem define o termo |
| `conceitos/<id>.md` | A explicação do portal para um item do inventário: resumo ("o que é"), corpo nas seções da §3 que ajudam, exemplos reais, exemplos didáticos, divergências entre fontes da origem, referências gerais e data de revisão |
| `limitacoes.yml` | As limitações e lacunas que a interface exibe, com onde aparecem, o responsável e a situação |
| `percursos.yml` | Os percursos da §5: passos que apontam para termos do inventário e uma prática com objetos reais, conferida como os exemplos |

**Natureza de cada bloco (§6 e §7).** A página de um termo separa visualmente:

- a **definição da origem**, extraída literalmente do glossário da origem no commit fixado. Para isso,
  o inventário aponta o arquivo e o termo em negrito do verbete, e a página mostra o arquivo e o
  commit. O portal não reescreve esse texto;
- a **explicação do portal**, que é texto do gdados;
- a **aplicação real**, um identificador do pacote (relação, coluna, pergunta, métrica, filtro),
  um arquivo copiado da origem ou uma página do portal, conferido na build;
- o **exemplo didático**, rotulado como simplificação, sem números do projeto;
- a **divergência entre fontes da origem**, com as duas fontes e o encaminhamento, sem escolher uma.

**Identificadores do pacote no texto editorial.** Os exemplos citam identificadores do pacote, como
pede a §5.2. Para que um pacote novo não exija reescrever conteúdo (PLANO §6), um exemplo que não
exista mais aparece como "não encontrado no pacote fixado" e não derruba a build. A build gera
`dados/editorial.json` com os exemplos, as definições e as âncoras não encontrados, e o teste
`portal/test/definicoes.test.mjs` exige que a lista esteja vazia. Ao refixar o commit (D03), o
relatório indica o que revisar. As contagens do pacote não entram no texto editorial.

**Ida e volta.** Um link contextual para um termo leva o endereço de origem, com filtros e recorte,
e a página do termo oferece o retorno a ele (§2). Cada relação lista as explicações que a usam como
exemplo.

**Termo sem explicação.** O item do inventário sem `conceitos/<id>.md` tem página mesmo assim, com a
definição da origem, os documentos da origem e a marca "explicação do portal pendente". A situação de
cada termo aparece no índice da página de conceitos e em `dados/editorial.json`.

## 10. Roteiro de aprendizado (pedido de 17/11/2026)

**Pedido do Owner (E4.1):** "Para mim, que estou iniciando e vou precisar aprender e entender, começo
por onde?" Uma guia que mostre os conteúdos mais importantes de aprender, dos isolados aos que
dependem de outros e dos termos técnicos: um roteiro de aprendizado, além de disponibilizar o
conhecimento.

**Avaliação (17/11/2026):** viável, sem dependência nova e dentro das decisões D01 e D02. A
implementação **aguarda o Owner autorizar**.

**Direção do Owner (18/11/2026): um degrau por vez.** Em vez de montar o roteiro inteiro de uma
vez, o roteiro cresce com o aprendizado: o agente propõe e implementa um degrau, o Owner estuda e
indica o próximo. A proposta abaixo vira o alvo final, não a primeira entrega. Consequências:

- cada degrau é uma entrega pequena: objetivo, os termos daquele passo (com `prerequisitos`
  preenchidos só para eles), uma prática no catálogo e "a seguir" apontando para o degrau seguinte
  quando ele existir;
- a ordem registrada é a ordem em que o Owner avançou; o mapa e a lista do roteiro mostram só os
  degraus já feitos;
- o teste de pré-requisitos (sem ciclo, todo termo do roteiro alcançável) vale desde o primeiro
  degrau;
- cada degrau novo passa pelo "pode fazer" do Owner, que indica o assunto.

**Proposta (alvo final):**

- completar o campo `prerequisitos` do `inventario.yml` para os 62 termos (hoje poucos o têm). A
  ordem de leitura sai desse grafo, pela mesma lógica de camadas por caminho mais longo da linhagem
  (`portal/src/cliente/camadas.js`): termos sem pré-requisito formam o primeiro nível;
- uma página "Comece por aqui", com níveis (por exemplo: fundamentos, modelagem, fluxo e camadas,
  linhagem e procedência, ambientes, evidência), cada um com objetivo de aprendizagem, os termos e
  uma prática no catálogo. Os percursos da §5 viram trilhas dentro dele;
- um mapa do roteiro gerado dos dados, com alternativa em lista (regra dos diagramas);
- em cada termo, "leia antes" e "a seguir";
- marcação de "já li" guardada só no navegador de quem lê, sem conta nem servidor, como
  conveniência que pode se perder.

**Condições:**

- a ordem é decisão editorial do gdados, não da origem, e passa pela revisão do Owner (E4.3);
- o roteiro é sugestão: não bloqueia a exploração nem exige concluir etapas (§5);
- teste novo para o grafo de pré-requisitos (sem ciclo, todo termo alcançável) e verificação da
  página na repetição da E3.

