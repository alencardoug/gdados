import test from "node:test";
import assert from "node:assert/strict";
import { mapaDeCalor } from "../src/lib/calor.mjs";

const pacote = {
  relations: {
    "raw.a": { schema: "raw", columns: { id: { sensitivity: "internal" }, nome: { sensitivity: "personal" }, carga: { sensitivity: "personal" } } },
    "stg.b": { schema: "stg", columns: { id: { sensitivity: "public" }, x: { sensitivity: "secreta" } } },
  },
  tests: {
    t1: { relation: "stg.b", column: "id", result: { status: "pass" } },
    t2: { relation: "stg.b", column: null, result: { status: "fail" } },
    t3: { relation: null, test: "singular" },
  },
};
const amostras = { masking: { marker: "<p>" }, relations: {
  "raw.a": { columns: ["id", "nome", "carga"], rows: [[1, "<p>", { campo: { fundo: "<p>" } }], [2, null, null]] },
} };

test("conta classes, testes, cobertura e máscara (inclusive dentro de JSON) por camada", () => {
  const m = mapaDeCalor(pacote, amostras, ["raw", "stg"]);
  assert.deepEqual(m.classes, ["public", "internal", "personal", "secreta"]);
  const [raw, stg] = m.linhas;
  assert.deepEqual(raw.porClasse, { public: 0, internal: 1, personal: 2, secreta: 0 });
  assert.equal(raw.mascaradas, 2);
  assert.equal(raw.mascaradasForaDePersonal, 0);
  assert.equal(raw.testes, 0);
  assert.deepEqual([stg.testes, stg.comTeste, stg.colunas], [2, 1, 2]);
  assert.deepEqual(stg.resultados, { fail: 1, pass: 1 });
  assert.equal(m.testesSemRelacao, 1);
  assert.deepEqual(m.tiposSemRelacao, ["singular"]);
  assert.equal(m.maximoPorClasse.personal, 2);
});
