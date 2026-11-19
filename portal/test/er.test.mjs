// Diagrama entidade-relacionamento: chaves lidas do pacote, cardinalidade só pelo teste not_null.
import { test } from "node:test";
import assert from "node:assert/strict";
import { chavesEstrangeiras, relacoesDoModelo, vizinhos, definicaoER } from "../src/lib/er.mjs";
import { carregarOrigem } from "../src/lib/origem.mjs";

const pacote = {
  relations: {
    "a.fato": { primary_key: ["fato_key"], foreign_keys: [
      { column: "cliente_key", references_relation: "a.dim_cliente", references_column: "cliente_key" },
      { column: "criado_date_key", references_relation: "a.dim_data", references_column: "date_key" },
    ], columns: { fato_key: { data_type: "text" }, cliente_key: { data_type: "character varying" }, criado_date_key: { data_type: null } } },
    "a.dim_cliente": { primary_key: ["cliente_key"], foreign_keys: [], columns: { cliente_key: { data_type: "text" } } },
    "a.dim_data": { primary_key: ["date_key"], foreign_keys: [], columns: { date_key: { data_type: "text" } } },
    "b.solta": { primary_key: [], foreign_keys: [], columns: {} },
  },
  tests: {
    t1: { test: "not_null", relation: "a.fato", column: "cliente_key" },
    t2: { test: "relationships", relation: "a.fato", column: "criado_date_key" },
  },
};

test("modelo só com relações que têm chave ou são referenciadas", () => {
  assert.deepEqual(relacoesDoModelo(pacote), ["a.dim_cliente", "a.dim_data", "a.fato"]);
  assert.deepEqual(vizinhos(pacote, "a.dim_data"), ["a.dim_data", "a.fato"]);
});

test("cardinalidade: exatamente um só com not_null declarado", () => {
  const d = definicaoER(pacote, relacoesDoModelo(pacote), { titulo: "t" });
  assert.match(d, /^erDiagram/);
  assert.match(d, /e2 }o--\|\| e0 : "cliente_key"/);
  assert.match(d, /e2 }o--o\| e1 : "criado_date_key → date_key"/);
  assert.match(d, /character_varying cliente_key FK/);
  assert.match(d, /sem_tipo criado_date_key FK/);
  assert.match(d, /text fato_key PK/);
});

test("recorte com foco desenha só as ligações da relação em foco", () => {
  const ids = vizinhos(pacote, "a.dim_cliente");
  const d = definicaoER(pacote, ids, { foco: "a.dim_cliente" });
  assert.equal((d.match(/}o--/g) ?? []).length, 1);
});

test("no pacote fixado, toda chave estrangeira aponta para a chave primária do destino", () => {
  const { pacote: real } = carregarOrigem();
  const fks = chavesEstrangeiras(real);
  for (const f of fks) {
    const destino = real.relations[f.references_relation];
    assert.ok(destino, `${f.relacao}.${f.column} aponta para relação ausente`);
    assert.ok(destino.columns[f.references_column], `${f.references_relation}.${f.references_column} ausente`);
    assert.deepEqual(destino.primary_key, [f.references_column], `${f.relacao}.${f.column} não aponta para a PK`);
    assert.ok(real.relations[f.relacao].columns[f.column], `${f.relacao}.${f.column} ausente`);
  }
  const d = definicaoER(real, relacoesDoModelo(real), { titulo: "modelo" });
  assert.equal((d.match(/}o--/g) ?? []).length, fks.length);
});
