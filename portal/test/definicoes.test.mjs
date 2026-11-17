// Funções da camada editorial: trecho literal do glossário, exemplos e endereço de retorno.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { trechoDeDefinicao, exemploExiste, retornoValido } from "../src/lib/definicoes.mjs";
import { PASTA_DA_ORIGEM } from "../src/lib/origem.mjs";

const glossario = "**Grão** — o que uma linha\nrepresenta.\n\n**Outro** — x\n\n| Ferramenta | Papel |\n|---|---|\n| **dbt** | Transformação |\n";

test("verbete em parágrafo sai literal, com as linhas seguintes", () => {
  assert.equal(trechoDeDefinicao(glossario, "Grão"), "**Grão** — o que uma linha\nrepresenta.");
});
test("verbete em tabela sai literal, com o cabeçalho", () => {
  assert.equal(trechoDeDefinicao(glossario, "dbt"), "| Ferramenta | Papel |\n|---|---|\n| **dbt** | Transformação |");
});
test("termo ausente devolve null", () => {
  assert.equal(trechoDeDefinicao(glossario, "Inexistente"), null);
});

test("exemplos são conferidos contra o pacote, sem inventar", () => {
  const pacote = {
    relations: { "a.b": { columns: { c_d: {} } } },
    questions: { P01: {} }, metrics: { m: {} }, filters: { f: {} },
  };
  const ctx = { pacote, arquivoCopiado: (c) => c === "docs/x.md", paginaExiste: (p) => p === "governanca/" };
  assert.ok(exemploExiste({ tipo: "relacao", ref: "a.b" }, ctx));
  assert.ok(exemploExiste({ tipo: "coluna", ref: "a.b.c_d" }, ctx));
  assert.ok(!exemploExiste({ tipo: "coluna", ref: "a.b.toString" }, ctx));
  assert.ok(!exemploExiste({ tipo: "relacao", ref: "constructor" }, ctx));
  assert.ok(exemploExiste({ tipo: "arquivo", ref: "docs/x.md#y" }, ctx));
  assert.ok(exemploExiste({ tipo: "pagina", ref: "governanca/?camada=raw#catalogo" }, ctx));
  assert.ok(!exemploExiste({ tipo: "pergunta", ref: "P99" }, ctx));
});

test("retorno só aceita caminho interno do portal", () => {
  assert.ok(retornoValido("/governanca/?camada=raw#catalogo"));
  assert.ok(!retornoValido("//exemplo.com/x"));
  assert.ok(!retornoValido("https://exemplo.com/"));
  assert.ok(!retornoValido("javascript:alert(1)"));
  assert.ok(!retornoValido(null));
  assert.ok(retornoValido("/gdados/x/", "/gdados/") && !retornoValido("/x/", "/gdados/"));
});

// Depois de uma build (npm run build), o relatório não pode apontar nada fora do pacote ou da cópia.
const relatorio = join(import.meta.dirname, "..", "dist", "dados", "editorial.json");
test("relatório editorial da build sem referências ausentes", { skip: !existsSync(relatorio) && "rode npm run build antes" }, () => {
  const r = JSON.parse(readFileSync(relatorio, "utf8"));
  const proc = JSON.parse(readFileSync(join(PASTA_DA_ORIGEM, "procedencia.json"), "utf8"));
  assert.equal(r.commit, proc.commit, "dist/ é de outra cópia; refaça a build");
  assert.deepEqual(r.exemplos_ausentes, []);
  assert.deepEqual(r.definicoes_ausentes, []);
  assert.deepEqual(r.ancoras_ausentes, []);
  assert.deepEqual(r.limitacoes_com_pagina_ausente, []);
});
