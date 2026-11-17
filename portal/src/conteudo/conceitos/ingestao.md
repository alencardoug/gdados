---
resumo: >-
  Ingestão é trazer os dados dos sistemas de origem para o armazém analítico, sem transformá-los
  ainda. É a primeira travessia do pipeline.
exemplos:
  - tipo: pagina
    ref: "estrutura/#travessias"
    nota: as travessias de ingestão
  - tipo: arquivo
    ref: airbyte/streams.yml
    nota: a declaração da ingestão em lote, com o modo de cada tabela
  - tipo: relacao
    ref: raw.orders
    nota: uma tabela de chegada
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Consultar diretamente o banco das aplicações para fazer análise pesa sobre a operação e mistura
responsabilidades. A ingestão copia os dados para um lugar próprio, onde o pipeline pode trabalhar.

## Como funciona

Neste projeto, o Airbyte copia o banco transacional para `raw` e o banco legado para `raw_legacy`,
em lote. Cada tabela tem um modo: substituir tudo, acrescentar ou manter o histórico deduplicado. As
mudanças do livro de estoque também chegam por [streaming](../batch-e-streaming/). A Arquitetura da
origem, §1, separa os bancos de origem do armazém para que a ingestão seja observável e o pipeline
não consulte as tabelas das aplicações.

## O que não confundir

A camada de chegada é uma cópia, não uma versão limpa: em `raw` não há transformação além dos
metadados de carga, e em `raw_legacy` o valor recebido é preservado com os defeitos (Arquitetura, §2).
