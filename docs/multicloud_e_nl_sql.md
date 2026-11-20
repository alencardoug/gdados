# Paridade multicloud e o nl_sql — direção anotada em 20/11/2026

Dono documental da direção multicloud do portal e da relação do gdados com o `nl_sql`. É anotação de
rumo, não autorização para implementar: as páginas dependem de as plataformas existirem e do "pode
fazer" do Owner. As regras gerais continuam no [AGENTS.md](../AGENTS.md), nas
[decisões](decisoes.md) e no [PLANO](../PLANO.md).

## 1. Pedido do Owner (20/11/2026)

> Mais adiante, quando implementar databricks, aws e snowflake (nesta ordem) vou querer criar páginas
> que também mostrem a paridade do que 'dá pra entrar nas clouds', com foco em favorecer o nl-sql (o
> outro projeto). Assim é possível ver quais tipos de conteúdo conseguem entrar na nuvem e favorecer
> o processamento de dados.

Ordem das plataformas: **Databricks → AWS → Snowflake**. O `nl_sql` registra, em 14/11/2026 (Q14), a
ordem Databricks → AWS → GCP para as medições dele; a inclusão do Snowflake e o lugar do GCP nessa
sequência ficam para o Owner alinhar entre os projetos.

## 2. Os três projetos e o fluxo

| Projeto | Papel | O que entrega aos outros |
|---|---|---|
| `mvp_eng_dados_2` (origem) | Produz o dado e declara os metadados | Pacote de metadados versionado por *tag* (hoje `v2.3.0`, `2bceb47`), amostras mascaradas (D06), documentos, Terraform e docker-compose |
| `gdados` (este portal) | Lê o pacote por commit fixado, deriva, confere e mostra | Páginas e verificações que provam que cada número e ligação publicados saem do pacote |
| `nl_sql` (`/home/doug/Projetos/data/nl_sql`) | Banco de provas NL→SQL: mede *Execution Accuracy* por plataforma, numa escada de governança C0→C3 (o contexto que cada produto lê) | Contrato de perguntas, gabarito, canônico de governança e renderizadores por plataforma |

Direção recomendada: o contexto que o `nl_sql` oferece às ferramentas sai do **mesmo pacote fixado
da origem**, lido por *tag*, e não do HTML do gdados. O gdados mostra e confere esse pacote; nas
páginas multicloud, mostrará também o que cada plataforma consegue receber dele.

## 3. O que já existe e serve ao nl_sql

O `nl_sql` registra, no estado de 14/11/2026, o que falta no canônico de governança: "grão e uso das
tabelas, regras das colunas com as correções do C0, glossário, regras globais, inglês das descrições
e renderizadores". Boa parte disso o pacote já declara, e o gdados já mostra e confere:

| Necessidade de contexto NL→SQL | Onde está no pacote | Onde o gdados usa e confere |
|---|---|---|
| Grão e uso de cada tabela | `relations.*.grain`, a descrição e `view_rules.*.grain` | Cartão da relação; percurso da pergunta (rodadas 1 e 3) |
| Junções válidas | `relations.*.foreign_keys` e `primary_key` | Esquema estrela por fato e da pergunta; diagrama ER (rodadas 4 e 5) |
| Métricas e regras de cálculo | `metrics`, `view_rules`, `on_zero_denominator` | Página de métricas; "Como se forma" no percurso (rodada 4) |
| Pergunta de negócio ↔ view, medidas e dimensões | `questions` (P01–P16, `measures`, `dimensions`) | Percurso da pergunta e estrela da pergunta (rodadas 3 a 5) |
| Glossário | Glossários da origem, citados literalmente no inventário de 62 termos | Páginas de conceito, com linhas reais (rodada 7) |
| Classificação das colunas | `columns.*.sensitivity` | Mapa de calor e legenda da ficha (rodadas 2 e 9) |
| De onde vem cada número | `lineage.*.columns.*.leaves` | Linhagem, minimapa e percurso (rodadas 1 a 4) |
| Valores reais de exemplo | Amostras mascaradas (D06) | Ficha, legado e conceitos (rodadas 5 a 7) |
| Qualidade e testes | `tests` e o catálogo de falhas do legado | Mapa de calor e qualidade do legado (rodadas 6 e 9) |
| Paridade de ambientes | Arquitetura §5 (mapa de paridade), Terraform, compose | Local e GCP lado a lado (rodada 10) |

