# Relatório da verificação local (E3)

| Campo | Valor |
|---|---|
| Data | 17/11/2026 |
| Versão avaliada | gdados `9f33546`, árvore limpa |
| Pacote | `mvp_eng_dados_2` `v2.1.0` (`eb11709`), copiado em 17/11/2026 às 16:26 (Brasília); repetição na `v2.2.0` na §7 |
| Ambiente | Esta máquina; Chrome 156.0.8078.79 via Playwright 1.64.1; Node 24.18.0; build servida localmente com gzip, cache desligado |
| Resultado bruto | [`verificacao/resultados/2026-11-17T20-21-17-148Z.json`](../verificacao/resultados/2026-11-17T20-21-17-148Z.json) |
| Como repetir | [`verificacao/README.md`](../verificacao/README.md) |
| Plano | [PLANO](../PLANO.md), E3 |

Este relatório registra medições locais de uma data, feitas sobre o pacote do commit fixado. Ele não
descreve o estado atual do banco nem do GCP e não é desempenho publicado. A avaliação pelo Owner é a
E4; aprovar este relatório não autoriza a publicação (D04).

## 1. Resumo

As 38 verificações automáticas passaram. Durante a E3, a verificação encontrou e o portal corrigiu
dois problemas: páginas que rolavam na horizontal em telas de 390 px e quadros longos no zoom do grafo
inteiro (§4). A verificação também corrigiu dois defeitos nos seus próprios verificadores antes da
rodada final.

Ficam para a E4: a meta de zoom no grafo inteiro, que é cumprida na mediana mas não em toda rodada
(§3); a exposição de identificadores de projetos GCP e de um prefixo de conta de faturamento nos
textos copiados da origem (§5, item 10); e as verificações que não são automatizáveis, isto é, a
fidelidade conceitual das explicações e a experiência dos percursos (itens 13 e 14).

## 2. Verificações por item da E3

| Item | Verificação | Resultado | Evidência |
|---|---|---|---|
| 1 | Contrato, identificadores e ligações | Passou | Cópia confere os SHA-256 dos 93 arquivos e o pacote valida contra o esquema do mesmo commit; 28 testes de unidade passam; 26.253 links internos e âncoras de `dist/` resolvem; toda relação e toda pergunta do pacote têm página |
| 2 | Caminho real da receita até as duas origens, sem salto fabricado | Passou | `net_revenue_amount` da view da P01 chega a colunas de `raw` e de `raw_legacy`, e as origens recalculadas pelo caminho das folhas são iguais às declaradas e às exibidas; o grafo por relação publicado tem exatamente as arestas agregadas das folhas do pacote, com as mesmas contagens |
| 3 | Estoque e travessias do streaming | Passou | A fato de estoque chega ao lote, ao streaming e ao legado; a travessia do streaming liga só à tabela dela, a do Airbyte liga à camada `raw` sem essa tabela, e nenhuma aparece no grafo por coluna |
| 4 | Coluna gerada e coluna de seed como terminais válidos | Passou | Na página da relação, a coluna de seed e a coluna gerada mostram a etiqueta do tipo de origem, sem marca de ausência |
| 5 | Item em aberto e decisão já tomada | Passou | Todos os itens de `open_items` aparecem com o estado do pacote e "objetos não declarados"; a D66 é ligada à seção dela no documento de pendências da origem |
| 6 | Fidelidade de contagens, métricas e infraestrutura | Passou | As oito contagens da página inicial são iguais às do pacote; cada métrica mostra a aditividade e as colunas do pacote, e cada razão, o `on_zero_denominator`; o `zero_denominator` não é lido; toda entrada de `environments` aparece, e a indisponível está marcada |
| 7 | Busca, filtros, seleção, histórico e links diretos | Passou | A busca acha pergunta, conceito, relação e termo em inglês; o filtro fica na URL e volta com o histórico; links diretos abrem a coluna e o recorte expandido; sem erro ou aviso no console |
| 8 | Legibilidade, teclado, alternativa tabular e telas menores | Passou | O primeiro Tab leva ao atalho para o conteúdo, e o foco é visível; a tabela da linhagem tem uma linha por ligação; 13 páginas representativas sem rolagem horizontal a 390 px |
| 9 | Desempenho com o grafo real | Passou, com ressalva | §3 |
| 10 | Build reproduzível e revisão do que seria publicado | Passou, com achado | Três builds com o mesmo SHA-256 de `dist/` (`5be0916…`); sem chaves, arquivos proibidos ou e-mails reais; identificadores de projetos GCP presentes (§5) |
| 11 | Cobertura de termos na busca | Passou | Os 62 termos do inventário têm explicação do portal e são achados pelo nome em português, pelos identificadores em inglês e pelas siglas |
| 12 | Ligações nos dois sentidos, preservando o recorte | Passou | Exemplos, definições da origem, âncoras e percursos resolvem no pacote fixado; da explicação, o retorno volta ao mesmo recorte expandido da linhagem |
| 13 | Fidelidade das explicações às definições e limitações da origem | Não automatizável | Cada explicação foi conferida pelo autor contra o documento da origem citado, e as correções estão nos commits de 17/11/2026. As divergências entre documentos da origem foram apontadas, não resolvidas (alinhamento, §7). A revisão conceitual é do Owner, na E4 |
| 14 | Percursos locais de leitura | Parcial | Os quatro percursos e as práticas resolvem (item 12). Links quebrados: nenhum. O registro de dúvidas levantadas pelo Owner é da E4 |

