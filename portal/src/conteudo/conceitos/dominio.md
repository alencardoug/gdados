---
resumo: >-
  Domínio é a área de negócio a que um objeto pertence, como vendas, logística ou estoque. Neste
  projeto a palavra também aparece em "domínio de valores", que é outra coisa: a lista dos valores
  que uma coluna pode ter e o que cada um significa.
exemplos:
  - tipo: pagina
    ref: "governanca/#catalogo"
    nota: o filtro por domínio do catálogo
  - tipo: coluna
    ref: analytics.dim_brand.source_system
    nota: uma coluna com domínio de valores
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Agrupar os objetos por área de negócio ajuda a encontrar o que interessa e a saber a quem perguntar.
Declarar o significado de cada valor de uma coluna evita que cada consumidor interprete um código
do seu jeito.

## Como funciona

- **Domínio da relação** (`meta.domain`): declarado nos modelos, obrigatório segundo a Política de
  Governança, §5.1. As *sources* de `raw` e `raw_legacy` não o declaram, e o catálogo mostra "não
  declarado".
- **Domínio de valores** (`value_domain` e `values` no `meta` da coluna): o nome de uma lista de
  valores e o significado de cada um. A origem declara essas listas uma vez num catálogo próprio
  (`glossario_de_negocio/dominios.yml`) e as copia para as colunas.

## O que não confundir

Os dois usos da palavra não têm relação: o primeiro classifica a tabela; o segundo descreve o
conteúdo de uma coluna.
