---
resumo: >-
  Uma tabela fato registra os acontecimentos de um processo de negócio, como uma venda, uma
  remessa ou um pagamento, com as medidas desse acontecimento e as chaves das dimensões que o descrevem.
exemplos:
  - tipo: relacao
    ref: analytics.fact_sales_order_item
    nota: uma linha por item de pedido
  - tipo: relacao
    ref: analytics.fact_shipment
  - tipo: pagina
    ref: "governanca/?camada=analytics#catalogo"
    nota: as fatos e as dimensões da camada analytics
divergencias:
  - texto: >-
      O Glossário Técnico diz que "todas as 9 fatos do projeto" são transacionais. O Modelo de
      Dados, §3.1, lista 11 tabelas fato, e o pacote também traz 11 relações `analytics.fact_*`.
      O arquivo do glossário não mudou desde o primeiro commit da origem.
    fontes:
      - "docs/glossario.md"
      - "docs/modelo_de_dados.md#31-tabelas-fato--11"
    encaminhamento: Encaminhado à origem pelo gdados em 17/11/2026; a origem decide qual texto corrigir.
fontes:
  - titulo: "Ralph Kimball e Margy Ross, The Data Warehouse Toolkit, 3ª ed. (Wiley, 2013): tabelas fato transacionais, de snapshot periódico e de snapshot acumulado"
revisado_em: "2026-11-17"
---

## Qual problema resolve

Separar os acontecimentos, que se medem, dos contextos que os descrevem, que são as dimensões, deixa
as perguntas analíticas simples de escrever. Basta somar ou contar as linhas da fato e agrupar pelos
atributos das dimensões.

## Como funciona

Cada linha da fato está num [grão](../grao/) declarado. Ela traz medidas numéricas e chaves que
apontam para as dimensões, como a data, o produto ou o canal. A literatura distingue fatos
transacionais (um evento por linha), de fotografia periódica (o estado em cada período) e de
fotografia acumulada (um processo que avança por etapas).

## Como aparece neste projeto

As fatos ficam na camada `analytics` e têm o nome começando por `fact_`. A origem decidiu não ter
fatos de fotografia: as métricas de estado ao longo do tempo, como o estoque médio, são derivadas
dos eventos (Modelo de Dados, §3).
