// Travessias no grafo: destino exato tem precedência sobre o destino por camada (PLANO §2.2).
import { test } from "node:test";
import assert from "node:assert/strict";
import { ligarTravessias } from "../src/lib/travessias.mjs";
import { carregarOrigem } from "../src/lib/origem.mjs";

const relations = {
  "raw.a": { schema: "raw" }, "raw.b_stream": { schema: "raw" }, "gov.cert": { schema: "gov" }, "gov.log": { schema: "gov" },
};
const crossings = [
  { origin: "`oltp`", destination: "`raw`", mechanism: "Airbyte, lote" },
  { origin: "`oltp.b`", destination: "`raw.b_stream`", mechanism: "Debezium (WAL) → Beam — x" },
  { origin: "`legacy`", destination: "`gov.cert`", mechanism: "captura" },
  { origin: "x", destination: "`nada`", mechanism: "y" },
];

test("destino exato liga só à relação; camada exclui a que tem travessia exata", () => {
  const { travessias, semLigacao } = ligarTravessias(crossings, relations);
  assert.deepEqual(travessias[0].relacoes, ["raw.a"]);
  assert.equal(travessias[0].tipo, "camada");
  assert.deepEqual(travessias[1].relacoes, ["raw.b_stream"]);
  assert.equal(travessias[1].tipo, "relacao");
  assert.deepEqual(travessias[2].relacoes, ["gov.cert"]);
  assert.deepEqual(semLigacao, ["nada"]);
  assert.equal(travessias[1].mecanismo, "Debezium");
});

test("no pacote fixado, toda travessia tem destino conhecido e as relações-destino são sources", () => {
  const { pacote } = carregarOrigem();
  const { travessias, semLigacao } = ligarTravessias(pacote.crossings, pacote.relations);
  assert.deepEqual(semLigacao, []);
  for (const t of travessias) {
    assert.ok(t.relacoes.length > 0, t.destino);
    for (const r of t.relacoes) assert.equal(pacote.relations[r].resource_type, "source", r);
  }
  const porRelacao = new Map();
  for (const t of travessias) for (const r of t.relacoes) porRelacao.set(r, [...(porRelacao.get(r) ?? []), t.id]);
  for (const [r, ts] of porRelacao) assert.equal(ts.length, 1, `${r} recebe mais de uma travessia`);
});
