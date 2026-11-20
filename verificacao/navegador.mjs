// Verificações da E3 no navegador (Chrome do sistema, via Playwright): desempenho contra as metas do
// PLANO, E3, item 9, e os itens funcionais 7, 8 e 12. Serve portal/dist com gzip, cache desligado.
import { chromium } from "playwright";
import { servir } from "./servidor.mjs";

const PORTA = 4321;
const BASE = `http://127.0.0.1:${PORTA}`;
const mediana = (xs) => {
  const v = xs.filter((x) => x != null).sort((a, b) => a - b);
  return v.length ? v[Math.floor((v.length - 1) / 2)] : null;
};

async function abrir(nav, rota, { cpu = 1, pronto = null, viewport = { width: 1280, height: 800 }, cache = false } = {}) {
  const contexto = await nav.newContext({ viewport });
  const pagina = await contexto.newPage();
  const erros = [];
  pagina.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") erros.push(m.text()); });
  pagina.on("pageerror", (e) => erros.push(e.message));
  const cdp = await contexto.newCDPSession(pagina);
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: !cache });
  if (cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
  await pagina.goto(BASE + rota, { waitUntil: "load" });
  if (pronto) await pagina.waitForSelector(pronto, { timeout: 60000 });
  await pagina.waitForFunction(() => performance.getEntriesByName("first-contentful-paint").length > 0, null, { timeout: 30000 });
  const m = await pagina.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const bytes = (nav?.encodedBodySize ?? 0) + performance.getEntriesByType("resource").reduce((s, r) => s + (r.encodedBodySize ?? 0), 0);
    const marca = (n) => performance.getEntriesByName(n).at(-1)?.startTime ?? null;
    return {
      fcp_ms: performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? null,
      bytes_comprimidos: bytes,
      linhagem_pronta_ms: marca("linhagem:pronto"),
      travessias_prontas_ms: marca("travessias:pronto"),
    };
  });
  return { contexto, pagina, m, erros };
}

// Zoom 4×, deslocamento e ajuste à área, 700 ms cada; o maior intervalo entre quadros.
const animar = (pagina) =>
  pagina.evaluate(() => new Promise((ok) => {
    const cy = document.getElementById("linhagem").cy;
    const deltas = [];
    let anterior = performance.now(), ativo = true;
    const laco = (t) => { deltas.push(t - anterior); anterior = t; if (ativo) requestAnimationFrame(laco); };
    requestAnimationFrame((t) => { anterior = t; requestAnimationFrame(laco); });
    const centro = { x: cy.width() / 2, y: cy.height() / 2 };
    cy.animate({ zoom: { level: cy.zoom() * 4, renderedPosition: centro }, duration: 700 })
      .animate({ panBy: { x: 400, y: 200 }, duration: 700 })
      .animate({ fit: { padding: 20 }, duration: 700, complete: () => { ativo = false; ok({ nos: cy.nodes().length, quadro_max_ms: Math.max(...deltas.slice(2)) }); } });
  }));

async function rodadaDeDesempenho(nav, cpu, { view, expandir, maiorPermitido }) {
  const r = {};
  {
    const { contexto, m } = await abrir(nav, "/governanca/pergunta/P02/", { cpu });
    r.pergunta = m;
    await contexto.close();
  }
  {
    const { contexto, pagina, m } = await abrir(nav, "/governanca/", { cpu, pronto: "html[data-busca-pronta]" });
    await pagina.locator("#busca").pressSequentially("receita liquida", { delay: 80 });
    await pagina.waitForTimeout(400);
    const buscas = await pagina.evaluate(() => performance.getEntriesByName("busca").map((e) => e.duration));
    r.catalogo = { ...m, busca_max_ms: Math.max(...buscas), medidas_de_busca: buscas.length };
    await contexto.close();
  }
  {
    const { contexto, m } = await abrir(nav, `/governanca/relacao/${view}/`, { cpu });
    r.relacao = m;
    await contexto.close();
  }
  {
    const { contexto, pagina, m } = await abrir(nav, `/governanca/linhagem/?modo=relacao&r=${view}`, { cpu, pronto: "#linhagem[data-pronto]" });
    const exp = await pagina.evaluate(async (id) => {
      const raiz = document.getElementById("linhagem");
      const antes = raiz.cy.nodes().length;
      await raiz.expandir(id);
      return { expandir_ms: performance.getEntriesByName("linhagem:expandir").at(-1)?.duration ?? null, nos_antes: antes, nos_depois: raiz.cy.nodes().length };
    }, expandir);
    r.linhagem_relacao = { ...m, ...exp };
    await contexto.close();
  }
  {
    const { contexto, pagina, m } = await abrir(nav, "/governanca/linhagem/?modo=tudo", { cpu, pronto: "#linhagem[data-pronto]" });
    r.linhagem_tudo = { ...m, ...(await animar(pagina)) };
    await contexto.close();
  }
  {
    const { contexto, pagina, m } = await abrir(nav, `/governanca/linhagem/?modo=coluna&r=${maiorPermitido.id}`, { cpu, pronto: "#linhagem[data-pronto]" });
    r.linhagem_coluna = { ...m, relacao: maiorPermitido.id, ...(await animar(pagina)) };
    await contexto.close();
  }
  {
    const { contexto, m } = await abrir(nav, "/estrutura/", { cpu, pronto: "#diagrama[data-pronto]" });
    r.estrutura = m;
    await contexto.close();
  }
  {
    const { contexto, m } = await abrir(nav, "/conceitos/", { cpu });
    r.conceitos = m;
    await contexto.close();
  }
  return r;
}

