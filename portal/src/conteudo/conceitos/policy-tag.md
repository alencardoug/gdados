---
resumo: >-
  No BigQuery, uma policy tag é uma etiqueta presa a uma coluna e ligada ao controle de acesso: quem
  não tem permissão na etiqueta não consegue ler a coluna.
exemplos:
  - tipo: arquivo
    ref: "docs/governanca_de_dados.md#52-materialização-da-governança-na-fase-gcp"
    nota: como a origem levou a classificação ao BigQuery
fontes:
  - titulo: "Documentação do Google Cloud: Introduction to column-level access control (BigQuery)"
    url: "https://cloud.google.com/bigquery/docs/column-level-security-intro"
revisado_em: "2026-11-17"
---

## Qual problema resolve

Uma classificação só no documento não impede ninguém de ler a coluna. A policy tag transforma a
classificação num bloqueio efetivo, aplicado pelo próprio banco.

## Como funciona

Na fase GCP da origem, só os níveis `confidential` e `personal` viraram policy tags com controle
ligado, porque em `public` e `internal` não há o que negar. O Terraform criou as etiquetas e as
permissões de leitura, e o dbt aplicou a etiqueta às colunas das tabelas que materializa (Política de
Governança, §5.2).

## Escolha e limites do projeto

O ambiente GCP foi desmontado. O que se mediu das policy tags está no registro da fase GCP da origem;
a política também registra uma parte da rota que não foi validada no Composer. O ambiente local não
tem policy tags: lá, o controle é o [acesso por papel](../acesso-por-papel/).
