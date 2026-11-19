---
resumo: >-
  Uma entidade é algo sobre o que se guardam dados, como cliente ou pedido. Um relacionamento liga
  entidades, e a cardinalidade diz quantas de um lado se ligam a quantas do outro.
exemplos:
  - tipo: arquivo
    ref: "docs/modelo_de_dados.md#211-diagrama-entidade-relacionamento"
    nota: os diagramas do modelo transacional, gerados pela origem
  - tipo: pagina
    ref: "estrutura/#logica"
    nota: as entidades e os grãos do modelo dimensional
  - tipo: pagina
    ref: "estrutura/#entidades"
    nota: o diagrama do modelo dimensional, gerado das chaves que o pacote declara
  - tipo: relacao
    ref: analytics.fact_cart_event
    nota: uma fato e as chaves estrangeiras para as suas dimensões
fontes: []
revisado_em: "2026-11-18"
---

## Qual problema resolve

O diagrama entidade-relacionamento mostra a estrutura de um modelo sem exigir a leitura de cada
tabela: o que existe, o que se liga a quê e com que multiplicidade.

## Como funciona

Cada relacionamento tem uma cardinalidade, como "um cliente tem muitos endereços" (um para muitos).
No banco, o relacionamento é implementado por uma [chave](../chave/) estrangeira. Na notação do
diagrama, os símbolos nas pontas das linhas indicam o mínimo e o máximo de cada lado.

## Como aparece neste projeto

O Modelo de Dados da origem, §2.11, tem um diagrama por domínio do modelo transacional, gerado a
partir dos modelos e mostrando só as chaves. Para o modelo dimensional de `analytics`, o portal
desenha o diagrama a partir das chaves primárias e estrangeiras que o pacote declara, um recorte por
vez: a relação escolhida e as ligadas a ela por chave. Como o pacote não declara a cardinalidade, o
portal só afirma "exatamente um" quando há teste `not_null` na coluna
([limitação conhecida](../limitacoes/#cardinalidade-dos-relacionamentos)).