const METAS = [
  ["pergunta.fcp_ms", "Pergunta P02: primeira renderização do percurso", 1500, "ms"],
  ["pergunta.bytes_comprimidos", "Pergunta P02: dados transferidos", 1_000_000, "B"],
  ["catalogo.fcp_ms", "Governança: primeira renderização com conteúdo", 1500, "ms"],
  ["catalogo.bytes_comprimidos", "Governança: dados transferidos", 1_000_000, "B"],
  ["catalogo.busca_max_ms", "Busca: maior tempo por tecla", 150, "ms"],
  ["relacao.bytes_comprimidos", "Relação: dados transferidos", 1_000_000, "B"],
  ["linhagem_relacao.linhagem_pronta_ms", "Linhagem por relação: recorte inicial desenhado", 1000, "ms"],
  ["linhagem_relacao.expandir_ms", "Linhagem: expandir um nível", 500, "ms"],
  ["linhagem_tudo.linhagem_pronta_ms", "Grafo inteiro desenhado com layout", 3000, "ms"],
  // Meta do grafo inteiro ajustada pelo Owner em 18/11/2026 (E4.4): 100 ms; os recortes seguem em 50 ms.
  ["linhagem_tudo.quadro_max_ms", "Zoom e deslocamento no grafo inteiro: maior quadro", 100, "ms"],
  ["linhagem_coluna.quadro_max_ms", "Zoom e deslocamento no maior recorte por coluna permitido: maior quadro", 50, "ms"],
  ["estrutura.bytes_comprimidos", "Estrutura (com Mermaid): dados transferidos", 1_000_000, "B"],
  ["conceitos.bytes_comprimidos", "Conceitos: dados transferidos", 1_000_000, "B"],
];
const pegar = (o, c) => c.split(".").reduce((x, k) => x?.[k], o);

