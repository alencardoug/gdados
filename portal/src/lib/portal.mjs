// Índices do portal, derivados no build do pacote validado (origem.mjs). Nada aqui fixa contagens
// ou identificadores do pacote atual: as coleções são lidas com tamanho e chaves variáveis (D03).
import { readFileSync } from "node:fs";
import { carregarOrigem } from "./origem.mjs";
import { criarRenderizador } from "./markdown.mjs";
import { camadasPorCaminhoMaisLongo } from "../cliente/camadas.js";

const { procedencia, pacote, arquivos } = carregarOrigem();
export { procedencia, pacote };

// ---------- endereços ----------
const BASE = import.meta.env?.BASE_URL ?? "/";
/** Endereço interno do portal, respeitando a base de publicação (D04, ainda indefinida). */
export const rota = (caminho = "") => `${BASE.replace(/\/$/, "")}/${caminho.replace(/^\//, "")}`;
export const rotaDaRelacao = (id) => rota(`governanca/relacao/${id}/`);
export const rotaDaColuna = (relacao, coluna) => `${rotaDaRelacao(relacao)}#coluna-${coluna}`;
export const rotaDaPergunta = (id) => rota(`governanca/pergunta/${id}/`);
export const rotaDaMetrica = (nome) => rota(`governanca/metricas/#metrica-${nome}`);
export const rotaDoFiltro = (nome) => rota(`governanca/metricas/#filtro-${nome}`);

// ---------- arquivos lidos por commit (origem/arquivos/) ----------
export const caminhosCopiados = [...arquivos.keys()].sort();
const pastas = new Set();
for (const c of caminhosCopiados) {
  const partes = c.split("/");
  for (let i = 1; i < partes.length; i++) pastas.add(`${partes.slice(0, i).join("/")}/`);
}
export const pastasCopiadas = [...pastas].sort();
export const arquivoCopiado = (caminho) => arquivos.has(caminho) || pastas.has(caminho);
export const rotaDoArquivo = (caminho, ancora = null) =>
  rota(`origem/${caminho.replace(/\/$/, "")}/`) + (ancora ? `#${ancora}` : "");
export const lerArquivo = (caminho) => readFileSync(arquivos.get(caminho).local, "utf8");
export const registroDoArquivo = (caminho) => arquivos.get(caminho) ?? null;

/** Separa "docs/x.md#ancora" em caminho e âncora, como o pacote os escreve. */
export const separarAncora = (ref) => {
  const i = ref.indexOf("#");
  return i < 0 ? { caminho: ref, ancora: null } : { caminho: ref.slice(0, i), ancora: ref.slice(i + 1) };
};
/** Endereço de uma referência do pacote a um arquivo da origem, ou null se não foi copiado. */
export const rotaDaReferencia = (ref) => {
  if (ref == null) return null;
  const { caminho, ancora } = separarAncora(ref);
  return arquivoCopiado(caminho) ? rotaDoArquivo(caminho, ancora) : null;
};

// ---------- Markdown saneado ----------
const md = await criarRenderizador({ arquivoCopiado, rotaDoArquivo });
const BASE_DOS_LINKS = pacote.provenance.link_base ?? "";
/** Texto Markdown do pacote; links relativos a provenance.link_base (especificação da origem). */
export const mdDoPacote = (texto) => md.renderizar(texto, BASE_DOS_LINKS);
export const mdDoPacoteEmLinha = (texto) => md.emLinha(texto, BASE_DOS_LINKS);
/** Texto de um arquivo da origem; links relativos ao próprio arquivo. */
export const mdDoArquivo = (caminho) => md.renderizar(lerArquivo(caminho), caminho);

// ---------- relações ----------
const relacaoDaColuna = (c) => c.split(".").slice(0, 2).join(".");
const nomeDaColuna = (c) => c.split(".").slice(2).join(".");
export { relacaoDaColuna, nomeDaColuna };

const agrupar = (itens, chave) => {
  const m = new Map();
  for (const item of itens) {
    const k = chave(item);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(item);
  }
  return m;
};

export const testesPorRelacao = agrupar(
  Object.entries(pacote.tests).map(([id, t]) => ({ id, ...t })),
  (t) => t.relation,
);
export const faltasPorRelacao = agrupar(pacote.description_gaps, (f) => f.relation);
const linhagem = pacote.lineage.relations;

