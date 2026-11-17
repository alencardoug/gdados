---
resumo: >-
  O manifest e o run_results são arquivos que o dbt gera. O manifest descreve o projeto: modelos,
  colunas, testes e dependências. O run_results registra uma execução: o que rodou, quando e com que
  resultado.
exemplos:
  - tipo: pagina
    ref: "procedencia/"
    nota: as datas e as invocações desses artefatos no pacote
fontes:
  - titulo: "Documentação do dbt: Manifest JSON file"
    url: "https://docs.getdbt.com/reference/artifacts/manifest-json"
  - titulo: "Documentação do dbt: Run results JSON file"
    url: "https://docs.getdbt.com/reference/artifacts/run-results-json"
revisado_em: "2026-11-17"
---

## Qual problema resolve

Para documentar e auditar o projeto, é preciso uma descrição estruturada dele e um registro de cada
execução. Os artefatos do dbt dão as duas coisas num formato que outras ferramentas leem.

## Como funciona

O pacote de metadados da origem usa esses artefatos: o catálogo e os testes vêm do manifest, e os
resultados dos testes, do run_results. A linhagem por coluna vem de um módulo da origem que lê o SQL
compilado pelo dbt ([linhagem](../linhagem/)). Cada artefato traz a
data em que foi gerado e o identificador da invocação do dbt.

## O que não confundir

- **Declaração e execução.** O manifest diz o que existe; o run_results diz o que aconteceu numa
  execução. O pacote indica, em cada resultado de teste, se ele é da mesma invocação do manifest.
- **Data do artefato e data de hoje.** As datas mostradas no rodapé são as da geração dos artefatos, não
  a data em que o portal foi construído.
