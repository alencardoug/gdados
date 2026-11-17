// Prova da D02: diagrama declarativo das travessias com Mermaid, gerado de `crossings` do pacote.
// O texto do pacote entra como rótulo escapado; securityLevel "strict". Marca: "travessias:pronto".
// Tira só a marcação: links, crases e ênfase delimitada. Sublinhado dentro de identificador fica
// (raw_legacy, dedup_history): o texto da origem não pode ser alterado.
const semMarkdown = (s) =>
  (s ?? "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(^|[\s(])\*([^*\s][^*]*)\*(?=[\s.,;:)]|$)/g, "$1$2");
const rotulo = (s, n = 60) => {
  const t = semMarkdown(s).replace(/\s+/g, " ").trim();
  return (t.length > n ? `${t.slice(0, n - 1)}…` : t).replace(/"/g, "#quot;");
};

export async function iniciarTravessias({ mermaid, container, tabela, base = "" }) {
  const travessias = await (await fetch(`${base}/dados/travessias.json`)).json();
  const ids = new Map();
  const idDe = (texto) => ids.get(texto) ?? ids.set(texto, `n${ids.size}`).get(texto);
  const linhas = [
    "flowchart LR",
    "  accTitle: Travessias fora do dbt",
    "  accDescr: Como os dados chegam às camadas de origem do armazém, conforme crossings do pacote de metadados",
  ];
  for (const t of travessias) {
    const o = idDe(t.origin), d = idDe(t.destination);
    linhas.push(`  ${o}["${rotulo(t.origin, 40)}"] -->|"${rotulo(t.mechanism.split(/ — |, |\(/)[0], 40)}"| ${d}["${rotulo(t.destination, 40)}"]`);
  }
  mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: "neutral" });
  const { svg } = await mermaid.render("travessias-svg", linhas.join("\n"));
  container.innerHTML = svg;
  tabela.replaceChildren(
    ...travessias.map((t) => {
      const tr = document.createElement("tr");
      for (const v of [t.origin, t.destination, t.mechanism, t.frequency, t.note]) {
        const td = document.createElement("td");
        td.textContent = v == null ? "ausente" : semMarkdown(v);
        tr.append(td);
      }
      return tr;
    }),
  );
  performance.mark("travessias:pronto");
  document.documentElement.dataset.travessiasProntas = "1";
}
