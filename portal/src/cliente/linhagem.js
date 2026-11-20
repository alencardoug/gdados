// Exploração da linhagem com Cytoscape.js (D02). Três modos, pelo parâmetro ?modo=:
//   relacao (padrão) — a relação em foco e seus vizinhos imediatos, expansível nó a nó;
//   coluna           — as colunas da relação e seus insumos imediatos, expansível, até LIMITE nós;
//   tudo             — visão geral de todas as relações, agrupadas por camada (não é a entrada).
// O recorte (modo, foco e nós expandidos) fica na URL, para que link direto e "voltar" o restaurem.
// A mesma informação está na tabela ao lado do grafo, navegável por teclado (condição de acesso).
// Conteúdo do pacote entra no DOM só como texto.
import cytoscape from "cytoscape";
import { posicoesEmCamadas, corDaCamada } from "./camadas.js";
import { columnsInFocus } from "./recorte-de-colunas.js";

const LIMITE_DE_NOS = 300;
const relacaoDaColuna = (c) => c.split(".").slice(0, 2).join(".");
const css = (nome) => getComputedStyle(document.documentElement).getPropertyValue(nome).trim();

export async function iniciarLinhagem(raiz) {
  const $ = (sel) => raiz.querySelector(sel);
  const base = raiz.dataset.dados;
  const rotaRelacao = raiz.dataset.rotaRelacao; // termina em "/"; recebe o id
  const params = new URLSearchParams(location.search);
  const modo = ["relacao", "coluna", "tudo"].includes(params.get("modo")) ? params.get("modo") : "relacao";
  const grafo = await (await fetch(`${base}grafo.json`)).json();
  const nos = new Map(grafo.nodes.map((n) => [n.id, n]));
  const indiceDaCamada = new Map(grafo.camadas.map((c, i) => [c, i]));
  const foco = nos.has(params.get("r")) ? params.get("r") : raiz.dataset.padrao;
  const requested = params.getAll("c");
  let focusedColumns = [];
  // Travessias fora do dbt: nó próprio, ligado às relações por destino exato ou por camada.
  const travessias = new Map((grafo.travessias ?? []).map((t) => [t.id, t]));
  const travessiaDe = new Map();
  for (const t of travessias.values()) for (const r of t.relacoes) travessiaDe.set(r, t);
  const ehTravessia = (id) => travessias.has(id);
  const expandidos = new Set((params.get("e") ?? "").split(",").filter(Boolean));

  const entradas = new Map(), saidas = new Map();
  for (const e of grafo.edges) {
    (entradas.get(e.target) ?? entradas.set(e.target, []).get(e.target)).push(e);
    (saidas.get(e.source) ?? saidas.set(e.source, []).get(e.source)).push(e);
  }
  const colunasCarregadas = new Map();
  const colunasDe = async (id) => {
    if (!colunasCarregadas.has(id)) {
      const n = nos.get(id);
      colunasCarregadas.set(id, n?.linhagem ? await (await fetch(`${base}linhagem/${id}.json`)).json() : null);
    }
    return colunasCarregadas.get(id);
  };

  const camadaDoNo = (id) => (ehTravessia(id) ? "travessia" : nos.get(relacaoDaColuna(id))?.camada ?? id.split(".")[0]);
  const estilo = [
    { selector: "node", style: {
      label: "data(rotulo)", "font-size": 10, "text-valign": "center", "text-halign": "right", "text-margin-x": 5,
      "background-color": (n) => corDaCamada(indiceDaCamada.get(n.data("camada")) ?? 0), width: 14, height: 14,
      color: css("--texto") || "#111", "text-wrap": "ellipsis", "text-max-width": 190,
    } },
    { selector: 'node[tipo = "travessia"]', style: { shape: "diamond", "background-color": "#475569", width: 16, height: 16 } },
    { selector: "node.foco", style: { width: 22, height: 22, "border-width": 3, "border-color": css("--texto") || "#111" } },
    { selector: "node.expandido", style: { shape: "round-rectangle" } },
    { selector: "edge", style: {
      width: 1, "line-color": "#9ca3af", "target-arrow-color": "#9ca3af",
      "target-arrow-shape": "triangle", "curve-style": "bezier", "arrow-scale": 0.7,
    } },
    { selector: 'edge[tipo = "travessia"]', style: { "line-style": "dashed", "line-color": "#64748b", "target-arrow-color": "#64748b" } },
    { selector: ".apagado", style: { opacity: 0.18 } },
    // Visão geral: rótulo abaixo de 8 px na tela não é desenhado (ilegível de qualquer forma).
    ...(modo === "tudo" ? [{ selector: "node", style: { "min-zoomed-font-size": 8 } }] : []),
    { selector: "node:selected", style: { "border-width": 3, "border-color": "#f59e0b" } },
    { selector: "edge.caminho", style: { width: 2.5, "line-color": "#f59e0b", "target-arrow-color": "#f59e0b" } },
  ];
  // Na visão geral, durante zoom e deslocamento o núcleo desenha uma textura e esconde as ligações
  // (opções do Cytoscape.js, sem extensão), para manter os quadros curtos com o grafo inteiro.
  const cy = cytoscape({
    container: $("#grafo"), style: estilo, minZoom: 0.05, maxZoom: 4, boxSelectionEnabled: false,
    ...(modo === "tudo" ? { textureOnViewport: true, hideEdgesOnViewport: true } : {}),
  });

  const no = (id, tipo) => ({
    group: "nodes",
    data: {
      id, tipo, camada: camadaDoNo(id),
      rotulo: tipo === "travessia" ? `${travessias.get(id).origem} · ${travessias.get(id).mecanismo}` : tipo === "coluna" ? id.split(".").slice(1).join(".") : id,
    },
  });
  const aresta = (source, target, n = 1) => ({ group: "edges", data: { id: `${source}→${target}`, source, target, n } });
  const arestaDeTravessia = (t, relacao) => ({
    group: "edges",
    data: { id: `${t.id}→${relacao}`, source: t.id, target: relacao, tipo: "travessia", n: t.tipo === "camada" ? `travessia declarada para a camada ${t.destino}` : "travessia declarada para esta relação" },
  });

  const aviso = $("#aviso");
  const adicionar = (elementos) => {
    const novos = elementos.filter((el) => cy.getElementById(el.data.id).empty());
    const unicos = [...new Map(novos.map((el) => [el.data.id, el])).values()];
    const nosNovos = unicos.filter((el) => el.group === "nodes").length;
    if (cy.nodes().length + nosNovos > LIMITE_DE_NOS) {
      aviso.textContent = `Este recorte passaria de ${LIMITE_DE_NOS} nós (${cy.nodes().length + nosNovos}). Expanda outro nó ou volte ao recorte anterior.`;
      return false;
    }
    cy.add(unicos.filter((el) => el.group === "nodes"));
    cy.add(unicos.filter((el) => el.group === "edges"));
    return true;
  };

  const vizinhosDaRelacao = (id) => {
    if (ehTravessia(id)) {
      const t = travessias.get(id);
      return [no(id, "travessia"), ...t.relacoes.flatMap((r) => [no(r, "relacao"), arestaDeTravessia(t, r)])];
    }
    const t = travessiaDe.get(id);
    return [...(t ? [no(t.id, "travessia"), arestaDeTravessia(t, id)] : []), ...vizinhosDaRelacaoNoDbt(id)];
  };
  const vizinhosDaRelacaoNoDbt = (id) => [
    no(id, "relacao"),
    ...(entradas.get(id) ?? []).flatMap((e) => [no(e.source, "relacao"), aresta(e.source, id, e.n)]),
    ...(saidas.get(id) ?? []).flatMap((e) => [no(e.target, "relacao"), aresta(id, e.target, e.n)]),
  ];
  const insumosDaColuna = async (colunaId) => {
    const cols = await colunasDe(relacaoDaColuna(colunaId));
    const folhas = cols?.[colunaId.split(".").slice(2).join(".")]?.leaves ?? [];
    return [no(colunaId, "coluna"), ...folhas.flatMap((f) => [no(f, "coluna"), aresta(f, colunaId)])];
  };
  const expandirUm = async (id) => (modo === "coluna" ? adicionar(await insumosDaColuna(id)) : adicionar(vizinhosDaRelacao(id)));

  // Posições: x pela camada global (caminho mais longo) da relação; y pela camada e pelo nome.
  const rankDe = (id) => (ehTravessia(id) ? -1 : nos.get(relacaoDaColuna(id))?.rank ?? 0);
  const ordem = (a, b) =>
    (indiceDaCamada.get(camadaDoNo(a)) ?? 0) - (indiceDaCamada.get(camadaDoNo(b)) ?? 0) || a.localeCompare(b);
  const desenhar = () => {
    const ids = cy.nodes().map((n) => n.id());
    const pos = posicoesEmCamadas(ids, rankDe, ordem, modo === "tudo" ? { dx: 320, dy: 22 } : { dx: 300, dy: 30 });
    cy.layout({ name: "preset", positions: (n) => pos.get(n.id()), animate: false, fit: true, padding: 24 }).run();
    for (const id of expandidos) cy.getElementById(id).addClass("expandido");
    cy.getElementById(foco).addClass("foco");
    for (const id of focusedColumns) cy.getElementById(id).addClass("foco");
    atualizarTabela();
    atualizarUrl();
  };

  const atualizarUrl = () => {
    const url = new URL(location.href);
    url.searchParams.set("modo", modo);
    url.searchParams.set("r", foco);
    if (expandidos.size) url.searchParams.set("e", [...expandidos].join(","));
    else url.searchParams.delete("e");
    history.replaceState(history.state, "", url);
  };

  const linkDoNo = (id) => {
    if (ehTravessia(id)) return raiz.dataset.rotaTravessias;
    const rel = relacaoDaColuna(id);
    if (!nos.has(rel)) return null;
    return `${rotaRelacao}${rel}/${id === rel ? "" : `#coluna-${id.split(".").slice(2).join(".")}`}`;
  };
  const celula = (texto, href) => {
    const td = document.createElement("td");
    const code = document.createElement("code");
    code.textContent = texto;
    if (href) {
      const a = document.createElement("a");
      a.href = href;
      a.append(code);
      td.append(a);
    } else td.append(code);
    return td;
  };
  const atualizarTabela = () => {
    const linhas = cy.edges().map((e) => {
      const tr = document.createElement("tr");
      const n = document.createElement("td");
      n.textContent = String(e.data("n"));
      const rotuloDe = (id) => (ehTravessia(id) ? cy.getElementById(id).data("rotulo") : id);
      tr.append(celula(rotuloDe(e.data("source")), linkDoNo(e.data("source"))), celula(rotuloDe(e.data("target")), linkDoNo(e.data("target"))), n);
      return tr;
    });
    $("#ligacoes").replaceChildren(...linhas);
    $("#ligacoes-situacao").textContent = `${cy.nodes().length} nós e ${cy.edges().length} ligações no recorte.`;
    if (modo === "tudo") return;
    const itens = cy.nodes().sort((a, b) => ordem(a.id(), b.id())).map((n) => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = expandidos.has(n.id()) ? "expandido" : "expandir";
      b.disabled = expandidos.has(n.id());
      b.setAttribute("aria-label", `Expandir ${n.id()}`);
      b.addEventListener("click", () => expandir(n.id()));
      const href = linkDoNo(n.id());
      const alvo = document.createElement(href ? "a" : "span");
      if (href) alvo.href = href;
      const code = document.createElement("code");
      code.textContent = n.data("rotulo") === n.id() || n.data("tipo") === "coluna" ? n.id() : n.data("rotulo");
      alvo.append(code);
      li.append(b, " ", alvo);
      return li;
    });
    $("#nos").replaceChildren(...itens);
  };

  const expandir = async (id) => {
    if (expandidos.has(id)) return;
    aviso.textContent = "";
    performance.mark("linhagem:expandir:inicio");
    if (await expandirUm(id)) {
      expandidos.add(id);
      desenhar();
    }
    // Medida "linhagem:expandir" (E3, item 9): até o quadro seguinte ao desenho.
    await new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
    performance.measure("linhagem:expandir", "linhagem:expandir:inicio");
  };

  // Destaque do caminho do nó selecionado dentro do recorte: insumos e consumidores transitivos.
  cy.on("tap", "node", (ev) => {
    const n = ev.target;
    const caminho = n.predecessors().union(n.successors()).union(n);
    cy.elements().removeClass("caminho apagado");
    cy.elements().difference(caminho).addClass("apagado");
    caminho.edges().addClass("caminho");
    const href = linkDoNo(n.id());
    $("#selecao").replaceChildren();
    const code = document.createElement("code");
    code.textContent = n.id();
    $("#selecao").append("Selecionado: ", code);
    if (href) {
      const a = document.createElement("a");
      a.href = href;
      a.textContent = "abrir no catálogo";
      $("#selecao").append(" — ", a);
    }
  });
  cy.on("tap", (ev) => {
    if (ev.target === cy) {
      cy.elements().removeClass("caminho apagado");
      $("#selecao").textContent = "";
    }
  });
  cy.on("dbltap", "node", (ev) => expandir(ev.target.id()));
  $("#ajustar").addEventListener("click", () => cy.fit(undefined, 24));

  // Recorte inicial.
  if (modo === "tudo") {
    cy.add(grafo.nodes.map((n) => no(n.id, "relacao")));
    cy.add(grafo.edges.map((e) => aresta(e.source, e.target, e.n)));
    for (const t of travessias.values()) {
      cy.add(no(t.id, "travessia"));
      cy.add(t.relacoes.filter((r) => cy.getElementById(r).nonempty()).map((r) => arestaDeTravessia(t, r)));
    }
    $("#nos-bloco").hidden = true;
  } else if (modo === "coluna") {
    const cols = await colunasDe(foco);
    const available = cols ? Object.keys(cols) : nos.get(foco)?.colunas ?? [];
    const colunas = columnsInFocus(requested, available).map((c) => `${foco}.${c}`);
    if (requested.length) focusedColumns = colunas;
    if (requested.length && !colunas.length) {
      aviso.textContent = "Nenhuma das colunas solicitadas consta desta relação no recorte.";
    } else if (!cols && !requested.length) {
      aviso.textContent = `${foco} não tem linhagem por coluna no pacote: uma source é origem, não tem insumo no dbt.`;
      adicionar([no(foco, "relacao")]);
    } else if (!adicionar((await Promise.all(colunas.map(insumosDaColuna))).flat())) {
      const excesso = aviso.textContent;
      adicionar(colunas.map((c) => no(c, "coluna")));
      aviso.textContent = `${excesso} Mostrando só as colunas de ${foco}; expanda uma coluna por vez.`;
    }
    if (requested.length && colunas.length && !aviso.textContent) {
      aviso.textContent = `Colunas em foco em ${foco}: ${colunas.map((c) => c.slice(foco.length + 1)).join(", ")}. O grafo inclui os insumos imediatos declarados.`;
    }
    for (const id of expandidos) if (cy.getElementById(id).nonempty()) await expandirUm(id);
  } else {
    adicionar(vizinhosDaRelacao(foco));
    for (const id of expandidos) if (cy.getElementById(id).nonempty()) await expandirUm(id);
  }
  desenhar();
  // Marca "linhagem:pronto" (E3, item 9) no quadro seguinte ao primeiro desenho. O grafo fica
  // acessível pelo próprio elemento, só para a medição de zoom e deslocamento.
  await new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
  performance.mark("linhagem:pronto");
  raiz.cy = cy;
  raiz.expandir = expandir;
  raiz.dataset.pronto = "1";
}
