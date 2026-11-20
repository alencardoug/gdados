# Layout do portal — frente de 19/11/2026

Dono documental da frente de layout: o pedido do Owner, os papéis, as restrições que valem e as
rodadas entre quem constrói e quem critica. As regras gerais continuam nos seus donos
([AGENTS.md](../AGENTS.md), [decisões](decisoes.md), [PLANO](../PLANO.md)); aqui só se aponta para elas.

## 1. Pedido do Owner (19/11/2026)

> Quero recursos poderosos, esquemas, diagramas com códigos robustos, ilustrações que tornem esta
> navegação interessante e facilitada de compreender. Quanto mais interessante, melhor. Atentar que
> este é um tema chato e difícil, então quanto mais conseguir deixar interessante via ilustrações,
> melhor (não figuras, nada de adicionar figuras; construa esquemas etc.).

Leitura: o objetivo é **compreensão**, e o meio é o **esquema gerado por código** a partir dos
artefatos (pacote, amostras, textos da origem). Imagem estática não entra (regra de diagramas do
AGENTS.md). O Owner está começando em engenharia de dados: o layout deve ensinar enquanto se
navega.

## 2. Papéis

| Quem | Papel |
|---|---|
| **Codex** (a sessão `codex`, não a `codex2`) | **Constrói** o layout: propõe, implementa no `portal/`, valida localmente |
| **Claude** (continuidade pela sessão `claude2`) | **Critica e enriquece o conceito**: avalia a ideia, aponta o que confunde, sugere esquemas mais fortes, aprofunda as oportunidades. **Não** revisa linha a linha nem escreve o layout: indica que o Codex construa. Faz a interface com o Owner |
| **Owner** | Decide. Aceita, em geral, a alternativa recomendada (memória `forma-de-trabalho-do-owner`); dependência nova pede o "sim" explícito dele |

**Canal (Owner, 19/11/2026):** o Claude envia o prompt ao Codex pela CLI (`codex exec`, conta
padrão, modelo `gpt-6.2-astra`, esforço `xhigh`) e lê só a resposta final, sem o diff; o Owner não
repassa nada. O Codex registra cada rodada na §6 e o Claude responde logo abaixo. Se a conta do
`codex` atingir o limite de uso, a rodada segue no `codex2` (Owner, 19/11/2026).

**Mudança de papéis (Owner, 19/11/2026, depois da rodada 5):** "daqui em diante, siga o
desenvolvimento, sem mais codex por hora". O Claude passa a construir e validar as rodadas
seguintes; a crítica continua registrada na §6, e o Codex volta só quando o Owner pedir.

## 3. Restrições que já valem (apontadores)

- Diagramas por código ou dados declarativos, relações derivadas dos artefatos responsáveis,
  **alternativa textual ou tabular** a toda visualização (AGENTS.md, "Diagramas").
- Bibliotecas adotadas: Astro (D01), Mermaid e Cytoscape.js (D02). **Qualquer outra (D3, ELK, uma
  biblioteca de animação, uma fonte externa) é dependência nova e pede decisão do Owner** antes.
  SVG gerado no build por componente Astro não precisa de dependência.
- Metas da E3 ([relatório](relatorio_e3.md), [PLANO](../PLANO.md) E3): primeira renderização
  ≤ 1500 ms, ≤ 1 MB por página, busca ≤ 150 ms por tecla, zoom ≤ 100 ms no grafo inteiro e ≤ 50 ms nos
  recortes, 390 px sem rolagem horizontal da página, teclado e foco visível, console sem erro. A
  verificação em `verificacao/` tem de continuar passando (hoje 39 de 39).
- Fidelidade (AGENTS.md, "Fontes e evidências"): não inventar contagem nem ligação; distinguir
  declarado, medido e verificado; `null` como ausente; rodapé de procedência em toda página;
  classificação de sensibilidade não vira decisão de exposição; seed e coluna gerada não são quebra
  de linhagem.
- Português na interface; tema claro e escuro (variáveis em `portal/src/styles/portal.css`).
- Publicação só pelo push no `main` (D04): **todo push publica**, então só com o "pode" do Owner.

## 4. O que existe hoje (19/11/2026)

Layout sóbrio, de documento: `portal/src/layouts/Base.astro` (topo com três seções e rodapé de
procedência) e um CSS de ~150 linhas. Páginas: início; governança (catálogo, relação, pergunta,
métricas, linhagem em Cytoscape, estado e evidência); estrutura e ambientes (Mermaid dos documentos
da origem, diagrama entidade-relacionamento); conceitos (62 termos, percursos, roteiro em degraus,
limitações); arquivos da origem; procedência. Desde a `v2.3.0` cada relação traz uma **amostra de
registros** real, com o campo pessoal mascarado (D06), o que abre exemplos concretos para os esquemas.

Pontos fracos já vistos na página da relação: ela é longa e sem navegação interna; a tabela da
amostra é larga (16 ou mais colunas, JSON aberto por clique); nas relações sem chave declarada, a
frase "na ordem da chave" lista todas as colunas.

## 5. Ideias de partida para a crítica (Claude, 19/11/2026)

Sementes para discutir com o Codex, não especificação. Todas derivam de dados que o pacote ou as
amostras já trazem.

1. **Mapa das camadas como linha de metrô.** `raw → staging → trusted → analytics → consumption`
   (mais `raw_legacy`, `snapshots`, `quarantine`, `governance`) como faixas, com a contagem de
   relações declarada no pacote. Em cada página de relação, um **minimapa "você está aqui"** com
   insumos e consumidores imediatos.
2. **Da pergunta à origem, em passos.** Para cada pergunta (P01…P16), uma narrativa rolável: a view,
   cada transformação, até `raw`/`raw_legacy`, com a linhagem por coluna destacando a coluna da
   métrica. O grafo Cytoscape já existe; falta o **roteiro guiado** por cima dele.
3. **Ficha da relação em blocos.** Cabeçalho tipo "cartão de identidade" (camada, grão, chave,
   responsável, sensibilidade); navegação por âncoras ou abas; a **composição de sensibilidade**
   (public/internal/confidential/personal) como barra; amostra com primeira coluna fixa e JSON como
   árvore recolhível.