## 3. Desempenho (item 9)

Mediana de cinco repetições, com cache desligado. A meta vale com CPU normal; a coluna com CPU 4×
mais lenta registra a margem.

| Medida | Meta | CPU 1× | CPU 4× |
|---|---|---|---|
| Build completa a partir da cópia do pacote | até 60 s | 9,8 s (três builds: 11,53, 9,83, 7,65 s) | — |
| Governança: primeira renderização com conteúdo | até 1,5 s | 224 ms | 312 ms |
| Governança: dados transferidos, comprimidos | até 1 MB | 135 KB | 135 KB |
| Busca: maior tempo por tecla | até 150 ms | 38 ms | 177 ms |
| Página de relação: dados transferidos | até 1 MB | 7 KB | 7 KB |
| Linhagem por relação: recorte inicial desenhado | até 1 s | 283 ms | 892 ms |
| Linhagem: expandir um nível | até 500 ms | 48 ms | 177 ms |
| Grafo inteiro (281 relações e 4 travessias) desenhado com layout | até 3 s | 645 ms | 2,28 s |
| Zoom e deslocamento no grafo inteiro: maior quadro | até 50 ms | 33 ms (rodadas: 100, 67, 33, 33, 33) | 200 ms |
| Zoom e deslocamento no maior recorte por coluna permitido (`analytics.fact_shipment_item`, 78 nós): maior quadro | até 50 ms | 17 ms | 100 ms |
| Estrutura, com o Mermaid: dados transferidos | até 1 MB | 656 KB | 656 KB |
| Conceitos: dados transferidos | até 1 MB | 7 KB | 7 KB |

**Ressalva no zoom do grafo inteiro.** A mediana cumpre a meta, mas duas das cinco rodadas tiveram um
quadro de 67 e de 100 ms. A D02 já registrava que essa meta não era cumprida de forma estável no grafo
inteiro. A E3 reduziu a mediana de 83 para 33–50 ms com duas opções do núcleo do Cytoscape.js, sem
extensão, só na visão geral: textura durante o zoom e rótulos ilegíveis não desenhados (§4). A visão
geral não é a entrada da linhagem (D02, condição 1). Cabe ao Owner, na E4, aceitar o resultado ou
ajustar a meta.

**Margem com CPU 4×.** A busca passa de 150 ms por tecla (177 ms), e o zoom passa de 50 ms nos dois
grafos. Pelo plano, a CPU 4× registra margem e não é a meta.

## 4. Correções feitas durante a E3

