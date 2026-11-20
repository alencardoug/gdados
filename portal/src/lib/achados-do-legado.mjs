// Cada observação pertence a uma única linha da exportação. A mesma ocorrência
// física pode reaparecer em outras relações, capturas ou versões do catálogo.
import { separarColuna } from "./definicoes.mjs";

function rawInput(pkg, id) {
  const sources = new Set();
  for (const { leaves } of Object.values(pkg.lineage.relations[id]?.columns ?? {})) {
    for (const leaf of leaves) {
      const { relacao } = separarColuna(leaf);
      if (pkg.relations[relacao]?.schema === "raw_legacy") sources.add(relacao);
    }
  }
  return sources.size === 1 ? [...sources][0] : undefined;
}

const isMap = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const fieldValue = (payload, field, marker) =>
  payload === marker ? marker : isMap(payload) && Object.hasOwn(payload, field) ? payload[field] : undefined;

export function legacyObservations(pkg, samples) {
  const rawByTable = new Map();
  const rawByBridge = new Map();
  const byCode = new Map();
  for (const [id, r] of Object.entries(pkg.relations)) {
    if (r.schema === "raw_legacy") rawByTable.set(r.name, id);
    if (r.schema === "trusted" && r.name.startsWith("legado__")) rawByBridge.set(id, rawInput(pkg, id));
  }

  for (const [id, sample] of Object.entries(samples.relations)) {
    const staging = pkg.relations[id]?.schema === "staging";
    const column = staging ? "achados" : sample.columns.find((c) => c === "findings" || c === "value_findings");
    if (!sample.columns.includes(column) || !sample.columns.includes("original_payload")) continue;
    const stagingRaw = staging && rawInput(pkg, id);
    for (const [index, cells] of sample.rows.entries()) {
      const row = Object.fromEntries(sample.columns.map((name, i) => [name, cells[i]]));
      const evidence = row[column];
      const findings = column === "findings" ? (Array.isArray(evidence) ? evidence : []) :
        isMap(evidence) ? Object.entries(evidence).map(([column, code]) => ({ column, code })) : [];
      for (const [n, finding] of findings.entries()) {
        if (typeof finding?.code !== "string" || finding.code === samples.masking.marker) continue;
        const field = finding.column;
        const before = field == null ? row.original_payload : fieldValue(row.original_payload, field, samples.masking.marker);
        const after = field == null ? row.cleaned_payload : fieldValue(staging ? row : row.cleaned_payload, field, samples.masking.marker);
        const raw = staging ? stagingRaw : rawByTable.get(row.source_table);
        const item = {
          code: finding.code, field, before, after, relation: id, rowNumber: index + 1,
          anchor: `caso-${id}-${index + 1}-${n + 1}`, evidence: column, raw,
          table: row.source_table ?? pkg.relations[raw]?.name, capture: row.snapshot_id,
          rowId: row.legacy_row_id, version: row.catalog_version, classification: row.classification,
          action: finding.action, reason: finding.reason, context: finding.context,
          payload: isMap(row.original_payload) ? row.original_payload : undefined,
        };
        if (!byCode.has(item.code)) byCode.set(item.code, []);
        byCode.get(item.code).push(item);
      }
    }
  }
  return { byCode, rawByBridge };
}
