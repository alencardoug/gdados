---
resumo: >-
  Uma dimensão descreve o contexto de um acontecimento: quem, o quê, onde, quando, por qual canal. As
  análises agrupam e filtram as fatos pelos atributos das dimensões.
exemplos:
  - tipo: relacao
    ref: analytics.dim_customer
    nota: uma dimensão com histórico (SCD tipo 2)
  - tipo: relacao
    ref: analytics.dim_geography
    nota: uma dimensão conformada
  - tipo: coluna
    ref: analytics.fact_sales_order_item.order_number
    nota: uma dimensão degenerada, guardada na própria fato
fontes:
  - titulo: "Ralph Kimball e Margy Ross, The Data Warehouse Toolkit, 3ª ed. (Wiley, 2013): dimensões, dimensões conformadas e degeneradas"
revisado_em: "2026-11-17"
---

## Qual problema resolve

Guardar o contexto separado dos acontecimentos evita repetir o nome do cliente em cada venda e
permite que vários processos usem a mesma descrição de cliente, produto ou data.

## Como funciona

- **Dimensão conformada:** a mesma dimensão, com o mesmo significado, usada por várias fatos, o que
  permite comparar processos diferentes.
- **Dimensão degenerada:** um identificador operacional, como o número do pedido, guardado na fato
  sem uma dimensão própria.
- **Membro desconhecido:** uma linha especial para quando a fato não encontra par, em vez de deixar a
  chave nula (Modelo de Dados, §3.2).

## Como aparece neste projeto

As dimensões ficam em `analytics` com o nome começando por `dim_`. Cada fato referencia a versão da
dimensão vigente no instante do evento, não a versão atual, e nenhuma dimensão perde um membro quando
ele é excluído na origem: ele fica marcado como excluído (Modelo de Dados, §3.2).
