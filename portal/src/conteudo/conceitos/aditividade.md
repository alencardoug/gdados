---
resumo: >-
  A aditividade diz ao longo de quais dimensões uma medida pode ser somada sem perder o sentido.
  Uma medida é aditiva, semiaditiva ou não aditiva.
exemplos:
  - tipo: pergunta
    ref: P01
    nota: a contagem de pedidos é não aditiva entre categorias, porque um pedido com itens de duas categorias conta nas duas
  - tipo: coluna
    ref: consumption.inventory_turnover_by_sku_and_warehouse.avg_quantity_on_hand
    nota: semiaditiva; a montagem da view diz ao longo do que ela soma
  - tipo: metrica
    ref: average_order_value
    nota: uma razão, não aditiva
didaticos:
  - titulo: Saldo de estoque
    texto: >-
      Um armazém tem 10 unidades no fim de janeiro e 12 no fim de fevereiro. Somar os dois armazéns
      num mesmo mês faz sentido; somar janeiro e fevereiro dá 22 unidades, que nunca existiram ao
      mesmo tempo. O saldo é semiaditivo: soma entre armazéns, não ao longo do tempo.
fontes:
  - titulo: "Ralph Kimball e Margy Ross, The Data Warehouse Toolkit, 3ª ed. (Wiley, 2013): fatos aditivos, semiaditivos e não aditivos"
revisado_em: "2026-11-17"
---

## Qual problema resolve

Somar é a agregação padrão da maioria das ferramentas de análise. Somar o saldo de estoque de
vários meses, ou as taxas de várias transportadoras, produz números que parecem certos e não
significam nada.

## Como funciona

- **Aditiva:** pode ser somada em qualquer dimensão. A receita líquida de vários dias, canais ou
  categorias soma.
- **Semiaditiva:** soma em algumas dimensões e não em outras, quase sempre não no tempo. Saldos e
  médias de estoque são o caso típico.
- **Não aditiva:** não se soma. Razões, taxas e médias são recalculadas a partir das partes: soma-se
  o numerador, soma-se o denominador e divide-se de novo.

## O que não confundir

A aditividade não é uma propriedade fixa da coluna: depende do grão em que ela é lida. A mesma
contagem pode ser aditiva na fato e não aditiva numa view, se o grão da view faz uma linha da fato
aparecer em mais de um grupo.

## Como aparece neste projeto

O pacote registra a aditividade declarada de cada medida e, separadamente, a de cada coluna das
views que a publicam, que o grão da view pode mudar. As duas aparecem na página de métricas e na
página de cada pergunta. O Modelo de Dados, §3.1, explica a classificação como a que impede somar
saldo de estoque ao longo do tempo.
