---
resumo: >-
  O catálogo é o inventário dos objetos de dados, com a descrição e o responsável de cada um. É por
  onde se começa a procurar um dado.
exemplos:
  - tipo: pagina
    ref: "governanca/#catalogo"
    nota: o catálogo do portal, gerado do pacote
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Sem catálogo, achar um dado depende de perguntar a quem o criou. Com ele, dá para buscar por nome,
assunto ou camada e ver o que cada objeto é antes de usá-lo.

## Como funciona

Neste projeto, o catálogo não é um sistema à parte: é mantido como código no repositório da origem
(ver [catálogo como código](../catalogo-como-codigo/)). O pacote de metadados leva o catálogo para o
portal, que o mostra com busca e filtros.

## O que não confundir

O catálogo lista os objetos; o [dicionário de dados](../dicionario-de-dados/) descreve campo a campo;
o [glossário](../glossario/) define os conceitos. São três peças complementares.

## Escolha e limites do projeto

O catálogo do portal mostra os objetos **declarados** no projeto dbt da origem, não um inventário
lido do banco. Uma relação sem descrição, registrada pela origem em `description_gaps`, aparece como
"sem descrição declarada"; o portal não escreve a descrição que falta.
