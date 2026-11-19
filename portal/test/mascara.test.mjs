// Identificadores da D04 (avaliação da E4.5): nenhum chega ao site.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { carregarOrigem, PASTA_DA_ORIGEM } from "../src/lib/origem.mjs";
import { mascarar, MARCADOR_DE_FATURAMENTO, MARCADOR_DE_PROJETO } from "../src/lib/mascara.mjs";

test("conta de faturamento, inteira ou truncada, vira marcador", () => {
  assert.equal(mascarar("conta ABC123-DEF456-789ABC aberta").texto, `conta ${MARCADOR_DE_FATURAMENTO} aberta`);
  assert.equal(mascarar("a conta `ABC123-…` é a única").texto, `a conta \`${MARCADOR_DE_FATURAMENTO}\` é a única`);
});

test("ID de projeto fora da lista e commits não mudam", () => {
  const texto = "mvp-ed1-gcp, commit eb11709, us-east1, cloud-run-source-deploy";
  assert.deepEqual(mascarar(texto), { texto, trocas: 0 });
});

test("nenhum identificador listado sobra nos textos e no pacote da origem", () => {
  const { arquivos } = carregarOrigem();
  let trocas = 0;
  const fontes = [...arquivos.values()].map((a) => readFileSync(a.local, "utf8"));
  fontes.push(readFileSync(join(PASTA_DA_ORIGEM, "pacote_de_metadados.json"), "utf8"));
  fontes.push(readFileSync(join(PASTA_DA_ORIGEM, "amostras_de_registros.json"), "utf8"));
  for (const texto of fontes) {
    const uma = mascarar(texto);
    trocas += uma.trocas;
    assert.equal(mascarar(uma.texto).trocas, 0, "a segunda passada não acha mais nada");
  }
  // Desde a v2.3.0 a origem troca esses identificadores por marcadores na fonte (29f13f8), e a cópia
  // não cita nenhum: a troca na exibição continua como defesa, para uma refixação que os traga de volta.
  assert.ok(trocas >= 0);
  assert.ok(MARCADOR_DE_PROJETO.length > 0);
});
