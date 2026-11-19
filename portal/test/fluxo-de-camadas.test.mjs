import test from "node:test";
import assert from "node:assert/strict";
import { layerFlows, planLayerMap, neighborLayers } from "../src/lib/fluxo-de-camadas.mjs";

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
test("o desenho só usa ligações exportadas e conserva saltos, voltas e camadas isoladas", () => {
  const edge = (source, target) => ({ source, target, pairs: 1 });
  const flows = [edge("raw", "trusted"), edge("trusted", "extra"), edge("extra", "staging"),
    edge("controle", "staging"), edge("staging", "trusted"), edge("trusted", "trusted")];
  const { stations, detached, extra } = planLayerMap(["raw", "staging", "trusted", "extra", "controle", "isolada"], flows);
  assert.equal(stations[0].next, undefined);
  assert.deepEqual(stations[1].next, flows[4]);
  assert.deepEqual(stations[1].branches, [{ layer: "controle", edge: flows[3] }]);
  assert.deepEqual(stations[2].branches, [{ layer: "extra", edge: flows[1] }]);
  assert.deepEqual(extra, [flows[0], flows[2], flows[5]]);
  assert.deepEqual(detached, ["isolada"]);
});
