import test from "node:test";
import assert from "node:assert/strict";
import {
  agruparPorLinha, camposNulos, chaveDaLinha, diferencaDeTexto, marcarDelimitador, tratamentoDoTipo,
} from "../src/lib/casos-do-legado.mjs";

const texto = (trechos) => trechos.map((t) => t.texto).join("");
const mudados = (trechos) => trechos.filter((t) => t.tipo === "mudou").map((t) => t.texto);

test("diferença marca só o que sai e o que entra, e o texto continua o literal", () => {
  const d = diferencaDeTexto('"R$ 195,00"', '"195.00"');
  assert.equal(texto(d.antes), '"R$ 195,00"');
  assert.equal(texto(d.depois), '"195.00"');
  assert.deepEqual(mudados(d.antes), ["R$ ", ","]);
  assert.deepEqual(mudados(d.depois), ["."]);
});

test("sem diferença, sem texto, acima do limite ou sem nada em comum, não há marcação", () => {
  assert.equal(diferencaDeTexto("igual", "igual"), null);
  assert.equal(diferencaDeTexto(null, "x"), null);
  assert.equal(diferencaDeTexto("a".repeat(301), "b"), null);
  assert.equal(diferencaDeTexto("abc", "xyz"), null);
});

test("o delimitador declarado é separado dos trechos iguais, sem mudar o texto", () => {
  const t = marcarDelimitador([{ tipo: "igual", texto: '"AGT-0002;Renan;Costela"' }], ";");
  assert.equal(texto(t), '"AGT-0002;Renan;Costela"');
  assert.equal(t.filter((x) => x.tipo === "delimitador").length, 2);
  assert.deepEqual(marcarDelimitador([{ tipo: "igual", texto: "sem" }], ""), [{ tipo: "igual", texto: "sem" }]);
});

test("a mesma linha (tabela, ocorrência, captura) reúne as etapas na ordem das camadas", () => {
  const schema = { "trusted.legacy_eligible_records": "trusted", "staging.stg_legacy__x": "staging" };
  const base = { table: "x", rowId: 9, capture: 94 };
  const grupos = agruparPorLinha([
    { ...base, relation: "trusted.legacy_eligible_records", anchor: "t" },
    { ...base, relation: "staging.stg_legacy__x", anchor: "s" },
    { table: "x", rowId: 9, capture: 7, relation: "staging.stg_legacy__x", anchor: "outra" },
    { table: "x", rowId: null, capture: 94, relation: "staging.stg_legacy__x", anchor: "sem-id" },
  ], (r) => schema[r]);
  assert.equal(grupos.length, 3);
  assert.deepEqual(grupos[0].itens.map((i) => i.anchor), ["s", "t"]);
  assert.equal(chaveDaLinha({ table: "x", rowId: 0, capture: 1 }), "x|0|1");
  assert.equal(chaveDaLinha({ table: "x", rowId: 1 }), null);
});

test("o tratamento sai do catálogo: rejeição, recuperação original ou nula", () => {
  assert.equal(tratamentoDoTipo({ rejeicao: "motivo" }), "rejeita");
  assert.equal(tratamentoDoTipo({ conversao: "r", recuperacao: "original" }), "recupera");
  assert.equal(tratamentoDoTipo({ conversao: "r", recuperacao: "nulo" }), "anula");
  assert.equal(tratamentoDoTipo({ conversao: "r" }), "converte");
  assert.equal(tratamentoDoTipo(undefined), "indefinido");
});

test("campos nulos da carga, fora o campo do achado, em ordem estável", () => {
  assert.deepEqual(camposNulos({ b: null, a: null, c: "1", campo: null }, "campo"), ["a", "b"]);
  assert.deepEqual(camposNulos("<personal>", "x"), []);
});
