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
repassa nada. O Codex registra cada rodada na §6 e o Claude responde logo abaixo.

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
