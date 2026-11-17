---
resumo: >-
  A linhagem é o caminho de um dado desde a origem até o consumo. Neste portal ela é por coluna:
  para cada coluna, de quais colunas o valor dela vem.
exemplos:
  - tipo: coluna
    ref: consumption.monthly_revenue_by_channel_and_category.net_revenue_amount
    nota: a receita líquida da P01, com origens nas duas fontes empilhadas
  - tipo: pagina
    ref: "governanca/linhagem/"
    nota: o grafo por relação e por coluna
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

A linhagem responde de onde vem um número, o que muda se uma coluna de origem mudar e se toda
coluna de consumo tem uma origem conhecida. Sem ela, auditar uma métrica exige ler o SQL de todas as
etapas.

## Como funciona

Há duas leituras. A **linhagem por relação** diz que um modelo lê outro; no dbt, ela vem das
referências entre modelos. A **linhagem por coluna** diz de quais colunas sai o valor de cada coluna.
Para cada coluna, o pacote traz o insumo imediato (`leaves`) e as [origens terminais](../origem-terminal/),
onde o caminho termina. No portal, o grafo por relação soma as ligações de coluna entre cada par de
relações.

## O que não confundir

- **Origem do valor e dependência.** Uma relação pode depender de outra só para filtrar ou para
  juntar, sem tirar dela o valor de nenhuma coluna. Essa dependência pode não aparecer como ligação
  na linhagem por coluna.
- **Linhagem declarada e execução.** A linhagem diz como os dados devem fluir segundo o código. Ela
  não prova que uma execução aconteceu nem que os valores estão corretos.

## Como aparece neste projeto

A origem deriva a linhagem por coluna do SQL compilado pelo dbt. Onde o SQL não mostra a origem, como
nas pontes do legado que extraem os valores de um JSON, a linhagem vem declarada nos próprios modelos
(`meta.lineage`), que um script da origem gera. Um teste da origem
confere que toda coluna fecha numa origem (Dicionário de Dados, §3). O que acontece antes do dbt são as
[travessias](../travessia/).
