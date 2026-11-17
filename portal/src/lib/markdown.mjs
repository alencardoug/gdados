// Markdown saneado para os textos da origem (pacote e arquivos lidos por commit).
//
// Processador: o satteri do Astro 7 (@astrojs/markdown-satteri), com um plugin HAST próprio
// (decisão do Owner de 17/11/2026). O conteúdo da origem é tratado como texto e dados:
// - HTML bruto no Markdown vira texto visível, nunca elemento; comentário HTML é descartado;
// - só ficam elementos que o próprio Markdown gera; qualquer outro vira o seu texto;
// - atributos de evento e estilo são retirados;
// - links: âncora interna e http(s) ficam; caminho relativo é resolvido no repositório da origem e
//   aponta para a página do arquivo, se ele foi copiado (D03), ou perde o link e fica marcado;
//   qualquer outro esquema (javascript:, data:, mailto:…) perde o link;
// - imagens viram o texto alternativo: o portal não carrega figuras da origem.
// Sublinhado em identificador (raw_legacy) é texto e não é alterado (achado da prova da D02).
import { createSatteriMarkdownProcessor } from "@astrojs/markdown-satteri";

const PERMITIDOS = new Set([
  "h1", "h2", "h3", "h4", "h5", "h6", "p", "a", "em", "strong", "del", "code", "pre", "kbd",
  "ul", "ol", "li", "blockquote", "hr", "br", "table", "thead", "tbody", "tr", "th", "td",
  "sup", "sub", "section", "input", "span", "div",
]);
// div e span só aparecem quando o próprio processador os gera (rodapés, destaque); HTML bruto já
// virou texto antes de chegar aqui.

const RAIZ = "file:///origem/";

/** Resolve um href relativo a um arquivo da origem; devolve { caminho, ancora } ou null. */
export function resolverNaOrigem(href, base) {
  let url;
  try {
    url = new URL(href, new URL(base, RAIZ));
  } catch {
    return null;
  }
  if (url.protocol !== "file:" || !url.pathname.startsWith("/origem/")) return null;
  const caminho = decodeURIComponent(url.pathname.slice("/origem/".length));
  return { caminho, ancora: url.hash ? decodeURIComponent(url.hash.slice(1)) : null };
}

function plugin({ arquivoCopiado, rotaDoArquivo }) {
  return (fabrica) => {
    const base = fabrica.fileURL ? fabrica.fileURL.pathname.replace(/^\/origem\//, "") : "";
    return {
      name: "gdados-saneador",
      raw(no) {
        // Comentário HTML não é conteúdo: sai. Qualquer outro HTML bruto vira texto visível.
        if (/^\s*<!--[\s\S]*?-->\s*$/.test(no.value)) return { type: "text", value: "" };
        return { type: "text", value: no.value };
      },
      element: [
        {
          filter: [],
          visit(no, ctx) {
            if (!PERMITIDOS.has(no.tagName)) {
              return { type: "text", value: ctx.textContent(no) };
            }
            for (const chave of Object.keys(no.properties ?? {})) {
              if (/^on/i.test(chave) || chave === "style") ctx.setProperty(no, chave, undefined);
            }
            if (no.tagName === "input") ctx.setProperty(no, "disabled", true);
          },
        },
        {
          filter: ["a"],
          visit(no, ctx) {
            const href = String(no.properties?.href ?? "");
            if (href.startsWith("#")) return;
            if (/^https?:\/\//i.test(href)) {
              ctx.setProperty(no, "rel", "noopener noreferrer external");
              return;
            }
            ctx.setProperty(no, "href", undefined);
            if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//")) return;
            const alvo = resolverNaOrigem(href, base);
            if (alvo && arquivoCopiado(alvo.caminho)) {
              ctx.setProperty(no, "href", rotaDoArquivo(alvo.caminho, alvo.ancora));
            } else {
              ctx.setProperty(no, "className", ["fora-da-copia"]);
              ctx.setProperty(no, "title", `Arquivo da origem fora da cópia do portal: ${alvo?.caminho ?? href}`);
            }
          },
        },
        {
          filter: ["img"],
          visit(no) {
            return { type: "text", value: String(no.properties?.alt ?? "") };
          },
        },
      ],
    };
  };
}

/**
 * Cria o renderizador. `arquivoCopiado(caminho)` diz se o caminho do repositório da origem está
 * em origem/arquivos/; `rotaDoArquivo(caminho, ancora)` dá o endereço da página dele no portal.
 */
export async function criarRenderizador({ arquivoCopiado, rotaDoArquivo }) {
  const processador = await createSatteriMarkdownProcessor({
    hastPlugins: [plugin({ arquivoCopiado, rotaDoArquivo })],
    syntaxHighlight: false,
    smartypants: false,
  });
  const cache = new Map();
  /** Markdown → HTML saneado. `base` é o arquivo ou a pasta da origem contra a qual os links se resolvem. */
  const renderizar = async (texto, base = "") => {
    if (texto == null) return null;
    const chave = `${base}\u0000${texto}`;
    if (!cache.has(chave)) {
      const { code } = await processador.render(texto, { fileURL: new URL(base, RAIZ) });
      cache.set(chave, code);
    }
    return cache.get(chave);
  };
  /** Igual, mas sem o parágrafo único que envolve um texto curto (para células e listas). */
  const emLinha = async (texto, base = "") => {
    const html = await renderizar(texto, base);
    if (html == null) return null;
    const m = /^<p>([\s\S]*)<\/p>\s*$/.exec(html);
    return m && !m[1].includes("<p>") ? m[1] : html;
  };
  return { renderizar, emLinha };
}

/** Texto plano a partir de Markdown, para rótulos de diagrama e busca. Preserva o sublinhado. */
export const semMarcacao = (s) =>
  (s ?? "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(^|[\s(])\*([^*\s][^*]*)\*(?=[\s.,;:)]|$)/g, "$1$2")
    .replace(/\s+/g, " ")
    .trim();