async function funcionais(nav, { view, pacote }) {
  const res = [];
  const add = (item, nome, ok, detalhe) => res.push({ item, nome, ok, detalhe });
  const errosDeConsole = [];

  // 7. Busca, filtros, histórico e links diretos.
  {
    const { contexto, pagina, erros } = await abrir(nav, "/governanca/", { pronto: "html[data-busca-pronta]", cache: true });
    const consultas = {};
    for (const q of ["P13", "grain", "sensibilidade", "fact_shipment", "receita liquida", "PII"]) {
      await pagina.fill("#busca", q);
      await pagina.waitForTimeout(100);
      consultas[q] = (await pagina.locator("#busca-resultados li").first().textContent())?.trim().slice(0, 80) ?? null;
    }
    await pagina.fill("#busca", "");
    await pagina.selectOption("select[name=camada]", "analytics");
    const filtrado = await pagina.textContent("#catalogo-situacao");
    await pagina.click("#relacoes tbody tr:not([hidden]) a >> nth=0");
    await pagina.waitForLoadState();
    await pagina.goBack();
    await pagina.waitForSelector("html[data-busca-pronta]");
    const voltou = { url: pagina.url().replace(BASE, ""), situacao: await pagina.textContent("#catalogo-situacao") };
    add(7, "Busca encontra perguntas, conceitos, relações e termos em inglês", Object.values(consultas).every(Boolean), consultas);
    add(7, "Filtro fica na URL e é restaurado ao voltar no histórico", voltou.url.includes("camada=analytics") && voltou.situacao === filtrado, { filtrado, voltou });
    errosDeConsole.push(...erros);
    await contexto.close();
  }
  {
    const coluna = "net_revenue_amount";
    const { contexto, pagina, erros } = await abrir(nav, `/governanca/relacao/${view}/#coluna-${coluna}`, { cache: true });
    const alvo = await pagina.evaluate(() => document.querySelector(":target")?.id ?? null);
    const lin = await abrir(nav, `/governanca/linhagem/?modo=relacao&r=${view}&e=analytics.fact_sales_order_item`, { pronto: "#linhagem[data-pronto]", cache: true });
    const recorte = await lin.pagina.evaluate(() => ({ nos: document.getElementById("linhagem").cy.nodes().length, linhas: document.querySelectorAll("#ligacoes tr").length, arestas: document.getElementById("linhagem").cy.edges().length }));
    add(7, "Links diretos abrem a coluna e o recorte expandido da linhagem", alvo === `coluna-${coluna}` && recorte.nos > 5, { alvo, recorte });
    add(8, "Alternativa em tabela: uma linha por ligação do recorte", recorte.linhas === recorte.arestas, recorte);
    errosDeConsole.push(...erros, ...lin.erros);
    await contexto.close(); await lin.contexto.close();
  }

  // 8. Teclado: o primeiro Tab é o atalho para o conteúdo; foco visível na navegação.
  {
    const { contexto, pagina, erros } = await abrir(nav, "/governanca/", { pronto: "html[data-busca-pronta]", cache: true });
    await pagina.keyboard.press("Tab");
    const primeiro = await pagina.evaluate(() => ({ texto: document.activeElement?.textContent?.trim(), href: document.activeElement?.getAttribute("href") }));
    await pagina.keyboard.press("Tab"); await pagina.keyboard.press("Tab");
    const foco = await pagina.evaluate(() => { const e = document.activeElement; const s = getComputedStyle(e); return { texto: e.textContent.trim(), outline: s.outlineStyle, largura: s.outlineWidth }; });
    add(8, "Navegação por teclado: atalho para o conteúdo e foco visível", primeiro.href === "#conteudo" && foco.outline !== "none", { primeiro, foco });
    errosDeConsole.push(...erros);
    await contexto.close();
  }

  // 8. Telas menores: nenhuma rolagem horizontal da página a 390 px.
  {
    const rotas = ["/", "/governanca/", `/governanca/relacao/${view}/`, "/governanca/pergunta/P01/", "/governanca/metricas/", "/governanca/linhagem/",
      "/governanca/evidencias/", "/estrutura/", "/conceitos/", "/conceitos/grao/", "/conceitos/limitacoes/", "/conceitos/roteiro/", "/procedencia/", "/origem/docs/arquitetura.md/"];
    const larguras = {};
    for (const r of rotas) {
      const { contexto, pagina, erros } = await abrir(nav, r, { viewport: { width: 390, height: 844 }, cache: true });
      await pagina.waitForTimeout(r.includes("linhagem") || r.includes("estrutura") || r.includes("arquitetura") ? 1500 : 100);
      larguras[r] = await pagina.evaluate(() => document.documentElement.scrollWidth);
      errosDeConsole.push(...erros);
      await contexto.close();
    }
    add(8, "Telas de 390 px sem rolagem horizontal da página", Object.values(larguras).every((w) => w <= 390), larguras);
  }

  // 8. A amostra do legado tem JSON aninhado, ênfase da camada e rolagem local.
  const sampleChecks = [], highlightChecks = [];
  const legacyColumns = Object.entries(pacote.relations["raw_legacy.support_agents"].columns);
  const classRows = (category) => legacyColumns.filter(([, c]) => c.sensitivity === category).map(([name]) => `coluna-${name}`);
  for (const theme of ["light", "dark"]) {
    const { contexto, pagina, erros } = await abrir(nav, "/governanca/relacao/raw_legacy.support_agents/", {
      viewport: { width: 390, height: 844 }, cache: true,
    });
    await pagina.emulateMedia({ colorScheme: theme });
    const shortcut = pagina.locator('.relation-nav a[href="#amostra"]');
    await shortcut.focus();
    await pagina.keyboard.press("Enter");
    await pagina.keyboard.press("Tab");
    const region = pagina.locator(".sample-scroll");
    const focused = await region.evaluate((e) => e === document.activeElement && e.matches(":focus-visible") && getComputedStyle(e).outlineStyle !== "none");
    const firstCell = region.locator("tbody tr:first-child td:first-child");
    const before = await firstCell.boundingBox();
    await region.evaluate((e) => { e.scrollLeft = e.scrollWidth; });
    const after = await firstCell.boundingBox();
    const scrolled = await region.evaluate((e) => e.scrollLeft > 0);
    const json = region.locator(".sample-json").first();
    await json.locator(":scope > summary").focus();
    await pagina.keyboard.press("Enter");
    const opened = await json.evaluate((e) => e.open);
    const width = await pagina.evaluate(() => document.documentElement.scrollWidth);
    await pagina.keyboard.press("Enter");
    const closed = await json.evaluate((e) => !e.open);
    sampleChecks.push({ theme, focused, scrolled, sticky: Math.abs(before.x - after.x) <= 1, opened, closed, width });

    const legend = pagina.locator("#legenda-sensibilidade");
    const selectedRows = () => pagina.locator("#tabela-colunas tr.highlighted").evaluateAll((rows) => rows.map((r) => r.id));
    await legend.locator('[data-highlight="public"]').click();
    const byClick = await selectedRows();
    const personal = legend.locator('[data-highlight="personal"]');
    await personal.focus();
    await pagina.keyboard.press("Shift+Tab");
    await pagina.keyboard.press("Tab");
    const keyFocus = await personal.evaluate((e) => e.matches(":focus-visible") && getComputedStyle(e).outlineStyle !== "none");
    await pagina.keyboard.press("Enter");
    const byKeyboard = await selectedRows();
    const selectedClass = await personal.getAttribute("aria-current");
    const firstTarget = await pagina.evaluate(() => document.activeElement.id);
    const reset = pagina.locator("#limpar-destaque");
    await reset.focus();
    await pagina.keyboard.press("Space");
    const cleared = (await selectedRows()).length === 0 && await reset.isHidden()
      && await personal.evaluate((e) => document.activeElement === e && !e.hasAttribute("aria-current"));
    highlightChecks.push({ theme, byClick, byKeyboard, keyFocus, selectedClass, firstTarget, cleared });
    errosDeConsole.push(...erros);
    await contexto.close();
  }
  add(8, "Amostra em 390 px nos dois temas: foco pelo teclado, primeira coluna fixa e JSON recolhível",
    sampleChecks.every((r) => r.focused && r.scrolled && r.sticky && r.opened && r.closed && r.width <= 390), sampleChecks);

  add(8, "Legenda em 390 px nos dois temas destaca a classe por clique e Enter e devolve o foco ao limpar",
    highlightChecks.every((r) => JSON.stringify(r.byClick) === JSON.stringify(classRows("public")) &&
      JSON.stringify(r.byKeyboard) === JSON.stringify(classRows("personal")) && r.firstTarget === classRows("personal")[0] &&
      r.keyFocus && r.selectedClass === "true" && r.cleared), highlightChecks);

  const guideChecks = [];
  for (const theme of ["light", "dark"]) {
    const { contexto, pagina, erros } = await abrir(nav, "/governanca/pergunta/P02/", {
      viewport: { width: 390, height: 844 }, cache: true,
    });
    await pagina.emulateMedia({ colorScheme: theme });
    const other = pagina.locator('.measure-picker a:not([aria-current])').first();
    const measure = (await other.textContent()).trim();
    await other.focus();
    await pagina.keyboard.press("Shift+Tab");
    await pagina.keyboard.press("Tab");
    const focus = await other.evaluate((e) => e.matches(":focus-visible") && getComputedStyle(e).outlineStyle !== "none");
    await pagina.keyboard.press("Enter");
    await pagina.waitForURL((u) => u.hash === "#percurso");
    const selected = await pagina.locator(".measure-guide").getAttribute("data-measure");
    const width = await pagina.evaluate(() => document.documentElement.scrollWidth);
    const first = pagina.locator("#passo-1");
    const viewId = await first.getAttribute("data-relation");
    await first.locator(".step-graph").focus();
    await pagina.keyboard.press("Enter");
    await pagina.waitForSelector("#linhagem[data-pronto]");
    const published = await pagina.evaluate(() => document.getElementById("linhagem").cy.edges()
      .map((e) => e.data("source") + "→" + e.data("target")).sort());
    const expected = pacote.lineage.relations[viewId].columns[measure].leaves.map((leaf) => leaf + "→" + viewId + "." + measure).sort();
    const inputsMatch = JSON.stringify(published) === JSON.stringify(expected);
    await pagina.goBack();
    const terminal = pagina.locator('.guide-steps > li').filter({ has: pagina.locator('[data-terminal="source"]') }).first();
    const terminalId = await terminal.getAttribute("id");
    const branch = pagina.locator(`.step-branches a[href="#${terminalId}"]`).first();
    await branch.focus();
    await pagina.keyboard.press("Enter");
    const onBranch = new URL(pagina.url()).hash === "#" + terminalId &&
      await terminal.evaluate((e) => e === document.activeElement && getComputedStyle(e).outlineStyle !== "none");
    const relation = await terminal.getAttribute("data-relation");
    const columns = await terminal.locator("[data-column]").evaluateAll((els) => els.map((e) => e.dataset.column));
    await terminal.locator(".step-graph").focus();
    await pagina.keyboard.press("Enter");
    await pagina.waitForSelector("#linhagem[data-pronto]");
    const nodes = await pagina.evaluate(() => document.getElementById("linhagem").cy.nodes().map((n) => n.id()).sort());
    const exact = JSON.stringify(nodes) === JSON.stringify(columns.map((c) => relation + "." + c).sort());
    await pagina.goBack();
    const restored = await pagina.locator(".measure-guide").getAttribute("data-measure") === selected &&
      new URL(pagina.url()).hash === "#" + terminalId;
    guideChecks.push({ theme, width, focus, selected, measure, inputsMatch, onBranch, exact, restored });
    errosDeConsole.push(...erros);
    await contexto.close();
  }
  add(8, "Percurso em 390 px nos dois temas: escolha por teclado, ramo, recorte terminal no grafo e volta",
    guideChecks.every((r) => r.width <= 390 && r.focus && r.selected === r.measure && r.inputsMatch && r.onBranch && r.exact && r.restored), guideChecks);

  // 12. Ida e volta: do recorte da linhagem à explicação e de volta ao mesmo recorte.
  {
    const { contexto, pagina, erros } = await abrir(nav, `/governanca/linhagem/?modo=relacao&r=${view}&e=analytics.fact_sales_order_item`, { pronto: "#linhagem[data-pronto]", cache: true });
    const antes = pagina.url();
    await pagina.click("a[data-conceito][href*='/conceitos/linhagem/']");
    await pagina.waitForLoadState();
    const noConceito = pagina.url();
    await pagina.click("#retorno a");
    await pagina.waitForSelector("#linhagem[data-pronto]");
    const depois = pagina.url();
    const nos = await pagina.evaluate(() => document.getElementById("linhagem").cy.nodes().length);
    add(12, "Da explicação de volta ao mesmo recorte da linhagem", depois === antes && nos > 5, { antes: antes.replace(BASE, ""), conceito: noConceito.replace(BASE, ""), depois: depois.replace(BASE, ""), nos });
    errosDeConsole.push(...erros);
    await contexto.close();
  }
  add(7, "Nenhum erro ou aviso no console nas verificações funcionais", errosDeConsole.length === 0, { erros: errosDeConsole.slice(0, 20) });
  return res;
}

