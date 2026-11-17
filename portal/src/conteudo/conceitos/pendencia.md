---
resumo: >-
  Uma pendência é uma decisão ou verificação que ficou em aberto, esperando alguém. Os itens em
  aberto do pacote apontam para o documento de pendências da origem.
exemplos:
  - tipo: pagina
    ref: "governanca/evidencias/#itens"
    nota: os itens em aberto do pacote
  - tipo: arquivo
    ref: docs/pendencias.md
    nota: o documento de pendências da origem
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

O que fica em aberto sem registro é esquecido, ou é resolvido por quem não deveria decidir. A lista de
pendências torna visível o que espera decisão e de quem.

## Como funciona

O documento de pendências da origem separa as decisões (D) das verificações e trabalhos adiados (V),
cada uma com o estado e a data, e mantém uma seção de decisões já fechadas. O pacote leva os itens em
aberto em `open_items`, com o estado e o endereço da seção correspondente.

## O que não confundir

- **Em aberto e decidido.** Uma decisão já tomada, como a D66, não aparece em `open_items`; ela é lida
  no documento responsável.
- **Item e objetos afetados.** O pacote não diz quais relações cada item afeta, e o portal não faz essa
  ligação (ver [limitações](../limitacoes/#objetos-dos-itens-em-aberto)).
