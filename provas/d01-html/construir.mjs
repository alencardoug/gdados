// Prova da D01, candidata sem framework: gera páginas estáticas com template literals.
// Insumo: provas/comum/gerado/dados (preparar_dados.mjs). Saída: dist/.
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const dados = join(aqui, "..", "comum", "gerado", "dados");
const cliente = join(aqui, "..", "comum", "cliente");
const dist = join(aqui, "dist");
const ler = (nome) => JSON.parse(readFileSync(join(dados, nome), "utf8"));

const esc = (v) =>
  String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const ausente = (v, texto = "ausente") => (v == null ? `<span class="ausente">${texto}</span>` : esc(v));

const proc = ler("procedencia.json");
const relacoes = ler("relacoes.json");

const pagina = ({ titulo, corpo, scripts = "" }) => `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)} · gdados (prova)</title>
<link rel="stylesheet" href="/cliente/estilo.css">
</head>
<body>
<header><nav aria-label="Principal"><a href="/">Catálogo</a><a href="/linhagem/">Linhagem</a><a href="/travessias/">Travessias</a></nav></header>
<main>
${corpo}
</main>
<footer>
Pacote de <code>${esc(proc.repository)}</code> em <code>${esc(proc.ref)}</code> (<code>${esc(proc.commit.slice(0, 7))}</code>),
copiado em ${esc(proc.copied_at)}. Manifesto de ${esc(proc.manifest_generated_at)}, dbt ${esc(proc.dbt_version)} (${esc(proc.adapter_type)}).
Armazém: <code>${esc(proc.warehouse.status)}</code>${proc.warehouse.reason ? ` (${esc(proc.warehouse.reason)})` : ""}.
</footer>
${scripts}
</body>
</html>
`;

const catalogo = () =>
  pagina({
    titulo: "Catálogo",
    corpo: `<h1>Catálogo</h1>
<label for="busca">Buscar</label>
<input id="busca" type="search" disabled placeholder="Carregando o índice…" autocomplete="off">
<p id="situacao" role="status"></p>
<ul id="resultados"></ul>
<label for="camada">Camada</label>
<select id="camada"><option value="">Todas</option>${[...new Set(relacoes.map((r) => r.camada))]
      .map((c) => `<option>${esc(c)}</option>`)
      .join("")}</select>
<div class="rolagem"><table id="relacoes">
<thead><tr><th>Relação</th><th>Camada</th><th>Tipo</th><th>Colunas</th><th>Descrição</th></tr></thead>
<tbody>
${relacoes
  .map(
    (r) => `<tr data-camada="${esc(r.camada)}"><td><a href="/relacao/${esc(r.id)}/">${esc(r.id)}</a></td><td>${esc(r.camada)}</td><td>${esc(r.tipo)}</td><td>${r.colunas}</td><td>${r.sem_descricao ? '<span class="ausente">sem descrição declarada</span>' : ausente(r.descricao)}</td></tr>`,
  )
  .join("\n")}
</tbody></table></div>`,
    scripts: `<script type="module">
import { iniciarBusca } from "/cliente/busca.js";
iniciarBusca({ entrada: document.getElementById("busca"), lista: document.getElementById("resultados"), situacao: document.getElementById("situacao") });
const filtro = document.getElementById("camada");
filtro.addEventListener("change", () => {
  for (const tr of document.querySelectorAll("#relacoes tbody tr")) tr.hidden = filtro.value !== "" && tr.dataset.camada !== filtro.value;
});
</script>`,
  });