4. **Conceitos explicados com o dado real.** As amostras permitem ilustrar com linhas verdadeiras:
   *grão* (uma linha = uma remessa), *chave substituta* versus natural, *snapshot*/SCD (a mesma
   entidade em versões), *membro desconhecido*, *nulo com significado*. É o que tira o tema do
   abstrato.
5. **O legado defeituoso, antes e depois.** `original_payload` × `cleaned_payload` × `findings` como
   comparação lado a lado, com o defeito marcado (ex.: `TEXT_DELIMITER` em
   `raw_legacy.support_agents`, linha 2). Ensina qualidade de dados melhor que qualquer texto.
6. **Esquema estrela centrado na fato.** Do diagrama entidade-relacionamento, uma vista que põe uma
   `fact_*` no centro e as dimensões em volta, com as chaves declaradas (27 PKs, 60 FKs em
   `analytics`).
7. **Local ↔ GCP lado a lado.** Dois diagramas de arquitetura com o mesmo esqueleto, gerados dos
   arquivos declarativos copiados (docker-compose, Terraform), com o estado de cada evidência
   (declarado, medido em data, indisponível).
8. **Mapa de calor de sensibilidade e de testes** por camada: onde está o dado pessoal, onde estão
   os testes, onde a máscara atua.
9. **Roteiro de aprendizado como trilha visual**, com degraus e o que cada um desbloqueia.

**Lentes da crítica**: o esquema ensina algo que o texto não ensina? Deriva de artefato, ou alguém
desenhou à mão? Tem alternativa textual? Cabe nas metas? Distingue declarado de medido? Fica bonito
*e* legível em 390 px e no tema escuro? É interessante para quem está começando?

## 6. Rodadas

Cada rodada: data, proposta do Codex (ou apontador para o commit), crítica do Claude, decisão do
Owner.

### Rodada 1 — Orientação no pipeline · 19/11/2026

**Proposta e construção do Codex.** Conectar o mapa da página inicial à pergunta que surge ao abrir
uma relação do catálogo: onde ela está e de quem recebe ou para quem fornece valores? Implementação
em `86d3afe`, com verificações de regressão em `b5ceba4`. Os esquemas são HTML gerado pelo Astro
no build, com listas, links e controles nativos.

| Onde | Como ler | Evidência da origem fixada na v2.3.0 |
|---|---|---|
| Mapa no início | Cada estação informa função, nome e quantidade e abre o catálogo filtrado. A lista oferece a leitura por texto. As duas entradas, principal e legada, dividem uma estação. Rejeições, histórico e auditoria aparecem em uma faixa própria. | Funções da Arquitetura §2. Contagens calculadas de `relations.*.schema`. |
| Minimapa nas fichas | A camada atual recebe o rótulo “Você está aqui”. As setas seguem o sentido dos valores. Até três vizinhos ficam abertos de cada lado e os demais têm expansão por teclado. A tabela lista todos os insumos e consumidores com o número de ligações entre colunas. | Ligações imediatas agregadas de `lineage.relations.*.columns.*.leaves`. Uma junção ou um filtro pode ficar fora dessa linhagem. |
| Identidade e amostra | A ficha reúne camada, grão, chave primária, responsável e composição de sensibilidade. A legenda numérica acompanha a barra. As âncoras levam, entre outros destinos, aos papéis com leitura e à amostra. A primeira coluna permanece visível durante a rolagem interna e cada ramo JSON abre por demanda. | `relations` e, quando identificado como grão de agregação da view, `view_rules.*.grain`. Sensibilidade vem de cada coluna. A ordem, as linhas e a máscara vêm da exportação de amostras da D06. |

Na amostra, o texto menciona chave primária somente quando as colunas de ordenação coincidem, na
mesma sequência, com a chave declarada. Nos demais casos, informa as colunas de ordenação ou diz
que a origem usou todas as colunas na sequência da tabela. A prioridade dos defeitos do legado
continua explícita. Os quatro componentes herdados da tentativa interrompida foram reescritos e
integrados. As ideias 2 e 4 a 9 da §5 ficam fora desta rodada.

**Verificação local.** O pacote `2bceb47` passou pela validação de seus 97 arquivos. Os 46 testes
de unidade passaram. Três builds das 479 páginas produziram o mesmo SHA-256 de `dist/`
(`64b6fa81008e130ae79dc81d30d99137557e16f3cd73c28f58916b1c75cb08da`). Passaram os 20 testes
estáticos, inclusive os quatro novos. Foram conferidos 37.285 links e âncoras e as 469 ligações
imediatas nas 283 fichas. Em gzip nível 6, o maior HTML do portal tem 100.700 bytes
(`registro_fase_gcp.md`). Entre as páginas alteradas, a maior é a ficha de
`trusted.legacy_eligible_records`, com 26.652 bytes somando o HTML e o CSS.

Em Firefox 158.0.1, a inicial e as 283 fichas foram abertas como arquivos locais com o CSS do
build, em 390 px, no tema claro e no escuro. Nas 284 páginas por tema houve zero excesso de largura
e zero erro ou aviso da página. As 280 tabelas que precisaram de rolagem mantiveram a primeira
coluna fixa. Em 123 fichas, um JSON abriu e fechou. A leitura do HTML também conferiu as 20.617
células da exportação, inclusive objetos, listas, nulos e máscaras. A janela sem interface do
Firefox não recebeu foco do sistema. O foco programático selecionou a tabela, mas a indicação
visual de foco não pôde ser confirmada.

A E3 completa tem agora 44 verificações. As 24 anteriores ao navegador passaram. O ambiente
recusou a abertura do servidor local em `127.0.0.1:4321` com `EPERM` e a inicialização do
Chrome também falhou. Permanecem pendentes as 20 verificações de navegador da E3, inclusive o
novo teste com Tab e Enter, o foco visível, a medição HTTP das transferências e os tempos de
renderização, busca e zoom.

**Pergunta ao Owner.** Ao abrir `raw_legacy.support_agents`, você consegue encontrar uma relação
que recebe valores dela usando só a ficha?

