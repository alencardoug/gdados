// Mede as candidatas da D01, com a linhagem (Cytoscape) e as travessias (Mermaid) da D02,
// contra as metas do PLANO, E3, item 9. Chrome instalado na máquina, via Playwright.
// Uso: node medir.mjs [repetições=5]  →  resultados/<instante>.json e resumo no terminal.
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { servir } from "./servidor.mjs";

const aqui = dirname(fileURLToPath(import.meta.url));
const provas = join(aqui, "..");
const REPETICOES = Number(process.argv[2] ?? 5);
const CANDIDATAS = ["d01-html", "d01-astro"];
const VIEW = "consumption.monthly_revenue_by_channel_and_category";
const EXPANDIR = "analytics.fact_sales_order_item";

const mediana = (xs) => {
  const v = xs.filter((x) => x != null).sort((a, b) => a - b);
  return v.length ? v[Math.floor((v.length - 1) / 2)] : null;
};

// A relação de maior recorte por coluna (colunas e insumos imediatos), calculada dos dados preparados.
function maiorRecortePorColuna(limite = Infinity) {
  const pasta = join(provas, "comum", "gerado", "dados", "relacao");
  let maior = { id: null, nos: 0 };
  for (const a of readdirSync(pasta)) {
    const r = JSON.parse(readFileSync(join(pasta, a), "utf8"));
    const nos = new Set();
    for (const [nome, c] of Object.entries(r.columns)) {
      nos.add(`${r.id}.${nome}`);
      for (const f of c.lineage?.leaves ?? []) nos.add(f);
    }
    if (nos.size > maior.nos && nos.size <= limite) maior = { id: r.id, nos: nos.size };
  }
  return maior;
}

function medirBuild(candidata) {
  const tempos = [];
  for (let i = 0; i < 3; i++) {
    const t0 = performance.now();
    execSync("npm run build --silent", {
      cwd: join(provas, candidata), stdio: "ignore",
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" },
    });
    tempos.push((performance.now() - t0) / 1000);
  }
  return { tempos_s: tempos, mediana_s: mediana(tempos) };
}