A classificação de sensibilidade é insumo, não decisão: o que uma ferramenta NL→SQL pode ler é
decisão do `nl_sql` e do Owner, com os papéis de acesso declarados na origem (`meta.grants`).

## 4. As páginas multicloud futuras

- **Base:** o lado a lado da rodada 10 (hoje local ↔ GCP, pelo mapa da origem), com uma coluna por
  plataforma: GCP, Databricks, AWS e Snowflake.
- **Linhas pelo tipo de conteúdo que entra e que o NL→SQL lê:** tabela; view; chave primária e
  estrangeira, declarada ou aplicada; descrição de tabela e de coluna; glossário e termos; métrica e
  camada semântica; classificação, *tags* e máscara; linhagem; valores de exemplo; perguntas de
  exemplo.
- **Fonte de cada célula:** o que um projeto declara em artefato versionado, como os renderizadores
  por plataforma do `nl_sql`, o Terraform ou um registro datado, com o mesmo vocabulário do portal:
  declarado, medido em data ou indisponível. Nada preenchido de conhecimento geral sobre a
  plataforma.
- **O foco que o Owner pediu:** "dá para entrar?", "o produto NL→SQL da plataforma lê?" e, quando o
  `nl_sql` medir, o resultado por cenário C0–C3 ao lado.
- **Pré-requisito:** um artefato versionado do `nl_sql` (por exemplo, resultado por plataforma e
  cenário, e o que cada renderizador escreve), lido por commit como o pacote da origem. O formato
  ainda precisa ser combinado.

## 5. Como a organização do gdados pode favorecer o nl_sql

Recomendações, para o `nl_sql` avaliar pelas regras dele:

1. **Fonte única e fixada.** Ler o pacote da origem por *tag*, como o gdados faz (D03), e registrar a
   *tag* em cada medição. Hoje o gdados está na `v2.3.0` e o `nl_sql` na `v2.1.0`.
2. **Derivar antes de redigir.** Gerar do pacote o que o pacote já declara (grão, chaves, métricas,
   descrições, glossário) e redigir à mão só o que falta, como o inglês das descrições, registrando a
   diferença.
3. **Conferência independente.** Assim como o gdados confere o HTML publicado contra o pacote sem
   usar o próprio código, cada renderizador do `nl_sql` pode ter um teste que relê a fonte e confere o
   que foi escrito na plataforma.
4. **Declarado, medido e indisponível.** Separar, em cada resultado, o que foi declarado, o que foi
   medido em data e o que não pôde ser medido, como o portal faz.
5. **Um artefato derivado do gdados, se o Owner quiser.** O build poderia publicar um JSON de
   "contexto semântico" (relação → grão, chaves, FKs, colunas com classificação e descrição;
   pergunta → view, medidas e dimensões), conferido pela E3. É proposta: depende do Owner e não deve
   competir com a leitura direta do pacote.

## 6. Pendências e avisos

- Avisos deixados em 20/11/2026 no `alinhamento.md` da origem e do `nl_sql`, a pedido do Owner.
- Para o Owner decidir, quando chegar a hora:
  1. o `nl_sql` lê o pacote direto da origem (recomendado) ou um JSON do gdados;
  2. as páginas multicloud entram já com o declarado ou só quando houver medição;
  3. a ordem combinada entre os projetos (Databricks → AWS → Snowflake aqui; Databricks → AWS → GCP
     no `nl_sql`).
