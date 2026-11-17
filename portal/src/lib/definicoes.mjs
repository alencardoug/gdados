// Funções puras da camada editorial (testáveis fora do Astro).

/**
 * Trecho de um glossário da origem para um termo, sem alteração: o parágrafo que começa com
 * "**<termo>**" ou a linha de tabela "| **<termo>** | … |" (com o cabeçalho da tabela).
 * Devolve null se o termo não estiver no texto.
 */
export function trechoDeDefinicao(texto, termo) {
  const linhas = texto.split("\n");
  const abre = `**${termo}**`;
  for (let i = 0; i < linhas.length; i++) {
    const l = linhas[i];
    if (l.startsWith(abre)) {
      const par = [l];
      for (let j = i + 1; j < linhas.length && linhas[j].trim() !== ""; j++) par.push(linhas[j]);
      return par.join("\n");
    }
    if (l.startsWith(`| ${abre} |`)) {
      // Linhas literais: o cabeçalho da tabela (até a linha separadora) e a linha do termo.
      let inicio = i;
      while (inicio > 0 && linhas[inicio - 1].startsWith("|")) inicio--;
      return [linhas[inicio], linhas[inicio + 1], l].join("\n");
    }
  }
  return null;
}

/** Separa "relação.coluna" sabendo que a relação tem duas partes (schema.nome). */
const separarColuna = (ref) => {
  const p = ref.split(".");
  return { relacao: p.slice(0, 2).join("."), coluna: p.slice(2).join(".") };
};

/**
 * Confere se um exemplo editorial existe no pacote fixado ou no portal.
 * `paginaExiste(caminho)` diz se um caminho do portal (sem ? e #) tem página.
 */
export function exemploExiste({ tipo, ref }, { pacote, arquivoCopiado, paginaExiste }) {
  switch (tipo) {
    case "relacao":
      return Object.hasOwn(pacote.relations, ref);
    case "coluna": {
      const { relacao, coluna } = separarColuna(ref);
      return Boolean(pacote.relations[relacao]?.columns && Object.hasOwn(pacote.relations[relacao].columns, coluna));
    }
    case "pergunta":
      return Object.hasOwn(pacote.questions, ref);
    case "metrica":
      return Object.hasOwn(pacote.metrics, ref);
    case "filtro":
      return Object.hasOwn(pacote.filters, ref);
    case "arquivo":
      return arquivoCopiado(ref.split("#")[0]);
    case "pagina":
      return paginaExiste(ref.split(/[?#]/)[0]);
    default:
      return false;
  }
}
export { separarColuna };

/** Valida que um "de" (endereço de retorno) é um caminho interno do portal. */
export function retornoValido(de, base = "/") {
  return typeof de === "string" && de.startsWith(base) && !de.startsWith("//") && !/[\s\\]/.test(de);
}
