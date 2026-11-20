// Lê o HTML como entregue. O esperado sai das células e do catálogo fixados,
// sem usar os índices nem a resolução de percursos do portal.
import { isDeepStrictEqual } from "node:util";

const text = (html) => html.replace(/<[^>]+>/g, "").replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");
const sampleText = (v, marker) => v === undefined ? "campo ausente na carga" :
  v === null ? "nulo" : v === marker ? marker : JSON.stringify(v, null, typeof v === "object" ? 2 : undefined);
const rawInputs = (pkg, id) => new Set(Object.values(pkg.lineage.relations[id]?.columns ?? {})
  .flatMap((c) => c.leaves.map((f) => f.slice(0, f.lastIndexOf(".")))).filter((r) => pkg.relations[r]?.schema === "raw_legacy"));

export function checkLegacy(pkg, samples, catalog, html, add) {
  const { marker } = samples.masking;
  const expected = new Map(), counts = new Map();
  const valuesErrors = [], indexErrors = [], pathErrors = [];
  let masked = 0, steps = 0, compared = 0;
  for (const [rel, sample] of Object.entries(samples.relations)) {
    for (const [i, cells] of sample.rows.entries()) {
      const row = Object.fromEntries(sample.columns.map((c, j) => [c, cells[j]]));
      if (!Object.hasOwn(row, "original_payload")) continue;
      const map = row.achados ?? row.value_findings;
      const findings = Array.isArray(row.findings) ? row.findings : map && typeof map === "object" ?
        Object.entries(map).map(([column, code]) => ({ column, code })) : [];
      findings.forEach(({ column, code, reason }, j) => {
        const payloads = [row.original_payload, "achados" in row ? row : row.cleaned_payload];
        const values = payloads.map((p) => sampleText(column == null || p === marker ? p : p?.[column], marker));
        let sources = rawInputs(pkg, rel);
        if (row.source_table) sources = new Set(Object.keys(pkg.relations).filter((r) =>
          pkg.relations[r].schema === "raw_legacy" && pkg.relations[r].name === row.source_table));
        const id = `caso-${rel}-${i + 1}-${j + 1}`;
        expected.set(id, { rel, column, code, reason, values, sources, row: i + 1 });
        counts.set(code, (counts.get(code) ?? 0) + 1);
      });
    }
  }

  const index = html("/governanca/legado/");
  const published = new Map([...index.matchAll(/<li data-code="([^"]+)">([\s\S]*?)<\/li>/g)].map(([, code, body]) => {
    const n = Number(body.match(/class="defect-count">(\d+) /)?.[1]);
    if (!body.includes(`href="/governanca/legado/${code}/"`)) indexErrors.push(code);
    return [code, n];
  }));
  if (!isDeepStrictEqual(published, counts)) indexErrors.push("contagens");
  const seen = new Set();
  for (const code of counts.keys()) {
    const page = html("/governanca/legado/" + code + "/");
    const declaration = catalog.split("\n  " + code + ":\n")[1]?.split(/\n  [A-Z_]+:\n/)[0];
    const detection = declaration?.match(/^    deteccao: (.*)$/m)?.[1];
    if (detection) {
      const quote = detection.replace(/[`*]/g, "");
      if (!text(page).includes(quote) || !text(index).includes(quote)) indexErrors.push(code + "/significado");
    } else if (!page.includes("O catálogo da origem não define este tipo.")) indexErrors.push(code + "/sem definição");
    const rule = page.match(/class="treatment-rule">([\s\S]*?)<\/div>/)?.[1] ?? "";
    if (!rule.includes('href="/origem/src/mvp_ed1/legacy/catalogo.yml/"') ||
      rule.includes("Destino declarado dos rejeitados") !== Boolean(declaration?.match(/^    rejeicao: /m))) indexErrors.push(code + "/regra");

    for (const [, id, body] of page.matchAll(/<article class="legacy-case"[^>]* id="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)) {
      const row = expected.get(id);
      if (!row || seen.has(id) || row.code !== code) { valuesErrors.push(id); continue; }
      seen.add(id);
      const pair = body.match(/class="comparison">([\s\S]*?)<\/dl>/)?.[1] ?? "";
      const values = [...pair.matchAll(/<dd>([\s\S]*?)<\/dd>/g)].map((m) => text(m[1]));
      if (values.length === 2 && row.column != null) compared++;
      if (values.includes(marker)) masked++;
      if (!isDeepStrictEqual(values, row.values) ||
        text(body.match(/<mark>([\s\S]*?)<\/mark>/)?.[1] ?? "") !== (row.column ?? "Achado da linha inteira") ||
        !body.includes(`href="/governanca/relacao/${row.rel}/#linha-amostra-${row.row}"`) ||
        row.reason && !text(body).includes(row.reason.replace(/[`*]/g, ""))) valuesErrors.push(id);
      const path = body.match(/class="case-trail">[\s\S]*?<a href="([^"#]+)#(passo-\d+)"/);
      if (path) {
        steps++;
        const step = html(path[1]).match(new RegExp(`<li id="${path[2]}" data-relation="([^"]+)"[\\s\\S]*?</article>`));
        if (!step?.[1]?.startsWith("trusted.legado__") || !isDeepStrictEqual(rawInputs(pkg, step[1]), row.sources) ||
          !step[0].includes('href="/governanca/legado/')) pathErrors.push(id);
      }
    }
  }
  if (seen.size !== expected.size) valuesErrors.push("cobertura de achados");
  add(6, "Índice dos defeitos reproduz contagens, definições e regras de quarentena da origem", !indexErrors.length,
    { tipos: counts.size, aparicoes: expected.size, erros: indexErrors });
  add(6, "Antes, depois, campo, motivo e linha da ficha correspondem ao mesmo achado exportado", !valuesErrors.length,
    { comparacoes: compared, com_mascara: masked, achados_de_linha: seen.size - compared, erros: valuesErrors });
  add(2, "Dos achados aos passos de linhas aptas, a tabela bruta é a mesma e há caminho de volta", !pathErrors.length && steps > 0,
    { ligacoes_com_passo: steps, erros: pathErrors });
}
