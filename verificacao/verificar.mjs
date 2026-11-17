// Verificação local do portal (PLANO, E3). Constrói o portal, confere a build contra o pacote fixado e
// mede no navegador. Grava resultados/<instante>.json e imprime o resumo.
// Uso, a partir desta pasta: node verificar.mjs [repetições=5]
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { verificarEstatica } from "./estatica.mjs";
import { verificarNoNavegador } from "./navegador.mjs";

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = join(aqui, "..");
const portal = join(raiz, "portal");
const dist = join(portal, "dist");
const origem = join(raiz, "origem");
const REPETICOES = Number(process.argv[2] ?? 5);
const sh = (cmd, cwd = raiz) => execSync(cmd, { cwd, encoding: "utf8", env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" }, stdio: ["ignore", "pipe", "pipe"] });

function hashDaPasta(dir) {
  const h = createHash("sha256");
  const visitar = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const c = join(d, e.name);
      if (e.isDirectory()) visitar(c);
      else h.update(relative(dir, c)).update("\0").update(readFileSync(c));
    }
  };
  visitar(dir);
  return h.digest("hex");
}

const resultado = {
  instante: new Date().toISOString(),
  gdados: { commit: sh("git rev-parse HEAD").trim(), arvore_limpa: sh("git status --porcelain").trim() === "" },
  origem: JSON.parse(readFileSync(join(origem, "procedencia.json"), "utf8")),
  node: process.version,
  resultados: [],
};
resultado.origem = { repository: resultado.origem.repository, ref: resultado.origem.ref, commit: resultado.origem.commit, copied_at: resultado.origem.copied_at };
const add = (item, nome, ok, detalhe) => resultado.resultados.push({ item, nome, ok, detalhe });

// 1. Cópia, formato e esquema; testes de unidade do portal.
try { add(1, "Cópia da origem confere os SHA-256 e o pacote é válido contra o esquema do mesmo commit", true, sh("npm run --silent validar", portal).trim()); }
catch (e) { add(1, "Cópia da origem confere os SHA-256 e o pacote é válido contra o esquema do mesmo commit", false, String(e.stdout) + String(e.stderr)); }

// 10. Build reproduzível: três builds, mesmo conteúdo de dist/; o tempo vai para o item 9.
const tempos = [], hashes = [];
for (let i = 0; i < 3; i++) {
  const t0 = performance.now();
  sh("npm run --silent build", portal);
  tempos.push((performance.now() - t0) / 1000);
  hashes.push(hashDaPasta(dist));
}
const mediana = [...tempos].sort((a, b) => a - b)[1];
add(9, "Build completa a partir da cópia do pacote (meta 60 s)", mediana <= 60, { tempos_s: tempos.map((t) => +t.toFixed(2)), mediana_s: +mediana.toFixed(2) });
add(10, "Build reproduzível: três builds com o mesmo conteúdo em dist/", new Set(hashes).size === 1, { sha256_de_dist: hashes });

try { const saida = sh("npm test --silent", portal); add(1, "Testes de unidade do portal", true, saida.match(/ℹ (tests|pass|fail) \d+/g)); }
catch (e) { add(1, "Testes de unidade do portal", false, String(e.stdout).slice(-2000)); }

const { pacote, resultados: estaticos } = verificarEstatica({ dist, origem });
resultado.resultados.push(...estaticos);
const { desempenho, resultados: noNavegador } = await verificarNoNavegador({ dist, pacote, repeticoes: REPETICOES });
resultado.resultados.push(...noNavegador);
resultado.desempenho = desempenho;

resultado.resultados.sort((a, b) => a.item - b.item);
mkdirSync(join(aqui, "resultados"), { recursive: true });
const arquivo = join(aqui, "resultados", `${resultado.instante.replace(/[:.]/g, "-")}.json`);
writeFileSync(arquivo, JSON.stringify(resultado, null, 2) + "\n");

for (const r of resultado.resultados) console.log(`${r.ok ? "ok  " : "FALHA"} [${String(r.item).padStart(2)}] ${r.nome}`);
const falhas = resultado.resultados.filter((r) => !r.ok).length;
console.log(`\n${resultado.resultados.length - falhas} de ${resultado.resultados.length} verificações passaram. Resultado: ${relative(raiz, arquivo)}`);
process.exitCode = falhas ? 1 : 0;
