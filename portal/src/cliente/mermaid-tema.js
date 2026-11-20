// Mermaid com as cores do portal: tema "base" com variáveis lidas dos tokens de portal.css, nos
// dois temas. Quem desenha registra uma função de redesenho, chamada quando o leitor troca o tema.
import { aoMudarTema, corDoTema, temaAtual } from "./tema.js";

export function configurarMermaid(mermaid, extra = {}) {
  const c = (n, padrao) => corDoTema(n) || padrao;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: "base",
    themeVariables: {
      darkMode: temaAtual() === "dark",
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      background: c("--fundo", "#ffffff"),
      mainBkg: c("--realce-fundo", "#e8eefc"),
      primaryColor: c("--realce-fundo", "#e8eefc"),
      primaryTextColor: c("--texto", "#1c1d1f"),
      primaryBorderColor: c("--realce", "#1d4ed8"),
      secondaryColor: c("--track-surface", "#eaf4f1"),
      secondaryBorderColor: c("--track", "#36776f"),
      tertiaryColor: c("--codigo-fundo", "#f1f2f4"),
      tertiaryBorderColor: c("--borda", "#dcdde0"),
      lineColor: c("--suave", "#565b63"),
      textColor: c("--texto", "#1c1d1f"),
      edgeLabelBackground: c("--superficie", "#ffffff"),
      clusterBkg: c("--codigo-fundo", "#f1f2f4"),
      clusterBorder: c("--borda", "#dcdde0"),
      noteBkgColor: c("--ausente-fundo", "#fff6e0"),
      noteTextColor: c("--texto", "#1c1d1f"),
      attributeBackgroundColorOdd: c("--superficie", "#ffffff"),
      attributeBackgroundColorEven: c("--codigo-fundo", "#f1f2f4"),
    },
    ...extra,
  });
}

// Registra o redesenho: a cada troca de tema, reconfigura e chama de novo.
export function redesenharNaTroca(mermaid, extra, desenhar) {
  aoMudarTema(() => { configurarMermaid(mermaid, extra); desenhar(); });
}
