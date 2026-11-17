---
resumo: >-
  Camada é um estágio nomeado do fluxo de dados, com transformações permitidas e consumidores
  definidos. Neste projeto, cada camada é um schema do armazém.
exemplos:
  - tipo: pagina
    ref: "estrutura/#fisica"
    nota: as camadas na ordem do pipeline, com as materializações
  - tipo: pagina
    ref: "governanca/linhagem/?modo=tudo"
    nota: a visão geral da linhagem, com as camadas da esquerda para a direita
fontes:
  - titulo: "Documentação do PostgreSQL: Schemas"
    url: "https://www.postgresql.org/docs/current/ddl-schemas.html"
revisado_em: "2026-11-17"
---

## Qual problema resolve

Separar o fluxo em estágios deixa claro o que cada tabela promete. Uma tabela de `raw` é uma cópia
fiel da origem; uma de `trusted` já passou pelas regras de negócio; uma view de `consumption` é um
contrato estável de leitura. Quem consome sabe o que esperar sem ler o código.

## Como funciona

A Arquitetura da origem, §2, define nove schemas, cada um com conteúdo, transformações permitidas e
consumidor. Sete formam o fluxo, de `raw` e `raw_legacy` até `consumption`, com `quarantine` como
destino dos registros rejeitados. `governance` e `snapshots` ficam fora do fluxo: guardam o registro
de execução e o histórico das dimensões.

## O que não confundir

- **Camada e schema.** A camada é o papel no fluxo; o schema é onde as tabelas dela ficam no banco.
  Aqui os dois coincidem, mas são ideias diferentes.
- **Schema e isolamento.** A origem chama o schema explícito de separação física, em oposição a uma
  convenção de nomes. No PostgreSQL, porém, um schema é um espaço de nomes dentro de um banco: separa
  os nomes e as permissões, não o armazenamento.
