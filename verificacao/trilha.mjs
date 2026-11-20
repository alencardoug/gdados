// Confere a trilha do roteiro contra src/conteudo/roteiro.yml: para cada degrau, as estações são os
// termos, a prática e as perguntas, nessa ordem, e cada pergunta tem a âncora para onde a estação aponta.
import { readFileSync } from "node:fs";

export function checkTrail(roteiroYml, html, add) {
  const page = html("/conceitos/roteiro/");
  const errors = [];
  let stations = 0;
  for (const block of roteiroYml.split(/^- id: /m).slice(1)) {
    const id = block.split("\n", 1)[0].trim();
    const section = (name) => block.split(new RegExp(`^  ${name}:\\s*$`, "m"))[1]?.split(/^ {2}[a-z_]+:/m)[0] ?? "";
    const terms = [...section("termos").matchAll(/- \{ id: ([a-z0-9-]+)/g)].map((m) => `${id}:ler:${m[1]}`);
    const practice = [...section("pratica").matchAll(/ref: ("[^"]+"|[^,}\s]+)/g)].map((m) => `${id}:praticar:${m[1].replace(/^"|"$/g, "")}`);
    const questions = [...section("perguntas").matchAll(/^ {4}- /gm)].map((_, n) => `${id}:conferir:${n + 1}`);
    const expected = [...terms, ...practice, ...questions];
    const trail = page.split(`data-degrau="${id}"`)[1]?.split("</ol>")[0] ?? "";
    const shown = [...trail.matchAll(/data-estacao="([^"]+)"/g)].map((m) => m[1].replaceAll("&amp;", "&"));
    stations += shown.length;
    if (shown.join("|") !== expected.join("|")) errors.push(`${id}: ${shown.length} ≠ ${expected.length}`);
    questions.forEach((_, n) => { if (!page.includes(`id="pergunta-${id}-${n + 1}"`)) errors.push(`${id}: âncora da pergunta ${n + 1}`); });
  }
  add(6, "Trilha do roteiro: estações iguais aos termos, à prática e às perguntas de cada degrau, na ordem do roteiro",
    errors.length === 0 && stations > 0, { estacoes: stations, erros: errors });
}
export const lerRoteiro = (portal) => readFileSync(`${portal}/src/conteudo/roteiro.yml`, "utf8");
