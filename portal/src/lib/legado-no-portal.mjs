import { amostras, pacote, rota, rotaDaPergunta } from "./portal.mjs";
import { legacyObservations } from "./achados-do-legado.mjs";
import { initialMeasure, measureTrail } from "./percurso-da-medida.mjs";

export const { byCode, rawByBridge } = legacyObservations(pacote, amostras);
export const catalogPath = "src/mvp_ed1/legacy/catalogo.yml";
export const legacyUrl = (code = "") => rota("governanca/legado/" + (code ? encodeURIComponent(code) + "/" : ""));
export const caseUrl = (item) => legacyUrl(item.code) + "#" + item.anchor;

// Uma ficha abre um exemplo da própria relação ou da mesma tabela de origem.
// O link representa a tabela, sem identificar linhas entre duas amostras.
const firstByRelation = new Map(), firstByRaw = new Map();
for (const items of byCode.values()) {
  for (const item of items) {
    if (!firstByRelation.has(item.relation)) firstByRelation.set(item.relation, item);
    if (item.raw && !firstByRaw.has(item.raw)) firstByRaw.set(item.raw, item);
  }
}
export const exampleForRelation = (id) => firstByRelation.get(id) ?? firstByRaw.get(rawByBridge.get(id) ?? id);

// Procura um passo efetivo por tabela, com preferência pelas medidas iniciais.
export const stepsByRaw = new Map();
const routes = Object.entries(pacote.questions).flatMap(([id, question]) => {
  const first = initialMeasure(question, pacote);
  return question.measures.map(({ column }) => ({ id, question, column, isFirst: column === first }));
}).sort((a, b) => Number(b.isFirst) - Number(a.isFirst));
for (const { id, question, column, isFirst } of routes) {
  for (const [i, step] of measureTrail(question.view, column, pacote).steps.entries()) {
    const raw = rawByBridge.get(step.id);
    if (raw && !stepsByRaw.has(raw)) {
      stepsByRaw.set(raw, { question: id, relation: step.id, number: i + 1, measure: column,
        href: rotaDaPergunta(id) + (isFirst ? "" : encodeURIComponent(column) + "/") + "#passo-" + (i + 1) });
    }
  }
}
// A própria relação de quarentena da D06 declara o destino permanente.
const quarantine = "quarantine.rejected_legacy_records";
export const quarantineId = pacote.relations[quarantine]?.schema === "quarantine" ? quarantine : null;
