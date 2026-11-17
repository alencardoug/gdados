---
resumo: >-
  Integridade é a garantia de que os dados respeitam as regras que os tornam coerentes. Uma
  invariante é uma regra que deve valer sempre, como "a soma dos reembolsos nunca excede o valor capturado".
exemplos:
  - tipo: arquivo
    ref: "docs/modelo_de_dados.md#4-invariantes-de-negócio"
    nota: as invariantes de negócio da origem
  - tipo: pagina
    ref: "governanca/evidencias/#verificacoes"
    nota: as verificações que as conferem
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Um banco que aceita qualquer combinação de valores acaba guardando pedidos sem itens, reembolsos maiores
que o pagamento ou datas fora de ordem. As regras de integridade impedem ou denunciam esses casos.

## Como funciona

- **No banco:** chaves primárias, chaves estrangeiras e restrições `CHECK` recusam a gravação que
  viola a regra.
- **Nos testes:** as regras que o banco não expressa, ou que valem entre tabelas, são conferidas a
  cada execução.

Na origem, cada invariante é ao mesmo tempo regra de geração dos dados sintéticos e teste automatizado
(Glossário Técnico; Modelo de Dados, §4).

## O que não confundir

Integridade referencial (toda chave estrangeira aponta para algo que existe) é um tipo de integridade;
as invariantes de negócio vão além dela.
