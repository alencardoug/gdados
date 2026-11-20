// Cores das camadas, geradas da ordem das camadas no grafo (nenhum nome de camada é fixado aqui):
// a camada de índice i recebe o token --camada-(i mod N) de portal.css, nos dois temas. O CSS
// gerado liga cada camada à sua cor e cada elemento marcado com a camada à cor dela.
import { TAMANHO_DA_PALETA } from "../cliente/camadas.js";
const NOME = /^[a-z0-9_]+$/;

export function cssDasCamadas(camadas) {
  const validas = camadas.filter((c) => NOME.test(c));
  const cores = validas.map((c) => `--cor-${c}: var(--camada-${camadas.indexOf(c) % TAMANHO_DA_PALETA});`).join(" ");
  const porElemento = validas.map((c) =>
    `[data-layer="${c}"], [data-camada="${c}"] { --cor-camada: var(--cor-${c}); }\n` +
    `[data-from="${c}"] { --cor-origem: var(--cor-${c}); }`).join("\n");
  return `:root { ${cores} }\n${porElemento}\n`;
}
