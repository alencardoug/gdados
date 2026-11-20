// O percurso começa numa única medida da pergunta. Só as folhas imediatas abrem ramos.
import { separarColuna } from "./definicoes.mjs";

// Uma seta resume as folhas imediatas de uma coluna. Insumos de relações
// distintas só dividem a legenda se fornecerem os mesmos nomes.
export function changedInputs({ name, leaves }) {
  const byRelation = new Map();
  let changed = false;
  for (const leaf of leaves) {
    const { relacao, coluna } = separarColuna(leaf);
    if (coluna !== name) changed = true;
    if (!byRelation.has(relacao)) byRelation.set(relacao, new Set());
    byRelation.get(relacao).add(coluna);
  }
  if (!changed) return [];
  const groups = new Map();
  for (const [id, columns] of byRelation) {
    const names = [...columns].sort();
    const key = JSON.stringify(names);
    if (!groups.has(key)) groups.set(key, { names, relations: [] });
    groups.get(key).relations.push(id);
  }
  return [...groups.values()];
}

export function initialMeasure(question, pkg) {
  const columns = pkg.view_rules[question.view]?.columns ?? {};
  const lineage = pkg.lineage.relations[question.view]?.columns ?? {};
  const firstMetric = question.measures.find((m) => columns[m.column]?.role === "metric");
  const firstWithSource = question.measures.find((m) => lineage[m.column]?.origins.some((o) => o.kind === "source"));
  return (firstMetric ?? firstWithSource ?? question.measures[0])?.column;
}

export function measureTrail(view, measure, pkg) {
  const byId = new Map();
  const visiting = new Set();
  function visit(fullName) {
    const { relacao: id, coluna: name } = separarColuna(fullName);
    const relation = pkg.relations[id];
    if (!byId.has(id)) byId.set(id, { id, layer: relation?.schema, columns: new Map(), inputs: new Set() });
    const step = byId.get(id);
    if (step.columns.has(name)) return;
    const entry = pkg.lineage.relations[id]?.columns[name];
    const leaves = [...new Set(entry?.leaves)];
    const current = { name, leaves, terminal: null, gap: null };
    step.columns.set(name, current);
    if (!Object.hasOwn(relation?.columns ?? {}, name)) current.gap = "Coluna sem ficha no catálogo.";
    if (!leaves.length && !current.gap) {
      // Uma source fica fora do manifesto de linhagem do dbt. Uma coluna gerada precisa do kind explícito.
      current.terminal = entry?.origins.find((o) => o.column === fullName)?.kind ??
        (["source", "seed"].includes(relation.resource_type) ? relation.resource_type : null);
      if (!current.terminal) current.gap = "O pacote não declara insumo nem origem terminal para esta coluna.";
    }
    visiting.add(fullName);
    for (const leaf of leaves) {
      const input = separarColuna(leaf).relacao;
      if (input !== id) step.inputs.add(input);
      if (visiting.has(leaf)) current.gap = "A linhagem retorna a uma coluna já percorrida neste ramo.";
      else visit(leaf);
    }
    visiting.delete(fullName);
  }
  visit(`${view}.${measure}`);
  const edges = [...byId.values()].flatMap((step) => [...step.inputs].map((source) => ({ source, target: step.id })));
  // Pós-ordem invertida mantém cada ramo junto e põe insumos compartilhados
  // depois de todos os consumidores. O desempate entre irmãos é pelo identificador.
  const visited = new Set();
  const ordered = [];
  function finish(id) {
    if (visited.has(id)) return;
    visited.add(id);
    const step = byId.get(id);
    for (const input of [...step.inputs].sort().reverse()) finish(input);
    ordered.push(step);
  }
  finish(view);
  return { steps: ordered.reverse(), edges };
}
