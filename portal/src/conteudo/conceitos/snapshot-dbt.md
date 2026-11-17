---
resumo: >-
  Um snapshot do dbt guarda as versões de uma tabela ao longo do tempo: a cada execução, registra o
  que mudou e o período em que cada versão valeu.
exemplos:
  - tipo: relacao
    ref: snapshots.scd_customer
    nota: as versões do cliente, com início e fim de vigência
  - tipo: relacao
    ref: analytics.dim_customer
    nota: a dimensão construída a partir dele
fontes:
  - titulo: "Documentação do dbt: Snapshots"
    url: "https://docs.getdbt.com/docs/build/snapshots"
revisado_em: "2026-11-17"
---

## Qual problema resolve

A origem guarda só o estado atual. Sem registrar as versões, perde-se o que valia antes de uma mudança,
e uma [dimensão de tipo 2](../scd/) fica impossível.

## Como funciona

A cada execução, o dbt compara a tabela com a última versão registrada e, quando algo mudou, fecha a
versão antiga e abre uma nova. Ele acrescenta colunas próprias de controle, como o início e o fim da
vigência (`dbt_valid_from` e `dbt_valid_to`).

## Escolha e limites do projeto

Os snapshots ficam no schema `snapshots`, fora do fluxo principal, mantidos só pelo dbt e com
retenção permanente. A origem registra uma armadilha: o dbt marca o início da vigência no instante da
primeira execução, e os eventos anteriores ficariam sem versão; por isso a primeira versão de cada
entidade passa a valer desde o início do período dos dados (Modelo de Dados, §3.2).
