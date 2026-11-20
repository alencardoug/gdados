---
resumo: >-
  O grão diz o que uma linha de uma tabela representa: um pedido, um item de pedido, uma remessa,
  um dia. É a primeira coisa a saber antes de contar ou somar qualquer coisa nela.
exemplos:
  - tipo: relacao
    ref: analytics.fact_shipment
    nota: o grão é a remessa, mas algumas colunas são do pedido e se repetem em cada remessa do mesmo pedido; a descrição pede reduzir ao pedido antes de agregar
  - tipo: relacao
    ref: analytics.dim_date
    nota: uma dimensão também tem grão
  - tipo: pergunta
    ref: P01
    nota: na view, o grão é a lista de colunas de grão da montagem
didaticos:
  - titulo: Pedido e item de pedido
    texto: >-
      Um pedido com três itens aparece uma vez numa tabela de pedidos e três vezes numa tabela de
      itens. Se o valor do frete, que é do pedido, estiver na tabela de itens, somá-lo ali conta o
      frete três vezes. O erro não está na soma: está em agregar uma coluna num grão que não é o dela.
fontes:
  - titulo: "Ralph Kimball e Margy Ross, The Data Warehouse Toolkit, 3ª ed. (Wiley, 2013): a declaração do grão no processo de modelagem dimensional"
linhas_reais:
  - relacao: analytics.fact_shipment
    colunas: [shipment_code, order_id, order_shipment_count, is_split_order, order_to_delivery_days]
    destaque: [order_shipment_count, order_to_delivery_days]
    nota: >-
      Cada linha é uma remessa (`shipment_code`). As colunas destacadas são do pedido, não da remessa:
      a origem descreve `order_shipment_count` como o número de remessas do pedido, "repetido em cada
      remessa dele", e diz que o grão de `order_to_delivery_days` é o pedido. Num pedido com duas
      remessas, esses valores aparecem em duas linhas, e somá-los aqui contaria o pedido duas vezes.
revisado_em: "2026-11-19"
---

## Qual problema resolve

Sem o grão declarado, não se sabe o que uma contagem ou uma soma está contando. Duas tabelas sobre
o mesmo assunto, com grãos diferentes, dão totais diferentes para a mesma pergunta, e juntá-las sem
cuidado repete valores.

## Como funciona

Na modelagem dimensional, o grão é declarado logo depois de escolher o processo de negócio, antes
das dimensões e das medidas, e tudo o que entra na tabela precisa ser coerente com ele. Um grão mais
fino, como o item, permite agregar para um grão mais grosso, como o pedido ou o mês. O caminho
inverso não existe sem perder informação.

## O que não confundir

- **Grão e chave.** A chave identifica cada linha; o grão diz, em termos de negócio, o que a linha é.
  Em geral a chave realiza o grão, mas uma tabela pode ter chave e ainda assim um grão mal entendido.
- **Grão da tabela e grão de uma coluna.** Uma tabela pode carregar atributos de um grão mais grosso,
  repetidos em cada linha. Eles são úteis para filtrar, mas não podem ser somados como se fossem do
  grão da tabela.

## Como aparece neste projeto

A origem escreve o grão no começo da descrição das fatos e das dimensões, entre `**Grão:` e `**`, e o
pacote extrai esse trecho para o campo `grain` de cada relação. Uma relação sem essa convenção fica
com o grão "não declarado". Nas views de consumo, o grão é a lista de colunas de grão da montagem,
mostrada na página de cada pergunta.

## Escolha e limites do projeto

O Glossário Técnico da origem define o grão para tabelas fato. O pacote também o declara nas
dimensões. No pacote fixado, o campo `grain` das views de `consumption` é nulo: o grão delas está na
montagem (`view_rules`), não na relação.
