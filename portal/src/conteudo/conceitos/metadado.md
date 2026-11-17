---
resumo: >-
  Metadado é dado sobre dados: a descrição de uma tabela, o tipo de uma coluna, o responsável, a
  classificação, a origem, a data em que algo foi gerado.
exemplos:
  - tipo: pagina
    ref: "procedencia/"
    nota: os metadados do próprio pacote
  - tipo: relacao
    ref: analytics.dim_customer
    nota: descrição, responsável, classificação e testes de uma relação
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Os dados sozinhos não dizem o que significam, de onde vieram nem quem responde por eles. O metadado
responde a essas perguntas sem que seja preciso ler o código.

## Como funciona

Neste projeto, o metadado é declarado junto com o código, nos arquivos do dbt (descrição, bloco
`meta`, testes), e reunido pela origem num **pacote de metadados** versionado. O portal lê só esse
pacote e alguns documentos da origem, sem consultar o banco.

## O que não confundir

O bloco `meta` do dbt é uma parte do metadado, não todo ele: descrição, testes e linhagem também são
metadados e vêm de outros lugares.
