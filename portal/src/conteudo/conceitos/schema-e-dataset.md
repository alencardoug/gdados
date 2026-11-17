---
resumo: >-
  Banco, schema e dataset são níveis de organização do armazenamento. No PostgreSQL, um servidor tem
  bancos, e cada banco tem schemas; no BigQuery, um projeto tem datasets. Neste projeto, cada camada
  é um schema local e um dataset na nuvem.
exemplos:
  - tipo: arquivo
    ref: docker/docker-compose.yml
    nota: os três bancos locais, cada um no seu contêiner
  - tipo: arquivo
    ref: "docs/arquitetura.md#5-mapa-de-paridade-local--gcp"
    nota: schema local e dataset na nuvem
fontes:
  - titulo: "Documentação do PostgreSQL: Schemas"
    url: "https://www.postgresql.org/docs/current/ddl-schemas.html"
  - titulo: "Documentação do Google Cloud: Introduction to datasets (BigQuery)"
    url: "https://cloud.google.com/bigquery/docs/datasets-intro"
revisado_em: "2026-11-17"
---

## Qual problema resolve

Saber em que nível dois objetos estão separados diz o que eles compartilham: nomes, permissões, espaço
em disco ou a própria máquina.

## Como funciona

Localmente, a origem tem três bancos PostgreSQL, cada um em seu contêiner: o transacional, o legado e
o armazém. Dentro do armazém, as nove camadas são schemas. No BigQuery, as camadas eram datasets.

## O que não confundir

- **Namespace, banco e instância.** Um schema separa nomes e permissões dentro de um banco; bancos em
  contêineres diferentes são instâncias diferentes. Não se deve presumir isolamento de armazenamento
  só pelo nome de um schema.
- **Schema e dataset.** Os dois agrupam tabelas, mas um dataset do BigQuery também é unidade de
  localização e de controle de acesso, o que muda o que a separação garante.
