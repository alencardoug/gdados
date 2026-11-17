// Camada editorial montada no build: inventário + explicações + definições da origem + exemplos.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { getCollection } from "astro:content";
import {
  pacote, rota, rotaDaRelacao, rotaDaColuna, rotaDaPergunta, rotaDaMetrica, rotaDoFiltro, rotaDaReferencia,
  arquivoCopiado, lerArquivo, separarAncora, renderizarDaOrigem,
} from "./portal.mjs";
import { trechoDeDefinicao, exemploExiste, separarColuna } from "./definicoes.mjs";

const grupos = (await getCollection("grupos")).map((g) => ({ id: g.id, ...g.data }));
const inventario = (await getCollection("inventario")).map((i) => ({ id: i.id, ...i.data }));
const entradas = new Map((await getCollection("conceitos")).map((e) => [e.id, e]));
const ids = new Set(inventario.map((i) => i.id));

const PAGINAS = join(process.cwd(), "src", "pages");
// Rotas dinâmicas: o segmento final precisa existir na coleção correspondente.
const DINAMICAS = [
  [/^conceitos\/([^/]+)$/, (id) => ids.has(id)],
  [/^governanca\/relacao\/([^/]+)$/, (id) => Object.hasOwn(pacote.relations, id)],
  [/^governanca\/pergunta\/([^/]+)$/, (id) => Object.hasOwn(pacote.questions, id)],
];
/** O portal tem página para o caminho? (ex.: "governanca/linhagem/", "conceitos/grao/") */
export const paginaExiste = (caminho) => {
  const c = caminho.replace(/^\/|\/$/g, "");
  for (const [re, existe] of DINAMICAS) {
    const m = re.exec(c);
    if (m) return existe(m[1]);
  }
  return c === "" ? existsSync(join(PAGINAS, "index.astro")) : existsSync(join(PAGINAS, c, "index.astro")) || existsSync(join(PAGINAS, `${c}.astro`));
};

// Integridade da camada editorial: erro de autoria recusa a build (não depende do pacote).
const erros = [];
for (const i of inventario) {
  if (!grupos.some((g) => g.id === i.grupo)) erros.push(`${i.id}: grupo desconhecido ${i.grupo}`);
  for (const p of i.prerequisitos) if (!ids.has(p)) erros.push(`${i.id}: pré-requisito desconhecido ${p}`);
}
for (const id of entradas.keys()) if (!ids.has(id)) erros.push(`conceitos/${id}.md sem item no inventário`);
if (erros.length) throw new Error(`camada editorial inválida:\n  ${erros.join("\n  ")}`);

const hrefDoExemplo = ({ tipo, ref }) => {
  switch (tipo) {
    case "relacao": return rotaDaRelacao(ref);
    case "coluna": { const { relacao, coluna } = separarColuna(ref); return rotaDaColuna(relacao, coluna); }
    case "pergunta": return rotaDaPergunta(ref);
    case "metrica": return rotaDaMetrica(ref);
    case "filtro": return rotaDoFiltro(ref);
    case "arquivo": return rotaDaReferencia(ref);
    case "pagina": return rota(ref);
  }
};

// Exemplos que não existem no pacote fixado: exibidos como ausentes, nunca derrubam a build
// (PLANO §6: atualizar o pacote não exige reescrever conteúdo). Listados para a E3 e os testes.
export const exemplosAusentes = [];
// Definições da origem não encontradas no commit fixado, pela mesma regra.
export const definicoesAusentes = [];
// Âncoras de leituras e divergências que não existem no documento da origem copiado.
export const ancorasAusentes = [];
const idsPorArquivo = new Map();
const conferirAncora = async (dono, ref) => {
  const { caminho, ancora } = separarAncora(ref);
  if (!ancora || !arquivoCopiado(caminho) || !caminho.endsWith(".md")) return;
  if (!idsPorArquivo.has(caminho)) {
    const html = await renderizarDaOrigem(lerArquivo(caminho), caminho);
    idsPorArquivo.set(caminho, new Set([...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1])));
  }
  if (!idsPorArquivo.get(caminho).has(ancora)) ancorasAusentes.push(`${dono}: ${ref}`);
};

