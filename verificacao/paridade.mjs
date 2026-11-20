// Confere a seção "Local e GCP lado a lado" da página de estrutura contra os arquivos copiados da
// origem, sem o código do portal: linhas do mapa de paridade, serviços dos compose e blocos
// resource do Terraform por arquivo.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const text = (h) => h.replace(/<[^>]+>/g, "").replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replace(/\s+/g, " ").trim();
const plain = (md) => md.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*`]/g, "").replace(/\s+/g, " ").trim();

export function checkParity(pkg, origem, html, add) {
  const errors = [];
  const page = html("/estrutura/");
  const section = page.match(/<section class="lado-a-lado"[\s\S]*?<\/section>/)?.[0] ?? "";
  const env = pkg.environments.find((e) => /#.*paridade/.test(e.path));
  const [file] = env.path.split("#");
  const md = readFileSync(join(origem, "arquivos", file), "utf8");
  const sec = md.split(/\n## /).find((s) => /^5\. Mapa de paridade/.test(s)) ?? "";
  const rows = sec.split("\n").filter((l) => l.startsWith("|")).slice(2).map((l) => l.slice(1, -1).split("|").map((c) => c.trim()));
  const concepts = [...section.matchAll(/<div class="paridade-conceito">([\s\S]*?)<\/div>/g)].map((m) => text(m[1]));
  if (concepts.join("|") !== rows.map((r) => plain(r[0])).join("|")) errors.push(`conceitos: ${concepts.length} ≠ ${rows.length}`);
  const measuredExpected = rows.filter((r) => /\*\*Medido/i.test(r[2])).length;
  const measured = (section.match(/class="paridade-medido"/g) ?? []).length;
  if (measured !== measuredExpected) errors.push(`medido ${measured} ≠ ${measuredExpected}`);

  for (const e of pkg.environments.filter((x) => /docker-compose[^/]*\.ya?ml$/.test(x.path))) {
    const y = readFileSync(join(origem, "arquivos", e.path), "utf8");
    const block = y.split(/\nservices:\s*\n/)[1]?.split(/\n\S/)[0] ?? "";
    const names = [...block.matchAll(/^ {2}([A-Za-z0-9_.-]+):\s*$/gm)].map((m) => m[1]);
    const shown = section.split(`<code>${e.path}</code>`)[1]?.split("</ul>")[0] ?? "";
    const shownNames = [...shown.matchAll(/<li><code>([^<]+)<\/code>/g)].map((m) => m[1]);
    if (names.join(",") !== shownNames.join(",")) errors.push(`${e.path}: ${shownNames} ≠ ${names}`);
  }
  let declarations = 0;
  for (const f of readdirSync(join(origem, "arquivos", "terraform")).filter((f) => f.endsWith(".tf"))) {
    const n = (readFileSync(join(origem, "arquivos", "terraform", f), "utf8").match(/^resource\s+"[^"]+"\s+"[^"]+"/gm) ?? []).length;
    declarations += n;
    if (!n) continue;
    const m = section.match(new RegExp(`<code>${f.replace(".", "\\.")}</code></a> <span class="suave">· (\\d+)</span>`));
    if (Number(m?.[1]) !== n) errors.push(`${f}: ${m?.[1]} ≠ ${n}`);
  }
  if (!text(section).includes(`Terraform, ${declarations} declarações de recurso`)) errors.push("total de declarações");
  add(6, "Local e GCP: conceitos do mapa de paridade, serviços dos compose e blocos resource do Terraform iguais aos arquivos copiados",
    errors.length === 0 && concepts.length > 0, { conceitos: concepts.length, medidos: measured, declaracoes: declarations, erros: errors });
}
