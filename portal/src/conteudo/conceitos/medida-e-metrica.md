---
resumo: >-
  Neste projeto, uma medida é um agregado sobre uma única fonte, como a soma da receita líquida.
  Uma métrica é uma conta feita sobre medidas: uma razão ou uma diferença.
exemplos:
  - tipo: metrica
    ref: net_revenue_amount
    nota: medida, com fonte, data do período e filtro
  - tipo: metrica
    ref: average_order_value
    nota: razão entre duas medidas
  - tipo: metrica
    ref: gross_profit_amount
    nota: diferença entre duas medidas
  - tipo: filtro
    ref: realised_order
    nota: a população que a medida conta
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Uma métrica sem regra escrita é calculada de um jeito diferente por cada pessoa. Declarar uma vez a
fonte, o período, a população, a fórmula e o arredondamento faz todas as views que publicam a
métrica usarem a mesma conta.

## Como funciona

A medida diz de qual tabela fato lê, que data define o período, quais junções usa, que agregado
aplica, como soma ou média, e quais filtros definem a população. A métrica não
lê tabela: combina os nomes de outras medidas, dividindo (razão) ou subtraindo (diferença), com
escala e arredondamento próprios.

## O que não confundir

- **O uso das palavras varia** entre ferramentas e autores; muitos chamam tudo de métrica. Este
  portal segue a separação do pacote da origem.
- **A expressão é a declaração**, em SQL sobre os apelidos da fonte. Ela não é o SQL compilado da
  view. A conferência de que a view bate com a declaração é feita na origem, por teste.

## Como aparece neste projeto

A regra operacional de cada medida e métrica vive num único catálogo da origem,
`glossario_de_negocio/metricas.yml` (ADR-0055 da origem). Um montador gera dele o SQL das views, e
um teste compara o resultado com a view auditada. O pacote traz essas regras na seção `metrics`, e
os filtros, em `filters`.
