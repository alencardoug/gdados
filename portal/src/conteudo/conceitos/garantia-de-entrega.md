---
resumo: >-
  A garantia de entrega diz quantas vezes um transporte de eventos entrega cada mensagem: pelo menos
  uma vez, no máximo uma vez ou exatamente uma vez. Com "pelo menos uma vez", o consumidor precisa
  descartar as repetições.
exemplos:
  - tipo: arquivo
    ref: "docs/modelo_de_dados.md#5-contrato-do-evento-de-estoque"
    nota: a chave de idempotência do evento
  - tipo: relacao
    ref: raw.inventory_movements_stream
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Se uma confirmação se perde, o transporte reenvia a mensagem. Sem tratamento, o mesmo movimento de
estoque seria contado duas vezes.

## Como funciona

Neste projeto, o transporte oferece entrega pelo menos uma vez, e os consumidores tratam as
repetições pela chave de idempotência do evento, sem presumir que o transporte entregue exatamente uma
vez (Modelo de Dados, §5.4). Deduplicar é descartar a reentrega por essa chave estável.

## O que não confundir

"Exatamente uma vez" de ponta a ponta costuma ser resultado da combinação de entrega pelo menos uma vez
com destino [idempotente](../idempotencia/), não uma propriedade do transporte sozinho.
