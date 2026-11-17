// Saneamento do Markdown da origem (decisão de 17/11/2026; E3, achado da prova da D02).
import { test } from "node:test";
import assert from "node:assert/strict";
import { criarRenderizador, resolverNaOrigem, semMarcacao } from "../src/lib/markdown.mjs";

const copiados = new Set(["docs/glossario_de_negocio/receita_liquida.md", "airbyte/streams.yml", "docs/pendencias.md"]);
const { renderizar, emLinha } = await criarRenderizador({
  arquivoCopiado: (c) => copiados.has(c),
  rotaDoArquivo: (c, a) => `/origem/${c}/${a ? `#${a}` : ""}`,
});

test("preserva o sublinhado dos identificadores", async () => {
  const html = await renderizar("A camada raw_legacy e o modo dedup_history, em `raw_legacy`.");
  assert.match(html, /raw_legacy e o modo dedup_history/);
  assert.match(html, /<code>raw_legacy<\/code>/);
  assert.equal(semMarcacao("`raw_legacy` e *dedup_history* e snake_case_x"), "raw_legacy e dedup_history e snake_case_x");
});

test("HTML bruto vira texto, nunca elemento", async () => {
  const html = await renderizar('Texto <script>alert(1)</script> e <img src=x onerror="alert(1)">\n\n<div onclick="x">bloco</div>');
  assert.doesNotMatch(html, /<(script|img|div)[\s>]/i);
  assert.match(html, /&lt;img src=x onerror="alert\(1\)"&gt;/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});

test("links: âncora e http(s) ficam; outros esquemas perdem o destino", async () => {
  const html = await renderizar("[a](#secao) [b](https://exemplo.com/x) [c](javascript:alert(1)) [d](data:text/html,x) [e](mailto:x@example.com)");
  assert.match(html, /href="#secao"/);
  assert.match(html, /href="https:\/\/exemplo\.com\/x" rel="noopener noreferrer external"/);
  assert.doesNotMatch(html, /javascript:|data:text|mailto:/);
});

test("link relativo resolve no repositório da origem, a partir da base", async () => {
  const doPacote = await renderizar("[conceito](glossario_de_negocio/receita_liquida.md) e [fluxo](../airbyte/streams.yml)", "docs/");
  assert.match(doPacote, /href="\/origem\/docs\/glossario_de_negocio\/receita_liquida\.md\/"/);
  assert.match(doPacote, /href="\/origem\/airbyte\/streams\.yml\/"/);
  const doArquivo = await renderizar("[d63](../pendencias.md#d63--x)", "docs/glossario_de_negocio/receita_liquida.md");
  assert.match(doArquivo, /href="\/origem\/docs\/pendencias\.md\/#d63--x"/);
});

test("link para arquivo fora da cópia perde o destino e fica marcado", async () => {
  const html = await renderizar("[adr](adr/0099-nao-copiada.md)", "docs/");
  assert.doesNotMatch(html, /href=/);
  assert.match(html, /class="fora-da-copia"/);
  assert.match(html, /docs\/adr\/0099-nao-copiada\.md/);
});

test("link que sai do repositório não é resolvido", () => {
  assert.equal(resolverNaOrigem("../../../etc/passwd", "docs/"), null);
  assert.deepEqual(resolverNaOrigem("x.md#a", "docs/"), { caminho: "docs/x.md", ancora: "a" });
});

test("imagem vira o texto alternativo", async () => {
  const html = await renderizar("![diagrama da arquitetura](fig.png)");
  assert.doesNotMatch(html, /<img/);
  assert.match(html, /diagrama da arquitetura/);
});

test("texto curto em linha não ganha parágrafo; ausente continua ausente", async () => {
  assert.equal(await emLinha("só `isto`"), "só <code>isto</code>");
  assert.equal(await emLinha(null), null);
});
