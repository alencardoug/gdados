---
resumo: >-
  Orquestrar é coordenar a execução das etapas do pipeline na ordem certa, com dependências,
  repetição em caso de falha e registro do que rodou. Uma DAG é o grafo dessas etapas.
exemplos:
  - tipo: arquivo
    ref: docker/docker-compose.airflow.yml
    nota: a orquestração local
  - tipo: pagina
    ref: "estrutura/#travessias"
    nota: a frequência da ingestão em lote, por execução da DAG
fontes:
  - titulo: "Documentação do Apache Airflow: DAGs"
    url: "https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html"
revisado_em: "2026-11-17"
---

## Qual problema resolve

Rodar à mão cada etapa (ingestão, transformação, testes) é sujeito a esquecimento e a ordem errada. O
orquestrador garante que cada etapa só comece quando as anteriores terminaram bem.

## Como funciona

Uma DAG (grafo acíclico dirigido) declara as tarefas e as dependências entre elas. Neste projeto, o
Airflow orquestra o fluxo em lote, e a ingestão pelo Airbyte acontece a cada execução da DAG
`fluxo_batch`, disparada manualmente; na fase GCP, o equivalente era o Cloud Composer (Arquitetura, §5).

## O que não confundir

A DAG do orquestrador e o grafo de dependências do dbt são grafos diferentes: o primeiro ordena
tarefas do pipeline inteiro; o segundo ordena modelos dentro da transformação.
