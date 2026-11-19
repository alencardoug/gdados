---
resumo: >-
  Uma chave identifica cada linha de uma tabela. A chave natural vem do sistema de origem; a chave
  substituta é criada pelo armazém. A chave primária identifica a linha, e a estrangeira aponta para
  a linha de outra tabela.
exemplos:
  - tipo: coluna
    ref: analytics.dim_brand.brand_natural_key
    nota: a chave natural, como a origem a numera
  - tipo: coluna
    ref: analytics.dim_brand.brand_key
    nota: a chave substituta, calculada a partir do sistema de origem e do identificador
  - tipo: coluna
    ref: trusted.customers.source_system
    nota: o sistema de origem faz parte da identidade
  - tipo: relacao
    ref: analytics.dim_date
    nota: uma dimensão referenciada pelas chaves estrangeiras de várias fatos
  - tipo: pagina
    ref: "estrutura/#entidades"
    nota: o diagrama gerado das chaves primárias e estrangeiras do pacote
fontes: []
revisado_em: "2026-11-18"
---

## Qual problema resolve

Sem uma chave confiável não há como juntar tabelas, nem garantir que uma linha não se repete. Quando
duas origens são empilhadas, a chave natural sozinha deixa de bastar.

## Como funciona

- **Chave natural:** o identificador do sistema de origem, como o número que o banco transacional dá
  a uma marca.
- **Chave substituta:** um identificador técnico gerado no armazém, independente da origem. Ela
  permite, por exemplo, que uma dimensão com histórico tenha várias linhas para a mesma entidade
  ([SCD](../scd/)).
- **Chave primária e estrangeira:** a primária identifica a linha; a estrangeira guarda a chave de
  outra tabela e declara o relacionamento entre as duas.

## O que não confundir

Neste projeto, as duas origens numeram as entidades a partir de 1, e o mesmo número em sistemas
diferentes é outro registro. Por isso o sistema de origem (`source_system`) entra em toda chave e em
toda junção, como diz a descrição da própria coluna.

## Escolha e limites do projeto

A origem declara chaves primárias e estrangeiras só em `analytics` e as instala no banco a cada
execução (ADR-0056 da origem). O pacote as traz em cada relação, e a página da relação mostra a chave
primária, as estrangeiras e quem a referencia. Nas outras camadas, os testes `relationships` conferem
que o valor existe na outra tabela, mas não correspondem a uma chave instalada. As ligações estão no
diagrama entidade-relacionamento da página de estrutura (ver os exemplos acima).
