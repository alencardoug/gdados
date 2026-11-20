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
  let masked = 0, steps = 0, compared = 0, diffs = 0, delimiters = 0, merged = 0;
  const diffErrors = [], rowErrors = [], groupErrors = [];
  const delimiter = catalog.match(/^delimitador: "(.*)"$/m)?.[1];
  const treatmentOf = (decl) => !decl ? "indefinido" : /^    rejeicao: /m.test(decl) ? "rejeita" :
    /^    conversao: /m.test(decl) ? ({ original: "recupera", nulo: "anula" }[decl.match(/^    recuperacao: (\S+)/m)?.[1]] ?? "converte") : "indefinido";
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
        const table = row.source_table ?? [...rawInputs(pkg, rel)].map((r) => pkg.relations[r].name)[0];
        const identity = [table, row.legacy_row_id, row.snapshot_id].some((v) => v == null) ? null :
          [table, row.legacy_row_id, row.snapshot_id].join("|");
        expected.set(id, { rel, column, code, reason, values, sources, row: i + 1, identity });
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
  for (const [, group, body] of index.matchAll(/<section class="treatment-group"[^>]*aria-labelledby="tratamento-([a-z]+)"[^>]*>([\s\S]*?)<\/section>/g)) {
    for (const [, code] of body.matchAll(/<li data-code="([^"]+)">/g)) {
      const decl = catalog.split("\n  " + code + ":\n")[1]?.split(/\n  [A-Z_]+:\n/)[0];
      if (treatmentOf(decl) !== group) groupErrors.push(code + "/" + group);
    }
  }
  if (![...index.matchAll(/<section class="treatment-group"/g)].length) groupErrors.push("sem grupos");
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

    const keys = new Set();
    for (const [, sec] of page.matchAll(/<section class="legacy-row"[^>]*>([\s\S]*?)<\/section>/g)) {
      const ids = [...sec.matchAll(/<article class="legacy-case"[^>]* id="([^"]+)"/g)].map((m) => m[1]);
      const identities = new Set(ids.map((i) => expected.get(i)?.identity ?? "achado:" + i));
      if (identities.size !== 1) rowErrors.push(code + "/" + ids.join("+"));
      const [key] = identities;
      if (keys.has(key)) rowErrors.push(code + "/repetida/" + key);
      keys.add(key);
      if (ids.length > 1) merged++;
    }
    for (const [, id, body] of page.matchAll(/<article class="legacy-case"[^>]* id="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)) {
      const row = expected.get(id);
      if (!row || seen.has(id) || row.code !== code) { valuesErrors.push(id); continue; }
      seen.add(id);
      const pair = body.match(/class="comparison">([\s\S]*?)<\/dl>/)?.[1] ?? "";
      const values = [...pair.matchAll(/<dd>([\s\S]*?)<\/dd>/g)].map((m) => text(m[1]));
      if (values.length === 2 && row.column != null) compared++;
      if (values.includes(marker)) masked++;
      const dds = [...pair.matchAll(/<dd>([\s\S]*?)<\/dd>/g)].map((m) => m[1]);
      if (dds.some((d) => d.includes('class="diff-antes"') || d.includes('class="diff-depois"'))) {
        diffs++;
        const sem = (d, cls) => text(d.replace(new RegExp(`<span class="${cls}"[^>]*>[^<]*<\\/span>`, "g"), ""));
        if (sem(dds[0], "diff-antes") !== sem(dds[1], "diff-depois")) diffErrors.push(id);
      }
      for (const [, d] of body.matchAll(/<span class="diff-delimitador"[^>]*>([^<]*)<\/span>/g)) {
        delimiters++;
        if (d !== delimiter || code !== "TEXT_DELIMITER") diffErrors.push(id + "/delimitador");
      }
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
  add(6, "Diferença marcada é real e o delimitador marcado é o declarado no catálogo", !diffErrors.length && diffs > 0,
    { comparacoes_marcadas: diffs, delimitadores: delimiters, delimitador: delimiter, erros: diffErrors });
  add(6, "Cada bloco reúne uma só linha do legado (tabela, ocorrência, captura), sem repetir linha na página", !rowErrors.length,
    { linhas_com_varias_etapas: merged, erros: rowErrors });
  add(6, "Grupos do índice seguem o tratamento declarado no catálogo (conversão e recuperação, ou rejeição)", !groupErrors.length,
    { erros: groupErrors });
  add(2, "Dos achados aos passos de linhas aptas, a tabela bruta é a mesma e há caminho de volta", !pathErrors.length && steps > 0,
    { ligacoes_com_passo: steps, erros: pathErrors });
}
