---
resumo: >-
  Um evento é o registro de algo que aconteceu, como um movimento de estoque. Um tópico é o canal
  nomeado por onde os eventos de um tipo passam, do produtor para os consumidores.
exemplos:
  - tipo: arquivo
    ref: streaming/fluxo.yml
    nota: o tópico de eventos e o tópico de alertas declarados
  - tipo: arquivo
    ref: "docs/modelo_de_dados.md#5-contrato-do-evento-de-estoque"
    nota: o contrato do evento de estoque
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Com um canal intermediário, quem produz não precisa conhecer quem consome, e o consumidor pode parar
e retomar sem perder eventos.

## Como funciona

Neste projeto, as mudanças do livro de estoque são publicadas num tópico do Redpanda, compatível com
Kafka, e consumidas por um pipeline Beam; na fase GCP, o transporte era o Pub/Sub. O contrato do
evento (Modelo de Dados, §5) fixa os campos de cada movimento, inclusive o identificador estável, a
chave de idempotência e o momento de negócio em que o movimento ocorreu.

## O que não confundir

O tópico de alertas é separado de propósito: segundo o arquivo do fluxo, o alerta é sinal para outro
sistema, não linha de dado.
