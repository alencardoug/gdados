---
resumo: >-
  Um contêiner empacota um serviço com o que ele precisa para rodar, isolado dos demais. Um serviço
  gerenciado é o mesmo tipo de serviço operado pelo provedor de nuvem.
exemplos:
  - tipo: arquivo
    ref: docker/docker-compose.yml
    nota: os bancos e serviços locais
  - tipo: arquivo
    ref: docker/docker-compose.streaming.yml
    nota: o streaming local
  - tipo: arquivo
    ref: "docs/arquitetura.md#5-mapa-de-paridade-local--gcp"
    nota: o equivalente gerenciado de cada serviço
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Montar à mão um ambiente com vários bancos e serviços é lento e difícil de repetir. Com contêineres
declarados em arquivo, o ambiente inteiro sobe com um comando e é igual em qualquer máquina.

## Como funciona

Neste projeto, os arquivos `docker-compose` da origem declaram os bancos, a orquestração e o
streaming locais. Na fase GCP, o mapa de paridade troca cada serviço por um gerenciado: o PostgreSQL
em contêiner vira Cloud SQL, o Airflow vira Cloud Composer, o Beam local vira Dataflow (Arquitetura,
§5).

## O que não confundir

O contêiner e o serviço gerenciado cumprem o mesmo papel, mas quem opera, como escala e quanto custa
mudam. A [paridade](../paridade/) compara o papel, não a implementação.