export async function verificarNoNavegador({ dist, pacote, repeticoes = 5 }) {
  const servidor = await servir(dist, PORTA);
  const nav = await chromium.launch({ channel: "chrome" });
  try {
    const view = pacote.questions.P01.view;
    const expandir = pacote.questions.P01.facts[0];
    // Maior recorte por coluna dentro do limite de 300 nós (colunas e insumos imediatos).
    let maiorPermitido = { id: null, nos: 0 };
    for (const [id, r] of Object.entries(pacote.lineage.relations)) {
      const nos = new Set();
      for (const [c, x] of Object.entries(r.columns)) { nos.add(`${id}.${c}`); for (const f of x.leaves) nos.add(f); }
      if (nos.size > maiorPermitido.nos && nos.size <= 300) maiorPermitido = { id, nos: nos.size };
    }
    const desempenho = { navegador: nav.version(), repeticoes, maior_recorte_por_coluna_permitido: maiorPermitido, cpu: {} };
    for (const cpu of [1, 4]) {
      const rodadas = [];
      for (let i = 0; i < repeticoes; i++) rodadas.push(await rodadaDeDesempenho(nav, cpu, { view, expandir, maiorPermitido }));
      desempenho.cpu[cpu] = Object.fromEntries(METAS.map(([c]) => [c, mediana(rodadas.map((r) => pegar(r, c)))]));
      desempenho.cpu[cpu].rodadas = rodadas;
    }
    const resultados = METAS.map(([c, nome, meta, un]) => ({
      item: 9, nome: `${nome} (meta ${un === "B" ? `${meta / 1e6} MB` : `${meta} ms`})`,
      ok: desempenho.cpu[1][c] != null && desempenho.cpu[1][c] <= meta,
      detalhe: { cpu_1x: desempenho.cpu[1][c], cpu_4x: desempenho.cpu[4][c], unidade: un, meta, mede_em: "CPU 1×; 4× registrado como margem" },
    }));
    resultados.push(...(await funcionais(nav, { view, pacote })));
    return { desempenho, resultados };
  } finally {
    await nav.close();
    servidor.close();
  }
}