**Integração e verificação pelo Claude.** O sandbox do Codex (`workspace-write`) deixou o `.git`
somente leitura e bloqueou servidor e Chrome. O bundle foi conferido (árvore idêntica à de trabalho)
e os três commits entraram no `main`. A E3 completa rodou em 19/11/2026 nesta máquina: **44 de 44**
([resultado](../verificacao/resultados/2026-11-19T22-54-50-785Z.json)), inclusive teclado e foco
visível, 390 px, tempos e transferência. Nas próximas rodadas o canal segue assim: o Codex entrega
o bundle e as verificações estáticas, e o Claude integra e roda as de navegador.

**Crítica do Claude (conceito, a partir das telas em 1280 e 390 px).**

O que funciona: o cartão de identidade resume a relação em um olhar e mostra a ausência como
ausência; o bloco "fornecem → em foco → recebem" responde de imediato à pergunta do Codex (sim: os
três consumidores de `raw_legacy.support_agents` estão na ficha, sem abrir o grafo); no celular o
mapa vira linha vertical e o fluxo vira coluna, sem perder sentido.

O que ainda não ensina:

1. **O minimapa repete o mapa da inicial e só acende um ponto.** "Você está aqui" sem os vizinhos
   no próprio mapa diz pouco; o leitor tem de cruzar dois blocos. Fundir: no mapa da ficha, marcar
   também as camadas dos insumos e consumidores (ex.: "staging · 1 recebe", "trusted · 2 recebem"),
   com o trecho percorrido aceso, numa faixa compacta. "Outras funções" só aparece na ficha se a
   relação ou um vizinho estiver lá.
2. **O mapa da inicial é uma linha do tempo, não um fluxo.** Os trechos entre estações são iguais e
   não carregam nada; `raw_legacy` e as "outras funções" ficam soltos. O que flui deve estar no
   traço: o número de relações (ou de ligações) de cada camada para a seguinte, derivado da
   linhagem, e os ramais de `quarantine`, `snapshots` e `governance` presos à camada de onde recebem.
   Onde a linhagem não informa, dizer que não informa.
3. **Ruído da fidelidade.** Na ficha de `raw_legacy.support_agents`, "não declarado no pacote"
   aparece em toda célula da coluna Tipo. Quando a coluna inteira é ausente, dizer uma vez no
   cabeçalho; repetir não acrescenta informação.
4. **Nomes quebrados no meio** ("fact_inventory_movemen / t", "aggregate_v / ersion"). Quebrar só
   depois de `.` e `_`.
5. **A legenda de sensibilidade pode ensinar.** Clicar em "personal 3" destacando as três colunas
   na tabela liga a barra ao dado, sem virar decisão de exposição.

Recomendação para a rodada 2: refinar a orientação nesses cinco pontos (o mapa vira fluxo), antes de
abrir ideias novas. A rodada 3 abre "da pergunta à origem" (ideia 2), que pode reaproveitar o mapa
para acender as estações percorridas por uma pergunta, e o esquema estrela (ideia 6).

Decisão do Owner: (pendente)

### Rodada 2 — A orientação vira fluxo · 19/11/2026

**Construção do Codex.** A inicial responde “entre quais camadas passam valores?” e a ficha
responde “quem fornece valores a esta relação e quem os recebe?”. Os dois mapas são HTML e CSS
gerados no build do Astro. A rodada usa o pacote `v2.3.0` da origem, commit `2bceb47`.

| Ponto | O que o leitor encontra | Artefato e leitura em texto |
|---|---|---|
| Minimapa da ficha | Uma só faixa reúne “Você está aqui”, os trechos ativos e os nomes dos vizinhos agrupados por camada e sentido. Em `raw_legacy.support_agents`, uma relação de `staging` e duas de `trusted` recebem valores. “Outras funções” acompanha apenas as camadas desse grupo que participam da ficha. | Vizinhos imediatos de `lineage.relations.*.columns.*.leaves`, agrupados pelo `schema` de cada relação. A lista nomeia os vizinhos e a tabela detalha o número de ligações entre colunas de cada par. |
| Mapa da inicial | Cada seta traz a contagem de pares dirigidos de relações. O legado entrega a `staging` e diretamente a `trusted`. De `trusted` saem ramais para `quarantine` e `snapshots`. A linhagem mostra saídas de `governance` para `staging` e `trusted` e deixa sua entrada sem informação. | As mesmas folhas e o mesmo `schema` sustentam o mapa e a tabela completa. Cada par fornecedor–consumidor conta uma vez, qualquer que seja o número de colunas envolvidas. Saltos, retornos e pares internos aparecem com origem, destino e contagem ao lado da linha principal. |
| Avisos de ausência | O cabeçalho reúne o que vale para a tabela inteira, como tipo ausente ou “cada coluna é origem”. Uma ausência parcial continua na linha correspondente. O mesmo critério reúne referências ou resultados inteiramente ausentes na tabela de testes. | Campos de `relations.*.columns`, `lineage`, `description_gaps` e `tests`. Em 240 fichas, uma nota informa a falta de tipo em todas as colunas. |
| Identificadores | Cartão, relação em foco, vizinhos e tabelas oferecem quebras após ponto ou sublinhado. As âncoras e o texto copiável conservam o nome integral. | Identificadores de relações, colunas, testes e chaves usados nos próprios links e tabelas. Cada segmento fica inteiro em uma linha. |
| Sensibilidade | Clique ou Enter na legenda leva à primeira coluna da classe e destaca todas as correspondentes. “Limpar destaque” devolve o foco à legenda. | A barra, as contagens e as linhas usam `relations.*.columns.*.sensitivity`. Com JavaScript desativado, os links, a legenda numérica e o dicionário continuam disponíveis. As permissões de leitura continuam na seção de acesso. |

**Verificação local de 19/11/2026.** A validação conferiu 97 arquivos da origem. Passaram 53 de
53 casos de unidade e 25 de 25 verificações estáticas. As três builds geraram 479 páginas com
SHA-256 idêntico de `dist/` (`04144cf21143fa6cbcba82e379e832fb95293bbdbcdcbecc0f57871f158a1981`).
Duraram 9,59 s, 7,28 s e 7,08 s, com mediana de 7,28 s para a meta de 60 s. A verificação
conferiu 36.738 links e âncoras, as 283 fichas e os 469 pares dirigidos distribuídos em 16 fluxos
de camada, inclusive os internos. A leitura das amostras conferiu as 20.617 células exportadas.
Em gzip nível 6, HTML e CSS somaram 7.119 bytes na inicial e até 30.607 bytes nas fichas.

