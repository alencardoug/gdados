---
resumo: >-
  Reconciliação é conferir que as contagens e os totais fecham entre duas etapas ou duas cópias:
  nada foi criado nem perdido no caminho.
exemplos:
  - tipo: pagina
    ref: "governanca/evidencias/#verificacoes"
    nota: verificações de reconciliação do pytest
  - tipo: relacao
    ref: analytics.fact_shipment
    nota: uma fato reconciliada com a tabela que a conduz
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Um pipeline pode perder ou duplicar linhas sem erro aparente. A reconciliação compara contagens e
somas entre etapas e acusa a diferença.

## Como funciona

O Glossário Técnico da origem a define entre camadas adjacentes. No pacote, aparecem, por exemplo, o
teste que reconcilia cada fato com a tabela de `trusted` que a conduz (`fato_reconcilia_com_a_condutora`)
e verificações do `pytest`; a carga em lote do estoque serve de reconciliação do caminho contínuo. O
Modelo de Dados, §3.1, registra também um limite aceito: as duas fatos de remessa se reconciliam cada
uma com a sua condutora, mas nenhum teste as compara atributo a atributo.

## O que não confundir

Reconciliar contagens não prova que cada valor está certo; prova que o conjunto não ganhou nem perdeu
linhas.
