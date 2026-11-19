import assert from "node:assert/strict";
import test from "node:test";
import { identifierParts, wrapInlineIdentifiers } from "../src/lib/identificadores.mjs";

test("nomes técnicos mantêm cada caractere e só admitem quebras depois de ponto ou sublinhado", () => {
  for (const [name, parts] of [
    ["analytics.fact_inventory_movement", ["analytics.", "fact_", "inventory_", "movement"]],
    ["aggregate_version", ["aggregate_", "version"]], ["_a__b", ["_", "a_", "_", "b"]],
    ["uma-palavra", ["uma-palavra"]],
  ]) assert.deepEqual(identifierParts(name), parts);
});
test("quebras no Markdown preservam HTML saneado, expressões e texto comum", () => {
  const other = "Texto_comum <code>&lt;a&gt;</code> <code>a + b</code>";
  assert.equal(wrapInlineIdentifiers(other + " <code>x.y_z</code>"),
    other + ' <code class="identifier"><span>x.</span><wbr><span>y_</span><wbr><span>z</span></code>');
});
