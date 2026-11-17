---
resumo: >-
  Na linhagem e no catálogo, seed é uma tabela pequena de referência, mantida como arquivo no
  repositório e carregada no armazém pelo dbt. A mesma palavra também designa a semente do gerador
  de dados sintéticos, que é outra coisa.
exemplos:
  - tipo: relacao
    ref: trusted.brazilian_states
    nota: uma seed do dbt
  - tipo: coluna
    ref: analytics.dim_geography.state_name
    nota: uma coluna cuja origem terminal é essa seed
divergencias:
  - texto: >-
      O Glossário Técnico define seed só como a "semente que torna a geração aleatória
      determinística". O Dicionário de Dados, §3.2, e o pacote usam seed no sentido do dbt: uma
      tabela "declarada no Git", que é origem terminal na linhagem e tipo de relação no catálogo.
    fontes:
      - "docs/glossario.md"
      - "docs/dicionario_de_dados.md#32-linhagem-por-coluna--totais"
    encaminhamento: Encaminhado à origem pelo gdados em 17/11/2026; a origem decide como registrar os dois sentidos.
fontes:
  - titulo: "Documentação do dbt: Seeds"
    url: "https://docs.getdbt.com/docs/build/seeds"
revisado_em: "2026-11-17"
---

## Qual problema resolve

Algumas tabelas não vêm de nenhum sistema de origem: a lista de estados, as transições de estado
permitidas de um pedido, as categorias de chamado. Mantê-las como arquivo versionado junto com o
código deixa claro quem as mudou e quando, e o dbt as carrega como qualquer outra tabela.

## Como funciona

No dbt, uma seed é um arquivo CSV do projeto que o comando `dbt seed` carrega no armazém. Depois de
carregada, ela é referenciada pelos modelos como qualquer tabela. É indicada para dados pequenos e
estáveis, não para dados que mudam com a operação.

## O que não confundir

- **Seed do dbt e semente do gerador.** O projeto também usa uma semente para gerar os dados
  sintéticos de forma reproduzível: mesma semente, mesmos dados. É o sentido que o Glossário Técnico
  registra. No catálogo e na linhagem deste portal, seed é sempre a tabela do dbt.
- **Seed e fonte.** Uma fonte chega pelo processo de ingestão; uma seed sai do repositório. Na
  linhagem, as duas são [origens terminais](../origem-terminal/), de tipos diferentes.