export const termos = await Promise.all(
  inventario.map(async (i) => {
    const entrada = entradas.get(i.id) ?? null;
    const definicoes = await Promise.all(
      i.definicoes.map(async (d) => {
        const texto = arquivoCopiado(d.arquivo) ? trechoDeDefinicao(lerArquivo(d.arquivo), d.termo) : null;
        if (texto == null) definicoesAusentes.push(`${i.id}: ${d.arquivo} › ${d.termo}`);
        return { ...d, href: rotaDaReferencia(d.arquivo), html: texto == null ? null : await renderizarDaOrigem(texto, d.arquivo) };
      }),
    );
    const contexto = { pacote, arquivoCopiado, paginaExiste };
    const exemplos = (entrada?.data.exemplos ?? []).map((e) => {
      const existe = exemploExiste(e, contexto);
      if (!existe) exemplosAusentes.push(`${i.id}: ${e.tipo} ${e.ref}`);
      return { ...e, existe, href: existe ? hrefDoExemplo(e) : null };
    });
    const divergencias = await Promise.all(
      (entrada?.data.divergencias ?? []).map(async (d) => ({
        ...d,
        html: await renderizarDaOrigem(d.texto, ""),
        fontes: d.fontes.map((f) => ({ ref: f, href: rotaDaReferencia(f), caminho: separarAncora(f).caminho })),
      })),
    );
    for (const l of i.leituras) await conferirAncora(i.id, l);
    for (const d of entrada?.data.divergencias ?? []) for (const f of d.fontes) await conferirAncora(i.id, f);
    return {
      ...i,
      href: rota(`conceitos/${i.id}/`),
      entrada,
      escrito: entrada != null,
      definicoes,
      exemplos,
      divergencias,
      leituras: i.leituras.map((l) => ({ ref: l, href: rotaDaReferencia(l) })),
    };
  }),
);
if (exemplosAusentes.length) console.warn(`[gdados] exemplos editoriais fora do pacote fixado:\n  ${exemplosAusentes.join("\n  ")}`);
if (ancorasAusentes.length) console.warn(`[gdados] âncoras da origem não encontradas:\n  ${ancorasAusentes.join("\n  ")}`);
if (definicoesAusentes.length) console.warn(`[gdados] definições da origem não encontradas:\n  ${definicoesAusentes.join("\n  ")}`);

export const termoPorId = new Map(termos.map((t) => [t.id, t]));
export const gruposComTermos = grupos.map((g) => ({ ...g, termos: termos.filter((t) => t.grupo === g.id) }));
export const limitacoes = (await getCollection("limitacoes")).map((l) => ({
  id: l.id,
  ...l.data,
  onde: l.data.onde.map((o) => ({ ...o, href: rota(o.pagina), existe: paginaExiste(o.pagina.split(/[?#]/)[0]) })),
}));

// Percursos (página de conceitos §5): termo desconhecido é erro de autoria; prática ausente no pacote
// segue a regra dos exemplos.
export const percursos = (await getCollection("percursos")).map((p) => {
  for (const passo of p.data.passos) {
    for (const id of passo.termos) if (!ids.has(id)) throw new Error(`percurso ${p.id}: termo desconhecido ${id}`);
  }
  return {
    id: p.id,
    ...p.data,
    passos: p.data.passos.map((passo) => ({ ...passo, termos: passo.termos.map((id) => termoPorId.get(id)) })),
    pratica: p.data.pratica.map((e) => {
      const existe = exemploExiste(e, { pacote, arquivoCopiado, paginaExiste });
      if (!existe) exemplosAusentes.push(`percurso ${p.id}: ${e.tipo} ${e.ref}`);
      return { ...e, existe, href: existe ? hrefDoExemplo(e) : null };
    }),
  };
});

/** Explicações que usam um objeto do pacote como exemplo (ligação no sentido objeto → conceito). */
export function conceitosQueCitam(tipo, ref) {
  return termos.filter((t) => t.exemplos.some((e) => e.existe && e.tipo === tipo && e.ref === ref));
}
/** Endereço de um conceito do inventário; recusa a build se o id não existir (erro de código). */
export function rotaDoConceito(id) {
  if (!termoPorId.has(id)) throw new Error(`conceito desconhecido no inventário: ${id}`);
  return termoPorId.get(id).href;
}
