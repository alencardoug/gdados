// Busca local sobre o índice gerado no build (dados/busca.json). O conteúdo do pacote entra no
// DOM só como texto (textContent): nada do pacote é interpretado como HTML aqui.
const normalizar = (s) => (s ?? "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
const ROTULO = { conceito: "conceito", relacao: "relação", coluna: "coluna", pergunta: "pergunta", metrica: "métrica", filtro: "filtro", item: "item em aberto" };
const LIMITE = 50;

export async function iniciarBusca(entrada, lista, situacao) {
  const resposta = await fetch(entrada.dataset.indice);
  const indice = (await resposta.json()).map((e) => ({ ...e, alvo: normalizar(`${e.id} ${e.rotulo} ${e.texto ?? ""}`) }));
  const params = new URLSearchParams(location.search);

  const buscar = () => {
    const termos = normalizar(entrada.value).split(/\s+/).filter(Boolean);
    const achados = termos.length ? indice.filter((i) => termos.every((t) => i.alvo.includes(t))) : [];
    // Nome exato ou começo do nome primeiro.
    const t0 = termos.join(" ");
    const peso = (i) => (normalizar(i.rotulo) === t0 ? 0 : normalizar(i.rotulo).startsWith(t0) ? 1 : 2);
    achados.sort((a, b) => peso(a) - peso(b));
    const mostrados = achados.slice(0, LIMITE);
    lista.replaceChildren(
      ...mostrados.map((e) => {
        const li = document.createElement("li");
        const tipo = document.createElement("span");
        tipo.className = "etiqueta";
        tipo.textContent = ROTULO[e.k] ?? e.k;
        const a = document.createElement("a");
        a.href = e.href;
        a.textContent = e.rotulo;
        li.append(tipo, " ", a);
        if (e.texto) {
          const p = document.createElement("p");
          p.textContent = e.texto;
          li.append(p);
        }
        return li;
      }),
    );
    situacao.textContent = termos.length
      ? `${achados.length} resultado(s)${achados.length > mostrados.length ? `; mostrando os ${mostrados.length} primeiros` : ""}.`
      : "";
    const url = new URL(location.href);
    if (entrada.value) url.searchParams.set("q", entrada.value);
    else url.searchParams.delete("q");
    history.replaceState(history.state, "", url);
  };

  entrada.addEventListener("input", buscar);
  entrada.disabled = false;
  entrada.placeholder = "Ex.: receita, fact_shipment, P13, sensibilidade";
  if (params.get("q")) {
    entrada.value = params.get("q");
    buscar();
  }
}
