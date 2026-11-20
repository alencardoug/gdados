// Tema do portal: automático (segue o sistema), claro ou escuro. A escolha fica no navegador de
// quem lê (localStorage, conveniência local); sem ela, ou sem JavaScript, vale o sistema. O script
// em linha do <head> aplica a escolha antes da primeira pintura; aqui ficam o botão e o aviso de
// troca, para que Mermaid e Cytoscape redesenhem com as cores do tema.
const CHAVE = "gdados-tema";
const raiz = document.documentElement;
const sistema = matchMedia("(prefers-color-scheme: dark)");

const ler = () => { try { return localStorage.getItem(CHAVE); } catch { return null; } };
const gravar = (v) => { try { v ? localStorage.setItem(CHAVE, v) : localStorage.removeItem(CHAVE); } catch { /* sem armazenamento */ } };
export const escolha = () => (raiz.dataset.theme === "light" || raiz.dataset.theme === "dark" ? raiz.dataset.theme : "auto");
export const temaAtual = () => (escolha() === "auto" ? (sistema.matches ? "dark" : "light") : escolha());
export const corDoTema = (nome) => getComputedStyle(raiz).getPropertyValue(nome).trim();

const avisar = () => document.dispatchEvent(new CustomEvent("gdados:tema", { detail: { tema: temaAtual() } }));
export const aoMudarTema = (fn) => document.addEventListener("gdados:tema", () => fn(temaAtual()));

const ROTULO = { auto: "Automático", light: "Claro", dark: "Escuro" };
const ICONE = { auto: "◐", light: "☀", dark: "☾" };
const SEGUINTE = { auto: "light", light: "dark", dark: "auto" };

export function iniciarTema() {
  const valor = ler();
  if ((valor === "light" || valor === "dark") && escolha() !== valor) raiz.dataset.theme = valor;
  sistema.addEventListener("change", () => { if (escolha() === "auto") avisar(); });
  const botao = document.getElementById("tema");
  if (!botao) return;
  const atualizar = () => {
    const e = escolha();
    botao.querySelector(".tema-icone").textContent = ICONE[e];
    botao.querySelector(".tema-rotulo").textContent = ROTULO[e];
    botao.setAttribute("aria-label", `Tema: ${ROTULO[e].toLowerCase()}${e === "auto" ? ` (${temaAtual() === "dark" ? "escuro" : "claro"}, pelo sistema)` : ""}. Trocar para ${ROTULO[SEGUINTE[e]].toLowerCase()}.`);
    botao.dataset.escolha = e;
  };
  botao.addEventListener("click", () => {
    const proxima = SEGUINTE[escolha()];
    if (proxima === "auto") delete raiz.dataset.theme; else raiz.dataset.theme = proxima;
    gravar(proxima === "auto" ? null : proxima);
    atualizar();
    avisar();
  });
  sistema.addEventListener("change", atualizar);
  atualizar();
  botao.hidden = false;
}
iniciarTema();
