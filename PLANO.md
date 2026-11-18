# Plano de implementação — portal gdados

| Campo | Valor |
|---|---|
| Estado | E0 fechada em 14/11/2026; pacote fixado na `v2.1.0` da origem em 17/11/2026; E1 e E2 autorizadas; aplicação iniciada em `portal/` e E3 feita em 17/11/2026 ([relatório](docs/relatorio_e3.md)); E4 com o Owner; publicação pendente (D04) |
| Data | 10/11/2026; E0, E1 e E5 revistas em 14/11/2026; sequência, E1, E2 e E3 replanejadas em 17/11/2026 |
| Base da proposta | [Verificação de viabilidade](docs/verificacao_de_viabilidade.md) |
| Decisões | [Registro de decisões](docs/decisoes.md) |

## 1. Objetivo e fronteira

Permitir que o usuário parta de uma pergunta de negócio ou de um objeto de dados e compreenda o
caminho até suas origens, as transformações, os contratos e as limitações; em outra página,
compreender a organização do projeto e comparar os ambientes local e GCP. Uma terceira página,
**Conceitos e artefatos**, deverá explicar os fundamentos necessários para aproveitar essa navegação,
com a mesma importância da parte técnica.

O gdados e a etapa 2.7 do `bi-como-codigo` são dois portais que leem o mesmo pacote de metadados
da origem, cada um com o próprio escopo ([D05](docs/decisoes.md#d05--relação-com-o-portal-da-etapa-27-do-bi-como-codigo)).

O portal será uma camada de leitura e explicação. Não editará dados, executará SQL, operará pipelines
ou administrará infraestrutura. Esta entrega não inclui reparar regras de negócio do projeto de dados.
Seu propósito é tornar a governança existente visível e compreensível. A ampliação do conteúdo
didático não autoriza alterar a engenharia da origem.

## 2. Página de governança — da fonte às views

### 2.1 Catálogo e contexto de negócio

- Busca por pergunta, conceito, domínio, relação ou coluna.
- Filtros por camada, origem, domínio e sensibilidade.
- Detalhes: descrição, tipo, chaves quando declaradas, responsável, retenção e contrato.
- Ligação entre pergunta de negócio, view, medidas, fatos e dimensões.
- Acesso ao SQL e à declaração responsável, identificados pelo commit da origem.
- Indicação explícita de descrição ausente e de informação não disponível.

### 2.2 Exploração de linhagem

- Visão por relação e detalhamento por coluna.
- Expansão progressiva dos insumos e dos consumidores; destaque do caminho selecionado.
- Busca, zoom, deslocamento e ajuste do diagrama à área visível.
- Agrupamento por camada e distinção entre origem principal, legado, seed e valor gerado.
- Travessias externas ao dbt conectadas ao grafo sem inventar precisão por coluna.
- Identificação da origem da evidência: declaração, SQL compilado ou captura nativa do GCP.
- Explicação do que a aresta significa: origem de valor e dependência de filtro/junção não são
  automaticamente a mesma relação.
- Alternativa em tabela/lista para percorrer as mesmas relações.

A abertura inicial deve apresentar um recorte legível. Não carregar visualmente todas as colunas
como um diagrama único sem orientação.

## 3. Página de estrutura do projeto e ambientes

| Perspectiva | Conteúdo |
|---|---|
| Negócio/conceitual | Domínios, processos, conceitos, métricas e perguntas |
| Lógica | Entidades, relacionamentos, chaves, grãos e regras |
| Física | Tabelas, views, tipos, constraints, materializações, schemas/datasets e estratégias de armazenamento |
| Infraestrutura local | Bancos e serviços declarados, contêineres e relações entre componentes |
| Infraestrutura GCP | Recursos declarados em Terraform e evidências datadas da execução |
| Código | Árvore explicada do repositório e localização das definições responsáveis |

### 3.1 Comparação local ↔ GCP

- Reutilizar o mapa de paridade, conferindo sua coerência com as definições atuais.
- Explicar a diferença entre função lógica, objeto do motor e recurso de infraestrutura.
- Distinguir configuração declarada e recurso efetivamente observado em uma data. O ambiente GCP
  foi desmontado em 13/11/2026; seu lado da comparação usa declaração e evidência histórica
  ([Verificação §7.4](docs/verificacao_de_viabilidade.md#74-o-ambiente-gcp-foi-desmontado)).
- Mostrar batch e streaming, suas convergências e seus componentes de controle.
- Manter quarentena, auditoria e histórico com seus papéis próprios; não forçar tudo em uma
  sequência linear artificial.

### 3.2 Diagramas por código

- Fluxos de arquitetura e ingestão, diagramas entidade-relacionamento e esquemas de materialização.
- Convenção visual consistente entre páginas, com legenda e identificação das fontes.
- Modelos declarativos versionados; relações derivadas dos metadados sempre que disponíveis.
- Exportação de representações declarativas e, onde suportado, vetoriais.
- Sem dependência de imagens estáticas para explicar ou atualizar a estrutura.

A escolha das bibliotecas permanece na decisão D02.

## 4. Página de conceitos e artefatos

A especificação editorial e funcional vive em
[docs/pagina_de_conceitos.md](docs/pagina_de_conceitos.md). Essa página terá entrada própria na
navegação e será acessível por links contextuais no catálogo, nos diagramas e na comparação de
ambientes. Seus percursos partem dos fundamentos e chegam aos objetos reais do projeto.

O conteúdo combina explicação conceitual, aprofundamento teórico quando necessário e aplicação
prática, com fontes e limites identificados. Não será apenas uma lista alfabética de siglas.

## 5. Etapas propostas

### Sequência a partir de 17/11/2026

Em 17/11/2026 o pacote real foi fixado na `v2.1.0` da origem e validado contra o esquema do mesmo
commit ([D03](docs/decisoes.md#d03--pacote-e-atualização-de-metadados);
[Verificação §10](docs/verificacao_de_viabilidade.md#10-pacote-fixado-na-v210-17112026)). No mesmo
dia, a origem aceitou os itens do gdados, abriu uma fase curta de correções que terminará numa tag
nova, sem data, e liberou a E1 à E3 contra a `v2.1.0` sem espera
([alinhamento, O8](docs/alinhamento_entre_projetos.md#3-dependências-do-mvp_eng_dados_2)). O portal
trabalha com o pacote como está; um pacote novo só entra pela troca do commit fixado na D03, com
nova validação, e o código não fixa contagens nem identificadores do pacote atual. Campos que a
tag nova trará, como as chaves de `analytics` (F34), aparecem como "não declarados na `v2.1.0`" até lá.

1. **Provas da D01 e da D02.** **Feitas** em 17/11/2026; o Owner adotou Astro e Mermaid com
   Cytoscape.js no mesmo dia ([D01](docs/decisoes.md#d01--estrutura-da-aplicação),
   [D02](docs/decisoes.md#d02--diagramas-e-grafos)).
2. **E1 sem dependência de stack.** **Feitos** em 17/11/2026: comando de cópia (D03),
   [mapeamento](docs/mapeamento_do_pacote.md), formato da camada editorial, inventário de termos e
   limitações ([página de conceitos §9](docs/pagina_de_conceitos.md#9-formato-da-camada-editorial-17112026))
   os percursos da §5 e a primeira redação das explicações de todos os termos do inventário
   (17/11/2026). **A fazer:** a revisão conceitual das explicações pelo Owner, na E4, com as dúvidas
   registradas e corrigidas (página de conceitos §8); a situação de cada termo está em
   `dados/editorial.json` da build.
3. **Início da E2 com a E1 na stack.** **Feito** em 17/11/2026, em `portal/` (Astro 7, com
   `package.json` próprio, lendo `origem/` no build): conferência dos SHA-256 da cópia e validação
   do pacote contra o esquema do mesmo commit, recusando `format` diferente de 1 (D03); tratamento
   de ausência e estado (D03); Markdown saneado para os textos do pacote e de `origem/arquivos/`;
   as três condições da D02, com o layout em camadas por caminho mais longo, sem extensão
   ([D02](docs/decisoes.md#d02--diagramas-e-grafos)). As dependências estão na
   [D01](docs/decisoes.md#d01--estrutura-da-aplicação). A parte editorial da E1 está no passo 2.
4. **E2 e E3** sobre o pacote fixado. Na E2, feitos em 17/11/2026: as travessias ligadas ao grafo de
   linhagem e os diagramas Mermaid dos documentos da origem ([D02](docs/decisoes.md#d02--diagramas-e-grafos)).
   Todas as verificações da E3 medem fidelidade ao pacote fixado. A E3 inclui um teste que preserva
   `_` nos identificadores (achado da prova da D02), já em `portal/test/markdown.test.mjs`.
   **E3 feita** em 17/11/2026 sobre o gdados `9f33546`: 38 verificações automáticas passaram, com a
   ressalva do zoom no grafo inteiro e o achado dos identificadores GCP para a D04
   ([relatório](docs/relatorio_e3.md); verificação em `verificacao/`).
5. **Na tag nova da origem**, quando anunciada: refixar e revalidar pela D03, sem esperar por ela
   nas etapas anteriores. As mudanças previstas são aditivas no formato 1.
6. **E4**, avaliação pelo Owner; **E5** só depois dela, com a D04 decidida à luz da Q14.

### E0 — Avaliar e fechar as decisões

**Fechada em 14/11/2026**, conforme a resposta central do Owner. As condições eram a E1 reescrita e
a D05 respondida. D01 e D02 serão decididas por prova local; D03 e D05 estão decididas; a D04 fica
para a E5. Não há adoção implícita de uma ferramenta porque ela aparece como candidata neste plano.

### E1 — Consumir o contrato de metadados da origem

O contrato dos metadados é o **formato 1 do pacote da origem**, lido no commit fixado na
[D03](docs/decisoes.md#d03--pacote-e-atualização-de-metadados). O gdados não define esse contrato,
não gera pacote e não reimplementa a inferência da linhagem. Desde 17/11/2026 a E1 trabalha contra
o pacote real; o exemplo fica para testes do mecanismo.

Entregas de consumo:

- comando local explícito que copia da origem, no commit fixado, o pacote e o esquema,
  registrando ao lado o commit e o SHA-256 de cada um;
- validação do arquivo copiado com o esquema do mesmo commit e recusa de `format` diferente de 1.
  A validação avulsa de 17/11/2026 não substitui esse comando;
- mapeamento dos campos do formato para as três páginas, incluindo os acrescentados depois de
  14/11/2026: `grain`, `grants_select`, `metrics`, `filters`, `view_rules`, `checks`,
  `open_items`, o `meta` de domínio das colunas e a procedência do armazém. Nas razões, ler
  `on_zero_denominator`, nunca o `zero_denominator`, que sai no próximo formato. Identificar
  também o que o portal lê por commit fora do pacote: os artefatos de `environments`, os textos de
  documentos, ADRs e glossário e as decisões já tomadas, como a D66;
- tratamento de ausência e de estado conforme a D03: ausente, sem resultado, não verificado,
  data e commit visíveis;
- leitura das coleções do pacote com tamanho e identificadores variáveis, sem fixar contagens ou IDs
  do pacote atual no código ou na camada editorial;
- registro do que faltar no formato para alguma página, encaminhado pelo
  [arquivo de alinhamento](docs/alinhamento_entre_projetos.md). O campo novo é acrescentado pela
  origem; o gdados não completa o pacote.

Entregas da camada editorial, que é do gdados:

- formato do conteúdo da [página de conceitos](docs/pagina_de_conceitos.md): explicações,
  percursos e ligações com objetos, diagramas e documentos;
- identificadores estáveis das entradas editoriais, ligados aos identificadores do pacote
  (relação, coluna, pergunta e teste);
- distinção explícita entre definição de origem, explicação editorial e exemplo ilustrativo;
- inventário dos termos e artefatos expostos pela interface, com ligação às fontes responsáveis
  e indicação de explicação existente, complementação didática necessária ou conteúdo pendente;
- inventário das lacunas e limitações conhecidas que a interface exibirá.

**Saída:** consumo validado contra o pacote do commit fixado e camada editorial definida,
utilizáveis em clone limpo do portal e sem conexão com bancos.

### E2 — Construir a interface local

Entregas: três páginas — governança, estrutura/ambientes e conceitos/artefatos —, busca e filtros,
painéis de detalhes, diagramas por código, exploração da linhagem, percursos explicativos e acesso
aos documentos responsáveis. Preservar o contexto ao abrir uma explicação e voltar ao objeto.
Tratar conteúdo dos artefatos como texto/dados,
sem executar HTML ou instruções inseridas nos metadados.

**Saída:** aplicação local usando o pacote do commit fixado. Sem deploy.

### E3 — Validar localmente

Verificações previstas:

1. Contrato de metadados, integridade de identificadores e ligações entre os artefatos.
2. Caminho real de uma métrica de receita até ambas as origens; nenhum salto fabricado.
3. Um caminho envolvendo estoque e as travessias do streaming, respeitando a granularidade disponível.
4. Uma coluna gerada e uma coluna de seed, reconhecidas como terminais válidos.
5. Exibição de um item em aberto de `open_items` do pacote fixado e de uma decisão já tomada, como
   a D66 (ADR-0053 da origem), sem reinterpretá-los.
6. Fidelidade de contagens, das regras das métricas (inclusive o denominador zero) e da comparação
   de infraestrutura ao pacote utilizado.
7. Busca, filtros, seleção, histórico de navegação e links diretos para objetos.
8. Legibilidade, navegação por teclado, alternativa tabular e adaptação a telas menores.
9. Desempenho com o grafo real, medido localmente contra as metas abaixo, sem apresentar
   estimativas como resultados.
10. Build reproduzível e revisão dos arquivos que seriam publicados, incluindo ausência de segredos
    e material privado fora do escopo.
11. Cobertura dos termos técnicos e artefatos expostos, incluindo busca por nomes em português,
    identificadores em inglês e siglas relevantes.
12. Ligações nos dois sentidos: do objeto para a explicação e dela para exemplos reais, mantendo
    o recorte selecionado ao voltar à exploração.
13. Fidelidade das explicações às definições e limitações da origem; diferenças entre conceito
    geral, escolha do projeto e evidência de execução explicitadas.
14. Percursos locais de leitura e exploração previstos na especificação da página de conceitos,
    com registro de lacunas editoriais, links quebrados e dúvidas levantadas pelo Owner.

**Metas de desempenho (propostas em 17/11/2026).** Servem às provas da D01 e da D02 e ao item 9.
São alvos, não medições; o Owner pode ajustá-los na E4. Medição em build de produção servida
localmente, no Chrome desta máquina, sem limitação de rede ou CPU, e repetida com CPU 4× mais lenta
para registrar a margem.

| Medida | Meta |
|---|---|
| Build completa a partir da cópia do pacote | até 60 s |
| Página de governança: primeira renderização com conteúdo | até 1,5 s |
| Dados transferidos ao abrir uma página, comprimidos | até 1 MB, sem carregar o pacote inteiro |
| Busca: resultados após digitar | até 150 ms |
| Linhagem por relação: recorte inicial (relação e vizinhos imediatos) desenhado | até 1 s |
| Linhagem: expandir um nível | até 500 ms |
| Grafo de relações inteiro (todas as relações do `lineage`) desenhado com layout | até 3 s |
| Linhagem por coluna: maior recorte exibido de uma vez | até 300 nós; acima disso, a interface pede filtro ou expansão |
| Zoom e deslocamento no maior recorte permitido | sem quadro acima de 50 ms no perfil do navegador |

Os itens que medem fidelidade (2 a 6, 9 e 13) medem fidelidade ao pacote do commit fixado, não ao
estado atual do banco nem do GCP. Contra o exemplo, valeriam só como ensaio do mecanismo.

**Saída:** relatório das verificações com resultados, limites e versão exata avaliada:
[docs/relatorio_e3.md](docs/relatorio_e3.md), de 17/11/2026.

### E4 — Avaliação local pelo Owner

Entregas: aplicação local navegável, conteúdo explicativo e relatório de E3. A avaliação deve
considerar a precisão técnica e a clareza conceitual; registrar os ajustes e o aceite da versão.
Aceitar o plano ou aprovar o build tecnicamente não equivale a autorizar a publicação.

**Em andamento desde 17/11/2026.** Primeira impressão do Owner: "o site está ótimo, muito conteúdo,
como esperado". Como está começando na área, pediu um caminho para aprender, além do conteúdo
disponível. Pedidos e pendências da avaliação:

| # | Pedido ou pendência | Situação | Dono |
|---|---|---|---|
| E4.1 | Roteiro de aprendizado: por onde começar, do conteúdo isolado ao que depende de outros e dos termos técnicos | Avaliado como viável sem dependência nova; em 18/11/2026 o Owner definiu construir **um degrau por vez**, conforme aprende; **o primeiro degrau aguarda o "pode fazer"** | [Página de conceitos §10](docs/pagina_de_conceitos.md#10-roteiro-de-aprendizado-pedido-de-17112026) |
| E4.2 | As cinco primeiras linhas de cada tabela, com todas as colunas | Tecnicamente viável, mas contraria o AGENTS.md (amostras), a decisão de o portal não ler banco e o formato do pacote; **aguarda decisão do Owner** | [D06](docs/decisoes.md#d06--amostras-de-registros-no-portal) |
| E4.3 | Revisão conceitual das explicações e dos percursos | A fazer pelo Owner; dúvidas registradas aqui e corrigidas | [Página de conceitos §8](docs/pagina_de_conceitos.md#8-critérios-de-avaliação-local) |
| E4.4 | Meta de zoom no grafo inteiro, cumprida na mediana e não em toda rodada | Aceitar ou ajustar a meta | [Relatório da E3](docs/relatorio_e3.md), §3; [D02](docs/decisoes.md#d02--diagramas-e-grafos) |
| E4.5 | Identificadores de projetos GCP e prefixo de conta de faturamento nos textos copiados | Decidir antes de publicar | [D04](docs/decisoes.md#d04--identidade-e-audiência-da-publicação); relatório da E3, §5 |

### E5 — Preparar a publicação

Depois da avaliação local, preparar workflow com validação, testes e build antes do deploy,
autenticação por federação de identidade e publicação somente do artefato correspondente ao commit
validado. Usar o Linkedia como referência de processo, sem copiar sua identidade ou configuração
específica de acesso.

A publicação depende de decisão do Owner sobre hospedagem, repositório, site e audiência (D04), e de
autorização para a etapa. A Q14 proíbe recursos novos no GCP, e um projeto Firebase é um deles; a
D04 registra esse conflito para a E5. Não há provisionamento ou deploy autorizado por este plano.

## 6. Critérios de aceite funcional

- Uma pergunta de negócio abre sua view e permite percorrer transformações até a origem.
- Um objeto mostra o significado, a definição responsável e suas lacunas sem simular completude.
- O usuário distingue conceito, modelo lógico, implementação física, infraestrutura e código.
- A página de conceitos tem entrada própria e cobre os termos e artefatos necessários às outras
  páginas, sem pressupor conhecimento prévio de toda a stack.
- Cada explicação permite entender o propósito do termo e encontrar sua aplicação real no projeto,
  com os critérios editoriais definidos em `docs/pagina_de_conceitos.md`.
- A consulta a uma explicação permite voltar ao objeto e ao recorte em exploração.
- Explicações gerais, regras particulares do projeto e exemplos ilustrativos ficam identificados;
  conteúdo novo não altera definições ou decisões existentes.
- Os ambientes local e GCP têm diagramas comparáveis com evidências e datas identificáveis.
- A linhagem por coluna preserva a semântica do exportador, inclusive terminais gerados e seeds.
- Os diagramas são regeneráveis por código; o usuário consegue consultar também suas relações em texto.
- Nenhuma estatística de execução é apresentada como atual apenas por existir numa medição histórica.
- A atualização do pacote de metadados não exige reescrever conteúdo manualmente na interface.

## 7. Dependências e limites

As divergências e faltas observadas estão no parecer de viabilidade. A correção na origem, quando
necessária, será trabalho separado: os arquivos de origem não serão alterados pelo projeto gdados.
Esta proposta não estima prazo nem custo antes das decisões de stack e do ensaio com o grafo real.
