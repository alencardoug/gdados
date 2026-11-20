import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { cssDasCamadas } from "../src/lib/tema.mjs";
import { TAMANHO_DA_PALETA } from "../src/cliente/camadas.js";

const css = readFileSync(new URL("../src/styles/portal.css", import.meta.url), "utf8");
const tokens = (bloco) => Object.fromEntries([...bloco.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()]));
const claro = tokens(css.match(/^:root \{([\s\S]*?)^\}/m)[1]);
const escuroSistema = css.match(/:root:not\(\[data-theme="light"\]\) \{([\s\S]*?)\n  \}/)[1];
const escuroEscolha = css.match(/^:root\[data-theme="dark"\] \{([\s\S]*?)^\}/m)[1];
const escuro = tokens(escuroSistema);

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

test("o tema escuro é o mesmo pela preferência do sistema e pela escolha no topo", () => {
  assert.deepEqual(tokens(escuroSistema), tokens(escuroEscolha));
  assert.match(css, /@media \(prefers-color-scheme: dark\) \{\n  :root:not\(\[data-theme="light"\]\)/);
});

test("claro e escuro declaram as mesmas cores, inclusive a paleta inteira das camadas", () => {
  const cores = (t) => Object.keys(t).filter((k) => k !== "largura").sort();
  assert.deepEqual(cores(escuro), cores(claro));
  for (let i = 0; i < TAMANHO_DA_PALETA; i++) assert.ok(claro[`camada-${i}`] && escuro[`camada-${i}`], `camada-${i}`);
});

for (const [nome, t] of [["claro", claro], ["escuro", escuro]]) {
  test(`contraste WCAG no tema ${nome}: texto e links 4,5:1; marcas de camada 3:1`, () => {
    const falhas = [];
    const exigir = (a, b, minimo) => { const c = contraste(t[a], t[b]); if (c < minimo) falhas.push(`${a}/${b} ${c.toFixed(2)}`); };
    for (const fundo of ["fundo", "superficie"]) {
      for (const texto of ["texto", "suave", "realce", "ok", "alerta", "class-personal", "class-confidential", "track"]) exigir(texto, fundo, 4.5);
      for (let i = 0; i < TAMANHO_DA_PALETA; i++) exigir(`camada-${i}`, fundo, 3);
    }
    exigir("ausente", "ausente-fundo", 4.5);
    exigir("realce", "realce-fundo", 4.5);
    exigir("texto", "codigo-fundo", 4.5);
    assert.deepEqual(falhas, []);
  });
}

test("o CSS das camadas liga cada camada a um índice da paleta, pela ordem, e ignora nomes inválidos", () => {
  const nomes = Array.from({ length: TAMANHO_DA_PALETA + 2 }, (_, i) => `c${i}`);
  const gerado = cssDasCamadas([...nomes, "x\"]{}"]);
  assert.match(gerado, /--cor-c0: var\(--camada-0\);/);
  assert.match(gerado, new RegExp(`--cor-c${TAMANHO_DA_PALETA}: var\\(--camada-0\\);`));
  assert.match(gerado, /\[data-layer="c1"\], \[data-camada="c1"\] \{ --cor-camada: var\(--cor-c1\); \}/);
  assert.match(gerado, /\[data-from="c2"\] \{ --cor-origem: var\(--cor-c2\); \}/);
  assert.doesNotMatch(gerado, /x"\]/);
});
