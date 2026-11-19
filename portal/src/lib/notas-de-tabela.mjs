// Agrupa apenas avisos de ausência ou de escopo. Valores declarados permanecem em suas linhas.
export function commonNotice(rows, noticeOf) {
  if (!rows.length) return null;
  const first = noticeOf(rows[0]);
  return first && rows.every((row) => noticeOf(row) === first) ? first : null;
}

export function terminalNotice(lineage, resourceType) {
  if (lineage == null) return resourceType === "source" ? "é origem" : "sem linhagem no pacote";
  return lineage.origins.length === 0 ? "nenhuma origem declarada" : null;
}
