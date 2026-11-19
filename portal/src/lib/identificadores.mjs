export const identifierParts = (name) => name.split(/(?<=[._])(?=.)/u);

// Recebe Markdown já saneado. Só reescreve o conteúdo de <code> que é um identificador simples.
export function wrapInlineIdentifiers(html) {
  return html?.replace(/<code>([A-Za-z0-9_.]+)<\/code>/g, (_, name) =>
    `<code class="identifier">${identifierParts(name).map((part) => `<span>${part}</span>`).join("<wbr>")}</code>`);
}
