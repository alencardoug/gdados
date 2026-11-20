import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { changedInputs, initialMeasure, measureTrail } from "../src/lib/percurso-da-medida.mjs";
import { columnsInFocus } from "../src/cliente/recorte-de-colunas.js";

const pkg = JSON.parse(readFileSync(new URL("../../origem/pacote_de_metadados.json", import.meta.url)));
for (const [id, q] of Object.entries(pkg.questions)) {
  test(`${id} preserva as origens de cada medida e ordena os dois extremos de cada ramo`, () => {
    for (const { column } of q.measures) {
      const { steps, edges } = measureTrail(q.view, column, pkg);
      assert.equal(steps[0].id, q.view);
      const ids = steps.map((s) => s.id);
      assert.equal(new Set(ids).size, ids.length);
      for (const edge of edges) assert.ok(ids.indexOf(edge.target) < ids.indexOf(edge.source), JSON.stringify(edge));
      const ends = new Set();
      for (const s of steps) for (const c of s.columns.values()) {
        if (!c.leaves.length) assert.ok(c.terminal || c.gap, s.id + "." + c.name);
        if (c.terminal) ends.add(c.terminal + ":" + s.id + "." + c.name);
      }
      const declared = pkg.lineage.relations[q.view]?.columns[column]?.origins;
      if (declared) assert.deepEqual(ends, new Set(declared.map((o) => o.kind + ":" + o.column)), column);
    }
  });
}

test("uma folha já visitada é compartilhada e a dimensão usada só na junção não entra", () => {
  const q = pkg.questions.P02;
  const { steps, edges } = measureTrail(q.view, "average_order_value", pkg);
  const trusted = steps.find((s) => s.id === "trusted.order_items");
  assert.equal(trusted.columns.get("source_system").terminal, "generated");
  assert.equal(trusted.inputs.size, 2);
  assert.equal(edges.filter((e) => e.target === trusted.id).length, 2);
  assert.ok(!steps.some((s) => q.dimensions.includes(s.id)));
});

const fixture = {
  relations: {
    "c.v": { schema: "c", columns: { total: {}, other: {} } },
    "a.s": { schema: "a", columns: { n: {} }, resource_type: "seed" },
  },
  view_rules: {},
  lineage: { relations: { "c.v": { columns: {
    total: { leaves: ["a.s.n", "x.missing.col", "c.v.other"], origins: [] }, other: { leaves: [], origins: [] },
  } } } },
};

test("seed é terminal e ausências de ficha ou de linhagem têm motivo próprio", () => {
  const { steps } = measureTrail("c.v", "total", fixture);
  const step = (id) => steps.find((s) => s.id === id);
  assert.equal(step("a.s").columns.get("n").terminal, "seed");
  assert.equal(step("a.s").columns.get("n").gap, null);
  assert.match(step("x.missing").columns.get("col").gap, /sem ficha/);
  assert.match(step("c.v").columns.get("other").gap, /não declara insumo/);
});

test("uma referência circular fica explícita e não impede a leitura dos demais ramos", () => {
  const circular = structuredClone(fixture);
  circular.lineage.relations["c.v"].columns.other.leaves.push("c.v.total");
  const { steps } = measureTrail("c.v", "total", circular);
  assert.match(steps[0].columns.get("other").gap, /retorna/);
  assert.ok(steps.some((s) => s.id === "a.s"));
});

test("a escolha inicial vem da regra da view e, sem medida, a pergunta continua sem seleção", () => {
  assert.equal(initialMeasure(pkg.questions.P02, pkg), "average_order_value");
  assert.equal(initialMeasure({ view: "c.v", measures: [] }, fixture), undefined);
});

test("o foco do Cytoscape preserva o recorte antigo sem seleção e aceita só as colunas publicadas", () => {
  assert.deepEqual(columnsInFocus([], ["x", "y"]), ["x", "y"]);
  assert.deepEqual(columnsInFocus(["y", "fora", "y"], ["x", "y"]), ["y"]);
  assert.deepEqual(columnsInFocus(["fora"], ["x", "y"]), []);
});

test("a numeração da P02 termina o ramo de varejo antes de abrir o legado", () => {
  const q = pkg.questions.P02;
  const steps = measureTrail(q.view, "average_order_value", pkg).steps;
  assert.deepEqual(steps.map((s) => s.layer), ["consumption", "analytics", "trusted", "staging", "raw", "trusted", "raw_legacy"]);
});

test("a mudança de nome conserva a relação de cada folha, inclusive um insumo homônimo", () => {
  const leaves = ["a.one.x", "a.two.y", "a.three.x", "a.two.total", "a.two.y"];
  assert.deepEqual(changedInputs({ name: "total", leaves }), [
    { names: ["x"], relations: ["a.one", "a.three"] },
    { names: ["total", "y"], relations: ["a.two"] },
  ]);
  assert.deepEqual(changedInputs({ name: "x", leaves: ["a.one.x", "a.two.x"] }), []);
  assert.deepEqual(changedInputs({ name: "x", leaves: [] }), []);
});
