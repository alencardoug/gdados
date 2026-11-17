// Ligação das travessias (crossings) ao grafo de linhagem, sem precisão por coluna (PLANO §2.2).
//
// O destino de uma travessia é uma relação (ex.: `raw.inventory_movements_stream`) ou uma camada
// (ex.: `raw`), como o pacote o escreve. Regra:
//   - destino que é relação: a travessia liga só a essa relação ("exata");
//   - destino que é camada: liga às relações dessa camada que não têm travessia exata, e a ligação
//     é marcada como "por camada" — o pacote declara a camada, não cada relação.
// Destino que não é relação nem camada conhecida fica sem ligação e é listado.
import { semMarcacao } from "./markdown.mjs";

const limpar = (s) => semMarcacao(s ?? "").replace(/`/g, "").trim();

export function ligarTravessias(crossings, relations) {
  const camadas = new Set(Object.values(relations).map((r) => r.schema));
  const lista = crossings.map((t, i) => {
    const destino = limpar(t.destination);
    const tipo = Object.hasOwn(relations, destino) ? "relacao" : camadas.has(destino) ? "camada" : null;
    return {
      id: `travessia:${i}`,
      origem: limpar(t.origin),
      destino,
      tipo,
      mecanismo: limpar(t.mechanism).split(/: | — |, |\(/)[0].trim(),
      relacoes: [],
    };
  });
  const comExata = new Set(lista.filter((t) => t.tipo === "relacao").map((t) => t.destino));
  for (const t of lista) {
    if (t.tipo === "relacao") t.relacoes = [t.destino];
    else if (t.tipo === "camada") {
      t.relacoes = Object.entries(relations)
        .filter(([id, r]) => r.schema === t.destino && !comExata.has(id))
        .map(([id]) => id)
        .sort();
    }
  }
  return { travessias: lista, semLigacao: lista.filter((t) => t.tipo == null).map((t) => t.destino) };
}