const detalhe = (r) => {
  const m = r.meta ?? {};
  const linhas = Object.entries(r.columns)
    .map(([nome, c]) => {
      const origens = c.lineage?.origins?.map((o) => `${esc(o.column)} <span class="tipo">${esc(o.kind)}</span>`).join("<br>");
      return `<tr id="coluna-${esc(nome)}"><td><code>${esc(nome)}</code></td><td>${ausente(c.data_type, "não declarado")}</td><td>${esc(c.sensitivity)}</td><td>${ausente(c.description)}</td><td>${origens ?? '<span class="ausente">sem linhagem no pacote</span>'}</td></tr>`;
    })
    .join("\n");
  const testes = r.tests
    .map((t) => `<tr><td>${esc(t.test)}</td><td>${ausente(t.column)}</td><td>${t.result ? `${esc(t.result.status)} em ${esc(t.result.executed_at)}` : '<span class="ausente">sem resultado</span>'}</td></tr>`)
    .join("\n");
  return pagina({
    titulo: r.id,
    corpo: `<h1><code>${esc(r.id)}</code></h1>
<p>${r.description == null ? '<span class="ausente">Sem descrição declarada.</span>' : esc(r.description)}</p>
<dl>
<dt>Tipo</dt><dd>${esc(r.resource_type)}</dd>
<dt>Materialização</dt><dd>${ausente(r.materialization)}</dd>
<dt>Grão</dt><dd>${ausente(r.grain)}</dd>
<dt>Domínio</dt><dd>${ausente(m.domain)}</dd>
<dt>Dono</dt><dd>${ausente(m.owner)}</dd>
<dt>Retenção</dt><dd>${ausente(m.retention)}</dd>
<dt>Papéis com leitura</dt><dd>${r.grants_select.length ? r.grants_select.map(esc).join(", ") : '<span class="ausente">nenhum</span>'}</dd>
</dl>
<p><a href="/linhagem/?r=${esc(r.id)}">Linhagem por relação</a> · <a href="/linhagem/?modo=coluna&amp;r=${esc(r.id)}">Linhagem por coluna</a></p>
<h2>Colunas</h2>
<div class="rolagem"><table><thead><tr><th>Coluna</th><th>Tipo</th><th>Sensibilidade</th><th>Descrição</th><th>Origens terminais</th></tr></thead>
<tbody>
${linhas}
</tbody></table></div>
<h2>Testes</h2>
${r.tests.length ? `<div class="rolagem"><table><thead><tr><th>Teste</th><th>Coluna</th><th>Resultado</th></tr></thead><tbody>${testes}</tbody></table></div>` : '<p class="ausente">Nenhum teste declarado.</p>'}`,
  });
};

const linhagem = () =>
  pagina({
    titulo: "Linhagem",
    corpo: `<h1>Linhagem</h1>
<p><a href="/linhagem/">Recorte por relação</a> · <a href="/linhagem/?modo=coluna">Por coluna</a> · <a href="/linhagem/?modo=tudo">Todas as relações</a>. Duplo clique num nó expande um nível.</p>
<p id="aviso" role="status"></p>
<div id="grafo" role="img" aria-label="Grafo de linhagem; as mesmas ligações estão na tabela abaixo"></div>
<h2>Ligações (alternativa em tabela)</h2>
<div class="rolagem"><table><thead><tr><th>Insumo</th><th>Destino</th><th>Colunas</th></tr></thead><tbody id="ligacoes"></tbody></table></div>`,
    scripts: `<script type="module">
import cytoscape from "/vendor/cytoscape.esm.min.mjs";
import { iniciarLinhagem } from "/cliente/linhagem.js";
iniciarLinhagem({ cytoscape, container: document.getElementById("grafo"), tabela: document.getElementById("ligacoes"), aviso: document.getElementById("aviso"), params: new URLSearchParams(location.search) });
</script>`,
  });

const travessias = () =>
  pagina({
    titulo: "Travessias",
    corpo: `<h1>Travessias fora do dbt</h1>
<div id="diagrama"></div>
<h2>Travessias (alternativa em tabela)</h2>
<div class="rolagem"><table><thead><tr><th>Origem</th><th>Destino</th><th>Mecanismo</th><th>Frequência</th><th>Nota</th></tr></thead><tbody id="tabela"></tbody></table></div>`,
    scripts: `<script type="module">
import mermaid from "/vendor/mermaid/mermaid.esm.min.mjs";
import { iniciarTravessias } from "/cliente/travessias.js";
iniciarTravessias({ mermaid, container: document.getElementById("diagrama"), tabela: document.getElementById("tabela") });
</script>`,
  });

rmSync(dist, { recursive: true, force: true });
const escrever = (rota, html) => {
  mkdirSync(join(dist, rota), { recursive: true });
  writeFileSync(join(dist, rota, "index.html"), html);
};
escrever("", catalogo());
escrever("linhagem", linhagem());
escrever("travessias", travessias());
for (const arquivo of readdirSync(join(dados, "relacao"))) {
  const r = JSON.parse(readFileSync(join(dados, "relacao", arquivo), "utf8"));
  escrever(join("relacao", r.id), detalhe(r));
}
cpSync(dados, join(dist, "dados"), { recursive: true });
cpSync(cliente, join(dist, "cliente"), { recursive: true });
const nm = join(aqui, "node_modules");
mkdirSync(join(dist, "vendor", "mermaid"), { recursive: true });
cpSync(join(nm, "cytoscape", "dist", "cytoscape.esm.min.mjs"), join(dist, "vendor", "cytoscape.esm.min.mjs"));
cpSync(join(nm, "mermaid", "dist", "mermaid.esm.min.mjs"), join(dist, "vendor", "mermaid", "mermaid.esm.min.mjs"));
cpSync(join(nm, "mermaid", "dist", "chunks", "mermaid.esm.min"), join(dist, "vendor", "mermaid", "chunks", "mermaid.esm.min"), {
  recursive: true,
  filter: (origem) => !origem.endsWith(".map"),
});
console.log(`dist/ gerado: ${relacoes.length} páginas de relação`);