**Entrega e limite da medição.** Os commits de implementação são `c4fc657`, `43f6fb0` e
`b743248`. A entrega usa o bundle `.cache/layout-rodada-2/rodada-2.bundle`, baseado em
`d6b768f`. A E3 de navegador cabe ao Claude, inclusive o novo teste de clique, Enter e retorno de
foco ao limpar o destaque em 390 px e nos dois temas. Legibilidade, altura da faixa, foco visível,
transferência HTTP e tempos de interação desta rodada aguardam essa verificação.

**Pergunta ao Owner.** No mapa da inicial, é fácil encontrar a entrega direta de
`raw_legacy` para `trusted` ao lado do caminho que passa por `staging`?

**Integração e verificação pelo Claude.** O Codex parou no meio da rodada pelo limite de uso da
conta; a sessão foi retomada e concluída. Bundle conferido (árvore idêntica à de trabalho) e os
quatro commits entraram no `main`. A E3 completa rodou em 19/11/2026 nesta máquina: **50 de 50**
([resultado](../verificacao/resultados/2026-11-19T23-48-09-229Z.json)), inclusive o novo teste da
legenda, 390 px nos dois temas, foco e tempos.

**Crítica do Claude (telas em 1280 e 390 px).**

O que funciona: a ficha ficou boa. A faixa "fornecem → você está aqui → recebem, agrupados por
camada" é compacta e responde à pergunta da relação; a nota única de ausência limpou a tabela; a
legenda de sensibilidade agora é um controle; os nomes não quebram mais no meio. A inicial deixou de
ser linha do tempo: os números nos traços mostram o que passa.

O que ainda engana ou não ensina:

1. **O maior fluxo do mapa está escondido.** Respondendo à pergunta do Codex: não, não é fácil.
   `raw_legacy → trusted` (76) é o segundo maior traço do portal e aparece como uma etiqueta em
   "Outros fluxos diretos", enquanto `raw_legacy` desenhado como ramal lateral de `staging` (40) o
   faz parecer secundário, do mesmo peso de `governance` (1). O legado é uma **entrada**, par de
   `raw`. Desenhar duas linhas de entrada no topo (principal e legado), com o traço do legado
   seguindo até `trusted` por fora de `staging`. Isso conta, sozinho, a história do projeto: o
   legado pula o preparo porque chega como texto e é validado em `trusted`, se a origem declarar
   assim (verificar na documentação da origem antes de escrever a frase).
2. **A espessura deve carregar o número.** Hoje 1 e 81 têm o mesmo traço. Espessura proporcional
   (com o número mantido) faz o leitor ver o fluxo antes de ler.
3. **"Pares de relações" é abstrato para quem começa.** Mostrar um exemplo real ao lado da legenda
   (um par real, tirado do pacote, com a frase "este par conta 1, quantas colunas passarem").
4. **Fluxos internos como laço na estação.** `trusted → trusted 60` e `analytics → analytics 58`
   são grandes e explicam algo importante (modelos que se apoiam em modelos da mesma camada). Como
   etiqueta solta, perdem-se; um laço com o número na própria estação os mantém no desenho.
5. **Estações com altura vazia.** `staging` e `trusted` ficam altas só para acompanhar os ramais;
   no celular sobra uma caixa grande com o texto no meio. Alinhar o texto ao topo ou reduzir a
   altura.

Recomendação: uma rodada 2b curta só para a inicial (pontos 1 a 5), depois a rodada 3.

Decisão do Owner: (pendente)

### Rodada 2b — As duas entradas do mapa da inicial · 19/11/2026

