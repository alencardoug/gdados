// Prova da D02: linhagem com Cytoscape.js. A biblioteca é recebida por parâmetro, para que cada
// candidata da D01 a carregue do seu jeito. Marcas: "linhagem:pronto" e "linhagem:expandido".
//
// Modos (?modo=): "relacao" (recorte da relação e vizinhos imediatos, expansível), "tudo" (todas as
// relações) e "coluna" (colunas da relação e seus insumos imediatos, expansível, até LIMITE nós).
const LIMITE_DE_NOS = 300;
const CORES = {
  raw: "#6b7280", raw_legacy: "#9ca3af", staging: "#0e7490", trusted: "#1d4ed8",
  quarantine: "#b91c1c", snapshots: "#7c3aed", analytics: "#047857", consumption: "#b45309",
  governance: "#be185d",
};
const relacaoDaColuna = (c) => c.split(".").slice(0, 2).join(".");

const estilo = [
  { selector: "node", style: {
    label: "data(rotulo)", "font-size": 9, "text-valign": "center", "text-halign": "right", "text-margin-x": 4,
    "background-color": (n) => CORES[n.data("camada")] ?? "#374151", width: 14, height: 14,
    color: "#111827", "text-wrap": "ellipsis", "text-max-width": 140,
  } },
  { selector: "node.foco", style: { width: 22, height: 22, "border-width": 3, "border-color": "#111827" } },
  { selector: "edge", style: {
    width: 1, "line-color": "#9ca3af", "target-arrow-color": "#9ca3af",
    "target-arrow-shape": "triangle", "curve-style": "bezier", "arrow-scale": 0.7,
  } },
  { selector: "node:selected", style: { "border-width": 3, "border-color": "#f59e0b" } },
];

function no(id, tipo) {
  const partes = id.split(".");
  return {
    group: "nodes",
    data: { id, camada: partes[0], tipo, rotulo: tipo === "coluna" ? partes.slice(1).join(".") : partes[1] ?? id },
  };
}
const aresta = (source, target, n = 1) => ({ group: "edges", data: { id: `${source}→${target}`, source, target, n } });

export async function iniciarLinhagem({ cytoscape, container, tabela, aviso, base = "", params }) {
  const modo = params.get("modo") ?? "relacao";
  const foco = params.get("r") ?? "consumption.monthly_revenue_by_channel_and_category";
  const grafo = await (await fetch(`${base}/dados/grafo_relacoes.json`)).json();
  const entradas = new Map(), saidas = new Map();
  for (const e of grafo.edges) {
    (entradas.get(e.target) ?? entradas.set(e.target, []).get(e.target)).push(e);
    (saidas.get(e.source) ?? saidas.set(e.source, []).get(e.source)).push(e);
  }
  const relacoesCarregadas = new Map();
  const carregarRelacao = async (id) => {
    if (!relacoesCarregadas.has(id)) {
      const r = await fetch(`${base}/dados/relacao/${id}.json`);
      relacoesCarregadas.set(id, r.ok ? await r.json() : null);
    }
    return relacoesCarregadas.get(id);
  };

  const cy = cytoscape({ container, style: estilo, wheelSensitivity: 0.3, minZoom: 0.05, maxZoom: 4 });

  const desenhar = (marca) =>
    new Promise((resolver) => {
      // Camadas da esquerda para a direita: o breadthfirst do núcleo, com x e y trocados.
      const layout = cy.layout({
        name: "breadthfirst", directed: true, spacingFactor: 1, animate: false,
        transform: (_no, pos) => ({ x: pos.y * 2.2, y: pos.x * 0.35 }),
      });
      layout.one("layoutstop", () => {
        cy.fit(undefined, 20);
        requestAnimationFrame(() => {
          performance.mark(marca);
          atualizarTabela();
          resolver(cy.nodes().length);
        });
      });
      layout.run();
    });

  const atualizarTabela = () => {
    const linhas = cy.edges().map((e) => {
      const tr = document.createElement("tr");
      for (const v of [e.data("source"), e.data("target"), e.data("n")]) {
        const td = document.createElement("td");
        td.textContent = String(v);
        tr.append(td);
      }
      return tr;
    });
    tabela.replaceChildren(...linhas);
  };

  const adicionar = (elementos) => {
    const novos = elementos.filter((el) => cy.getElementById(el.data.id).empty());
    const nosNovos = novos.filter((el) => el.group === "nodes").length;
    if (cy.nodes().length + nosNovos > LIMITE_DE_NOS) {
      aviso.textContent = `O recorte passaria de ${LIMITE_DE_NOS} nós (${cy.nodes().length + nosNovos}). Expanda outro nó ou filtre.`;
      return false;
    }
    cy.add(novos.filter((el) => el.group === "nodes"));
    cy.add(novos.filter((el) => el.group === "edges"));
    aviso.textContent = "";
    return true;
  };

  const vizinhosDaRelacao = (id) => [
    no(id, "relacao"),
    ...(entradas.get(id) ?? []).flatMap((e) => [no(e.source, "relacao"), aresta(e.source, id, e.n)]),
    ...(saidas.get(id) ?? []).flatMap((e) => [no(e.target, "relacao"), aresta(id, e.target, e.n)]),
  ];
  const insumosDaColuna = async (colunaId) => {
    const r = await carregarRelacao(relacaoDaColuna(colunaId));
    const nome = colunaId.split(".").slice(2).join(".");
    const folhas = r?.columns?.[nome]?.lineage?.leaves ?? [];
    return [no(colunaId, "coluna"), ...folhas.flatMap((f) => [no(f, "coluna"), aresta(f, colunaId)])];
  };

  let expandir;
  if (modo === "tudo") {
    cy.add(grafo.nodes.map((n) => no(n.id, "relacao")));
    cy.add(grafo.edges.map((e) => aresta(e.source, e.target, e.n)));
    expandir = async () => cy.nodes().length;
  } else if (modo === "coluna") {
    const r = await carregarRelacao(foco);
    const colunas = Object.keys(r?.columns ?? {}).map((c) => `${foco}.${c}`);
    const elementos = (await Promise.all(colunas.map(insumosDaColuna))).flat();
    if (!adicionar(elementos)) {
      const excesso = aviso.textContent;
      adicionar(colunas.map((c) => no(c, "coluna")));
      aviso.textContent = `${excesso} Mostrando só as colunas de ${foco}; expanda uma coluna por vez.`;
    }
    expandir = async (id) => (adicionar(await insumosDaColuna(id)) ? desenhar("linhagem:expandido") : cy.nodes().length);
  } else {
    adicionar(vizinhosDaRelacao(foco));
    expandir = async (id) => (adicionar(vizinhosDaRelacao(id)) ? desenhar("linhagem:expandido") : cy.nodes().length);
  }
  cy.getElementById(foco).addClass("foco");
  cy.on("dbltap", "node", (ev) => expandir(ev.target.id()));
  await desenhar("linhagem:pronto");
  window.__prova = { cy, expandir, nos: () => cy.nodes().length, limite: LIMITE_DE_NOS };
  document.documentElement.dataset.linhagemPronta = "1";
}
