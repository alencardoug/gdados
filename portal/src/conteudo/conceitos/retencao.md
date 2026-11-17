---
resumo: >-
  Retenção é quanto tempo um objeto de dados é guardado e com que critério pode ser descartado.
  Neste projeto, cada objeto é permanente ou reconstruível.
exemplos:
  - tipo: relacao
    ref: quarantine.rejected_legacy_records
    nota: permanente, porque é evidência de auditoria
  - tipo: relacao
    ref: analytics.fact_sales_order_item
    nota: reconstruível a partir das camadas anteriores
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Guardar tudo para sempre custa e aumenta o risco; apagar sem critério perde evidência. Declarar a
retenção de cada objeto diz o que pode ser refeito e o que precisa ser preservado.

## Como funciona

A Política de Governança, §8, declara a retenção por camada e um teste da origem a cobra objeto a
objeto: **permanente** para as camadas de chegada, a quarentena, o histórico e o registro de
governança; **reconstruível** para as camadas que se refazem a partir das anteriores. A política
também admite um número de dias.

## O que não confundir

**Reconstruível não quer dizer descartável sem custo.** Quer dizer que o objeto pode ser refeito
pelo código a partir do que é permanente. A origem respalda a retenção permanente com um pacote de
recuperação (Capacidade e Recuperação, §3).

## Escolha e limites do projeto

Como todo dado é sintético, a política da origem trata a retenção como exercício de disciplina, não
como obrigação legal, com a mesma estrutura que valeria para dados reais.
