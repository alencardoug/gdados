import test from "node:test";
import assert from "node:assert/strict";
import { factStar } from "../src/lib/estrela.mjs";

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
  assert.deepEqual(star.arms.map((a) => [a.fk, a.target, a.pk]), [
    ["start", "analytics.dim_date", "key"], ["end", "analytics.dim_date", "key"],
  ]);
  assert.deepEqual(star.arms[0].snapshots, ["history.dates"]);
  assert.equal(factStar(pkg, "analytics.dim_date"), null);
});

test("chave homônima e teste relationships sem FK não criam braço nem completam grão", () => {
  const p = structuredClone(pkg);
  p.relations["analytics.fact_empty"] = { schema: "analytics", name: "fact_empty", columns: { key: {} }, grain: null };
  p.tests = { t: { test: "relationships", relation: "analytics.fact_empty", column: "key",
    references_relation: "analytics.dim_date", references_column: "key" } };
  assert.deepEqual(factStar(p, "analytics.fact_empty").arms, []);
  assert.equal(factStar(p, "analytics.fact_empty").grain, null);
  p.relations["analytics.dim_date"].primary_key.push("version");
  assert.deepEqual(factStar(p, "analytics.fact_event").arms, []);
});
