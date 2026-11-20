// Cada braço tem uma FK própria: duas datas podem apontar para a mesma dimensão.
import { separarColuna } from "./definicoes.mjs";

export function factStar(pkg, id) {
  const fact = pkg.relations[id];
  if (fact?.schema !== "analytics" || !fact.name.startsWith("fact_")) return null;
  const arms = [];
  for (const { column, references_relation: target, references_column: pk } of fact.foreign_keys ?? []) {
    const dim = pkg.relations[target];
    if (dim?.schema !== "analytics" || !dim.name.startsWith("dim_") ||
      dim.primary_key?.length !== 1 || dim.primary_key[0] !== pk) continue;
    const snapshots = new Set();
    for (const entry of Object.values(pkg.lineage.relations[target]?.columns ?? {})) {
      for (const leaf of entry.leaves) {
        const { relacao } = separarColuna(leaf);
        if (pkg.relations[relacao]?.resource_type === "snapshot") snapshots.add(relacao);
      }
    }
    arms.push({ fk: column, target, pk, dimension: dim.name, grain: dim.grain, snapshots: [...snapshots] });
  }
  return { id, name: fact.name, grain: fact.grain, primaryKey: fact.primary_key ?? [], arms };
}
