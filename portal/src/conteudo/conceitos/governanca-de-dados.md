---
resumo: >-
  Governança de dados é o conjunto de regras, responsabilidades e controles que dizem como os dados
  são definidos, classificados, acessados, guardados e verificados.
exemplos:
  - tipo: arquivo
    ref: docs/governanca_de_dados.md
    nota: a política da origem
  - tipo: pagina
    ref: "governanca/evidencias/"
    nota: o que o pacote registra como evidência dos controles
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Sem regras comuns, cada pessoa define, classifica e acessa os dados do seu jeito, e ninguém consegue
dizer se um número é confiável ou se um dado está protegido.

## Como funciona

A Política de Governança da origem diz o que pode e o que não pode entrar no projeto, como cada
campo é classificado, onde vivem o catálogo e o glossário, quais controles são obrigatórios, quem lê e
quem grava cada camada e quanto tempo cada objeto é guardado. O propósito declarado é que catálogo,
linhagem e classificação nasçam junto com os dados, não depois (Política, §1).

## O que não confundir

**Política declarada e controle verificado.** Uma regra escrita só vira controle quando algo a
confere. Neste projeto, boa parte das regras tem teste na origem, e o portal mostra os resultados com
a data da execução, não como garantia permanente.

## Como aparece neste projeto

O portal é uma camada de leitura dessa governança: mostra o que a origem declara e registra, aponta o
que falta e não decide regra nenhuma.
