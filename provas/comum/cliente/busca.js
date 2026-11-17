// Busca local sobre o índice preparado. Conteúdo do pacote é tratado como texto (textContent).
// Mede de cada digitação até o quadro seguinte ao desenho dos resultados: medida "busca".
const normalizar = (s) => (s ?? "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

const ROTULO_DO_TIPO = { relacao: "relação", coluna: "coluna", pergunta: "pergunta", metrica: "métrica" };

function endereco(base, e) {
  if (!e.r) return null;
  if (e.k === "coluna") return `${base}/relacao/${e.r}/#coluna-${e.rotulo}`;
  return `${base}/relacao/${e.r}/`;
}

export async function iniciarBusca({ entrada, lista, situacao, base = "" }) {
  const indice = await (await fetch(`${base}/dados/busca.json`)).json();
  const itens = indice.map((e) => ({ ...e, alvo: normalizar(`${e.id} ${e.rotulo} ${e.texto ?? ""}`) }));

  entrada.addEventListener("input", () => {
    performance.mark("busca:inicio");
    const termos = normalizar(entrada.value).split(/\s+/).filter(Boolean);
    const achados = termos.length ? itens.filter((i) => termos.every((t) => i.alvo.includes(t))) : [];
    const mostrados = achados.slice(0, 50);
    lista.replaceChildren(
      ...mostrados.map((e) => {
        const li = document.createElement("li");
        const tipo = document.createElement("span");
        tipo.className = "tipo";
        tipo.textContent = ROTULO_DO_TIPO[e.k];
        const href = endereco(base, e);
        const alvo = document.createElement(href ? "a" : "span");
        if (href) alvo.href = href;
        alvo.textContent = e.k === "coluna" ? `${e.r}.${e.rotulo}` : e.rotulo;
        li.append(tipo, " ", alvo);
        if (e.texto) {
          const p = document.createElement("p");
          p.textContent = e.texto;
          li.append(p);
        }
        return li;
      }),
    );
    situacao.textContent = termos.length
      ? `${achados.length} resultado(s)${achados.length > mostrados.length ? `; mostrando ${mostrados.length}` : ""}`
      : "";
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        performance.mark("busca:fim");
        performance.measure("busca", "busca:inicio", "busca:fim");
      }),
    );
  });
  entrada.disabled = false;
  entrada.placeholder = "Relação, coluna, pergunta ou métrica";
  document.documentElement.dataset.buscaPronta = "1";
}
