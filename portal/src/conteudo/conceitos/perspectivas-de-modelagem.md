---
resumo: >-
  Um mesmo dado pode ser descrito em três níveis: o conceitual (o que o negócio entende), o lógico
  (entidades, atributos e relacionamentos) e o físico (tabelas, tipos, índices e onde ficam).
exemplos:
  - tipo: pagina
    ref: "estrutura/"
    nota: a página que separa essas perspectivas
  - tipo: arquivo
    ref: docs/glossario_de_negocio/receita_liquida.md
    nota: perspectiva conceitual
  - tipo: relacao
    ref: analytics.fact_sales_order_item
    nota: perspectiva física, com materialização e tipos
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Misturar os níveis gera mal-entendido: discutir "receita" como se fosse uma coluna, ou mudar uma
tabela achando que se mudou um conceito. Separar os níveis deixa claro o que muda em cada decisão.

## Como funciona

- **Conceitual:** os conceitos e as perguntas do negócio, no glossário de negócio.
- **Lógico:** as [entidades e relacionamentos](../entidade-e-relacionamento/), as [chaves](../chave/) e
  os [grãos](../grao/).
- **Físico:** as relações do banco, com [materialização](../materializacao/), tipos e
  [camada](../camada/).

## Como aparece neste projeto

A página de estrutura e ambientes organiza essas perspectivas, e cada relação do catálogo mostra o
que é declarado no nível físico.
