---
resumo: >-
  Qualidade de dados é o quanto os dados servem ao uso pretendido: completos, válidos, consistentes,
  únicos onde devem ser e coerentes com as regras do negócio.
exemplos:
  - tipo: pagina
    ref: "governanca/evidencias/#testes"
    nota: os testes de dados do dbt
  - tipo: arquivo
    ref: "docs/modelo_de_dados.md#4-invariantes-de-negócio"
    nota: as invariantes que definem dado coerente
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Dado de má qualidade produz decisões erradas com aparência de certas. Medir a qualidade com regras
explícitas permite saber o que está bom, o que falhou e desde quando.

## Como funciona

Neste projeto, a qualidade é expressa como [testes](../teste/) e [invariantes](../integridade/):
regras que valem sempre e são verificadas a cada execução. O que não passa nas regras do legado vai
para a [quarentena](../quarentena/), com o motivo, em vez de ser descartado em silêncio.

## O que não confundir

Teste que passou diz que a regra testada vale naquela execução; não diz que o dado é bom em tudo.
