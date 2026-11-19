// Roteiro de aprendizado: pré-requisitos sem ciclo e todo termo alcançável na ordem de leitura.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { verificarRoteiro, posicoesNoRoteiro, mapaDoRoteiro } from "../src/lib/roteiro.mjs";

const pre = new Map([["a", []], ["b", ["a"]], ["c", ["b"]], ["d", []]]);
const degrau = (id, ...termos) => ({ id, titulo: id, termos: termos.map((t) => ({ id: t })) });

test("roteiro coerente não tem erro", () => {
  assert.deepEqual(verificarRoteiro([degrau("um", "a", "b"), degrau("dois", "c")], pre), []);
});

test("pré-requisito fora do roteiro ou num degrau posterior é erro", () => {
  assert.match(verificarRoteiro([degrau("um", "b")], pre).join(), /b pede a, que não está no roteiro/);
  assert.match(verificarRoteiro([degrau("um", "b"), degrau("dois", "a")], pre).join(), /só vem em dois/);
});

test("termo desconhecido, repetido e ciclo são erros", () => {
  assert.match(verificarRoteiro([degrau("um", "x")], pre).join(), /termo desconhecido x/);
  assert.match(verificarRoteiro([degrau("um", "a", "a")], pre).join(), /já está em um/);
  const ciclo = new Map([["a", ["b"]], ["b", ["a"]]]);
  assert.match(verificarRoteiro([], ciclo).join(), /ciclo nos pré-requisitos/);
});

test("posição: anterior e seguinte atravessam os degraus", () => {
  const p = posicoesNoRoteiro([degrau("um", "a", "b"), degrau("dois", "c")]);
  assert.deepEqual(p.get("b"), { id: "b", degrau: 0, ordem: 1, anterior: "a", seguinte: "c" });
  assert.equal(p.get("a").anterior, null);
  assert.equal(p.get("c").seguinte, null);
});

test("mapa liga só termos do roteiro e escapa o texto", () => {
  const m = mapaDoRoteiro([degrau("um", "a", "b")], pre, new Map([["a", 'A "x"'], ["b", "B"]]));
  assert.match(m, /t0\["A #quot;x#quot;"\]/);
  assert.match(m, /t0 --> t1/);
});

// Depois de uma build, o relatório editorial lista o roteiro sem prática ausente.
const relatorio = join(import.meta.dirname, "..", "dist", "dados", "editorial.json");
test("roteiro da build sem prática ausente", { skip: !existsSync(relatorio) && "rode npm run build antes" }, () => {
  const r = JSON.parse(readFileSync(relatorio, "utf8"));
  assert.ok(r.roteiro.degraus.length >= 1);
  assert.ok(!r.exemplos_ausentes.some((e) => e.startsWith("roteiro")));
});