| Achado | Correção | Commit |
|---|---|---|
| Métricas e documentos da origem rolavam na horizontal a 390 px: fichas em grade sem encolher a coluna do valor e tabelas do Markdown fora de área rolável | Coluna de valor com largura mínima zero e quebra de texto longo; tabelas dos textos da origem roláveis dentro do próprio bloco | `42cbb01` |
| Zoom do grafo inteiro com quadros de 83 ms de mediana | Na visão geral, textura durante zoom e deslocamento e ligações ocultas enquanto a área se move (`42cbb01`); rótulos abaixo de 8 px na tela não desenhados (`9f33546`) | `42cbb01`, `9f33546` |
| A medição precisava de marcas que o portal não tinha | Marcas da Performance API na busca, na linhagem e no diagrama, sem mudar o comportamento | `a25e327` |

Antes da rodada final, também foram corrigidos dois defeitos dos verificadores. Um tratava como
quebrados os links relativos válidos das explicações. O outro recortava a linha da coluna até uma
tabela aninhada, o que podia dar falso positivo no item 4.

## 5. Achados para decisão

**Item 10: identificadores de GCP nos textos copiados da origem.** A D03 já previa revisar esse
ponto antes de publicar. Os arquivos lidos por commit trazem, em `dist/`:

| Identificador | Onde |
|---|---|
| `mvp-ed1-gcp` (projeto da fase GCP) | Registro da fase GCP, Capacidade e Recuperação, `terraform.tfvars.example` |
| `mvp-ed1-estudo` | Registro da fase GCP, Capacidade e Recuperação |
| `analisador-de-risco`, `da-voz-ao-produto`, `customer-care-prod` (projetos sem relação com o projeto de dados, citados ao explicar a conta de faturamento) | Registro da fase GCP |
| Prefixo truncado de uma conta de faturamento (`0199D3-…`) | Registro da fase GCP |

O portal não decide se isso pode ser publicado. As alternativas são publicar como está, retirar esses
documentos da lista de cópia ou pedir à origem uma versão sanitizada. A decisão volta ao Owner com a
D04, na E5.

## 6. Limites desta verificação

- Medições locais, nesta máquina, sem limitação de rede, só no Chrome. Firefox e Safari não foram
  verificados.
- O teclado foi verificado no atalho para o conteúdo e no foco visível. Leitor de tela, contraste e o
  tema escuro não foram verificados, e nenhuma auditoria automática de acessibilidade foi rodada.
- O item 8 verificou 13 páginas representativas a 390 px, não todas as 474.
- A fidelidade é ao pacote do commit fixado. Quando a tag nova da origem for fixada (D03), a
  verificação deve ser repetida; a repetição na `v2.2.0` está na §7.
- Testes automatizados conferem estrutura, ligações e fidelidade; não provam a compreensão do leitor
  (página de conceitos §8).

## 7. Repetição na `v2.2.0` (18/11/2026)

| Campo | Valor |
|---|---|
| Versão avaliada | gdados `ea70367`, árvore limpa |
| Pacote | `mvp_eng_dados_2` `v2.2.0` (`f5a5173`), 94 arquivos conferidos |
| Ambiente | O mesmo da §1: Chrome 156.0.8078.79, Node 24.18.0, cinco repetições por medida |
| Resultado bruto | [`verificacao/resultados/2026-11-19T00-45-06-228Z.json`](../verificacao/resultados/2026-11-19T00-45-06-228Z.json) |

**As 39 verificações automáticas passaram** (a 39ª é a da D04, acrescentada depois da §1). Uma rodada
anterior, com a árvore ainda suja, achou a página de estrutura com 439 px a 390 px de largura: o
seletor do diagrama entidade-relacionamento, novo, se alargava pela opção mais longa. Corrigido em
`ea70367` antes desta rodada. O resultado da rodada suja não foi guardado.

Destaques, mediana com CPU normal: build em 6,0 s; 35 testes de unidade; 27.100 links e âncoras de
`dist/` resolvem; as 282 relações e as 16 perguntas têm página; três builds com o mesmo SHA-256 de
`dist/` (`a9fd8bc…`); nenhum identificador mascarado pela D04 em `dist/`. Governança com primeira
renderização em 188 ms e 141 KB; busca em até 55 ms por tecla; recorte da linhagem em 247 ms;
grafo inteiro em 566 ms; estrutura, agora com dois diagramas Mermaid, em 671 KB comprimidos.

