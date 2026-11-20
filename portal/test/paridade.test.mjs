import test from "node:test";
import assert from "node:assert/strict";
import { ancoraDoTitulo, tabelaDaSecao, aberturaDaCelula, servicosDoCompose, imagemLegivel, recursosDoTerraform } from "../src/lib/paridade.mjs";

test("a âncora segue o GitHub e a tabela vem da seção certa", () => {
  assert.equal(ancoraDoTitulo("5. Mapa de paridade local ↔ GCP"), "5-mapa-de-paridade-local--gcp");
  const md = "# A\n\n## 1. Outra\n\n| x | y | z |\n|---|---|---|\n| 1 | 2 | 3 |\n\n## 5. Mapa de paridade local ↔ GCP\n\nTexto.\n\n| Conceito | Fase local | Fase GCP |\n|---|---|---|\n| Origem | PostgreSQL | Cloud SQL |\n| Segredos | `.env` local | Secret Manager |\n\n## 6. Depois\n";
  const t = tabelaDaSecao(md, "5-mapa-de-paridade-local--gcp");
  assert.deepEqual(t.cabecalho, ["Conceito", "Fase local", "Fase GCP"]);
  assert.deepEqual(t.linhas, [["Origem", "PostgreSQL", "Cloud SQL"], ["Segredos", "`.env` local", "Secret Manager"]]);
  assert.throws(() => tabelaDaSecao(md, "9-nao-existe"), /não encontrada/);
});

test("a abertura corta na primeira pausa forte, sem quebrar identificadores com sublinhado", () => {
  assert.deepEqual(aberturaDaCelula("Schema no `warehouse_db` (nove)"), { abertura: "Schema no warehouse_db", resumida: true });
  assert.deepEqual(aberturaDaCelula("Cloud SQL for PostgreSQL"), { abertura: "Cloud SQL for PostgreSQL", resumida: false });
  assert.ok(aberturaDaCelula("palavra ".repeat(30)).abertura.endsWith("…"));
});

test("serviços do compose herdam a imagem da âncora YAML quando não declaram a própria", () => {
  const y = "name: x\n\nx-base: &base\n  image: postgres:16@sha256:abc\n  restart: always\n\nservices:\n  # comentário\n  db:\n    <<: *base\n    container_name: db\n  app:\n    image: app:1\n\nvolumes:\n  dados:\n";
  const s = servicosDoCompose(y);
  assert.deepEqual(s.map((x) => [x.nome, x.imagem, x.heranca]), [["db", "postgres:16@sha256:abc", "base"], ["app", "app:1", null]]);
  assert.equal(imagemLegivel(s[0].imagem), "postgres:16");
});

test("o Terraform conta blocos resource por tipo, não instâncias", () => {
  const tf = 'resource "google_bigquery_dataset" "camadas" {\n  for_each = toset(var.x)\n}\nresource "google_project_iam_member" "a" {}\nresource "google_project_iam_member" "b" {}\ndata "google_project" "p" {}\n';
  assert.deepEqual(recursosDoTerraform(tf), [{ tipo: "google_project_iam_member", n: 2 }, { tipo: "google_bigquery_dataset", n: 1 }]);
});
