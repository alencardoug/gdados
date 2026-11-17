---
resumo: >-
  Captura de mudanças (CDC) é obter as alterações de um banco lendo o log de transações dele, em vez
  de consultar as tabelas repetidamente.
exemplos:
  - tipo: arquivo
    ref: streaming/fluxo.yml
    nota: os parâmetros do caminho contínuo
  - tipo: relacao
    ref: raw.inventory_movements_stream
    nota: onde as mudanças capturadas chegam
fontes:
  - titulo: "Documentação do Debezium"
    url: "https://debezium.io/documentation/"
revisado_em: "2026-11-17"
---

## Qual problema resolve

Consultar a tabela de tempos em tempos perde mudanças intermediárias e pesa sobre o banco. O log de
transações já registra cada mudança confirmada, na ordem, e pode ser lido sem tocar nas tabelas.

## Como funciona

No PostgreSQL, o log é o WAL; cada registro tem uma posição (LSN), que serve de cursor para retomar a
leitura. Neste projeto, o Debezium lê o WAL da tabela de movimentos de estoque e publica cada mudança
como um evento. O CDC publica apenas transações confirmadas (Modelo de Dados, §5.4).

## O que não confundir

O CDC funciona bem aqui porque o livro de estoque só aceita inserções: uma correção é um novo evento
compensatório, nunca uma alteração de um movimento já publicado (Modelo de Dados, §5).
