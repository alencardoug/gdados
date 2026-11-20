import test from "node:test";
import assert from "node:assert/strict";
import { montarLinhasReais } from "../src/lib/linhas-reais.mjs";

const amostras = { relations: { "a.dim": {
  columns: ["key", "natural", "origem"],
  rows: [["k1", 1, "retail"], ["k2", 2, "retail"], ["k3", 1, "legacy"]],
} } };
const pacote = { relations: { "a.dim": { grain: "um por origem", columns: { key: { sensitivity: "internal" }, natural: { sensitivity: "public" } } } } };
const base = { relacao: "a.dim", colunas: ["key", "natural"], destaque: ["key"], distintas_em: [], nota: "n" };

test("recorta as colunas, traz a classificação do pacote e numera os grupos repetidos", () => {
  const b = montarLinhasReais({ ...base, agrupar_por: "natural", distintas_em: ["origem", "key"] }, amostras, pacote);
  assert.equal(b.grao, "um por origem");
  assert.deepEqual(b.colunas.map((c) => [c.nome, c.sensibilidade, c.destaque]), [["key", "internal", true], ["natural", "public", false]]);
  assert.deepEqual(b.linhas.map((l) => [l.numero, l.grupo]), [[1, 1], [2, null], [3, 1]]);
  assert.equal(b.grupos, 1);
});

test("o build falha quando a amostra não sustenta a nota", () => {
  assert.throws(() => montarLinhasReais({ ...base, relacao: "x.y" }, amostras, pacote), /sem amostra/);
  assert.throws(() => montarLinhasReais({ ...base, colunas: ["falta"] }, amostras, pacote), /não está na amostra/);
  assert.throws(() => montarLinhasReais({ ...base, agrupar_por: "origem", distintas_em: ["origem"] }, amostras, pacote), /se repete dentro/);
  assert.throws(() => montarLinhasReais({ ...base, agrupar_por: "key" }, amostras, pacote), /nenhum valor/);
});