async function abrir(navegador, base, rota, cpu, pronto) {
  const contexto = await navegador.newContext({ viewport: { width: 1280, height: 800 } });
  const pagina = await contexto.newPage();
  const cdp = await contexto.newCDPSession(pagina);
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  if (cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
  await pagina.goto(base + rota, { waitUntil: "load" });
  if (pronto) await pagina.waitForFunction((k) => document.documentElement.dataset[k] === "1", pronto, { timeout: 60000 });
  await pagina.waitForFunction(() => performance.getEntriesByName("first-contentful-paint").length > 0, null, { timeout: 30000 });
  const m = await pagina.evaluate(() => {
    const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? null;
    const nav = performance.getEntriesByType("navigation")[0];
    const recursos = performance.getEntriesByType("resource");
    const bytes = (nav?.encodedBodySize ?? 0) + recursos.reduce((s, r) => s + (r.encodedBodySize ?? 0), 0);
    const marca = (n) => performance.getEntriesByName(n).at(-1)?.startTime ?? null;
    return { fcp_ms: fcp, bytes_comprimidos: bytes, linhagem_pronta_ms: marca("linhagem:pronto"), travessias_prontas_ms: marca("travessias:pronto") };
  });
  return { contexto, pagina, m };
}

// Zoom 4×, deslocamento e ajuste à área, 700 ms cada; registra o maior intervalo entre quadros.
const animar = (pagina) =>
  pagina.evaluate(
    () =>
      new Promise((ok) => {
        const { cy } = window.__prova;
        const deltas = [];
        let anterior = performance.now(), ativo = true;
        const laco = (t) => { deltas.push(t - anterior); anterior = t; if (ativo) requestAnimationFrame(laco); };
        requestAnimationFrame((t) => { anterior = t; requestAnimationFrame(laco); });
        const centro = { x: cy.width() / 2, y: cy.height() / 2 };
        cy.animate({ zoom: { level: cy.zoom() * 4, renderedPosition: centro }, duration: 700 })
          .animate({ panBy: { x: 400, y: 200 }, duration: 700 })
          .animate({ fit: { padding: 20 }, duration: 700, complete: () => { ativo = false; ok({ nos: cy.nodes().length, arestas: cy.edges().length, quadro_max_ms: Math.max(...deltas.slice(2)), quadros: deltas.length }); } });
      }),
  );

async function rodada(navegador, base, cpu, maior, maiorPermitido) {
  const r = {};
  // Catálogo e busca
  {
    const { contexto, pagina, m } = await abrir(navegador, base, "/", cpu, "buscaPronta");
    await pagina.locator("#busca").pressSequentially("receita liquida", { delay: 80 });
    await pagina.waitForTimeout(300);
    const buscas = await pagina.evaluate(() => performance.getEntriesByName("busca").map((e) => e.duration));
    r.catalogo = { ...m, busca_max_ms: Math.max(...buscas), busca_mediana_ms: mediana(buscas), resultados: await pagina.locator("#resultados li").count() };
    await contexto.close();
  }
  // Página de relação
  {
    const { contexto, m } = await abrir(navegador, base, `/relacao/${VIEW}/`, cpu);
    r.relacao = m;
    await contexto.close();
  }
  // Linhagem: recorte por relação e expansão de um nível
  {
    const { contexto, pagina, m } = await abrir(navegador, base, `/linhagem/?r=${VIEW}`, cpu, "linhagemPronta");
    const exp = await pagina.evaluate(async (id) => {
      const antes = window.__prova.nos();
      const t0 = performance.now();
      const depois = await window.__prova.expandir(id);
      return { expandir_ms: performance.now() - t0, nos_antes: antes, nos_depois: depois };
    }, EXPANDIR);
    r.linhagem_relacao = { ...m, ...exp };
    await contexto.close();
  }
  // Linhagem: todas as relações, e zoom/deslocamento sobre ela
  {
    const { contexto, pagina, m } = await abrir(navegador, base, "/linhagem/?modo=tudo", cpu, "linhagemPronta");
    const quadros = await animar(pagina);
    r.linhagem_tudo = { ...m, ...quadros };
    await contexto.close();
  }
  // Linhagem por coluna: o maior recorte
  {
    const { contexto, pagina, m } = await abrir(navegador, base, `/linhagem/?modo=coluna&r=${maior.id}`, cpu, "linhagemPronta");
    r.linhagem_coluna = { ...m, relacao: maior.id, nos_calculados: maior.nos, nos_exibidos: await pagina.evaluate(() => window.__prova.nos()), aviso: await pagina.locator("#aviso").textContent() };
    await contexto.close();
  }
  // Linhagem por coluna: o maior recorte dentro do limite, e zoom/deslocamento sobre ele
  {
    const { contexto, pagina, m } = await abrir(navegador, base, `/linhagem/?modo=coluna&r=${maiorPermitido.id}`, cpu, "linhagemPronta");
    r.linhagem_coluna_limite = { ...m, relacao: maiorPermitido.id, nos_exibidos: await pagina.evaluate(() => window.__prova.nos()), quadro_max_ms: (await animar(pagina)).quadro_max_ms };
    await contexto.close();
  }
  // Travessias (Mermaid)
  {
    const { contexto, pagina, m } = await abrir(navegador, base, "/travessias/", cpu, "travessiasProntas");
    r.travessias = { ...m, svg_com_titulo: await pagina.locator("#diagrama svg title").count() > 0 };
    await contexto.close();
  }
  return r;
}

const maior = maiorRecortePorColuna();
const maiorPermitido = maiorRecortePorColuna(300);
const resultado = { instante: new Date().toISOString(), repeticoes: REPETICOES, maior_recorte_por_coluna: maior, maior_recorte_permitido: maiorPermitido, candidatas: {} };
const navegador = await chromium.launch({ channel: "chrome" });
resultado.navegador = navegador.version();
let porta = 4310;
for (const candidata of CANDIDATAS) {
  const build = medirBuild(candidata);
  const servidor = await servir(join(provas, candidata, "dist"), porta);
  const base = `http://127.0.0.1:${porta++}`;
  const porCpu = {};
  for (const cpu of [1, 4]) {
    const rodadas = [];
    for (let i = 0; i < REPETICOES; i++) rodadas.push(await rodada(navegador, base, cpu, maior, maiorPermitido));
    porCpu[`cpu_${cpu}x`] = rodadas;
  }
  servidor.close();
  resultado.candidatas[candidata] = { build, ...porCpu };
}
await navegador.close();

mkdirSync(join(aqui, "resultados"), { recursive: true });
const arquivo = join(aqui, "resultados", `${resultado.instante.replace(/[:.]/g, "-")}.json`);
writeFileSync(arquivo, JSON.stringify(resultado, null, 2) + "\n");

// Resumo: mediana de cada medida por candidata e CPU.
const campos = [
  ["catalogo", "fcp_ms"], ["catalogo", "bytes_comprimidos"], ["catalogo", "busca_max_ms"],
  ["relacao", "fcp_ms"], ["relacao", "bytes_comprimidos"],
  ["linhagem_relacao", "linhagem_pronta_ms"], ["linhagem_relacao", "expandir_ms"], ["linhagem_relacao", "bytes_comprimidos"],
  ["linhagem_tudo", "linhagem_pronta_ms"], ["linhagem_tudo", "quadro_max_ms"],
  ["linhagem_coluna", "linhagem_pronta_ms"], ["linhagem_coluna", "nos_exibidos"],
  ["linhagem_coluna_limite", "linhagem_pronta_ms"], ["linhagem_coluna_limite", "nos_exibidos"], ["linhagem_coluna_limite", "quadro_max_ms"],
  ["travessias", "travessias_prontas_ms"], ["travessias", "bytes_comprimidos"],
];
console.log(`navegador ${resultado.navegador}; ${REPETICOES} repetições; maior recorte por coluna: ${maior.id} (${maior.nos} nós); maior dentro do limite: ${maiorPermitido.id} (${maiorPermitido.nos} nós)`);
for (const [c, d] of Object.entries(resultado.candidatas)) {
  console.log(`\n${c}: build mediana ${d.build.mediana_s.toFixed(2)} s`);
  for (const [secao, campo] of campos) {
    const v = (k) => mediana(d[k].map((r) => r[secao][campo]));
    console.log(`  ${`${secao}.${campo}`.padEnd(40)} 1x ${String(Math.round(v("cpu_1x"))).padStart(8)}   4x ${String(Math.round(v("cpu_4x"))).padStart(8)}`);
  }
}
console.log(`\nresultados em ${arquivo}`);
