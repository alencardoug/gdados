---
resumo: >-
  Materialização é a forma como um modelo existe no banco: como uma view, que guarda só a
  consulta, como uma tabela, que guarda o resultado, ou como uma tabela incremental, que acrescenta
  apenas o que é novo.
exemplos:
  - tipo: pagina
    ref: "estrutura/#fisica"
    nota: as materializações de cada camada
  - tipo: relacao
    ref: analytics.fact_inventory_movement
    nota: a fato incremental
fontes:
  - titulo: "Documentação do dbt: Materializations"
    url: "https://docs.getdbt.com/docs/build/materializations"
revisado_em: "2026-11-17"
---

## Qual problema resolve

A mesma transformação pode ser recalculada a cada leitura ou gravada uma vez e lida muitas. A escolha
troca espaço em disco e tempo de construção por tempo de consulta, e decide se o resultado reflete a
origem de agora ou a da última execução.

## Como funciona

- **View:** guarda só a consulta; cada leitura recalcula. Não ocupa espaço com dados.
- **Tabela:** grava o resultado; a leitura é rápida, e o dado é o da última construção.
- **Incremental:** grava o resultado e, a cada execução, acrescenta ou atualiza só o que mudou.
- **Snapshot** e **seed** são materializações próprias do dbt: o histórico de uma dimensão e a carga de
  uma tabela de referência.

## O que não confundir

Uma view de `consumption` e uma view de `staging` usam a mesma materialização com papéis diferentes: a
primeira é um contrato de leitura para análise; a segunda, um passo do pipeline. A materialização diz
como o objeto existe, não para que serve.

## Como aparece neste projeto

A origem define a materialização por camada (ADR-0016 da origem), com exceções nomeadas por origem
de dados: o ramo legado se materializa diferente em `staging` e na fato incremental (Arquitetura, §2).
O catálogo mostra a materialização de cada relação; as *sources* não são materializadas pelo dbt.
