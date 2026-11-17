---
resumo: >-
  Uma relação pode depender de outra sem tirar dela o valor de nenhuma coluna: para juntar linhas,
  para escolher quais entram ou para decidir um caso. A linhagem por coluna mostra de onde vem o
  valor; essas outras dependências podem não aparecer nela.
exemplos:
  - tipo: coluna
    ref: analytics.fact_sales_order_item.net_revenue_amount
    nota: as origens são colunas dos itens do pedido; o estado do pedido não aparece entre elas
  - tipo: coluna
    ref: analytics.fact_sales_order_item.is_realised
    nota: a marca de pedido realizado, cuja origem é o estado do pedido
  - tipo: filtro
    ref: realised_order
    nota: o filtro que usa essa marca para definir quem entra na receita
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Quem lê a linhagem tende a concluir que, se uma coluna de origem não aparece, ela não afeta o
resultado. Não é assim: uma mudança no estado do pedido muda quais pedidos entram na receita, mesmo
sem ser a origem do valor somado.

## Como funciona

A linhagem por coluna da origem segue o que **vira valor** na coluna. A Política de Governança, §5.1,
descreve a mesma leitura ao derivar a sensibilidade: "o que decide o ramo de um `case` não entra, só o
que vira valor". Chaves de junção, condições de filtro e condições de `case` ficam de fora.

No exemplo real: a receita líquida da fato de itens tem origem no preço, na quantidade e no desconto
dos itens. A população, "só pedido realizado", vem do filtro `realised_order`, que usa a coluna
`is_realised`, e esta tem origem no estado do pedido. As duas linhagens são verdadeiras e respondem
a perguntas diferentes.

## O que não confundir

- **Origem do valor** responde "de onde vem este número".
- **Dependência** responde "o que pode mudar este resultado". Ela inclui a origem do valor e também
  as junções, os filtros e as condições.

## Como aparece neste projeto

O portal mostra só a origem do valor, como o pacote a declara, e não acrescenta as dependências por
conta própria. Para ver a população de uma medida, use os filtros na página de
[métricas](../medida-e-metrica/) e a [população de um indicador](../populacao/).
