---
resumo: >-
  Dado pessoal identificável é o que permite identificar uma pessoa, como nome, documento, e-mail,
  telefone ou endereço. Neste projeto, todo dado é sintético, mas é classificado como se fosse real.
exemplos:
  - tipo: coluna
    ref: analytics.dim_customer.customer_document
    nota: classificada como pessoal
  - tipo: pagina
    ref: "governanca/#catalogo"
    nota: filtre por sensibilidade "personal"
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Dados pessoais exigem cuidado legal e ético. Marcá-los é o primeiro passo para controlar quem os vê e
onde aparecem.

## Como funciona

Neste projeto, o nível de [sensibilidade](../sensibilidade/) `personal` marca o campo que, se fosse
real, seria dado pessoal. A Política de Governança, §3, proíbe dados pessoais reais em qualquer lugar
do projeto, inclusive em exemplos e capturas de tela.

## O que não confundir

**Sintético e anônimo.** Um dado sintético foi gerado e não corresponde a ninguém. Um dado
anonimizado veio de pessoas reais e teve a identificação retirada. A classificação vale para o
sintético porque o objetivo é exercitar o controle real.
