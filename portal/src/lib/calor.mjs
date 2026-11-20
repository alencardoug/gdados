// Mapa de calor por camada: onde está cada classe de sensibilidade, quanto das colunas tem teste do
// dbt e onde a máscara da exportação de amostras (D06) aparece. Tudo contado do pacote e da
// exportação fixados; a classificação descreve o dado e não vira decisão de acesso.

// Ordem de leitura das classes que o pacote usa; classe desconhecida entra no fim, em ordem alfabética.
const ORDEM_DAS_CLASSES = ["public", "internal", "confidential", "personal"];

const temMarcador = (v, marcador) => v === marcador ||
  (v !== null && typeof v === "object" && Object.values(v).some((x) => temMarcador(x, marcador)));

export function mapaDeCalor(pacote, amostras, camadas) {
  const marcador = amostras.masking.marker;
  const todas = new Set();
  for (const r of Object.values(pacote.relations)) for (const c of Object.values(r.columns)) todas.add(c.sensitivity ?? "não declarada");
  const classes = [...ORDEM_DAS_CLASSES.filter((c) => todas.has(c)), ...[...todas].filter((c) => !ORDEM_DAS_CLASSES.includes(c)).sort()];

  // Testes do dbt por relação e por coluna; o resultado vem do próprio teste no pacote.
  const testadas = new Set(), testesPorCamada = new Map(), resultadosPorCamada = new Map();
  for (const t of Object.values(pacote.tests)) {
    const camada = pacote.relations[t.relation]?.schema;
    if (!camada) continue;
    testesPorCamada.set(camada, (testesPorCamada.get(camada) ?? 0) + 1);
    const status = t.result?.status ?? "sem resultado";
    const m = resultadosPorCamada.get(camada) ?? new Map();
    m.set(status, (m.get(status) ?? 0) + 1);
    resultadosPorCamada.set(camada, m);
    if (t.column) testadas.add(`${t.relation}.${t.column}`);
  }

  const linhas = camadas.map((camada) => {
    const ids = Object.keys(pacote.relations).filter((id) => pacote.relations[id].schema === camada);
    const porClasse = Object.fromEntries(classes.map((c) => [c, 0]));
    let colunas = 0, comTeste = 0, mascaradas = 0, mascaradasForaDePersonal = 0;
    for (const id of ids) {
      const amostra = amostras.relations[id];
      for (const [nome, c] of Object.entries(pacote.relations[id].columns)) {
        colunas++;
        porClasse[c.sensitivity ?? "não declarada"]++;
        if (testadas.has(`${id}.${nome}`)) comTeste++;
        const j = amostra?.columns.indexOf(nome) ?? -1;
        if (j >= 0 && amostra.rows.some((row) => temMarcador(row[j], marcador))) {
          mascaradas++;
          if (c.sensitivity !== "personal") mascaradasForaDePersonal++;
        }
      }
    }
    return {
      camada, relacoes: ids.length, colunas, porClasse, comTeste, mascaradas, mascaradasForaDePersonal,
      testes: testesPorCamada.get(camada) ?? 0,
      resultados: Object.fromEntries([...(resultadosPorCamada.get(camada) ?? new Map())].sort()),
    };
  });
  const semRelacao = Object.values(pacote.tests).filter((t) => !pacote.relations[t.relation]);
  const tiposSemRelacao = [...new Set(semRelacao.map((t) => t.test ?? "não declarado"))].sort();
  const maximoPorClasse = Object.fromEntries(classes.map((c) => [c, Math.max(0, ...linhas.map((l) => l.porClasse[c]))]));
  return { classes, linhas, maximoPorClasse, marcador, testesSemRelacao: semRelacao.length, tiposSemRelacao, totalDeTestes: Object.keys(pacote.tests).length };
}
