import test from "node:test";
import assert from "node:assert/strict";
import { examplePair, flowWidth, layerFlows, planLayerMap, neighborLayers } from "../src/lib/fluxo-de-camadas.mjs";

const layerOf = (id) => ({ a: "raw", b: "trusted", c: "trusted", d: "trusted" })[id];
const edges = [
  { source: "a", target: "b", n: 7 }, { source: "a", target: "c", n: 2 },
  { source: "d", target: "c", n: 3 }, { source: "fora", target: "c", n: 1 },
];
test("cada par de relações conta uma vez, inclusive entre relações da mesma camada", () => {
  assert.deepEqual(layerFlows(edges, layerOf), [
    { source: "raw", target: "trusted", pairs: 2 },
    { source: "trusted", target: "trusted", pairs: 1 },
  ]);
});
test("a faixa agrupa cada direção pela camada declarada e preserva o vizinho sem ficha", () => {
  const inputs = neighborLayers(edges.filter((e) => e.target === "c"), "source", layerOf);
  assert.deepEqual(inputs.map((g) => [g.layer, g.items[0].id]), [["raw", "a"], ["trusted", "d"], [null, "fora"]]);
  const outputs = neighborLayers(edges.filter((e) => e.source === "a"), "target", layerOf);
  assert.deepEqual(outputs, [{ layer: "trusted", items: [{ id: "b", n: 7 }, { id: "c", n: 2 }] }]);
});
const edge = (source, target, pairs = 1) => ({ source, target, pairs });

test("um traço só ocupa o mapa se o par existir na linhagem", () => {
  const flows = [edge("raw", "trusted"), edge("trusted", "extra"), edge("extra", "staging"),
    edge("controle", "staging"), edge("staging", "trusted"), edge("trusted", "trusted"), edge("extra", "extra")];
  const layers = ["raw", "raw_legacy", "staging", "trusted", "extra", "controle", "isolada"];
  const { stations, others, routes, extra } = planLayerMap(layers, flows);
  assert.deepEqual(routes.map((r) => r.edge), [flows[4]]);
  assert.deepEqual(extra, flows.slice(0, 4));
  assert.deepEqual(others.map((s) => s.layer), ["extra", "controle", "isolada"]);
  assert.deepEqual([...stations, ...others].flatMap((s) => s.loop ?? []), flows.slice(5));
});

test("as duas entradas têm saídas próprias e só a entrega a trusted contorna staging", () => {
  const layers = ["raw", "raw_legacy", "staging", "trusted"];
  const flows = [edge("raw", "staging"), edge("raw_legacy", "staging"), edge("raw_legacy", "trusted")];
  const { stations, routes, extra } = planLayerMap(layers, flows);
  assert.deepEqual(stations.slice(0, 2).map((s) => s.layer), ["raw", "raw_legacy"]);
  assert.deepEqual(routes.map((r) => [r.edge, r.shape]), [[flows[0], "down"], [flows[1], "bend"], [flows[2], "down"]]);
  assert.deepEqual(extra, []);
});

test("a espessura aumenta em passos iguais desde um par até o maior fluxo", () => {
  assert.deepEqual([1, 2, 5, 9].map((n) => flowWidth(n, 9)), [1, 2.125, 5.5, 10]);
  assert.equal(flowWidth(1, 1), 1);
  assert.deepEqual([0, 1, 2, 3].map((n) => flowWidth(n, 3, 3)), [1, 3, 6.5, 10]);
});

test("o exemplo escolhe um par do desvio com várias ligações e nomes curtos", () => {
  const layers = { a: "raw", b: "raw_legacy", c: "trusted", longo: "trusted" };
  const pairs = [{ source: "a", target: "c", n: 8 }, { source: "b", target: "longo", n: 9 }, { source: "b", target: "c", n: 3 }];
  assert.equal(examplePair(pairs, (id) => layers[id]), pairs[2]);
});

test("sem exemplo no desvio, a legenda exige fichas e usa um par existente ou omite o exemplo", () => {
  const pairs = [{ source: "fora", target: "c", n: 7 }, { source: "a", target: "b", n: 1 }, { source: "a", target: "c", n: 4 }];
  assert.equal(examplePair(pairs, layerOf), pairs[2]);
  assert.equal(examplePair(pairs.slice(0, 2), layerOf), pairs[1]);
  assert.equal(examplePair(pairs.slice(0, 1), layerOf), undefined);
});
