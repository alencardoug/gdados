---
resumo: >-
  Um contrato é uma promessa explícita sobre a forma e o significado de um dado, que quem produz se
  compromete a manter e quem consome pode presumir.
exemplos:
  - tipo: relacao
    ref: consumption.monthly_revenue_by_channel_and_category
    nota: uma view de consumo, o contrato de leitura
  - tipo: arquivo
    ref: "docs/modelo_de_dados.md#5-contrato-do-evento-de-estoque"
    nota: o contrato do evento de estoque
  - tipo: pagina
    ref: "procedencia/"
    nota: o pacote de metadados, contrato entre a origem e os portais
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Quem consome um dado precisa saber o que pode presumir sobre ele. Sem contrato, qualquer mudança do
produtor pode quebrar o consumidor sem aviso.

## Como funciona

Neste projeto, a palavra aparece em três lugares:

- **Contrato de consumo:** as views de `consumption` são "contratos estáveis de leitura"
  (Arquitetura, §2); o que está por trás pode mudar, a view continua.
- **Contrato do evento:** o livro de estoque só aceita inserções e tem estrutura fixa; é esse contrato
  que torna possível o streaming (Modelo de Dados, §5).
- **Contrato de metadados:** o formato do pacote que a origem publica e o portal lê. Campo novo não
  muda o número do formato; formato diferente faz o portal recusar a build.

## O que não confundir

Um contrato declarado precisa ser conferido para valer: a origem audita as views e testa o evento, e o
portal valida o pacote contra o esquema a cada build.
