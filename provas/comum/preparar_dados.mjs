// Prepara, a partir de origem/, os dados que as duas candidatas da D01 servem ao navegador.
// É o mesmo insumo para as duas, para que a comparação meça a estrutura e não os dados.
// Uso: node provas/comum/preparar_dados.mjs  →  provas/comum/gerado/dados/
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = join(aqui, "..", "..");
const saida = join(aqui, "gerado", "dados");

const pacote = JSON.parse(readFileSync(join(raiz, "origem", "pacote_de_metadados.json"), "utf8"));
const origem = JSON.parse(readFileSync(join(raiz, "origem", "procedencia.json"), "utf8"));
if (pacote.format !== 1) throw new Error(`format ${pacote.format} desconhecido; o portal só lê o formato 1`);

rmSync(saida, { recursive: true, force: true });
mkdirSync(join(saida, "relacao"), { recursive: true });
const gravar = (nome, dados) => writeFileSync(join(saida, nome), JSON.stringify(dados));

const relacaoDaColuna = (coluna) => coluna.split(".").slice(0, 2).join(".");
const camada = (id) => id.split(".")[0];
const resumo = (texto, n = 160) => {
  if (texto == null) return null;
  const plano = texto.replace(/\s+/g, " ").trim();
  return plano.length > n ? `${plano.slice(0, n - 1)}…` : plano;
};

const p = pacote.provenance;
gravar("procedencia.json", {
  repository: origem.repository,
  ref: origem.ref,
  commit: origem.commit,
  copied_at: origem.copied_at,
  dbt_version: p.dbt.dbt_version,
  adapter_type: p.dbt.adapter_type,
  manifest_generated_at: p.dbt.manifest_generated_at,
  run_results_generated_at: p.dbt.run_results_generated_at,
  warehouse: p.warehouse,
});

const faltas = new Map();
for (const f of pacote.description_gaps) {
  if (!faltas.has(f.relation)) faltas.set(f.relation, []);
  faltas.get(f.relation).push(f.column);
}
const testesPorRelacao = new Map();
for (const [id, t] of Object.entries(pacote.tests)) {
  if (!testesPorRelacao.has(t.relation)) testesPorRelacao.set(t.relation, []);
  testesPorRelacao.get(t.relation).push({ id, ...t });
}

const linhagem = pacote.lineage.relations;
const relacoes = [];
const busca = [];
for (const [id, r] of Object.entries(pacote.relations).sort(([a], [b]) => a.localeCompare(b))) {
  const colunas = {};
  const sensibilidade = {};
  for (const [nome, c] of Object.entries(r.columns)) {
    colunas[nome] = { ...c, lineage: linhagem[id]?.columns?.[nome] ?? null };
    sensibilidade[c.sensitivity] = (sensibilidade[c.sensitivity] ?? 0) + 1;
    busca.push({ k: "coluna", id: `${id}.${nome}`, r: id, rotulo: nome, texto: resumo(c.description, 120) });
  }
  const meta = r.meta ?? {};
  relacoes.push({
    id,
    camada: camada(id),
    tipo: r.resource_type,
    materializacao: r.materialization,
    descricao: resumo(r.description),
    colunas: Object.keys(r.columns).length,
    sensibilidade,
    dominio: meta.domain ?? null,
    dono: meta.owner ?? null,
    sem_descricao: faltas.has(id) && faltas.get(id).includes(null),
  });
  busca.push({ k: "relacao", id, r: id, rotulo: id, texto: resumo(r.description, 120) });
  gravar(`relacao/${id}.json`, {
    id,
    ...r,
    columns: colunas,
    tests: testesPorRelacao.get(id) ?? [],
    gaps: faltas.get(id) ?? [],
  });
}
for (const [id, q] of Object.entries(pacote.questions)) {
  busca.push({ k: "pergunta", id, r: q.view, rotulo: `${id} — ${q.title}`, texto: q.view });
}
for (const [nome, m] of Object.entries(pacote.metrics)) {
  busca.push({ k: "metrica", id: nome, r: m.columns[0]?.column ? relacaoDaColuna(m.columns[0].column) : null, rotulo: nome, texto: `${m.kind}, ${m.additivity}` });
}
gravar("relacoes.json", relacoes);
gravar("busca.json", busca);

// Grafo por relação, agregado da linhagem por coluna: aresta = insumo imediato (leaves).
const arestas = new Map();
for (const [destino, r] of Object.entries(linhagem)) {
  for (const c of Object.values(r.columns)) {
    for (const folha of c.leaves) {
      const fonte = relacaoDaColuna(folha);
      if (fonte === destino) continue;
      const chave = `${fonte}→${destino}`;
      arestas.set(chave, (arestas.get(chave) ?? 0) + 1);
    }
  }
}
gravar("grafo_relacoes.json", {
  nodes: relacoes.map((r) => ({ id: r.id, camada: r.camada, tipo: r.tipo })),
  edges: [...arestas].map(([k, n]) => {
    const [source, target] = k.split("→");
    return { source, target, n };
  }),
});
gravar("travessias.json", pacote.crossings);

console.log(`dados preparados em ${saida}: ${relacoes.length} relações, ${arestas.size} arestas por relação, ${busca.length} entradas de busca`);
