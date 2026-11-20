// Confere os blocos "com linhas reais" das páginas de conceito contra a exportação da origem (D06),
// lendo só o HTML publicado e as células exportadas: cada célula é o valor da linha indicada, cada
// coluna traz a classificação do pacote e as linhas de um mesmo grupo repetem o valor agrupado.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const text = (h) => h.replace(/<[^>]+>/g, "").replaceAll("&quot;", '"').replaceAll("&#39;", "'")
  .replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&").trim();

export function checkRealRows(pkg, exported, dist, html, add) {
  const { marker } = exported.masking;
  const shown = (v) => v === null ? "nulo" : v === marker ? marker : typeof v === "object" ? JSON.stringify(v) : String(v);
  const errors = [];
  let blocks = 0, cells = 0, grouped = 0;
  const dir = join(dist, "conceitos");
  const pages = existsSync(dir) ? readdirSync(dir).filter((d) => existsSync(join(dir, d, "index.html"))) : [];
  for (const id of pages) {
    const page = html(`/conceitos/${id}/`);
    for (const [, block] of page.matchAll(/<figure class="linhas-reais"[^>]*>([\s\S]*?)<\/figure>/g)) {
      blocks++;
      const rel = block.match(/href="\/governanca\/relacao\/([^"/]+)\/"/)?.[1];
      const sample = exported.relations[rel];
      if (!sample) { errors.push(`${id}: relação ${rel}`); continue; }
      const head = block.match(/<thead>([\s\S]*?)<\/thead>/)?.[1] ?? "";
      const cols = [...head.matchAll(/<th scope="col"[^>]*>([\s\S]*?)<\/th>/g)].slice(1).map(([, th]) => ({
        name: text(th.match(/<code>([\s\S]*?)<\/code>/)?.[1] ?? ""), sens: text(th.match(/<small[^>]*>([\s\S]*?)<\/small>/)?.[1] ?? ""),
      }));
      for (const c of cols) {
        if (!sample.columns.includes(c.name)) errors.push(`${id}: coluna ${c.name}`);
        if ((pkg.relations[rel]?.columns?.[c.name]?.sensitivity ?? "") !== c.sens) errors.push(`${id}: sensibilidade de ${c.name}`);
      }
      const groupCol = text(block.match(/class="suave linhas-reais-legenda">[\s\S]*?<code>([\s\S]*?)<\/code>/)?.[1] ?? "");
      const groups = new Map();
      for (const [, tr] of block.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)) {
        const n = Number(tr.match(/#linha-amostra-(\d+)"/)?.[1]);
        if (!n) continue;
        const cellsHtml = [...tr.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => text(m[1]));
        const row = sample.rows[n - 1];
        if (!row) { errors.push(`${id}: linha ${n}`); continue; }
        cols.forEach((c, k) => {
          cells++;
          if (cellsHtml[k] !== shown(row[sample.columns.indexOf(c.name)])) errors.push(`${id}: linha ${n}, ${c.name}`);
        });
        const g = tr.match(/class="marca-grupo"[^>]*>● (\d+)</)?.[1];
        if (g) {
          grouped++;
          const v = JSON.stringify(row[sample.columns.indexOf(groupCol)]);
          if (!groups.has(g)) groups.set(g, new Set());
          groups.get(g).add(v);
        }
      }
      for (const [g, values] of groups) if (values.size !== 1) errors.push(`${id}: grupo ${g} com valores diferentes`);
      if (groupCol && groups.size === 0) errors.push(`${id}: legenda de grupo sem linhas agrupadas`);
    }
  }
  add(6, "Linhas reais dos conceitos: cada célula é o valor exportado, com a classificação do pacote e grupos coerentes",
    errors.length === 0 && blocks > 0, { blocos: blocks, celulas: cells, linhas_agrupadas: grouped, erros: errors.slice(0, 30) });
}
