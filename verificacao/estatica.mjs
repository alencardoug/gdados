// Verificações estáticas da E3 sobre portal/dist, conferidas contra o pacote lido diretamente de
// origem/ — sem passar pelo código do portal, para que a fidelidade seja medida de fora.
// Cada verificação devolve { item, nome, ok, detalhe }; "item" é o número da E3 no PLANO.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { checkLegacy } from "./legado.mjs";
import { checkRealRows } from "./linhas-reais.mjs";
import { checkHeatmap } from "./calor.mjs";
import { checkParity } from "./paridade.mjs";
import { checkGuides } from "./percursos.mjs";
// Exceção à independência: a lista dos identificadores mascarados (só hashes) tem um dono, o portal.
import { mascarar } from "../portal/src/lib/mascara.mjs";

const lerJson = (c) => JSON.parse(readFileSync(c, "utf8"));
const html = (dist, rota) => readFileSync(join(dist, rota.replace(/^\//, ""), "index.html"), "utf8");
const textoDe = (h) =>
  h.replace(/<code class="identifier">([\s\S]*?)<\/code>/g, (_, name) => `<code>${name.replace(/<[^>]+>/g, "")}</code>`)
    .replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ");
const relacaoDaColuna = (c) => c.split(".").slice(0, 2).join(".");

function* arquivosHtml(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const c = join(dir, e.name);
    if (e.isDirectory()) yield* arquivosHtml(c);
    else if (e.name.endsWith(".html")) yield c;
  }
}

/** Item 1: todo link interno e toda âncora apontam para algo que existe em dist/. */
function conferirLinks(dist) {
  const idsPorArquivo = new Map();
  const ids = (arquivo) => {
    if (!idsPorArquivo.has(arquivo)) {
      idsPorArquivo.set(arquivo, new Set([...readFileSync(arquivo, "utf8").matchAll(/ id="([^"]+)"/g)].map((m) => m[1])));
    }
    return idsPorArquivo.get(arquivo);
  };
  const destino = (caminho) => {
    const c = join(dist, decodeURIComponent(caminho));
    if (existsSync(c) && statSync(c).isFile()) return c;
    if (existsSync(join(c, "index.html"))) return join(c, "index.html");
    return null;
  };
  const quebrados = [];
  let total = 0;
  for (const arquivo of arquivosHtml(dist)) {
    const origemDoLink = "/" + relative(dist, arquivo).replace(/index\.html$/, "");
    for (const m of readFileSync(arquivo, "utf8").matchAll(/ (?:href|src)="([^"]+)"/g)) {
      const bruto = m[1].replace(/&amp;/g, "&");
      if (/^(https?:|data:|mailto:)/.test(bruto)) continue;
      total++;
      // Resolvido como o navegador resolve, a partir do endereço da página.
      const url = new URL(bruto, `http://portal${origemDoLink}`);
      const caminho = url.pathname;
      const ancora = url.hash ? url.hash.slice(1) : null;
      const alvo = destino(caminho);
      if (!alvo) { quebrados.push(`${origemDoLink} → ${bruto}`); continue; }
      if (ancora && alvo.endsWith(".html") && !ids(alvo).has(decodeURIComponent(ancora))) quebrados.push(`${origemDoLink} → ${bruto} (âncora)`);
    }
  }
  return { total, quebrados };
}

/** Insumos imediatos (leaves) e origens terminais recalculadas pelo caminho das folhas. */
function origensPorCaminho(L, coluna, visto = new Set()) {
  const r = L[relacaoDaColuna(coluna)]?.columns?.[coluna.split(".").slice(2).join(".")];
  if (!r || visto.has(coluna)) return new Set([coluna]);
  visto.add(coluna);
  const fim = new Set();
  for (const f of r.leaves) for (const o of origensPorCaminho(L, f, visto)) fim.add(o);
  if (!r.leaves.length) for (const o of r.origins) fim.add(o.column);
  return fim;
}

export function verificarEstatica({ dist, origem }) {
  const pacote = lerJson(join(origem, "pacote_de_metadados.json"));
  const procedencia = lerJson(join(origem, "procedencia.json"));
  const L = pacote.lineage.relations;
  const R = pacote.relations;
  const res = [];
  const add = (item, nome, ok, detalhe) => res.push({ item, nome, ok, detalhe });

  // 1. Contrato, identificadores e ligações.
  const links = conferirLinks(dist);
  add(1, "Links internos e âncoras de dist/ resolvem", links.quebrados.length === 0,
    { links_conferidos: links.total, quebrados: links.quebrados.slice(0, 50), total_quebrados: links.quebrados.length });
  const semPagina = Object.keys(R).filter((id) => !existsSync(join(dist, "governanca", "relacao", id, "index.html")));
  add(1, "Toda relação do pacote tem página", semPagina.length === 0, { relacoes: Object.keys(R).length, sem_pagina: semPagina });
  const semPergunta = Object.keys(pacote.questions).filter((id) => !existsSync(join(dist, "governanca", "pergunta", id, "index.html")));
  add(1, "Toda pergunta do pacote tem página", semPergunta.length === 0, { perguntas: Object.keys(pacote.questions).length, sem_pagina: semPergunta });
  checkGuides(pacote, (path) => html(dist, path), add);

  // Grafo publicado = agregação das folhas do pacote, sem aresta a mais ou a menos (itens 2 e 9).
  const grafo = lerJson(join(dist, "dados", "grafo.json"));
  const esperado = new Map();
  for (const [destino, r] of Object.entries(L)) for (const c of Object.values(r.columns)) for (const f of c.leaves) {
    const fonte = relacaoDaColuna(f);
    if (fonte !== destino && R[fonte] && R[destino]) esperado.set(`${fonte}→${destino}`, (esperado.get(`${fonte}→${destino}`) ?? 0) + 1);
  }
  const publicado = new Map(grafo.edges.map((e) => [`${e.source}→${e.target}`, e.n]));
  const aMais = [...publicado.keys()].filter((k) => !esperado.has(k));
  const aMenos = [...esperado.keys()].filter((k) => !publicado.has(k));
  const contagemDiferente = [...esperado].filter(([k, n]) => publicado.has(k) && publicado.get(k) !== n).map(([k]) => k);
  add(2, "Nenhuma ligação fabricada no grafo por relação", !aMais.length && !aMenos.length && !contagemDiferente.length,
    { arestas: publicado.size, a_mais: aMais, a_menos: aMenos, contagem_diferente: contagemDiferente });

  // Orientação: confere o que o leitor recebe, inclusive a direção e o destino de cada link.
  const layers = Object.groupBy(Object.values(R), (r) => r.schema);
  const homeHtml = html(dist, "/");
  const stations = [...homeHtml.matchAll(/<div class="layer-station"><a href="[^"]*\?camada=([^"#]+)#catalogo">([\s\S]*?)<\/a>([\s\S]*?)<\/div>/g)]
    .map(([, layer, body, tail]) => [decodeURIComponent(layer), textoDe(body).trim(), Number(body.match(/class="layer-count">(\d+)/)?.[1]), textoDe(tail)]);
  const mapMatches = stations.length === Object.keys(layers).length && Object.entries(layers).every(([c, xs]) =>
    stations.some(([target, text, n]) => target === c && text.startsWith(c + " ") && n === xs.length));
  add(6, "Cada camada abre seu catálogo e mostra o número de relações do pacote", mapMatches,
    { camadas: stations.length, relacoes: Object.keys(R).length });

  const expectedFlows = new Map();
  for (const edge of esperado.keys()) {
    const [source, target] = edge.split("→").map((id) => R[id].schema);
    const pair = `${source}→${target}`;
    expectedFlows.set(pair, (expectedFlows.get(pair) ?? 0) + 1);
  }
  const traces = [...homeHtml.matchAll(/<span class="map-trace (\w+)" style="([^"]+)" data-from="([^"]+)" data-to="([^"]+)">([\s\S]*?)<b>(\d+)<\/b>/g)]
    .map(([, shape, style, source, target, body, n]) => ({
      shape, style, source, target, body, pairs: Number(n), width: Number(style.match(/--stroke:([\d.]+)px/)?.[1]),
    }));
  const drawn = traces.map((t) => [`${t.source}→${t.target}`, t.pairs]);
  const flowTable = homeHtml.match(/Ler todos os fluxos em tabela<\/summary>([\s\S]*?)<\/table>/)?.[1] ?? "";
  const tabulated = [...flowTable.matchAll(/<tr><td>(.*?)<\/td><td>(.*?)<\/td><td>(\d+)<\/td><\/tr>/gs)]
    .map(([, source, target, n]) => [`${textoDe(source).trim()}→${textoDe(target).trim()}`, Number(n)]);
  const sameFlows = (pairs) => pairs.length === expectedFlows.size && isDeepStrictEqual(new Map(pairs), expectedFlows);
  add(2, "Traços, ramais, saltos e tabela contam os pares dirigidos entre as camadas", sameFlows(drawn) && sameFlows(tabulated),
    { fluxos: expectedFlows.size, pares: esperado.size });
  const incoming = new Set([...expectedFlows.keys()].map((pair) => pair.split("→")).filter(([a,b]) => a !== b).map(([,b]) => b));
  const withoutInput = Object.keys(layers).filter((layer) => !incoming.has(layer)).sort();
  const note = homeHtml.match(/class="input-key">([\s\S]*?)<\/p>/)?.[1] ?? "";
  const named = [...note.matchAll(/<code class="identifier">(.*?)<\/code>/g)].map(([tag]) => textoDe(tag).trim()).sort();
  add(2, "A legenda identifica a trilha do legado e reúne as estações sem entrada", isDeepStrictEqual(named, withoutInput) &&
    (homeHtml.match(/A linhagem não informa entrada de outra camada/g) ?? []).length === Number(withoutInput.length > 0) &&
    homeHtml.includes('class="legacy-key">Trilha do legado') === [...expectedFlows.keys()].some((key) => key.startsWith("raw_legacy→")),
    { camadas_sem_entrada: named });

  // A faixa do desvio começa sob o legado, passa ao lado de staging e termina no topo de trusted.
  const gridArea = (style) => style?.match(/grid-area:([\d /]+)/)?.[1].split("/").map(Number) ?? [];
  const cells = new Map([...homeHtml.matchAll(/class="station-cell" data-layer="([^"]+)" style="([^"]+)"/g)]
    .map(([, layer, style]) => [layer, gridArea(style)]));
  const raw = cells.get("raw"), legacy = cells.get("raw_legacy"), stage = cells.get("staging"), trusted = cells.get("trusted");
  const peers = !(layers.raw && layers.raw_legacy) ||
    (raw && legacy && raw[0] === 1 && legacy[0] === raw[0] && raw[3] <= legacy[1]);
  const direct = traces.find((t) => t.source === "raw_legacy" && t.target === "trusted");
  const [top, left, bottom, right] = gridArea(direct?.style);
  const x = (left + right) / 2;
  const bypass = !expectedFlows.has("raw_legacy→trusted") || (legacy && trusted && direct?.shape === "down" &&
    top === legacy[2] && bottom === trusted[0] && legacy[1] < x && x < legacy[3] && trusted[1] < x && x < trusted[3] &&
    (!stage || (top <= stage[0] && stage[2] <= bottom && stage[3] <= left)));
  const viaStage = !expectedFlows.has("raw_legacy→staging") ||
    traces.some((t) => t.source === "raw_legacy" && t.target === "staging" && t.shape === "bend" && t.body.includes("<path "));
  add(2, "As entradas dividem o topo e o traço do legado chega a trusted por fora de staging", Boolean(peers && bypass && viaStage),
    { entradas: [raw, legacy], desvio: direct?.pairs });

  const largest = Math.max(1, ...expectedFlows.values());
  const widthsMatch = traces.every((t) => {
    const count = expectedFlows.get(`${t.source}→${t.target}`);
    const expected = largest === 1 ? 1 : 1 + (count - 1) * 9 / (largest - 1);
    return Math.abs(t.width - expected) < 0.00001;
  });
  const key = homeHtml.match(/class="map-key">([\s\S]*?)<\/div>/)?.[1] ?? "";
  const legendMatches = largest === 1 ? key.includes("1 px de espessura") : key.includes(`1 px (1 par) a 10 px (${largest} pares)`);
  add(2, "Todos os traços seguem a escala linear explicada junto ao mapa", sameFlows(drawn) && widthsMatch && legendMatches,
    { maior_fluxo: largest, espessuras_distintas: new Set(traces.map((t) => t.width)).size });

  const example = key.match(/class="pair-example">([\s\S]*?)<\/p>/)?.[1] ?? "";
  const exampleIds = [...example.matchAll(/href="[^"]*\/relacao\/([^"/]+)\/"/g)].map((m) => m[1]);
  const exampleText = textoDe(example).trim();
  const linksBetweenColumns = Number(exampleText.match(/por (\d+) ligaç(?:ões|ão) entre colunas/)?.[1]);
  const exampleMatches = esperado.size ? exampleIds.length === 2 &&
    esperado.get(exampleIds.join("→")) === linksBetweenColumns && exampleText.includes("O par conta 1") : !example;
  add(2, "O exemplo da legenda liga as duas fichas e confere com as folhas entre suas colunas", exampleMatches,
    { exemplo: exampleIds, ligacoes_entre_colunas: linksBetweenColumns });

  const loops = [];
  for (const match of homeHtml.matchAll(/class="layer-station"><a href="[^"]*\?camada=([^"#]+)#catalogo">([\s\S]*?)<\/div>/g)) {
    for (const loop of match[2].matchAll(/class="map-trace loop"[^>]*data-from="([^"]+)" data-to="([^"]+)">[\s\S]*?<svg [\s\S]*?<path [\s\S]*?<\/svg><b>(\d+)<\/b>/g)) {
      loops.push([match[1], loop[1], loop[2], Number(loop[3])]);
    }
  }
  const expectedLoops = [...expectedFlows].filter(([pair]) => {
    const [source, target] = pair.split("→");
    return source === target;
  });
  add(2, "Cada fluxo interno forma um laço numerado dentro da estação correspondente",
    loops.length === expectedLoops.length && expectedLoops.every(([pair, n]) =>
      loops.some(([layer, source, target, count]) => layer === source && `${source}→${target}` === pair && count === n)),
    { lacos: loops.map(([layer, , , pairs]) => [layer, pairs]) });

  const mapErrors = [], barErrors = [], orderErrors = [], neighborLayerErrors = [];
  const noteErrors = [], nameErrors = [], sensitivityTargetErrors = [];
  let summarizedTypes = 0;
  const exported = lerJson(join(origem, "amostras_de_registros.json"));
  const samples = exported.relations;
  checkLegacy(pacote, exported, readFileSync(join(origem, "arquivos/src/mvp_ed1/legacy/catalogo.yml"), "utf8"),
    (path) => html(dist, path), add);
  checkRealRows(pacote, exported, dist, (path) => html(dist, path), add);
  checkHeatmap(pacote, exported, (path) => html(dist, path), add);
  checkParity(pacote, origem, (path) => html(dist, path), add);
  for (const [id, r] of Object.entries(R)) {
    const page = html(dist, `/governanca/relacao/${id}/`);
    const orientation = page.match(/<section aria-labelledby="linhagem">([\s\S]*?)<\/section>/)?.[1] ?? "";
    const currentLayers = [...orientation.matchAll(/\?camada=([^"#]+)#catalogo" aria-current="location"/g)].map((m) => decodeURIComponent(m[1]));
    const inputs = [], outputs = [], rows = [];
    for (const [edge, n] of esperado) {
      const [source, target] = edge.split("→");
      if (target === id) { inputs.push(source); rows.push(`Insumo ${source} ${n}`); }
      if (source === id) { outputs.push(target); rows.push(`Consumidor ${target} ${n}`); }
    }
    const flow = orientation.split('class="lineage-table"')[0];
    const [before, after = ""] = flow.split('class="current-relation"');
    const neighbors = (fragment) => [...fragment.matchAll(/href="[^"]*\/relacao\/([^"/]+)\/"><code class="identifier">([\s\S]*?)<\/code>/g)]
      .map(([, href, body]) => {
        const name = body.replace(/<[^>]+>/g, "");
        return href === name ? href : `${name} → ${href}`;
      }).sort();
    const tableRows = [...orientation.matchAll(/<tr><td>(Insumo|Consumidor)<\/td>([\s\S]*?)<\/tr>/g)]
      .map(([row]) => textoDe(row).trim()).sort();
    if (!isDeepStrictEqual(currentLayers, [r.schema]) || !isDeepStrictEqual(neighbors(before), inputs.sort()) ||
        !isDeepStrictEqual(neighbors(after), outputs.sort()) || !isDeepStrictEqual(tableRows, rows.sort())) mapErrors.push(id);

    const expectedStops = [];
    for (const [direction, ids] of [["inputs", inputs], ["outputs", outputs]]) {
      for (const [layer, group] of Object.entries(Object.groupBy(ids, (i) => R[i].schema))) {
        const verbs = direction === "inputs" ? ["fornece", "fornecem"] : ["recebe", "recebem"];
        expectedStops.push(`${direction} ${layer} ${group.length} ${verbs[group.length === 1 ? 0 : 1]}`);
      }
    }
    const stops = [...flow.matchAll(/class="neighbor-layer" data-direction="([^"]+)" data-layer="([^"]+)">[\s\S]*?<b>(\d+ \w+)<\/b>/g)]
      .map(([, direction, layer, count]) => `${direction} ${layer} ${count}`);
    const ordinaryLayers = ["raw", "raw_legacy", "staging", "trusted", "analytics", "consumption"];
    const other = [id, ...inputs, ...outputs].some((i) => !ordinaryLayers.includes(R[i].schema));
    if (!isDeepStrictEqual(stops.sort(), expectedStops.sort()) || flow.includes("Outras funções") !== other ||
        flow.includes("inputs connected") !== Boolean(inputs.length) ||
        flow.includes("outputs connected") !== Boolean(outputs.length)) neighborLayerErrors.push(id);

    const classes = Object.groupBy(Object.values(r.columns), (c) => c.sensitivity ?? "ausente");
    const expectedCounts = Object.fromEntries(Object.entries(classes).map(([c, xs]) => [c, xs.length]));
    const countsIn = (re) => Object.fromEntries([...page.matchAll(re)].map(([, c, n]) => [c, Number(n)]));
    const legend = countsIn(/<i [^>]*data-class="[^"]+"[^>]*><\/i><code>([^<]+)<\/code> <b>(\d+)<\/b>/g);
    const bar = countsIn(/<span data-class="([^"]+)" style="flex-grow:(\d+)"/g);
    if (!isDeepStrictEqual(legend, expectedCounts) || !isDeepStrictEqual(bar, expectedCounts)) barErrors.push(id);

    const columnEntries = Object.entries(r.columns);
    const rowClasses = [...page.matchAll(/<tr id="coluna-([^"]+)" data-sensitivity="([^"]+)"/g)]
      .map(([, name, category]) => [name, category]);
    const legendTargets = [...page.matchAll(/href="#coluna-([^"]+)" data-highlight="([^"]+)" aria-controls="tabela-colunas"/g)]
      .map(([, name, category]) => [category, name]);
    const firstByClass = new Map();
    for (const [name, col] of columnEntries) {
      const category = col.sensitivity ?? "ausente";
      if (!firstByClass.has(category)) firstByClass.set(category, name);
    }
    if (!isDeepStrictEqual(rowClasses, columnEntries.map(([name, c]) => [name, c.sensitivity ?? "ausente"])) ||
        legendTargets.length !== firstByClass.size || !isDeepStrictEqual(new Map(legendTargets), firstByClass)) sensitivityTargetErrors.push(id);

    const dictionary = page.slice(page.indexOf('id="colunas"'), page.indexOf('id="amostra"'));
    const missingTypes = Object.values(r.columns).filter((c) => c.data_type == null).length;
    const allMissing = missingTypes > 0 && missingTypes === Object.keys(r.columns).length;
    if (allMissing) summarizedTypes++;
    const typeNote = dictionary.match(/<caption[^>]*>([\s\S]*?)<\/caption>/)?.[1] ?? "";
    if (typeNote.includes("Tipo</b> · não declarado no pacote") !== allMissing ||
        (dictionary.match(/class="ausente">não declarado no pacote</g) ?? []).length !== (allMissing ? 0 : missingTypes)) noteErrors.push(id);

    const nameMarkup = /<code class="identifier">([\s\S]*?)<\/code>/g;
    const dictionaryNames = [...dictionary.matchAll(/<th scope="row"><code class="identifier">([\s\S]*?)<\/code>/g)]
      .map(([, body]) => body.replace(/<[^>]+>/g, ""));
    const validBreaks = [...page.matchAll(nameMarkup)].every(([, body]) => {
      const parts = body.split(/<wbr\s*\/?>/).map((part) => part.match(/^<span>([^<]*)<\/span>$/)?.[1]);
      return parts.every((part, i) => part != null && (i === parts.length - 1 || /[._]$/.test(part)));
    });
    const title = page.match(/<h1>([\s\S]*?)<\/h1>/)?.[1] ?? "";
    if (!validBreaks || !title.includes('class="identifier"') || textoDe(title).trim() !== id ||
        !isDeepStrictEqual(dictionaryNames.sort(), Object.keys(r.columns).sort())) nameErrors.push(id);

    const a = samples[id];
    if (a.row_count === 0) continue;
    const sampleOrder = textoDe(page.match(/id="amostra">[^<]*<\/h2><p>([\s\S]*?)<\/p>/)?.[1] ?? "").trim();
    const byPrimaryKey = isDeepStrictEqual(a.order.key, r.primary_key);
    const byAllColumns = isDeepStrictEqual(a.order.key, a.columns);
    if (sampleOrder.includes("chave primária") !== byPrimaryKey ||
        sampleOrder.includes("todas as colunas") !== (!byPrimaryKey && byAllColumns) ||
        sampleOrder.includes("defeito registrado") !== a.order.defect_first ||
        ((byPrimaryKey || !byAllColumns) && !sampleOrder.includes(a.order.key.join(" , ")))) orderErrors.push(id);
  }
  add(2, "Minimapas e tabelas reproduzem a camada e os vizinhos imediatos de cada relação", mapErrors.length === 0,
    { relacoes: Object.keys(R).length, arestas: esperado.size, divergentes: mapErrors });
  add(2, "Faixas das fichas só acendem os sentidos com vizinhos e contam cada camada", !neighborLayerErrors.length,
    { relacoes: Object.keys(R).length, divergentes: neighborLayerErrors });
  add(6, "Barras e legendas reproduzem a classificação de cada conjunto de colunas", barErrors.length === 0,
    { relacoes: Object.keys(R).length, divergentes: barErrors });
  add(8, "Sem executar JavaScript cada classe tem contagem e link para a primeira coluna correspondente", !sensitivityTargetErrors.length && !barErrors.length,
    { fichas: Object.keys(R).length, divergentes: sensitivityTargetErrors });
  add(6, "Tipo inteiramente ausente recebe uma nota e tipos parcialmente ausentes conservam seus avisos", !noteErrors.length,
    { fichas_com_nota: summarizedTypes, divergentes: noteErrors });
  add(8, "Nomes do cartão e do dicionário preservam o identificador e só oferecem quebras nos separadores", !nameErrors.length,
    { fichas: Object.keys(R).length, divergentes: nameErrors });
  add(6, "Ordem de exportação da amostra e chave primária têm rótulos fiéis", orderErrors.length === 0,
    { amostras: Object.keys(samples).length, divergentes: orderErrors });

  // 2. Receita: a coluna de receita líquida da view da P01 chega às duas origens.
  const p01 = pacote.questions.P01;
  const receita = `${p01.view}.net_revenue_amount`;
  const porCaminho = [...origensPorCaminho(L, receita)];
  const declaradas = (L[p01.view]?.columns?.net_revenue_amount?.origins ?? []).map((o) => o.column);
  const camadasDeOrigem = [...new Set(porCaminho.map((c) => c.split(".")[0]))].sort();
  const paginaView = textoDe(html(dist, `/governanca/relacao/${p01.view}/`));
  add(2, "Receita líquida da P01 chega a raw e raw_legacy pelo caminho das folhas, igual às origens declaradas",
    camadasDeOrigem.includes("raw") && camadasDeOrigem.includes("raw_legacy") &&
      JSON.stringify([...porCaminho].sort()) === JSON.stringify([...declaradas].sort()) && declaradas.every((c) => paginaView.includes(c)),
    { coluna: receita, origens_pelo_caminho: porCaminho.sort(), origens_declaradas: declaradas.sort(), camadas: camadasDeOrigem });

  // 3. Estoque e travessias: a fato de estoque chega ao lote, ao streaming e ao legado; a travessia
  //    do streaming liga só à tabela dele; o grafo por coluna não carrega travessia.
  const estoque = new Set();
  for (const c of Object.values(L["analytics.fact_inventory_movement"]?.columns ?? {})) for (const o of c.origins) estoque.add(relacaoDaColuna(o.column));
  const travessiaStream = grafo.travessias.find((t) => t.destino === "raw.inventory_movements_stream");
  const travessiaRaw = grafo.travessias.find((t) => t.destino === "raw");
  add(3, "Estoque chega ao lote, ao streaming e ao legado; travessias sem precisão por coluna",
    estoque.has("raw.inventory_movements") && estoque.has("raw.inventory_movements_stream") && estoque.has("raw_legacy.inventory_movements") &&
      travessiaStream?.tipo === "relacao" && JSON.stringify(travessiaStream.relacoes) === '["raw.inventory_movements_stream"]' &&
      travessiaRaw?.tipo === "camada" && !travessiaRaw.relacoes.includes("raw.inventory_movements_stream"),
    { origens_da_fato: [...estoque].sort(), travessia_streaming: travessiaStream, travessia_raw: travessiaRaw && { ...travessiaRaw, relacoes: travessiaRaw.relacoes.length } });

  // 4. Coluna de seed e coluna gerada reconhecidas como terminais.
  const seedCol = Object.entries(L).flatMap(([r, x]) => Object.entries(x.columns).filter(([, c]) => c.origins.length && c.origins.every((o) => o.kind === "seed")).map(([c]) => [r, c]))[0];
  const gerCol = Object.entries(L).flatMap(([r, x]) => Object.entries(x.columns).filter(([, c]) => c.origins.length && c.origins.every((o) => o.kind === "generated")).map(([c]) => [r, c]))[0];
  // A linha da coluna vai até a próxima coluna ou o fim da tabela de colunas (há tabelas aninhadas).
  const linhaDe = (r, c) => {
    const h = html(dist, `/governanca/relacao/${r}/`);
    const i = h.indexOf(`id="coluna-${c}"`);
    const proxima = h.indexOf(' id="coluna-', i + 5);
    // A tabela de colunas é a única envolvida em div.rolagem e termina em "</tbody></table></div>";
    // as tabelas aninhadas (valores) terminam em "</table>" seguido de "</details>".
    const fimDaTabela = h.indexOf("</tbody></table></div>", i);
    const fim = proxima > 0 && proxima < fimDaTabela ? proxima : fimDaTabela;
    return h.slice(i, fim);
  };
  const linhaSeedHtml = linhaDe(...seedCol), linhaGerHtml = linhaDe(...gerCol);
  const linhaSeed = textoDe(linhaSeedHtml), linhaGer = textoDe(linhaGerHtml);
  add(4, "Seed e valor gerado aparecem como origem terminal, sem marca de ausência",
    /<span class="etiqueta">seed<\/span>/.test(linhaSeedHtml) && /<span class="etiqueta">valor gerado<\/span>/.test(linhaGerHtml) &&
      !/sem linhagem|nenhuma origem/.test(linhaSeed + linhaGer),
    { seed: `${seedCol.join(".")}: ${linhaSeed.slice(-200)}`, gerada: `${gerCol.join(".")}: ${linhaGer.slice(-200)}` });

  // 5. Itens em aberto do pacote e decisão já tomada (D66) exibidos sem reinterpretação.
  const evid = html(dist, "/governanca/evidencias/");
  const itensFaltando = pacote.open_items.filter((i) => !textoDe(evid).includes(i.id)).map((i) => i.id);
  const estadosIguais = pacote.open_items.every((i) => evid.includes(`estado ${i.state}`));
  const pend = html(dist, "/conceitos/pendencia/");
  const d66 = /href="\/origem\/docs\/pendencias\.md\/#d66--[^"]+"/.test(pend) && /id="d66--/.test(html(dist, "/origem/docs/pendencias.md/"));
  add(5, "Todos os itens de open_items com o estado do pacote; D66 lida no documento responsável",
    !itensFaltando.length && estadosIguais && d66 && pacote.open_items.every((i) => i.objects == null ? evid.includes("não declarados") : true),
    { itens: pacote.open_items.map((i) => `${i.id} ${i.state}`), faltando: itensFaltando, d66_ligada: d66 });

  // 6. Fidelidade de contagens, das regras das métricas e da comparação de infraestrutura.
  const inicio = textoDe(html(dist, "/"));
  const contagens = {
    relations: Object.keys(R).length, lineage: Object.keys(L).length, questions: Object.keys(pacote.questions).length,
    metrics: Object.keys(pacote.metrics).length, tests: Object.keys(pacote.tests).length, checks: Object.keys(pacote.checks).length,
    open_items: pacote.open_items.length, environments: pacote.environments.length,
  };
  const contagensFaltando = Object.entries(contagens).filter(([k, n]) => !new RegExp(`${k} ${n}\\b`).test(inicio)).map(([k]) => k);
  add(6, "Contagens da página inicial iguais às do pacote", !contagensFaltando.length, { contagens, divergentes: contagensFaltando });

  const met = html(dist, "/governanca/metricas/");
  const secao = (nome) => { const i = met.indexOf(`id="metrica-${nome}"`); return textoDe(met.slice(i, met.indexOf("</section>", i))); };
  const errosMetrica = [];
  for (const [nome, m] of Object.entries(pacote.metrics)) {
    const s = secao(nome);
    if (m.kind === "ratio") {
      if (m.on_zero_denominator === "returns_null" && !s.includes("returns_null")) errosMetrica.push(`${nome}: returns_null não exibido`);
      if (m.on_zero_denominator == null && !s.includes("não declarado")) errosMetrica.push(`${nome}: ausência não marcada`);
    }
    if (!s.includes(m.additivity === "additive" ? "aditiva" : m.additivity === "non_additive" ? "não aditiva" : "semiaditiva")) errosMetrica.push(`${nome}: aditividade`);
    for (const c of m.columns) if (!s.includes(c.column)) errosMetrica.push(`${nome}: coluna ${c.column}`);
  }
  const leZeroAntigo = /zero_denominator/.test(textoDe(met).replace(/on_zero_denominator/g, ""));
  add(6, "Regras das métricas fiéis ao pacote; denominador zero lido de on_zero_denominator", !errosMetrica.length && !leZeroAntigo,
    { metricas: Object.keys(pacote.metrics).length, razoes: Object.values(pacote.metrics).filter((m) => m.kind === "ratio").length, erros: errosMetrica, cita_zero_denominator: leZeroAntigo });

  const est = html(dist, "/estrutura/");
  const ambientesFaltando = pacote.environments.filter((e) => !est.includes(`id="ambiente-${e.id}"`) || !textoDe(est).includes(e.path)).map((e) => e.id);
  const indisponivel = pacote.environments.filter((e) => e.delivery === "not_available").every((e) => {
    const i = est.indexOf(`id="ambiente-${e.id}"`); return textoDe(est.slice(i, est.indexOf("</tr>", i))).includes("indisponível");
  });
  add(6, "Comparação de infraestrutura: toda entrada de environments, com o estado de entrega", !ambientesFaltando.length && indisponivel,
    { entradas: pacote.environments.length, faltando: ambientesFaltando, indisponivel_marcado: indisponivel });

  // 10. Revisão do que seria publicado: segredos e identificadores fora do escopo.
  const achados = { emails: new Set(), chaves: [], arquivos_proibidos: [], projetos_gcp: new Map() };
  const dominiosDeExemplo = /@(exemplo\.com|example\.(com|org|net))$|\.(invalid|example|test)$/;
  // Os projetos do próprio projeto de dados ficam (D04); os demais identificadores são mascarados.
  const PROJETOS = /\b(mvp-ed1-gcp|mvp-ed1-estudo)\b/g;
  const mascarados = [];
  const visitar = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const c = join(dir, e.name);
      if (e.isDirectory()) { visitar(c); continue; }
      if (/^\.env|\.tfstate|\.pem$|\.key$|credentials.*\.json$|service-account.*\.json$/.test(e.name)) achados.arquivos_proibidos.push(relative(dist, c));
      if (!/\.(html|json|js|css|txt|svg)$/.test(e.name)) continue;
      const t = readFileSync(c, "utf8");
      if (/BEGIN [A-Z ]*PRIVATE KEY/.test(t)) achados.chaves.push(relative(dist, c));
      for (const m of t.matchAll(/[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}/g)) if (!dominiosDeExemplo.test(m[0]) && !/\.(js|css)$/.test(e.name)) achados.emails.add(`${m[0]} (${relative(dist, c)})`);
      if (mascarar(t).trocas) mascarados.push(relative(dist, c));
      for (const m of t.matchAll(PROJETOS)) achados.projetos_gcp.set(m[1], (achados.projetos_gcp.get(m[1]) ?? new Set()).add(relative(dist, c).replace(/\/index\.html$/, "")));
    }
  };
  visitar(dist);
  add(10, "Sem segredos, chaves, arquivos proibidos ou e-mails reais em dist/",
    !achados.chaves.length && !achados.arquivos_proibidos.length && !achados.emails.size,
    { chaves: achados.chaves, arquivos_proibidos: achados.arquivos_proibidos, emails: [...achados.emails].slice(0, 20) });
  add(10, "Nenhum identificador mascarado pela D04 (projetos sem relação, conta de faturamento) em dist/",
    !mascarados.length, { arquivos: mascarados.slice(0, 20) });
  add(10, "Projetos GCP do projeto de dados presentes em dist/ (mantidos pela D04; não é falha)", true,
    { projetos: Object.fromEntries([...achados.projetos_gcp].map(([k, v]) => [k, [...v]])) });

  // 11. Cobertura da busca: todo termo do inventário é achado pelo título e por cada termo de busca.
  const busca = lerJson(join(dist, "dados", "busca.json"));
  const normalizar = (s) => (s ?? "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  const alvos = busca.map((e) => ({ ...e, alvo: normalizar(`${e.id} ${e.rotulo} ${e.texto ?? ""}`) }));
  const editorial = lerJson(join(dist, "dados", "editorial.json"));
  const conceitos = busca.filter((e) => e.k === "conceito");
  const naoAchados = [];
  for (const c of conceitos) {
    const termos = [c.rotulo, ...(c.texto ?? "").split(" · ")[0].split(", ").filter(Boolean)];
    for (const t of termos) {
      const partes = normalizar(t).split(/\s+/).filter(Boolean);
      if (!alvos.some((a) => a.id === c.id && a.k === "conceito" && partes.every((p) => a.alvo.includes(p)))) naoAchados.push(`${c.id}: ${t}`);
    }
  }
  add(11, "Todo termo do inventário é achado na busca pelo nome em português, pelo identificador e pelas siglas",
    !naoAchados.length && conceitos.length === editorial.termos,
    { termos: editorial.termos, explicados: editorial.explicados.length, pendentes: editorial.pendentes.length, nao_achados: naoAchados });

  // 1, 12 e 14. Camada editorial: exemplos, definições, âncoras e percursos resolvem no pacote fixado.
  add(12, "Exemplos, definições da origem, âncoras e percursos da camada editorial resolvem",
    editorial.commit === procedencia.commit && !editorial.exemplos_ausentes.length && !editorial.definicoes_ausentes.length &&
      !editorial.ancoras_ausentes.length && !editorial.limitacoes_com_pagina_ausente.length,
    { commit: editorial.commit, percursos: editorial.percursos, exemplos_ausentes: editorial.exemplos_ausentes, definicoes_ausentes: editorial.definicoes_ausentes, ancoras_ausentes: editorial.ancoras_ausentes });

  return { pacote, resultados: res };
}
