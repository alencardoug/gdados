---
resumo: >-
  Um glossário define os termos uma única vez. A origem mantém dois: o de negócio, com os conceitos
  do varejo, e o técnico, com os termos de engenharia de dados.
exemplos:
  - tipo: arquivo
    ref: docs/glossario_de_negocio/receita_liquida.md
    nota: um conceito de negócio
  - tipo: arquivo
    ref: docs/glossario.md
    nota: o glossário técnico
  - tipo: filtro
    ref: realised_order
    nota: um filtro que aponta para o conceito de onde sai
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Uma métrica sem definição escrita é calculada de um jeito diferente por cada pessoa. O glossário fixa
o significado e diz onde o conceito é implementado.

## Como funciona

O Glossário de Negócio da origem tem um arquivo por conceito, que o dbt importa para a documentação
técnica. Cada conceito diz como é calculado e em qual modelo está. A regra operacional das métricas
(fonte, filtro, fórmula) fica num catálogo próprio, `metricas.yml`, declarado uma vez. O Glossário
Técnico define, de forma curta, os termos de engenharia usados nos documentos.

## O que não confundir

- **Glossário da origem e explicação do portal.** As páginas de conceitos do portal mostram a
  definição da origem como ela é e acrescentam a explicação do portal, separada e identificada.
- **Divergência.** Quando o glossário diz uma coisa e outro documento da origem diz outra, o portal
  mostra as duas e encaminha a divergência à origem (ver [limitações](../limitacoes/#divergencias-nos-glossarios)).
