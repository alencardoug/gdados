// Confere as duas pontas da FK antes de agrupar os braços na caixa da dimensão.
import { separarColuna } from "./definicoes.mjs";

export function factStar(pkg, id) {
  const fact = pkg.relations[id];
  if (fact?.schema !== "analytics" || !fact.name.startsWith("fact_")) return null;
  const dimensions = new Map();
  for (const { column: fk, references_relation: target, references_column: pk } of fact.foreign_keys ?? []) {
    const dim = pkg.relations[target];
    if (dim?.schema !== "analytics" || !dim.name.startsWith("dim_") ||
      dim.primary_key?.length !== 1 || dim.primary_key[0] !== pk) continue;
    if (!dimensions.has(target)) {
      const snapshots = new Set();
      for (const entry of Object.values(pkg.lineage.relations[target]?.columns ?? {})) {
        for (const leaf of entry.leaves) {
          const { relacao } = separarColuna(leaf);
          if (pkg.relations[relacao]?.resource_type === "snapshot") snapshots.add(relacao);
        }
      }
      dimensions.set(target, { target, name: dim.name, grain: dim.grain, snapshots: [...snapshots], keys: [] });
    }
    dimensions.get(target).keys.push({ fk, pk });
  }
  return { id, name: fact.name, grain: fact.grain, primaryKey: fact.primary_key ?? [], dimensions: [...dimensions.values()] };
}

// O grão agrupa a resposta. Uma FK ou um alias na regra SQL, por si só,
// não prova de qual dimensão veio o valor de uma coluna da view.
export function viewColumnsByDimension(pkg, question) {
  const result = new Map(question.dimensions.map((id) => [id, []]));
  for (const [name, entry] of Object.entries(pkg.lineage.relations[question.view]?.columns ?? {})) {
    const sources = new Set(entry.leaves.map((leaf) => separarColuna(leaf).relacao));
    for (const source of sources) result.get(source)?.push(name);
  }
  return result;
}