**Construção do Codex.** No topo, `raw` e `raw_legacy` ocupam estações lado a lado. De
`raw_legacy` partem duas setas. A de 40 pares dobra em direção a `staging`. A de 76 desce pela
borda externa e chega a `trusted`. Os dois traços representam a linhagem imediata dos valores. A
[Arquitetura §2](../origem/arquivos/docs/arquitetura.md#2-camadas-de-dados) descreve as funções
das camadas. A legenda se limita ao que se pode ler nos traços.

- A espessura varia em escala linear de 1 px para um par até 10 px para a maior contagem do
  pacote, hoje 81 pares entre `staging` e `trusted`. Cada seta conserva o número exato.
- Ao lado da escala, o build escolhe um par com várias ligações entre colunas e dá preferência
  ao desvio do legado. Na `v2.3.0` (`2bceb47`), `raw_legacy.carts` fornece valores a
  `trusted.legado__carts` por 13 ligações entre colunas. O par acrescenta **1** aos 76.
  Os dois nomes abrem as fichas.
- Os laços de `trusted` (60) e `analytics` (58) trazem o número dentro da volta na própria
  estação. Cinco saltos e retornos aparecem em uma lista com origem, seta numerada e destino.
  A tabela reúne os 16 fluxos, inclusive os internos.
- As caixas de `staging` e `trusted` têm a altura do conteúdo. Quando a estação vizinha precisa
  de mais linhas, o traço continua fora da caixa. A grade preserva as duas entradas lado a lado
  em 390 px. As estações e a tabela usam links e controles nativos de teclado.

Os 469 pares dirigidos resultam de `lineage.relations.*.columns.*.leaves`, agrupados pelo
`relations.*.schema` dos dois extremos. O Astro gera o mapa em HTML, CSS e SVG no build.

**Verificação local de 19/11/2026.** Passaram os 57 casos de unidade e as 29 verificações
estáticas. Quatro verificações novas conferem no HTML o desvio por fora de `staging`, as larguras
dos 16 traços, o exemplo da legenda e os laços dentro das estações. A validação conferiu 97 arquivos
da origem e a estática resolveu 36.740 links e âncoras. Três builds geraram 479 páginas com o mesmo
SHA-256 de `dist/` (`6baae85500767829df2dc8e44c43bc3562fb3e996d9692ab47c15a9cd3a083fd`).
Duraram 7,02 s, 7,13 s e 6,88 s, com mediana de 7,02 s. Na inicial, HTML e CSS somaram 8.365
bytes em gzip nível 6. A verificação no navegador cabe ao Claude, inclusive a leitura em 390 px
nos dois temas, o foco por teclado e as metas de tempo e transferência.

**Entrega.** Implementação em `da282ac` e verificações estáticas em `e454c9a`.
Bundle local em `.cache/layout-rodada-2b/rodada-2b.bundle`, com base em `80898a4`.

**Pergunta ao Owner.** Em 390 px, dá para seguir a seta de 76 até `trusted` e distinguir a de 40
que termina em `staging`?

**Integração e verificação pelo Claude.** Bundle conferido (árvore idêntica) e os três commits no
`main`. E3 completa em 19/11/2026 nesta máquina: **54 de 54**
([resultado](../verificacao/resultados/2026-11-20T00-04-34-093Z.json)).

**Crítica do Claude (telas em 1280 e 390 px).** Respondendo ao Codex: sim. Em 390 px o traço de 76
desce por fora de `staging` até `trusted` e não se confunde com o de 40. O mapa agora é um
diagrama de fluxo de verdade: a espessura mostra o volume antes da leitura, o laço explica os pares
internos e o exemplo real torna "par" concreto. Aprovado como base. Ajustes pequenos, para levar
na próxima rodada sem rodada própria:

1. A trilha do legado é azul e as outras, verdes, mas nada diz isso; o azul também é a cor dos
   links. Uma linha na legenda ("trilha do legado") e um tom que não se confunda com link, nos
   dois temas.
2. "A linhagem não informa entrada de outra camada" se repete em `raw`, `raw_legacy` e
   `governance`. Dizer uma vez, na legenda, para as estações sem entrada.

Recomendação: abrir a rodada 3, "da pergunta à origem" (ideia 2 da §5), reaproveitando o mapa para
acender as camadas e os traços percorridos por uma pergunta. O esquema estrela (ideia 6) fica para a
rodada 4, para manter cada rodada com um tema.

Decisão do Owner: (pendente)

### Rodada 3 — Da pergunta à origem · 19/11/2026

**Construção do Codex.** As 16 perguntas abrem com um percurso. A pessoa escolhe uma das
medidas declaradas em `questions.*.measures` e segue o valor da coluna da view pelas folhas
imediatas de `lineage.relations.*.columns.*.leaves`. A medida inicial é a primeira com papel
`metric` em `view_rules`. Se faltar esse papel, abre a primeira com origem `source` em
`origins` ou, na ausência de ambas, a primeira declarada. É uma escolha de navegação do portal.
As demais medidas têm endereço próprio. O build gera o mapa e a lista em HTML e SVG.

**Como ler.** Comece pela **P02**, em `/governanca/pergunta/P02/`. A definição da origem
explica o ticket médio. No mapa da inicial, usado também aqui, as setas apontam no sentido em
que os valores passam. Para investigar a resposta, o leitor parte de `consumption` e percorre
as setas acesas ao contrário. O número em cada uma conta os pares de relações daquela medida.
As estações numeradas levam à lista.

- Cada relação ocupa um passo, mesmo quando fornece várias colunas. Os links “Passo” indicam o
  próximo insumo de cada ramo. Na P02, o terceiro passo, `trusted.order_items`, recebe valores
  de `staging.stg_retail__order_items` e de `trusted.legado__order_items`. No mesmo passo,
  `source_system` tem origem gerada. É possível seguir os dois ramos só pela lista.
- Cada passo reúne o papel, o grão quando declarado em `relations` ou `view_rules`, as colunas
  destacadas e a ficha. Os trechos citados vêm das descrições da relação e da coluna da view.
  “Ver as ligações coluna a coluna” abre os insumos individuais. “Abrir este passo no grafo”
  leva ao Cytoscape com essas mesmas colunas e seus insumos imediatos, inclusive quando o
  recorte se resume a uma coluna terminal.
- Fontes, seeds e valores gerados encerram caminhos. Nos 88 percursos da `v2.3.0` (`2bceb47`),
  aparecem fontes e valores gerados. A seed tem cobertura em unidade. A montagem da view
  permite investigar filtros e junções que a linhagem de valores não alcança. Nos passos de
  fonte, a travessia identifica se foi declarada para a camada ou para a relação.
- Na inicial, a legenda identifica a trilha do legado em ocre nos dois temas e reúne numa frase
  as estações sem entrada de outra camada.

**Verificação local de 19/11/2026.** Passaram 78 casos de unidade e 34 verificações estáticas.
A cópia da origem conferiu nos 97 arquivos. Nas 551 páginas, 46.557 links e âncoras resolveram.
Nos 88 percursos, a conferência do HTML contou 626 passos e 916 ligações entre colunas, contando
as ocorrências em cada percurso. As origens terminais coincidiram com `origins` de cada medida.

Três builds produziram o mesmo SHA-256 de `dist/`
(`1c4290639441e43c360ccf9e67fa78dec1acdc7c0efbd24e8b91f853752eb12d`). Duraram 7,18 s,
7,23 s e 7,18 s. Em gzip nível 6, o HTML e as folhas de estilo somaram 12.308 bytes na P02
e até 14.120 bytes na P08, em `gross_margin_pct`. A E3 de navegador fica com o Claude.
A suíte inclui a medição de primeira renderização e transferência da P02 e o percurso por
teclado em 390 px, nos dois temas, até o grafo e de volta.

**Entrega.** Legenda em `83af14d`, percursos em `f47e2b6` e verificações em `af4a396`.
Bundle em `.cache/layout-rodada-3/rodada-3.bundle`, baseado em `4cb1f30`.

**Pergunta ao Owner.** Na P02, a partir de `trusted.order_items`, dá para identificar quais
valores vêm das duas origens e qual nasce ali?

**Integração e verificação pelo Claude.** Bundle conferido (árvore idêntica) e os quatro commits
no `main`. E3 completa em 19/11/2026 nesta máquina: **62 de 62**
([resultado](../verificacao/resultados/2026-11-20T00-21-01-035Z.json)).

**Crítica do Claude (P02 em 1280 e 390 px).** Respondendo ao Codex: sim. Em `trusted.order_items`
os dois ramos aparecem como passos 4 e 5 e `source_system · Valor gerado aqui` diz onde a coluna
nasce. É a melhor página do portal até agora: a pergunta vira um caminho com começo e fim, as
duas origens terminam explicadas (travessia de cada uma) e o leitor escolhe a medida. Os ajustes
de 2b (legenda ocre do legado, frase única) resolveram.

O que falta para o percurso ensinar de fato:

1. **O momento em que o valor muda de forma está escondido.** Do passo 4 ao 3, `quantity`,
   `unit_price` e `discount_amount` viram `net_revenue_amount`; do 2 ao 1, `net_revenue_amount` e
   `order_id` viram `average_order_value`. É o centro do aprendizado ("a receita líquida nasce
   aqui, destas três colunas") e hoje fica dentro de "Ver as ligações coluna a coluna", fechado.
   Quando os nomes das colunas mudam entre passos, mostrar a ligação aberta e compacta
   (`quantity · unit_price · discount_amount → net_revenue_amount`), derivada de `leaves`.
2. **A numeração zigueza nos ramos.** O passo 4 vem do 7 e o 5 vem do 6. Numerar por ramo
   (ramo varejo: 4 → 5; ramo legado: 6 → 7) ou rotular "4a/4b", para a leitura seguir o desenho.
3. **O mapa some quando a leitura começa.** Em 1280 px a coluna do mapa fica vazia a partir do
   passo 3. Mapa fixo ao rolar (`position: sticky`), com a estação do passo visível acesa, faz o
   mapa acompanhar o roteiro; em 390 px, manter como está, com o atalho para os passos.
4. **Números que não informam.** No mapa do percurso, todo traço diz "1"; ali o que interessa é a
   ordem dos passos, não a contagem de pares. Trocar pelo número do passo ou retirar. A lista
   cinza "Outros fluxos diretos" não pertence a esta página.

Recomendação: levar os pontos 1 a 4 para a rodada 4 junto com o esquema estrela (ideia 6), que
pode nascer do passo "Fato da pergunta" (a fato no centro e as dimensões da P02 em volta).

Decisão do Owner: (pendente)

### Rodada 4 — Onde o valor muda e o que uma linha da fato representa · 19/11/2026

**Percurso.** Comece pela P02, em `/governanca/pergunta/P02/`. No passo 3,
`trusted.order_items` recebe `discount_amount`, `quantity` e `unit_price` pelos dois ramos.
A seta termina em `net_revenue_amount`. Abaixo dela, a descrição da origem explica em que momento
a receita é arredondada e o desconto é aplicado. No passo 1, a seta do ticket médio inclui
`source_system` junto de `net_revenue_amount` e `order_id`. A regra de `average_order_value` em
`metrics` divide a receita líquida por `order_count`. Esse denominador conta as combinações
distintas de sistema de origem e pedido.

Cada seta aberta vem das folhas imediatas de `lineage.relations.*.columns.*.leaves` quando ao
menos um nome muda. Dois ramos que entregam as mesmas colunas dividem a linha e conservam links
para os dois passos. As citações vêm da descrição da coluna e da métrica identificada em
`view_rules`. A numeração termina um ramo antes de abrir o seguinte, para que se possa acompanhar
uma origem de uma vez. Na P02, o varejo ocupa os passos 4 e 5, e o legado, 6 e 7. Um insumo
compartilhado ganha um único número depois dos consumidores.

O mapa fica fixo nas telas largas. A estação e o número do passo em leitura recebem destaque ao
rolar. Os números são atalhos para os passos. Um fluxo direto da medida que sai da grade aparece
na estação que o recebe. Em 390 px, o atalho “Ir aos passos em lista” fica acima do mapa. Com o
JavaScript desligado, o HTML contém as setas, os ramos, as citações e todos os links.

**Estrela.** Abra `/governanca/relacao/analytics.fact_shipment/#estrela`. No centro, o grão
declarado é “uma remessa”. Dois braços chegam a `dim_date.date_key`: um parte de `date_key` e o
outro de `delivered_date_key`. Cada braço corresponde a uma FK da fato em `relations` e termina
na PK declarada da dimensão. A tabela liga as duas colunas às fichas, e o diagrama
entidade-relacionamento abre no recorte da fato.

A mesma estrela aparece no passo “Fato da pergunta”. As dimensões em `questions.*.dimensions`
recebem o rótulo “Dimensão da pergunta”. As declaradas para a pergunta que carecem de FK direta
naquela fato aparecem abaixo do desenho. Uma dimensão recebe um link para seu snapshot quando as
folhas imediatas identificam uma relação com `resource_type: snapshot`. O Astro gera o esquema em
HTML, CSS e SVG. Em telas estreitas, os braços se distribuem em pares acima e abaixo do grão.

**Verificação local de 19/11/2026.** Passaram 82 casos de unidade e 36 verificações estáticas.
A validação conferiu os 97 arquivos da origem `v2.3.0` (`2bceb47`). O HTML dos 88 percursos
mostrou 185 ocorrências de mudança de nome em 626 passos. As 11 fichas de fatos mostraram 57
braços, e 84 passos de fato incluíram a estrela. Nas 551 páginas, os 48.958 links e âncoras
resolveram. Três builds duraram 7,30 s, 7,22 s e 7,31 s. O SHA-256 de `dist/` foi o mesmo
nas três execuções (`f2e0057c04e145d57d405257df1dae22f8990360fa075c274e40ceb452e5fb0d`).
Em gzip nível 6, o HTML e os recursos referenciados diretamente somaram 14.940 bytes na P02,
até 17.085 bytes entre os percursos (P13), e 18.875 bytes na ficha de remessas.

**Entrega.** Percurso em `1af6850`, estrela em `6446539`, identidade do denominador em
`67da154` e verificações em `aba3bb5`. Bundle em `.cache/layout-rodada-4/rodada-4.bundle`,
com base em `e561d1f`. A E3 de navegador cabe ao Claude, incluindo o mapa ao avançar e voltar,
o foco, a estrela em 390 px nos dois temas e as metas de desempenho.

**Pergunta ao Owner.** Na P02, as três dimensões destacadas ajudam a distinguir o que recorta o
ticket médio daquilo que entra na conta?

**Integração e verificação pelo Claude.** Rodada feita no `codex2`, por pedido do Owner. Bundle
conferido (árvore idêntica) e os cinco commits no `main`. E3 completa em 19/11/2026 nesta máquina:
**66 de 66** ([resultado](../verificacao/resultados/2026-11-20T00-51-00-711Z.json)).

**Crítica do Claude (P02 e `analytics.fact_shipment`, 1280 e 390 px).** O percurso ficou pronto:
o mapa fixo acende o passo em leitura, a numeração por ramo segue o desenho e "Como se forma
`net_revenue_amount`" mostra, com a frase da origem, o momento em que três colunas viram uma. É o
trecho que mais ensina no portal. A estrela da ficha da fato também funciona: grão no centro, grão
de cada dimensão no braço, FK → PK e o snapshot sinalizado.

Respondendo ao Codex: em parte. As três dimensões da pergunta estão destacadas, mas nada no desenho
diz que `net_revenue_amount` e `order_id` "entram na conta" enquanto cliente, data e canal
"recortam". Ajustes:

1. **Estrela da pergunta: medida no centro, recorte nos braços.** No centro, as colunas da fato que
   entram na conta (as do passo, já derivadas); nos braços destacados, as colunas da view que vêm
   de cada dimensão (`customer_segment_name` de `dim_customer`, `sales_channel_name` de
   `dim_sales_channel`, `month_number`/`year_*` de `dim_date`), **se a linhagem por coluna da view
   provar a ligação**; se não provar, só o destaque. Isso liga o grão da view (passo 1) à estrela:
   "o grão da resposta é a combinação das dimensões que recortam".
2. **No percurso, só as dimensões da pergunta abertas**; as demais da fato recolhidas ("mais 4
   dimensões desta fato"). Na coluna estreita do passo, as sete caixas ficam altas e vazias, e
   as chaves quebram ("brand_ / key").
3. **Dimensão com dois papéis.** Em `fact_shipment`, `dim_date` aparece em duas caixas. Uma caixa
   só, com dois braços rotulados pelas FKs (`date_key`, `delivered_date_key`), ensina o conceito;
   o papel (despacho, chegada) só com citação da descrição da origem.
4. **Altura das caixas** pelo conteúdo, não pela maior delas.

Recomendação: rodada 5 com esses quatro pontos e a ideia 5 da §5 (o legado defeituoso, antes e
depois: `original_payload`, `cleaned_payload` e `findings` lado a lado, com o defeito marcado), que
usa as amostras da D06 e é o melhor material para ensinar qualidade de dados.

Decisão do Owner: (pendente)

### Rodada 5 — O que entra na conta e o que a limpeza consegue recuperar · 19/11/2026

**Estrela.** Na P02, o centro reúne `net_revenue_amount`, `order_id` e `source_system`, as três
colunas do passo da fato que entram no ticket médio. O grão do passo 1 combina cinco campos da view.
Na estrela, `customer_segment_name` aparece no braço de cliente, `sales_channel_name` no de canal e
`month_number`, `year_month` e `year_number` no de data. Para colocar um campo ali, o build exige
que uma folha imediata da coluna da view em `lineage.relations` aponte para aquela dimensão. O
destaque vem de `questions.*.dimensions` e independe dessa prova. “Mais 4 dimensões desta fato”
abre as demais na P02.

Na ficha de `analytics.fact_shipment`, `date_key` e `delivered_date_key` chegam a uma só caixa
`dim_date`, por dois braços. As descrições das FKs na origem distinguem despacho e chegada,
inclusive a data usada quando a remessa ainda aguarda despacho. A altura das caixas acompanha
o conteúdo, as chaves permanecem inteiras e a tabela conserva cada par FK → PK.

**Antes e depois.** Em `/governanca/legado/MONEY_LOCALE/`, a linha 9 de `coupon_redemptions`,
captura 94, traz `"R$ 195,00"` antes e `"195.00"` depois. O campo marcado é `discount_amount`.
O motivo da correção e a classificação da linha vêm da mesma amostra de
`trusted.legacy_eligible_records`. Em `TEXT_DELIMITER`, o leitor encontra também a linha 2 de
`support_agents`, com o conteúdo deslocado preservado e a regra de rejeição citada.

A vista fica em Governança para que cada comparação abra a linha exata da ficha. Há entrada
também pelo conceito Qualidade de dados e pelos passos `trusted.legado__*`. Onde a linhagem
identifica a mesma tabela bruta em um percurso, há um link ao passo das linhas aptas.
Essa ligação é por tabela. A classificação de uma ocorrência vem de sua própria linha.

O índice lê três formas de evidência em `amostras_de_registros.json`. Em staging, compara
`original_payload` à coluna limpa indicada por `achados`. Em trusted e na quarentena, compara
`original_payload` a `cleaned_payload`, pelo campo de `value_findings` ou de `findings`.
Um achado de linha inteira mostra as duas cargas e o vínculo exportado com a ocorrência canônica.
O índice conta cada aparição em sua relação e linha. A mesma ocorrência física pode reaparecer.
Detecção, conversão e rejeição vêm de `falhas` em `src/mvp_ed1/legacy/catalogo.yml`, acrescentado
à cópia da D03 no mesmo commit `2bceb47`. A página distingue a regra do catálogo da ação e da
versão registradas na linha. A exportação da D06 fornece todos os valores, inclusive os nulos e
o marcador `<personal>`.

**Verificação local.** Conferiram os 98 arquivos da origem e as amostras das 283 relações.
Passaram 87 casos de unidade e 39 verificações estáticas. Nas 575 páginas, resolveram 50.218 links
e âncoras. O HTML reproduziu 57 braços nas 11 fichas de fatos e 84 estrelas nos passos.
O índice trouxe 19 tipos e 76 aparições. A estática conferiu os valores de 75 achados de campo
(14 com máscara) e as duas cargas do achado de linha inteira. Conferiu também 17 links dos casos
a passos do percurso da mesma tabela de origem.

Três builds duraram 7,48 s, 7,51 s e 7,39 s, com mediana de 7,48 s e o mesmo SHA-256 de `dist/`
(`033581c9a31ef71f5c92014517a86aab3872ba81e85705e0cd3f87b26757a58a`). O HTML e os recursos
referenciados diretamente, em gzip nível 6, somaram 8.168 bytes no índice do legado, 6.370 na
página `MONEY_LOCALE` e 15.183 na P02. A E3 de navegador fica com o Claude, incluindo a leitura
em 390 px nos dois temas, a abertura por teclado das dimensões recolhidas, o foco na linha da
amostra após o salto e as metas de renderização e transferência.

**Entrega.** Estrelas em `294ec40`, catálogo da origem em `95c5e91`, vista do legado em
`079082d` e verificações em `4a81fcb`. Bundle em `.cache/layout-rodada-5/rodada-5.bundle`,
com base em `75f428c`.

**Pergunta ao Owner.** Ao passar de `MONEY_LOCALE` a `TEXT_DELIMITER`, fica claro por que a origem
corrige o primeiro valor e preserva o segundo ao indicar a rejeição?

**Integração e verificação pelo Claude.** Bundle conferido (árvore idêntica) e os cinco commits no
`main`. O catálogo copiado (`src/mvp_ed1/legacy/catalogo.yml`) tem o mesmo SHA-256 do arquivo no
commit fixado `2bceb47` da origem, lido por `git show`. A primeira E3 deu 71 de 72: o teste do
foco na linha da amostra lia o foco antes de a navegação terminar. O `codex2` diagnosticou e
corrigiu o teste, sem mudar os critérios, e parou no limite de uso; a correção entrou em `0e5dd87`
e a E3 completa deu **72 de 72**
([resultado](../verificacao/resultados/2026-11-20T01-17-56-366Z.json)).

**Crítica do Claude (telas em 1280 e 390 px).** A estrela da pergunta resolveu a crítica da rodada 4:
"Entram na conta" no centro, "Na view" nos braços, provados pela linhagem, e as dimensões que não
recortam recolhidas. O legado ganhou o melhor material do portal para ensinar qualidade: linha
real, valor que chegou, valor depois da limpeza e a regra do catálogo da origem.

Respondendo ao Codex: ainda não. Os rótulos dizem "Regra de conversão" e "Regra de rejeição", mas
os cartões de `TEXT_DELIMITER` mostram o mesmo valor antes e depois, e o leitor não vê a rejeição
nem o deslocamento. Ajustes:

1. **Mostrar a diferença, não só os dois valores.** Marcar no "antes" o que a limpeza mudou
   (`R$ `, a vírgula decimal) e, nos casos de delimitador, o próprio delimitador dentro do valor e
   os campos seguintes da carga original vazios, que é o que a definição do catálogo descreve.
2. **Uma linha, um caso.** A mesma linha (relação, captura, linha) aparece em dois cartões quando
   foi achada em `staging` e corrigida em `trusted`. Reunir num caso só, com as etapas em
   sequência ("achada em staging → corrigida em trusted"), sem perder a contagem de aparições.
3. **O índice organizado pelo destino.** Os 19 tipos em grade uniforme não dizem o que a limpeza
   recupera e o que ela rejeita. Agrupar pelo tratamento que o catálogo declara (corrige,
   rejeita, etc.), com o grupo calculado do catálogo, nunca atribuído à mão.

Recomendação: rodada 6, construída pelo Claude, com esses três pontos.

Decisão do Owner: (pendente)

### Rodada 6 — O legado mostra a diferença e o destino · 19/11/2026

**Construção do Claude** (primeira rodada depois da mudança de papéis), sobre os três pontos da
crítica da rodada 5. Commits `26845c9`, `d6ee4d0` e `a6aba63`.

| Ponto | O que o leitor encontra | Artefato |
|---|---|---|
| Diferença marcada | No "antes", riscado o que sai (`R$ `, a vírgula); no "depois", sublinhado o que entra (o ponto). O texto lido continua o literal exportado. Só em textos de até 300 caracteres com algo em comum. | Diferença por caractere entre os dois literais da amostra (D06). |
| Delimitador e rejeição | Em `TEXT_DELIMITER`, o `;` aparece marcado dentro do valor, com o número de trechos, e a lista dos campos que chegaram nulos na mesma carga, com o aviso de que a carga não informa a ordem das colunas. Quando o valor não muda, a nota diz que o catálogo declara rejeição, não conversão. | `delimitador` e `rejeicao` do catálogo; `original_payload` da amostra. |
| Uma linha, um caso | A mesma linha (tabela, `legacy_row_id`, `snapshot_id`) num bloco só, com as etapas em sequência: "Achado na padronização" (staging) ↓ "Classificação em trusted". Cada etapa mantém a âncora antiga. 11 linhas reúnem mais de uma etapa. | Identidade descrita pela origem em `raw_legacy` (uma linha por ocorrência física em cada captura). |
| Índice pelo destino | Grupos "A limpeza recupera o valor", "troca por nulo de verdade" e "A linha é rejeitada", com tipos e aparições; cada tipo mostra aparições, linhas e a família do catálogo. | `conversao` + `recuperacao` ou `rejeicao`, mutuamente exclusivas no catálogo. |

**Verificação local de 19/11/2026.** Unidade: 93 de 93 (seis novos casos). Estáticas: 42 de 42,
com três novas: a diferença marcada é real (sem os trechos marcados, os dois lados coincidem;
29 comparações) e o delimitador marcado é o declarado (`;`); cada bloco reúne uma só linha, sem
repetição na página; o grupo de cada tipo no índice é o tratamento lido diretamente do YAML. E3
completa: **75 de 75** ([resultado](../verificacao/resultados/2026-11-20T01-27-51-872Z.json)).

**Limitações.** A amostra da quarentena não traz as linhas dos casos de delimitador (são de outra
captura), então o caso aponta para o destino declarado, não para a linha rejeitada. A lista de
nulos pode incluir nulos legítimos, como a página avisa.

**Pergunta ao Owner.** Ao abrir `TEXT_DELIMITER`, dá para ver por que a linha não tem conserto e é
rejeitada, enquanto `MONEY_LOCALE` é corrigido?

Decisão do Owner: (pendente)
