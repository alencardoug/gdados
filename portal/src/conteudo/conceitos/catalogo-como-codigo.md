---
resumo: >-
  Catálogo como código é manter o catálogo, o dicionário e o glossário em arquivos versionados no
  repositório, junto com o código que produz os dados, em vez de num sistema separado.
exemplos:
  - tipo: arquivo
    ref: "docs/governanca_de_dados.md#5-catálogo-como-código"
    nota: a escolha da origem
  - tipo: pagina
    ref: "procedencia/"
    nota: o pacote que leva esse catálogo ao portal, com o commit
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Um catálogo mantido à parte envelhece: o código muda e a documentação fica para trás. Mantido no
repositório, ele muda no mesmo commit que o código, e a revisão pega a divergência.

## Como funciona

Na origem, a descrição de cada modelo e coluna, os testes e o bloco `meta` estão nos arquivos YAML do
dbt, e o glossário de negócio está em Markdown no mesmo repositório (Política de Governança, §5). A
origem rejeitou um sistema de catálogo separado no ambiente local por custo de memória e por falta de
contrapartida direta no GCP (ADR-0007 da origem).

## Como aparece neste projeto

O próprio portal segue a mesma ideia: lê o catálogo por commit fixado e mostra o commit em toda página.