/** Arestas por relação, agregadas da linhagem por coluna: insumo imediato (leaves). */
const contagem = new Map();
for (const [destino, r] of Object.entries(linhagem)) {
  for (const c of Object.values(r.columns)) {
    for (const folha of c.leaves) {
      const fonte = relacaoDaColuna(folha);
      if (fonte === destino) continue;
      const k = `${fonte}\u0000${destino}`;
      contagem.set(k, (contagem.get(k) ?? 0) + 1);
    }
  }
}
export const arestasDeRelacoes = [...contagem].map(([k, n]) => {
  const [source, target] = k.split("\u0000");
  return { source, target, n };
});

const idsDasRelacoes = Object.keys(pacote.relations).sort();
// Relações citadas pela linhagem sem entrada em relations não são inventadas: ficam fora do grafo
// e são contadas para o relatório da E3.
export const relacoesSemEntrada = [
  ...new Set(arestasDeRelacoes.flatMap((a) => [a.source, a.target]).filter((id) => !pacote.relations[id])),
].sort();
export const camadaNoGrafo = camadasPorCaminhoMaisLongo(idsDasRelacoes, arestasDeRelacoes);

/** Perguntas e métricas que citam cada relação ou coluna, para ligações nos dois sentidos. */
export const perguntasPorRelacao = new Map();
for (const [id, q] of Object.entries(pacote.questions)) {
  for (const r of [q.view, ...q.facts, ...q.dimensions]) {
    if (!perguntasPorRelacao.has(r)) perguntasPorRelacao.set(r, []);
    perguntasPorRelacao.get(r).push(id);
  }
}
export const metricasPorColuna = new Map();
for (const [nome, m] of Object.entries(pacote.metrics)) {
  for (const c of m.columns ?? []) {
    if (!metricasPorColuna.has(c.column)) metricasPorColuna.set(c.column, []);
    metricasPorColuna.get(c.column).push(nome);
  }
}

export const relacoes = idsDasRelacoes.map((id) => {
  const r = pacote.relations[id];
  const faltas = faltasPorRelacao.get(id) ?? [];
  const sensibilidades = [...new Set(Object.values(r.columns).map((c) => c.sensitivity))].sort();
  return {
    id,
    r,
    camada: r.schema,
    linhagem: linhagem[id] ?? null,
    testes: testesPorRelacao.get(id) ?? [],
    semDescricao: faltas.some((f) => f.column == null),
    colunasSemDescricao: new Set(faltas.filter((f) => f.column != null).map((f) => f.column)),
    sensibilidades,
    auditoria: pacote.view_audits[id] ?? null,
    regras: pacote.view_rules[id] ?? null,
    perguntas: perguntasPorRelacao.get(id) ?? [],
    entradas: arestasDeRelacoes.filter((a) => a.target === id),
    saidas: arestasDeRelacoes.filter((a) => a.source === id),
  };
});
export const relacaoPorId = new Map(relacoes.map((x) => [x.id, x]));

/** Valores distintos para os filtros do catálogo, na ordem do pipeline quando houver. */
const mediana = (v) => v.sort((a, b) => a - b)[Math.floor(v.length / 2)];
export const camadas = [...agrupar(relacoes, (x) => x.camada)]
  .map(([c, xs]) => ({ camada: c, posicao: mediana(xs.map((x) => camadaNoGrafo.get(x.id))), n: xs.length }))
  .sort((a, b) => a.posicao - b.posicao || a.camada.localeCompare(b.camada))
  .map((c) => c.camada);
export const dominios = [...new Set(relacoes.map((x) => x.r.meta?.domain ?? null))].sort((a, b) =>
  a == null ? 1 : b == null ? -1 : a.localeCompare(b),
);
export const sensibilidades = [...new Set(relacoes.flatMap((x) => x.sensibilidades))].sort();
export const tiposDeRecurso = [...new Set(relacoes.map((x) => x.r.resource_type))].sort();

// ---------- datas e procedência ----------
const fmt = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});
/** Data e hora de um instante ISO, no fuso de Brasília, com o fuso explícito. */
export const dataHora = (iso) => (iso == null ? null : `${fmt.format(new Date(iso))} (Brasília)`);
export const data = (iso) =>
  iso == null ? null : new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
export const commitCurto = (c) => (c == null ? null : c.slice(0, 7));
