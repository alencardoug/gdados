// Ligação de ida e volta entre o objeto e a explicação (página de conceitos §2).
// Ida: no clique de um link [data-conceito], acrescenta ?de=<endereço atual>, com filtros e recorte.
// Volta: na página do conceito, mostra o link de retorno se ?de= for um caminho interno do portal.
import { retornoValido } from "../lib/definicoes.mjs";

const base = document.body.dataset.base ?? "/";
document.addEventListener("click", (ev) => {
  const a = ev.target.closest?.("a[data-conceito]");
  if (!a) return;
  const url = new URL(a.href, location.href);
  url.searchParams.set("de", location.pathname + location.search + location.hash);
  a.href = url.toString();
});

const alvo = document.getElementById("retorno");
if (alvo) {
  const de = new URLSearchParams(location.search).get("de");
  if (retornoValido(de, base)) {
    const a = document.createElement("a");
    a.href = de;
    a.textContent = "Voltar para onde você estava";
    alvo.replaceChildren("← ", a);
    alvo.hidden = false;
  }
}
