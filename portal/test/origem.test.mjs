// Regras de leitura da D03: SHA-256 da cópia, formato 1 e esquema do mesmo commit.
import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PASTA_DA_ORIGEM, carregarOrigem, conferirProcedencia, validarPacote, validarAmostras, ErroDaOrigem } from "../src/lib/origem.mjs";

const ler = (n) => JSON.parse(readFileSync(join(PASTA_DA_ORIGEM, n), "utf8"));
const esquema = ler("pacote_de_metadados.schema.json");
const exemplo = ler("pacote_de_metadados.exemplo.json");

test("a cópia versionada confere e o pacote é válido", () => {
  const { pacote, procedencia } = carregarOrigem();
  assert.equal(pacote.format, 1);
  assert.match(procedencia.commit, /^[0-9a-f]{40}$/);
});

test("o exemplo da origem é aceito (ensaio do mecanismo)", () => {
  assert.equal(validarPacote(structuredClone(exemplo), esquema).format, 1);
});

test("formato diferente de 1 recusa a build", () => {
  assert.throws(() => validarPacote({ ...structuredClone(exemplo), format: 2 }, esquema), (e) => e instanceof ErroDaOrigem && /só lê o formato 1/.test(e.message));
});

test("pacote fora do esquema recusa a build", () => {
  const ruim = structuredClone(exemplo);
  delete ruim.provenance;
  assert.throws(() => validarPacote(ruim, esquema), /não segue o esquema/);
});

test("format date inválido no calendário é recusado", () => {
  const ruim = structuredClone(exemplo);
  const ambiente = ruim.environments.find((e) => e.frozen_at != null) ?? ruim.environments[0];
  ambiente.frozen_at = "2026-02-30";
  assert.throws(() => validarPacote(ruim, esquema), /não segue o esquema/);
});

test("cópia alterada depois do registro recusa a build", () => {
  const tmp = join(PASTA_DA_ORIGEM, "..", ".cache", "testes", `origem-${process.pid}`);
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  cpSync(PASTA_DA_ORIGEM, tmp, { recursive: true });
  try {
    assert.doesNotThrow(() => conferirProcedencia(tmp));
    writeFileSync(join(tmp, "pacote_de_metadados.exemplo.json"), "{}");
    assert.throws(() => conferirProcedencia(tmp), /difere de procedencia\.json em: pacote_de_metadados\.exemplo\.json/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

// Amostras de registros (D06): esquema do mesmo commit e o que se confere sem o armazém.
const esquemaDasAmostras = ler("amostras_de_registros.schema.json");
const pacoteFixado = () => carregarOrigem().pacote;
const amostrasFixadas = () => structuredClone(carregarOrigem().amostras);
const comPessoal = (a) => Object.entries(a.relations).find(([, s]) => s.masked_columns.length && s.rows.length);

test("as amostras fixadas cobrem o pacote e são válidas", () => {
  const a = carregarOrigem().amostras;
  assert.deepEqual(Object.keys(a.relations).sort(), Object.keys(pacoteFixado().relations).sort());
  assert.equal(a.provenance.status, "verified");
});

test("amostras sem uma relação do pacote recusam a build", () => {
  const a = amostrasFixadas();
  delete a.relations[Object.keys(a.relations)[0]];
  assert.throws(() => validarAmostras(a, esquemaDasAmostras, pacoteFixado()), /sem amostra/);
});

test("valor personal sem máscara recusa a build", () => {
  const a = amostrasFixadas();
  const [id, s] = comPessoal(a);
  const i = s.columns.indexOf(s.masked_columns[0]);
  s.rows[0][i] = "Fulano de Tal";
  assert.throws(() => validarAmostras(a, esquemaDasAmostras, pacoteFixado()), new RegExp(`${id}, linha 1: .* não está mascarada`));
});

test("coluna mascarada diferente da classificação recusa a build", () => {
  const a = amostrasFixadas();
  const [, s] = comPessoal(a);
  s.masked_columns = [];
  assert.throws(() => validarAmostras(a, esquemaDasAmostras, pacoteFixado()), /mascaradas diferentes/);
});

test("amostras fora do esquema recusam a build", () => {
  const a = amostrasFixadas();
  a.provenance.status = "not_verified";
  assert.throws(() => validarAmostras(a, esquemaDasAmostras, pacoteFixado()), /não seguem o esquema/);
});
