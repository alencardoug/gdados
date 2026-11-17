---
resumo: >-
  Um processo é idempotente quando executá-lo de novo, com a mesma entrada, produz o mesmo resultado,
  sem duplicar nem perder dados.
exemplos:
  - tipo: relacao
    ref: raw.inventory_movements_stream
    nota: gravação idempotente por identificador do movimento
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Falhas acontecem no meio de uma carga, e a forma mais simples de recuperar é rodar de novo. Isso só é
seguro se a segunda execução não duplicar o que a primeira já gravou.

## Como funciona

Neste projeto, idempotência é requisito de toda carga (Glossário Técnico), e a reconstrução de
qualquer camada a partir da anterior é idempotente (Arquitetura, §2). No streaming, cada movimento de
estoque tem uma chave que impede aplicá-lo duas vezes, e o destino grava por identificador, de modo que
reentregar o mesmo evento não muda o resultado.

## O que não confundir

Idempotência é sobre reexecutar; [garantia de entrega](../garantia-de-entrega/) é sobre quantas vezes o
transporte entrega uma mensagem. A segunda depende da primeira para dar resultado correto.
