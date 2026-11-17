---
resumo: >-
  A população de um indicador é o conjunto de casos que ele conta: quais pedidos, quais remessas,
  quais chamados. Duas métricas com o mesmo nome e populações diferentes dão números diferentes.
exemplos:
  - tipo: filtro
    ref: realised_order
    nota: só pedido realizado
  - tipo: filtro
    ref: delivered_shipment
    nota: só a remessa entregue; o rótulo cita a decisão da origem
  - tipo: pergunta
    ref: P13
  - tipo: arquivo
    ref: docs/adr/0053-fato-no-grao-da-remessa.md
    nota: a decisão registrada pela origem
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

"Taxa de entrega no prazo" pode contar todas as remessas, só as entregues ou só as do pedido que
fechou o ciclo. Sem a população declarada, dois relatórios com o mesmo título discordam, e nenhum
está errado pela sua própria regra.

## Como funciona

Neste projeto, cada medida declara seus filtros pelo nome, e cada filtro tem um rótulo em português,
o predicado em SQL, a relação a que se aplica e o conceito do glossário de negócio de onde sai. A
medida também pode ter uma condição própria (`where`). O período é outra parte da população: a medida
diz qual data o define.

## O que não confundir

Nome, [linhagem](../linhagem/) e população são informações diferentes. O nome diz o que a métrica
pretende medir; a linhagem diz de onde vêm os valores; a população diz quais casos entram. Uma
métrica só é interpretável com as três, e a linhagem por coluna não mostra a população (ver
[dependência por junção ou filtro](../dependencia-de-juncao-e-filtro/)).

## Escolha e limites do projeto

A P13 é o caso que a origem decidiu em 14/11/2026 (D66, ADR-0053): o rótulo do filtro de remessa
entregue cita essa decisão. O portal mostra a decisão como a origem a registra, na própria ADR, e não
a reinterpreta.
