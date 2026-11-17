---
resumo: >-
  Quarentena é o destino dos registros que não puderam ser aceitos nem corrigidos com segurança. Não
  é descarte: o registro fica guardado com o motivo da rejeição.
exemplos:
  - tipo: relacao
    ref: quarantine.rejected_legacy_records
    nota: os rejeitados do legado, por captura
  - tipo: relacao
    ref: quarantine.rejected_shipment_deliveries
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Descartar em silêncio o que não passa nas regras esconde problemas e faz os totais mudarem sem
explicação. Rejeitar para a quarentena deixa evidência: quanto foi rejeitado, por quê e de onde veio.

## Como funciona

Na origem, nenhum registro é descartado em silêncio: o que não passa vai para `quarantine` com o
motivo (Arquitetura, §2). A camada é permanente e é lida pelo papel de auditoria; a tabela de
rejeitados do legado se descreve como "nunca fonte de negócio".

## O que não confundir

A quarentena não é uma lixeira nem uma fila de reprocessamento: é [evidência de auditoria](../auditoria/).
Os números de uma análise não incluem o que está em quarentena.
