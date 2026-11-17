---
resumo: >-
  O dbt transforma dados dentro do armazém a partir de consultas SQL versionadas. Um modelo é uma
  consulta que vira tabela ou view; uma source declara uma tabela que já chegou ao armazém; ref e
  source ligam os modelos entre si e às fontes.
exemplos:
  - tipo: relacao
    ref: raw.orders
    nota: uma source
  - tipo: relacao
    ref: staging.stg_retail__orders
    nota: um modelo que lê essa source
  - tipo: pagina
    ref: "governanca/linhagem/?modo=relacao&r=raw.orders"
    nota: as ligações entre source e modelos
fontes:
  - titulo: "Documentação do dbt: What is dbt?"
    url: "https://docs.getdbt.com/docs/introduction"
  - titulo: "Documentação do dbt: Sources"
    url: "https://docs.getdbt.com/docs/build/sources"
revisado_em: "2026-11-17"
---

## Qual problema resolve

Transformações escritas como scripts soltos ficam sem ordem, sem testes e sem documentação. O dbt
organiza cada transformação como um arquivo versionado, deduz a ordem de execução pelas referências e
junta testes e documentação ao mesmo projeto.

## Como funciona

Cada modelo é um arquivo SQL. Quando ele lê outro modelo com `ref`, ou uma fonte com `source`, o dbt
registra a dependência e monta o grafo de execução. Os arquivos YAML ao lado dos modelos guardam a
descrição, os testes e o bloco `meta` de cada modelo e coluna. Ao executar, o dbt gera artefatos que
descrevem o projeto e a execução ([manifest e run_results](../manifest-e-run-results/)).

## Como aparece neste projeto

O catálogo do portal lista as *sources*, os modelos, as [seeds](../seed/) e os [snapshots](../snapshot-dbt/)
do projeto dbt da origem, e cada teste mostra o arquivo YAML em que foi declarado. No Glossário
Técnico, o dbt é a ferramenta de "transformação, testes, documentação e linhagem".