**Zoom no grafo inteiro:** mediana de 50 ms, no limite da meta (rodadas: 33, 50, 50, 50,1 e 50 ms).
Em 18/11/2026, depois desta rodada, o Owner afrouxou a meta da visão geral para 100 ms
(E4.4), o que encerra a ressalva da §3; os recortes continuam com 50 ms. Com CPU 4× mais lenta, a busca chega a 153 ms por tecla e o zoom
a 150 ms, como margem, não meta.

O diagrama entidade-relacionamento não tem meta própria na E3; foi conferido no Chrome nesta data (recorte
padrão, recorte de `analytics.dim_date`, modelo inteiro e link direto `?er=`), sem erro no console.

## 8. Repetição na `v2.3.0` (19/11/2026)

| Campo | Valor |
|---|---|
| Versão avaliada | gdados `d64cf8e`; a árvore tinha só documentos de `docs/` e da raiz sem commit, fora da build |
| Pacote | `mvp_eng_dados_2` `v2.3.0` (`2bceb47`), 97 arquivos conferidos, com as amostras de registros da D06 |
| Ambiente | O mesmo da §1: Node 24.18.0, cinco repetições por medida |
| Resultado bruto | [`verificacao/resultados/2026-11-19T22-16-09-476Z.json`](../verificacao/resultados/2026-11-19T22-16-09-476Z.json) |

**As 39 verificações automáticas passaram.** Uma rodada anterior foi interrompida por esta sessão,
sem resultado guardado, porque `limitacoes.yml` mudou durante as builds.

Destaques, mediana com CPU normal: build em 6,2 s; 46 testes de unidade; 31.794 links e âncoras de
`dist/` resolvem; as 283 relações e as 16 perguntas têm página; três builds com o mesmo SHA-256 de
`dist/` (`a102960…`); nenhum identificador mascarado pela D04 em `dist/`, nenhum e-mail fora dos
domínios de exemplo. Governança com primeira renderização em 220 ms e 142 KB; busca em até 59 ms
por tecla; recorte da linhagem em 254 ms; grafo inteiro em 564 ms, zoom em 50 ms (meta de 100 ms).
A página de relação medida tem 7,8 KB; com as amostras, a maior página de relação de `dist/`
(`trusted.legacy_eligible_records`) tem 22 KB comprimida [medido fora da verificação, com gzip].

## 9. Repetição depois da frente de layout (20/11/2026)

| Campo | Valor |
|---|---|
| Versão avaliada | gdados `a291c18` com a rodada 11 ainda sem commit (o resultado registra `arvore_limpa: false`); a mesma árvore entrou em `3d1ed3c` e `764ff0a` |
| Pacote | `mvp_eng_dados_2` `v2.3.0` (`2bceb47`), com as amostras da D06 e o catálogo de falhas do legado copiado do mesmo commit |
| Ambiente | O mesmo da §1: Node 24.18.0, cinco repetições por medida |
| Resultado bruto | [`verificacao/resultados/2026-11-20T02-46-16-204Z.json`](../verificacao/resultados/2026-11-20T02-46-16-204Z.json) |

**As 81 verificações automáticas passaram.** São 42 a mais que na §8. Cada rodada da
[frente de layout](layout.md#6-rodadas) acrescentou as suas, e o registro de cada uma está lá:
mapas, percursos, estrelas, legado, linhas reais, tema, mapa de calor, lado a lado e trilha.
Também passaram 105 testes de unidade.

Medidas com CPU normal, mediana: primeira renderização da pergunta em 216 ms, do legado em 220 ms e
do catálogo em 272 ms; catálogo com 148 KB; busca em até 53 ms por tecla; recorte da linhagem em
337 ms e expansão em 57 ms; grafo inteiro em 799 ms, com quadro de zoom de até 50 ms; a página de
relação medida tem 13,6 KB e a de estrutura, a maior, 680 KB, por causa do Mermaid (meta de 1 MB).
