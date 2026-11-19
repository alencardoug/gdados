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

**Canal:** o Claude não tem acesso direto ao Codex. Na abertura da sessão, confirmar com o Owner
como trocar mensagens: ele repassa, ou o Codex registra as propostas na §6 deste arquivo e o Claude
responde logo abaixo. O pedido ao Codex só sai quando o Owner pedir ("depois eu peço para você pedir
ao codex").

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

_Nenhuma rodada ainda._
