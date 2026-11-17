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
fontes: []
revisado_em: "2026-11-17"
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
partir dos modelos e mostrando só as chaves. Para o modelo dimensional de `analytics`, o pacote fixado
não traz o destino das chaves estrangeiras, e o portal ainda não desenha esse diagrama
([limitação conhecida](../limitacoes/#chaves-estrangeiras)).
