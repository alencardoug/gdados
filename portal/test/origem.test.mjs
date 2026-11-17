// Regras de leitura da D03: SHA-256 da cópia, formato 1 e esquema do mesmo commit.
import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PASTA_DA_ORIGEM, carregarOrigem, conferirProcedencia, validarPacote, ErroDaOrigem } from "../src/lib/origem.mjs";

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
