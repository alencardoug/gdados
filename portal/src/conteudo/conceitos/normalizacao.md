---
resumo: >-
  Normalização é organizar as tabelas de modo que cada fato fique guardado num só lugar, evitando
  redundância e contradição. A terceira forma normal é a referência mais usada em bancos transacionais.
exemplos:
  - tipo: arquivo
    ref: "docs/modelo_de_dados.md#210-desvios-deliberados-da-3fn"
    nota: os desvios que a origem decidiu, cada um com motivo
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Se o mesmo valor está em dois lugares, um dia os dois discordam. A normalização reduz esse risco no
banco que recebe as operações do dia a dia.

## Como funciona

Na terceira forma normal, cada atributo que não é chave depende da chave, da chave inteira e de nada
além dela. O Modelo de Dados da origem usa essa forma como referência para o banco transacional e
registra seis desvios deliberados, cada um com justificativa.

## O que não confundir

- **Normalizado e dimensional.** O banco transacional é normalizado; o modelo dimensional de
  `analytics` é propositalmente desnormalizado, para facilitar a leitura analítica (ver
  [esquema estrela](../esquema-estrela/)).
- **Desvio e erro.** Para a origem, desvio sem justificativa escrita é erro de modelagem; com
  justificativa, é decisão. Um exemplo é guardar o total do pedido, que é o preço acordado no momento
  da compra e não deve mudar se uma lista de preços for corrigida depois.
