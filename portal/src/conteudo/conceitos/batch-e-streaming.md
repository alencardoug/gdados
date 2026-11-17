---
resumo: >-
  No processamento em lote (batch), os dados são movidos de tempos em tempos, em blocos. No
  streaming, cada mudança é movida logo que acontece. Este projeto usa os dois para o estoque.
exemplos:
  - tipo: relacao
    ref: raw.inventory_movements_stream
    nota: o destino do caminho contínuo
  - tipo: relacao
    ref: raw.inventory_movements
    nota: a mesma tabela, carregada em lote
  - tipo: pagina
    ref: "estrutura/#travessias"
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

O lote é simples e barato, mas o dado só fica pronto na próxima execução. O streaming entrega em
segundos, ao custo de lidar com eventos atrasados, repetidos e fora de ordem.

## Como funciona

Neste projeto, o fluxo em lote é orquestrado pelo Airflow e disparado manualmente. O caminho contínuo
lê as mudanças do livro de estoque no log do banco ([CDC](../cdc/)), transporta-as como eventos e as
grava em `raw` por um pipeline Beam. O Airbyte carrega a mesma tabela de estoque em lote, como
[reconciliação](../reconciliacao/) do caminho contínuo.

## O que não confundir

O Glossário Técnico da origem define as duas arquiteturas clássicas: na **Lambda**, lote e caminho
contínuo coexistem e se unem na leitura; na **Kappa**, tudo passa pelo caminho de eventos. As
definições estão acima, como a origem as escreve.
