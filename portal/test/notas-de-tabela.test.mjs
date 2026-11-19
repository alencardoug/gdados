import assert from "node:assert/strict";
import test from "node:test";
import { commonNotice, terminalNotice } from "../src/lib/notas-de-tabela.mjs";

test("só resume um aviso que vale para todas as linhas", () => {
  const note = (v) => v == null ? "não declarado" : null;
  assert.equal(commonNotice([], note), null);
  assert.equal(commonNotice([null, null], note), "não declarado");
  assert.equal(commonNotice([null, "integer"], note), null);
  assert.equal(commonNotice(["integer", "integer"], note), null);
});
test("a nota preserva a diferença entre source, linhagem ausente e lista de origens vazia", () => {
  const model = (l) => terminalNotice(l, "model");
  assert.equal(terminalNotice(null, "source"), "é origem");
  assert.equal(model(null), "sem linhagem no pacote");
  assert.equal(model({ origins: [] }), "nenhuma origem declarada");
  assert.equal(commonNotice([null, { origins: [] }], model), null);
  for (const kind of ["source", "seed", "generated"]) {
    assert.equal(model({ origins: [{ column: "a.b.c", kind }] }), null);
  }
});
