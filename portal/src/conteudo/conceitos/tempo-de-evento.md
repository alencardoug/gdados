---
resumo: >-
  O tempo de evento é quando algo aconteceu; o tempo de processamento é quando o sistema ficou sabendo.
  Num fluxo contínuo, os dois diferem, e as agregações por janela precisam decidir quanto esperar pelos atrasados.
exemplos:
  - tipo: arquivo
    ref: streaming/fluxo.yml
    nota: janela, tolerância a atraso e watermark, cada um com a procedência
fontes:
  - titulo: "Documentação do Apache Beam: Windowing e watermarks"
    url: "https://beam.apache.org/documentation/programming-guide/#windowing"
revisado_em: "2026-11-17"
---

## Qual problema resolve

Um evento pode chegar minutos depois de ter acontecido. Agrupar pela hora de chegada coloca o evento
na janela errada; esperar para sempre impede qualquer resultado.

## Como funciona

- **Janela:** o intervalo de tempo de evento sobre o qual se agrega.
- **Watermark:** a estimativa de até onde, no tempo de evento, o fluxo já viu tudo o que deveria.
- **Atraso tolerado:** quanto tempo depois do fechamento uma janela ainda aceita eventos atrasados e
  emite correção.

Neste projeto, esses parâmetros estão declarados em `streaming/fluxo.yml`, cada um com a procedência:
fixado por ADR, medido ou hipótese a calibrar, como o próprio arquivo rotula.

## O que não confundir

Evento que chega depois do atraso tolerado não gera erro: simplesmente não entra na janela. O
arquivo do fluxo registra esse risco ao justificar o valor escolhido para a tolerância.
