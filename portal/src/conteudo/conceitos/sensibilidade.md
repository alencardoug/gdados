---
resumo: >-
  A classificação de sensibilidade dá a cada coluna um nível que diz o que aquele dado seria se
  fosse real: público, interno, confidencial ou pessoal. Ela não decide, sozinha, quem pode ler a coluna.
exemplos:
  - tipo: coluna
    ref: analytics.dim_customer.customer_full_name
    nota: uma coluna pessoal; compare com os papéis com leitura da relação
  - tipo: relacao
    ref: consumption.monthly_revenue_by_channel_and_category
    nota: uma view de consumo; os papéis com leitura estão na ficha
  - tipo: pagina
    ref: "governanca/#catalogo"
    nota: o filtro por sensibilidade do catálogo
divergencias:
  - texto: >-
      O Glossário Técnico define a classificação como o nível "que determina como ele pode ser
      exposto". A Política de Governança, §4, diz que "classificar não é expor": o nível não decide
      quem vê o campo, e a exposição é decidida por concessão de acesso, conforme a ADR-0049 da origem.
    fontes:
      - "docs/glossario.md"
      - "docs/governanca_de_dados.md#4-classificação-de-sensibilidade"
    encaminhamento: Encaminhado à origem pelo gdados em 17/11/2026; a origem decide qual texto corrigir.
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Para proteger um dado, primeiro é preciso saber que ele precisa de proteção. A classificação marca
cada coluna uma vez, no lugar onde ela é declarada, e permite verificar automaticamente que nenhuma
ficou sem nível.

## Como funciona

A Política de Governança da origem define os quatro níveis (`public`, `internal`, `confidential` e
`personal`) e exige que toda coluna de toda camada tenha exatamente um. O nível é declarado uma vez,
nas colunas do banco de origem, e derivado para as demais colunas pela [linhagem](../linhagem/): uma
coluna que vem de várias recebe o nível mais restritivo entre elas. Quem discorda do nível derivado
declara outro com o motivo (`sensitivity_reason`), que o catálogo mostra. Um teste da origem confere a
cobertura. Todos os dados do projeto são sintéticos, mas a classificação vale como se fossem reais,
para exercitar o controle.

## O que não confundir

- **Classificar e expor.** O nível descreve o dado. Quem pode ler cada relação é decidido pelos
  papéis com leitura (`grants_select`), mostrados na página de cada relação. O portal não deduz
  permissão a partir da sensibilidade.
- **Sensibilidade e qualidade.** Uma coluna confidencial não é mais confiável nem mais importante que
  uma pública; o nível só fala do risco de exposição.

## Como aparece neste projeto

Cada coluna do catálogo mostra o nível e, quando a origem o declara, o motivo. Na fase GCP, a origem
transformava a classificação em *policy tags* do BigQuery, ligadas ao controle de acesso.
