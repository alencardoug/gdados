// Índice da busca, gerado no build. Cada entrada já traz o endereço; o cliente não monta rotas.
import { pacote, relacoes, rotaDaRelacao, rotaDaColuna, rotaDaPergunta, rotaDaMetrica, rotaDoFiltro, rotaDaReferencia } from "../../lib/portal.mjs";
import { semMarcacao } from "../../lib/markdown.mjs";

const resumo = (t, n = 120) => {
  if (t == null) return null;
  const s = semMarcacao(t);
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
};

export function GET() {
  const e = [];
  for (const x of relacoes) {
    e.push({ k: "relacao", id: x.id, rotulo: x.id, texto: resumo(x.r.description), href: rotaDaRelacao(x.id) });
    for (const [nome, c] of Object.entries(x.r.columns)) {
      e.push({ k: "coluna", id: `${x.id}.${nome}`, rotulo: `${x.id}.${nome}`, texto: resumo(c.description), href: rotaDaColuna(x.id, nome) });
    }
  }
  for (const [id, q] of Object.entries(pacote.questions)) {
    e.push({ k: "pergunta", id, rotulo: `${id} — ${q.title}`, texto: q.view, href: rotaDaPergunta(id) });
  }
  for (const [nome, m] of Object.entries(pacote.metrics)) {
    e.push({ k: "metrica", id: nome, rotulo: nome, texto: `${m.kind}, ${m.additivity}`, href: rotaDaMetrica(nome) });
  }
  for (const [nome, f] of Object.entries(pacote.filters)) {
    e.push({ k: "filtro", id: nome, rotulo: nome, texto: resumo(f.label), href: rotaDoFiltro(nome) });
  }
  for (const i of pacote.open_items) {
    const href = rotaDaReferencia(i.anchor);
    if (href) e.push({ k: "item", id: i.id, rotulo: `${i.id} — ${semMarcacao(i.title)}`, texto: i.state, href });
  }
  return new Response(JSON.stringify(e), { headers: { "Content-Type": "application/json" } });
}
