// Confere o HTML publicado com o pacote bruto, sem usar o construtor de percursos do portal.
import { isDeepStrictEqual } from "node:util";

function expectedSlice(pkg, root) {
  const columns = new Set(), pairs = new Set(), relations = new Set();
  const queue = [root];
  for (const id of queue) {
    if (columns.has(id)) continue;
    columns.add(id);
    const rel = id.slice(0, id.lastIndexOf("."));
    const name = id.slice(rel.length + 1);
    for (const leaf of pkg.lineage.relations[rel]?.columns[name]?.leaves ?? []) {
      pairs.add(`${leaf}→${id}`);
      const from = leaf.slice(0, leaf.lastIndexOf("."));
      if (from !== rel) relations.add(`${from}→${rel}`);
      queue.push(leaf);
    }
  }
  const flows = new Map();
  for (const pair of relations) {
    const layers = pair.split("→").map((r) => pkg.relations[r]?.schema);
    if (layers.includes(undefined)) continue;
    const key = layers.join("→");
    flows.set(key, (flows.get(key) ?? 0) + 1);
  }
  return { columns, pairs, flows };
}

export function checkGuides(pkg, html, add) {
  const pickerErrors = [], stepErrors = [], mapErrors = [], graphErrors = [];
  let measures = 0, stepCount = 0, linkCount = 0;
  for (const [id, q] of Object.entries(pkg.questions)) {
    const path = `/governanca/pergunta/${id}/`;
    const picker = html(path).match(/<nav class="measure-picker"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? "";
    const options = [...picker.matchAll(/<a href="([^"#]+)#percurso"[^>]*>([\s\S]*?)<\/a>/g)]
      .map(([, target, body]) => [body.replace(/<[^>]+>/g, ""), target]);
    if (!isDeepStrictEqual(options.map(([m]) => m), q.measures.map((m) => m.column))) pickerErrors.push(id);
    for (const [measure, target] of options) {
      const guide = html(target).match(/<section class="measure-guide"[^>]*>([\s\S]*?)<\/section>/)?.[0] ?? "";
      const selected = guide.match(/href="([^"#]+)#percurso" aria-current="page"/)?.[1];
      const root = q.view + "." + measure;
      const expected = expectedSlice(pkg, root);
      const columns = new Set(), pairs = new Set(), terminals = new Set(), layers = new Set();
      const steps = [...guide.matchAll(/<li id="passo-(\d+)" data-relation="([^"]+)"[^>]*><article>([\s\S]*?)<\/article>/g)];
      const stepIds = steps.map((m) => m[2]);
      const stepsById = new Map(stepIds.map((r, i) => [r, i + 1]));
      measures++;
      stepCount += steps.length;
      if (!guide.includes(`data-measure="${measure}"`) || selected !== target) pickerErrors.push(root);
      for (const [, number, relation, body] of steps) {
        const names = [];
        layers.add(pkg.relations[relation]?.schema);
        for (const [, name, kind] of body.matchAll(/<li data-column="([^"]+)"(?: data-terminal="(\w+)")?>/g)) {
          const qualified = relation + "." + name;
          names.push(name);
          columns.add(qualified);
          if (kind) terminals.add(kind + ":" + qualified);
        }
        const branchSteps = new Set();
        for (const [, name, leaf] of body.matchAll(/data-value="([^"]+)" data-input="([^"]+)"/g)) {
          pairs.add(leaf + "→" + relation + "." + name);
          const from = leaf.slice(0, leaf.lastIndexOf("."));
          if (from !== relation) branchSteps.add(stepsById.get(from));
        }
        const branches = body.match(/<ul class="step-branches">([\s\S]*?)<\/ul>/)?.[1] ?? "";
        const links = [...branches.matchAll(/href="#passo-(\d+)"/g)].map(([, n]) => Number(n));
        if (!isDeepStrictEqual(new Set(links), branchSteps) || links.some((n) => n <= Number(number))) stepErrors.push(root + "/" + relation);
        const href = body.match(/class="step-graph" href="([^"]+)"/)?.[1] ?? "";
        const url = new URL(href.replaceAll("&amp;", "&"), "https://portal.invalid");
        if (!href || url.pathname !== "/governanca/linhagem/" || url.searchParams.get("modo") !== "coluna" ||
          url.searchParams.get("r") !== relation || !isDeepStrictEqual(url.searchParams.getAll("c"), names)) graphErrors.push(root + "/" + relation);
      }
      linkCount += pairs.size;
      const origins = pkg.lineage.relations[q.view]?.columns[measure]?.origins;
      if (!guide.includes('<ol class="guide-steps">') || stepIds[0] !== q.view || steps.length !== stepsById.size ||
        !isDeepStrictEqual(columns, expected.columns) || !isDeepStrictEqual(pairs, expected.pairs) ||
        (origins && !isDeepStrictEqual(terminals, new Set(origins.map((o) => o.kind + ":" + o.column))))) stepErrors.push(root);

      const lit = new Set([...guide.matchAll(/class="station-cell" data-layer="([^"]+)"[^>]*><div class="layer-station" data-active="true"/g)].map((m) => m[1]));
      const traces = new Map([...guide.matchAll(/class="map-trace [^"]+"[^>]+data-from="([^"]+)" data-to="([^"]+)" data-active="true">[\s\S]*?<b>(\d+)<\/b>/g)]
        .map(([, from, to, pairs]) => [from + "→" + to, Number(pairs)]));
      if (!isDeepStrictEqual(lit, layers) || !isDeepStrictEqual(traces, expected.flows)) mapErrors.push(root);
    }
  }
  add(1, "Todas as medidas declaradas abrem seu percurso na página da pergunta", !pickerErrors.length, { medidas: measures, erros: pickerErrors });
  add(2, "A lista ordenada preserva todas as folhas, os ramos e as origens terminais de cada medida", !stepErrors.length,
    { percursos: measures, passos: stepCount, ligacoes_nos_percursos: linkCount, erros: stepErrors });
  add(2, "O mapa de cada medida acende exatamente suas camadas e seus pares dirigidos", !mapErrors.length, { percursos: measures, erros: mapErrors });
  add(2, "Cada passo abre no grafo sua relação e somente as colunas em foco", !graphErrors.length, { passos: stepCount, erros: graphErrors });
}
