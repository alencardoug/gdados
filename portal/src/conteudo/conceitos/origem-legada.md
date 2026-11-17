---
resumo: >-
  A origem legada é um segundo sistema de origem, antigo, com tipos frouxos e defeitos de propósito.
  Os dados dele são capturados, tratados e empilhados aos da origem principal.
exemplos:
  - tipo: relacao
    ref: raw_legacy.orders
    nota: a captura bruta, com tudo como texto
  - tipo: relacao
    ref: trusted.legacy_records
    nota: as ocorrências da captura selecionada
  - tipo: relacao
    ref: quarantine.rejected_legacy_records
    nota: o que foi rejeitado no tratamento
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Projetos reais quase sempre convivem com um sistema antigo. A origem legada exercita a migração: ler
dados sem garantia de tipo, tratar defeitos conhecidos e juntar os dois mundos sem perder a procedência.

## Como funciona

A Arquitetura da origem mostra um gerador legado com falhas intencionais e um banco próprio. A captura
copia o legado para `raw_legacy` por acréscimo, nunca sobrescrevendo, com os valores como texto e os
defeitos preservados, e deixa um [certificado de captura](../certificado-de-captura/). O tratamento
aplica as regras e empilha o resultado em `trusted`, com a [procedência](../procedencia/) de cada
registro; o que não pode ser aceito vai para a [quarentena](../quarentena/).

## O que não confundir

O Glossário Técnico distingue validar a estrutura na escrita (*schema-on-write*, a origem principal,
com tipos estritos) de validar só na leitura (*schema-on-read*, o legado, tudo como texto).
