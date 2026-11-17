---
resumo: >-
  No esquema estrela, uma tabela fato fica no centro, ligada diretamente a várias dimensões. É a
  forma clássica de organizar dados para análise.
exemplos:
  - tipo: pergunta
    ref: P01
    nota: uma fato e três dimensões
  - tipo: pagina
    ref: "governanca/linhagem/?modo=relacao&r=consumption.monthly_revenue_by_channel_and_category"
    nota: a fato e as dimensões que a view usa
fontes:
  - titulo: "Ralph Kimball e Margy Ross, The Data Warehouse Toolkit, 3ª ed. (Wiley, 2013): esquema estrela"
revisado_em: "2026-11-17"
---

## Qual problema resolve

Consultas analíticas juntam muitas tabelas. Com a fato no centro e as dimensões a um passo dela,
qualquer pergunta precisa de poucas junções, sempre da mesma forma.

## Como funciona

As dimensões não são normalizadas: os níveis de uma hierarquia ficam na própria dimensão, em vez de
tabelas encadeadas. O esquema otimiza a leitura, não a escrita.

## O que não confundir

Esquema estrela e banco transacional resolvem problemas diferentes; ver
[normalização](../normalizacao/).
