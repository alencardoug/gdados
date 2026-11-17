---
resumo: >-
  Origem terminal é onde o caminho de linhagem de uma coluna termina. Há três tipos: uma coluna de
  fonte, uma coluna de seed ou um valor gerado na própria transformação.
exemplos:
  - tipo: coluna
    ref: analytics.dim_geography.region
    nota: tem origem numa seed
  - tipo: coluna
    ref: analytics.dim_brand.source_system
    nota: um valor gerado, que não vem de coluna nenhuma
  - tipo: coluna
    ref: consumption.monthly_revenue_by_channel_and_category.net_revenue_amount
    nota: origens em colunas de fonte
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Seguir a linhagem de volta precisa de um ponto de parada. Sem distinguir os tipos de fim, uma
coluna que nasce de um literal ou de uma tabela de referência pareceria uma linhagem quebrada.

## Como funciona

Segundo o Dicionário de Dados da origem, §3.2, toda coluna fecha num destes:

- **fonte**: uma coluna de `raw`, `raw_legacy` ou `governance`, onde os dados chegam ao armazém;
- **[seed](../seed/)**: uma coluna de uma tabela de referência declarada no repositório;
- **valor gerado**: calendário, numeração, literal, chave técnica ou contagem de linhas, que não vem
  do valor de coluna nenhuma.

Uma coluna pode ter várias origens de tipos diferentes, como uma chave que combina o identificador
da fonte com o rótulo do sistema de origem.

## O que não confundir

Seed e valor gerado são **fins válidos** do caminho, não quebras de linhagem. Quebra seria uma coluna
sem origem conhecida, e a origem tem um teste para impedir isso.
