---
resumo: >-
  Um teste confere uma afirmação sobre os dados ou sobre o código e registra se ela passou numa
  execução. O pacote traz três tipos: testes de dados e testes de unidade do dbt, e verificações do pytest.
exemplos:
  - tipo: pagina
    ref: "governanca/evidencias/#testes"
    nota: os testes do dbt, por tipo
  - tipo: pagina
    ref: "governanca/evidencias/#verificacoes"
    nota: as verificações do pytest, por módulo
  - tipo: relacao
    ref: analytics.fact_shipment
    nota: os testes de uma relação, na página dela
fontes:
  - titulo: "Documentação do dbt: Data tests"
    url: "https://docs.getdbt.com/docs/build/data-tests"
  - titulo: "Documentação do dbt: Unit tests"
    url: "https://docs.getdbt.com/docs/build/unit-tests"
revisado_em: "2026-11-17"
---

## Qual problema resolve

Uma regra escrita só num documento não impede que os dados a violem. O teste transforma a regra numa
verificação que roda a cada execução e falha quando a regra é quebrada.

## Como funciona

- **Teste de dados do dbt:** consulta o armazém e falha se encontrar linhas que violam a regra:
  valor nulo onde não pode, valor repetido, valor fora da lista, chave sem correspondente, ou uma
  consulta escrita para o caso.
- **Teste de unidade do dbt:** confere a lógica de um modelo com dados de entrada fixos, sem depender
  do conteúdo do armazém.
- **Verificação do pytest:** testes do projeto em Python, como a prova de acesso por papel, as
  invariantes, as reconciliações e a certificação da captura.

## O que não confundir

- **Declarado, executado e resultado.** Um teste declarado pode não ter resultado no pacote ("sem
  resultado"). Um resultado vale para a execução em que foi obtido, com a data mostrada, não para o
  banco de hoje.
- **Passar não é provar tudo.** Um teste confere a regra que ele expressa e nada além dela.

## Como aparece neste projeto

Cada relação mostra seus testes, com o arquivo em que foram declarados e o resultado. A página de
estado e evidência resume os testes por tipo e as verificações por módulo.
