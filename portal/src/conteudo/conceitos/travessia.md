---
resumo: >-
  Travessia é o caminho que os dados percorrem fora do dbt para chegar ao armazém: a ingestão em
  lote, o streaming e a captura da origem legada.
exemplos:
  - tipo: pagina
    ref: "estrutura/#travessias"
    nota: o diagrama e a tabela das travessias
  - tipo: relacao
    ref: raw.inventory_movements_stream
    nota: o destino do caminho de streaming
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

A linhagem do dbt começa nas fontes, que já estão no armazém. Sem as travessias, ficaria invisível
como os dados chegaram ali, com que frequência e por qual mecanismo.

## Como funciona

Cada travessia declara a origem, o destino, o mecanismo, a frequência e uma observação. Neste projeto
há três tipos: a réplica do banco transacional pelo Airbyte, em lote; o caminho de streaming, em que
as mudanças são lidas do log do banco e transportadas como eventos até o armazém; e a captura da
origem legada, que deixa um certificado de captura.

## O que não confundir

A travessia é declarada **por camada de destino**, não por coluna. O portal a liga às camadas e não
inventa ligação de coluna para coluna nesse trecho.

## Como aparece neste projeto

O Dicionário de Dados da origem, §3.1, mantém a tabela das travessias, e o pacote a traz na seção
`crossings`. A página de estrutura mostra as travessias num diagrama gerado a partir dessa seção, com
a mesma informação em tabela.
