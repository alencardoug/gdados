---
resumo: >-
  O dicionário de dados descreve cada campo: o tipo, se é obrigatório, o que significa e como é
  classificado.
exemplos:
  - tipo: arquivo
    ref: docs/dicionario_de_dados.md
    nota: o dicionário da origem
  - tipo: relacao
    ref: analytics.dim_customer
    nota: as colunas de uma relação, com tipo, sensibilidade e descrição
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

O nome de uma coluna raramente basta: `status` pode ter dez valores com significados diferentes, e
`amount` pode incluir ou não o imposto. O dicionário diz o que cada campo é.

## Como funciona

Na origem, a descrição de cada coluna do banco de origem é declarada uma vez e herdada pelas colunas
que só a transportam; uma coluna que calcula algo novo precisa de descrição própria (Política de
Governança, §5.1). O portal mostra essa origem da descrição quando o pacote a informa ("descrição
herdada de…").

## O que não confundir

O dicionário fala do campo; o [glossário](../glossario/) fala do conceito de negócio. "Receita
líquida" é um conceito; `net_revenue_amount` é um campo que o implementa.
