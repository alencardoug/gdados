---
resumo: >-
  Um ADR (registro de decisão de arquitetura) documenta uma decisão: o contexto, as alternativas
  consideradas, a escolha e as consequências.
exemplos:
  - tipo: arquivo
    ref: docs/adr/0053-fato-no-grao-da-remessa.md
    nota: a decisão sobre a fato no grão da remessa
  - tipo: pagina
    ref: "governanca/evidencias/#decisoes"
    nota: as ADRs da origem copiadas para o portal
fontes:
  - titulo: "Michael Nygard, Documenting Architecture Decisions (2011)"
    url: "https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions"
revisado_em: "2026-11-17"
---

## Qual problema resolve

Meses depois, ninguém lembra por que uma escolha foi feita, e a tentação é desfazê-la sem saber o que
ela evitava. O ADR guarda o porquê junto com o quê.

## Como funciona

Cada ADR é um documento curto e numerado. Pela prática usual, ele não é reescrito quando a decisão
muda: uma decisão nova gera outro ADR, que substitui o anterior. Os documentos da origem citam as ADRs pelo número.

## Como aparece neste projeto

O portal copia, por commit, as ADRs que o pacote e as páginas citam. Uma ADR citada que não foi copiada
aparece nos textos com o link marcado como fora da cópia.
