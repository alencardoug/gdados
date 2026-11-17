// Layout em camadas por caminho mais longo (D02, condição 2).
import { test } from "node:test";
import assert from "node:assert/strict";
import { camadasPorCaminhoMaisLongo, posicoesEmCamadas } from "../src/cliente/camadas.js";

const a = (source, target) => ({ source, target });

test("camada é o caminho mais longo desde a origem", () => {
  const c = camadasPorCaminhoMaisLongo(["raw.x", "stg.x", "tr.x", "an.f", "co.v"], [
    a("raw.x", "stg.x"), a("stg.x", "tr.x"), a("tr.x", "an.f"), a("an.f", "co.v"), a("tr.x", "co.v"),
  ]);
  assert.deepEqual([...c.values()], [0, 1, 2, 3, 4]);
});

test("nó sem insumo fica junto do primeiro consumidor, não ao lado das origens", () => {
  // dim_date não tem insumo; sem o ajuste, a view que a lê ficaria perto de staging.
  const c = camadasPorCaminhoMaisLongo(["raw.x", "stg.x", "tr.x", "an.dim_date", "an.f", "co.v"], [
    a("raw.x", "stg.x"), a("stg.x", "tr.x"), a("tr.x", "an.f"), a("an.dim_date", "an.f"), a("an.f", "co.v"),
  ]);
  assert.equal(c.get("an.dim_date"), 2);
  assert.equal(c.get("an.f"), 3);
  assert.equal(c.get("co.v"), 4);
});

test("ciclo não trava o cálculo", () => {
  const c = camadasPorCaminhoMaisLongo(["a", "b", "c"], [a("a", "b"), a("b", "c"), a("c", "b")]);
  assert.equal(c.size, 3);
  assert.ok(c.get("b") >= 1 && c.get("c") >= 1);
});

test("arestas para nós fora da lista são ignoradas", () => {
  const c = camadasPorCaminhoMaisLongo(["a", "b"], [a("a", "b"), a("fantasma", "b"), a("a", "a")]);
  assert.deepEqual(Object.fromEntries(c), { a: 0, b: 1 });
});

test("posições: x pela ordem das camadas, sem buracos; y pela ordem dada", () => {
  const camada = { a: 0, b: 5, c: 5 };
  const p = posicoesEmCamadas(["c", "a", "b"], (id) => camada[id], (x, y) => x.localeCompare(y), { dx: 10, dy: 1 });
  assert.equal(p.get("a").x, 0);
  assert.equal(p.get("b").x, 10);
  assert.ok(p.get("b").y < p.get("c").y);
});
