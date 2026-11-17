---
resumo: >-
  O responsável é quem responde por um objeto de dados; os escritores são os papéis que podem gravar
  nele. Neste projeto, os dois aparecem no metadado de cada relação.
exemplos:
  - tipo: relacao
    ref: analytics.dim_customer
    nota: responsável, escritores e papéis com leitura na ficha
  - tipo: relacao
    ref: raw.orders
    nota: uma source, escrita pela ingestão
  - tipo: relacao
    ref: raw.inventory_movements_stream
    nota: gravação concedida ao streaming na própria relação
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Um dado sem responsável não tem a quem recorrer quando está errado, e um dado que qualquer processo
pode gravar não tem como ser auditado. Declarar as duas coisas junto do objeto mantém a regra perto
do código que ela governa.

## Como funciona

- **Responsável** (`meta.owner`): obrigatório nos modelos, segundo a Política de Governança, §5.1. As
  *sources* de `raw` e `raw_legacy` não o declaram.
- **Escritores** (`meta.writers`): o papel que escreve no schema, como a ingestão nas camadas de
  chegada e a transformação nas demais (Política de Governança, §7). Uma relação pode conceder
  gravação a outro papel além desse (`meta.grants`), como a tabela que o streaming grava em `raw`.

## O que não confundir

Responsável, escritor e leitor são atributos diferentes. Quem responde por uma tabela não é,
necessariamente, quem a grava, e nenhum dos dois decide sozinho quem pode lê-la: isso é o
[acesso por papel](../acesso-por-papel/).
