---
resumo: >-
  SCD, do inglês slowly changing dimension, é a forma como uma dimensão trata a mudança de um
  atributo. No tipo 1, o valor novo sobrescreve o antigo. No tipo 2, cria-se uma nova versão com
  período de vigência, e o histórico fica.
exemplos:
  - tipo: relacao
    ref: analytics.dim_customer
    nota: tipo 2, com início e fim de vigência
  - tipo: relacao
    ref: snapshots.scd_customer
    nota: o histórico mantido pelo dbt
  - tipo: relacao
    ref: analytics.dim_brand
    nota: tipo 1, sem histórico
fontes:
  - titulo: "Ralph Kimball e Margy Ross, The Data Warehouse Toolkit, 3ª ed. (Wiley, 2013): técnicas de dimensões que mudam devagar"
revisado_em: "2026-11-17"
---

## Qual problema resolve

Se um cliente muda de segmento, as vendas antigas devem ficar no segmento antigo ou no novo? O tipo 1
reescreve a história; o tipo 2 preserva cada versão e liga cada venda à versão vigente quando ela
aconteceu.

## Como funciona

No tipo 2, cada versão tem uma chave substituta própria e um período de vigência. Os períodos de uma
mesma entidade não podem se sobrepor, e a origem tem uma invariante e um teste para isso. Neste
projeto, as dimensões de tipo 2 são construídas a partir de [snapshots do dbt](../snapshot-dbt/), e a
primeira versão de cada entidade vale desde o início do período dos dados, para que os eventos
anteriores à primeira execução tenham a que se juntar (Modelo de Dados, §3.2).

## O que não confundir

A versão vigente hoje e a versão vigente no evento podem ser diferentes. Uma análise que junta a fato à
versão atual responde a outra pergunta.
