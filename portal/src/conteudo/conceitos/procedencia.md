---
resumo: >-
  Procedência é a informação sobre de onde um dado veio e como foi produzido. Neste portal a palavra
  aparece em três sentidos, que não devem ser confundidos.
exemplos:
  - tipo: coluna
    ref: trusted.customers.source_system
    nota: a procedência de cada registro
  - tipo: pagina
    ref: "procedencia/"
    nota: a procedência do pacote e do armazém
fontes:
  - titulo: "W3C, PROV-Overview: An Overview of the PROV Family of Documents (2013)"
    url: "https://www.w3.org/TR/prov-overview/"
revisado_em: "2026-11-17"
---

## Qual problema resolve

Um número só merece confiança quando se sabe de onde ele veio. A procedência permite rastrear um
registro até o sistema que o produziu e um resultado até a execução que o calculou.

## Como funciona

- **Procedência do registro.** Quando duas origens são empilhadas na mesma tabela, cada linha diz de
  qual sistema veio. Neste projeto é a coluna `source_system`, com a origem principal ou a legada. É o
  sentido do Glossário Técnico da origem.
- **Procedência do armazém e do pacote.** A origem registra que execução construiu o armazém e de
  qual commit, e o pacote diz com quais artefatos e em que data foi gerado. É o rodapé de toda página.
- **Procedência da cópia do portal.** O portal registra o commit da origem que copiou e o SHA-256 de
  cada arquivo, e confere tudo antes de construir as páginas.

## O que não confundir

Um armazém "verificado" diz que ele foi construído por uma execução conhecida, de um commit conhecido.
Isso não certifica cada linha que ele contém nem diz que os dados estão corretos.
