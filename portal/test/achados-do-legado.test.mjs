import test from "node:test";
import assert from "node:assert/strict";
import { legacyObservations } from "../src/lib/achados-do-legado.mjs";

const raw = "raw_legacy.old", stage = "staging.prepared", bridge = "trusted.legado__typed";
const pkg = {
  relations: {
    [raw]: { schema: "raw_legacy", name: "old" }, [stage]: { schema: "staging", name: "prepared" },
    [bridge]: { schema: "trusted", name: "legado__typed" }, "trusted.events": { schema: "trusted", name: "events" },
  },
  lineage: { relations: {
    [stage]: { columns: { price: { leaves: [raw + ".price"] } } },
    [bridge]: { columns: { amount: { leaves: [raw + ".price"] } } },
  } },
};
const marker = "<personal>";
function sample(id, rows) {
  const columns = Object.keys(rows[0]);
  return { masking: { marker }, relations: { [id]: { columns, rows: rows.map((r) => columns.map((k) => r[k])) } } };
}

test("staging usa a coluna limpa e o achado da mesma linha, inclusive para um código novo", () => {
  const samples = sample(stage, [
    { price: "1.20", original_payload: { price: "1,20" }, achados: { price: "NOVO" } },
    { price: "0.00", original_payload: { price: "0" }, achados: {} },
  ]);
  const { byCode, rawByBridge } = legacyObservations(pkg, samples);
  assert.deepEqual([...byCode.keys()], ["NOVO"]);
  const [item] = byCode.get("NOVO");
  assert.deepEqual([item.before, item.after, item.raw, item.rowNumber], ["1,20", "1.20", raw, 1]);
  assert.equal(rawByBridge.get(bridge), raw);
});

test("payload inteiro mascarado, folha mascarada, campo ausente e nulo conservam seus estados", () => {
  const samples = sample("trusted.events", [
    { original_payload: marker, cleaned_payload: { x: marker }, value_findings: { x: "A" } },
    { original_payload: {}, cleaned_payload: { x: null }, value_findings: { x: "A" } },
    { original_payload: { x: "null" }, cleaned_payload: { x: null }, value_findings: marker },
  ]);
  const { byCode } = legacyObservations(pkg, samples);
  assert.deepEqual(byCode.get("A").map((x) => [x.before, x.after]), [[marker, marker], [undefined, null]]);
  assert.equal(byCode.size, 1);
});

test("achado da linha inteira e correção numa linha rejeitada conservam escopo, ação e motivo", () => {
  const samples = sample("trusted.events", [{ original_payload: { name: " A" }, cleaned_payload: { name: "A" },
    classification: "rejected", source_table: "old", findings: [
      { column: null, code: "D", action: "reject", reason: "Duplicata", context: { canonical_row_id: 2 } },
      { column: "name", code: "C", action: "correct", reason: "Espaço" },
    ] }]);
  const { byCode } = legacyObservations(pkg, samples);
  const [duplicate] = byCode.get("D"), [correction] = byCode.get("C");
  assert.deepEqual([duplicate.field, duplicate.before, duplicate.after, duplicate.context],
    [null, { name: " A" }, { name: "A" }, { canonical_row_id: 2 }]);
  assert.deepEqual([correction.raw, correction.before, correction.after, correction.action, correction.classification, correction.reason],
    [raw, " A", "A", "correct", "rejected", "Espaço"]);
});

test("duas relações brutas possíveis deixam a tabela da ocorrência sem atribuição", () => {
  const p = structuredClone(pkg);
  p.relations["raw_legacy.another"] = { schema: "raw_legacy", name: "another" };
  p.lineage.relations[stage].columns.id = { leaves: ["raw_legacy.another.id"] };
  const samples = sample(stage, [{ price: 2, original_payload: { price: 1 }, achados: { price: "A" } }]);
  assert.equal(legacyObservations(p, samples).byCode.get("A")[0].raw, undefined);
});
