// Confere o mapa de calor da governança contra o pacote e a exportação, sem usar o código do
// portal: classes por camada, testes, colunas com teste e colunas mascaradas.
const text = (h) => h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const has = (v, m) => v === m || (v !== null && typeof v === "object" && Object.values(v).some((x) => has(x, m)));

export function checkHeatmap(pkg, exported, html, add) {
  const page = html("/governanca/");
  const section = page.match(/<section class="mapa-de-calor"[\s\S]*?<\/section>/)?.[0] ?? "";
  const classes = [...section.matchAll(/<th scope="col" class="classe classe-([a-z]+)"/g)].map((m) => m[1]);
  const errors = [];
  const tested = new Set(Object.values(pkg.tests).filter((t) => t.column).map((t) => `${t.relation}.${t.column}`));
  let rows = 0;
  for (const [, layer, body] of section.matchAll(/<tr data-camada="([^"]+)">([\s\S]*?)<\/tr>/g)) {
    rows++;
    const ids = Object.keys(pkg.relations).filter((id) => pkg.relations[id].schema === layer);
    const cols = ids.flatMap((id) => Object.entries(pkg.relations[id].columns).map(([n, c]) => ({ id, n, s: c.sensitivity })));
    const cells = [...body.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => text(m[1]));
    const expected = [String(cols.length), ...classes.map((c) => String(cols.filter((x) => x.s === c).length))];
    const tests = Object.values(pkg.tests).filter((t) => pkg.relations[t.relation]?.schema === layer).length;
    const withTest = cols.filter((x) => tested.has(`${x.id}.${x.n}`)).length;
    const masked = cols.filter((x) => {
      const s = exported.relations[x.id]; const j = s?.columns.indexOf(x.n) ?? -1;
      return j >= 0 && s.rows.some((r) => has(r[j], exported.masking.marker));
    });
    if (masked.some((x) => x.s !== "personal")) errors.push(`${layer}: máscara fora de personal`);
    const personal = cols.filter((x) => x.s === "personal").length;
    expected.push(String(tests), `${withTest} de ${cols.length} ${cols.length ? Math.round((100 * withTest) / cols.length) : 0}%`,
      masked.length ? `${masked.length} de ${personal}` : "0");
    if (cells.join("|") !== expected.join("|")) errors.push(`${layer}: ${cells.join("|")} ≠ ${expected.join("|")}`);
    if (!body.includes(`href="/governanca/?camada=${layer}#catalogo"`)) errors.push(`${layer}: link do catálogo`);
  }
  const layers = new Set(Object.values(pkg.relations).map((r) => r.schema));
  if (rows !== layers.size) errors.push(`linhas ${rows} ≠ camadas ${layers.size}`);
  const orphan = Object.values(pkg.tests).filter((t) => !pkg.relations[t.relation]).length;
  if (orphan && !text(section).includes(`Outros ${orphan} (`)) errors.push("testes sem relação não informados");
  add(6, "Mapa de calor: classes, testes, cobertura e máscara de cada camada recalculados do pacote e da exportação",
    errors.length === 0 && rows > 0, { camadas: rows, classes, testes_sem_relacao: orphan, erros: errors.slice(0, 20) });
}
