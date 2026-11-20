import test from "node:test";
import assert from "node:assert/strict";
import { factStar, viewColumnsByDimension } from "../src/lib/estrela.mjs";

const fk = (column, target, pk) => ({ column, references_relation: target, references_column: pk });
const pkg = {
  relations: {
    "analytics.fact_event": { name: "fact_event", schema: "analytics", grain: "um evento", primary_key: ["id"],
      foreign_keys: [fk("start", "analytics.dim_date", "key"), fk("end", "analytics.dim_date", "key")] },
    "analytics.dim_date": { schema: "analytics", name: "dim_date", primary_key: ["key"] },
    "history.dates": { resource_type: "snapshot" },
  },
  lineage: { relations: { "analytics.dim_date": { columns: { key: { leaves: ["history.dates.a", "history.dates.b"] } } } } },
};

test("duas datas mantêm as duas FKs e a PK declarada, mesmo com uma dimensão só", () => {
  const star = factStar(pkg, "analytics.fact_event");
  assert.equal(star.grain, "um evento");
  assert.deepEqual(star.primaryKey, ["id"]);
  assert.deepEqual(star.dimensions.map((dim) => dim.target), ["analytics.dim_date"]);
  assert.deepEqual(star.dimensions[0].keys, [{ fk: "start", pk: "key" }, { fk: "end", pk: "key" }]);
  assert.deepEqual(star.dimensions[0].snapshots, ["history.dates"]);
  assert.equal(factStar(pkg, "analytics.dim_date"), null);
});

test("chave homônima e teste relationships sem FK não criam braço nem completam grão", () => {
  const p = structuredClone(pkg);
  p.relations["analytics.fact_empty"] = { schema: "analytics", name: "fact_empty", columns: { key: {} }, grain: null };
  p.tests = { t: { test: "relationships", relation: "analytics.fact_empty", column: "key",
    references_relation: "analytics.dim_date", references_column: "key" } };
  assert.deepEqual(factStar(p, "analytics.fact_empty").dimensions, []);
  assert.equal(factStar(p, "analytics.fact_empty").grain, null);
  p.relations["analytics.dim_date"].primary_key.push("version");
  assert.deepEqual(factStar(p, "analytics.fact_event").dimensions, []);
});

test("o recorte exige folha da dimensão mesmo com nome igual ou dimensão declarada na pergunta", () => {
  const p = structuredClone(pkg);
  p.lineage.relations.view = { columns: {
    date_key: { leaves: ["analytics.fact_event.date_key"] },
    quarter: { leaves: ["analytics.dim_date.year", "analytics.dim_date.month"] },
    segment: { leaves: [], origins: [{ column: "analytics.dim_other.segment" }] },
  } };
  const dimensions = ["analytics.dim_date", "analytics.dim_other"];
  assert.deepEqual([...viewColumnsByDimension(p, { view: "view", dimensions })], [
    ["analytics.dim_date", ["quarter"]], ["analytics.dim_other", []],
  ]);
});
