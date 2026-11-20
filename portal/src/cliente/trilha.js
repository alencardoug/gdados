// Marcação local da trilha do roteiro: cada estação feita fica guardada só neste navegador
// (localStorage, conveniência de quem lê). Sem armazenamento disponível, a marcação vale até
// sair da página; sem JavaScript, as caixas nem aparecem.
const CHAVE = "gdados-trilha";
const ler = () => { try { return JSON.parse(localStorage.getItem(CHAVE) ?? "{}") ?? {}; } catch { return {}; } };
const gravar = (v) => { try { localStorage.setItem(CHAVE, JSON.stringify(v)); } catch { /* sem armazenamento */ } };

const raiz = document.querySelector("[data-trilha]");
if (raiz) {
  const feitos = ler();
  raiz.querySelector(".trilha-com-js").hidden = false;
  const atualizar = (degrau) => {
    const caixas = [...degrau.querySelectorAll("[data-marca]")];
    const n = caixas.filter((c) => c.checked).length;
    for (const c of caixas) c.closest(".estacao").dataset.feito = String(c.checked);
    // A linha enche até a última estação feita em sequência desde o início: é até onde a trilha foi percorrida.
    const seguidas = caixas.findIndex((c) => !c.checked);
    const ate = seguidas === -1 ? caixas.length : seguidas;
    const pontos = degrau.querySelectorAll(".estacao").length - 1;
    degrau.querySelector(".trilha").style.setProperty("--progresso", `${ate === 0 ? 0 : Math.round((100 * (ate - 1)) / pontos)}%`);
    degrau.querySelector(".trilha-progresso").textContent = `${n} de ${caixas.length} feitas`;
  };
  for (const degrau of raiz.querySelectorAll(".trilha-degrau")) {
    for (const caixa of degrau.querySelectorAll("[data-marca]")) {
      caixa.closest("label").hidden = false;
      caixa.checked = Boolean(feitos[caixa.dataset.marca]);
      caixa.addEventListener("change", () => {
        if (caixa.checked) feitos[caixa.dataset.marca] = true; else delete feitos[caixa.dataset.marca];
        gravar(feitos);
        atualizar(degrau);
      });
    }
    atualizar(degrau);
  }
}
