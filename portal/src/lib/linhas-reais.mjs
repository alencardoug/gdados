// Linhas reais para as páginas de conceito: a amostra exportada pela origem (D06) de uma relação,
// recortada nas colunas que o conceito escolhe. O que a nota editorial afirma sobre os dados é
// conferido aqui, e o build falha se a amostra fixada deixar de sustentar a afirmação.

const valorChave = (v) => JSON.stringify(v);

export function montarLinhasReais(spec, amostras, pacote) {
  const amostra = amostras.relations?.[spec.relacao];
  const relacao = pacote.relations?.[spec.relacao];
  if (!amostra || !relacao) throw new Error(`linhas_reais: ${spec.relacao} sem amostra ou fora do pacote`);
  const exigidas = [...spec.colunas, ...spec.destaque, ...(spec.agrupar_por ? [spec.agrupar_por] : []), ...spec.distintas_em];
  for (const c of exigidas) {
    if (!amostra.columns.includes(c)) throw new Error(`linhas_reais: ${spec.relacao}.${c} não está na amostra`);
  }
  const colunasDoPacote = Array.isArray(relacao.columns)
    ? Object.fromEntries(relacao.columns.map((c) => [c.name, c])) : relacao.columns ?? {};
  const linhas = amostra.rows.map((cells, i) => {
    const row = Object.fromEntries(amostra.columns.map((c, j) => [c, cells[j]]));
    return { numero: i + 1, row, valores: spec.colunas.map((c) => row[c]) };
  });

  // Grupos: linhas que repetem o valor de agrupar_por. Só valores que aparecem mais de uma vez.
  let grupos = 0;
  if (spec.agrupar_por) {
    const contagem = new Map();
    for (const l of linhas) {
      const k = valorChave(l.row[spec.agrupar_por]);
      contagem.set(k, (contagem.get(k) ?? 0) + 1);
    }
    const ordem = new Map();
    for (const l of linhas) {
      const k = valorChave(l.row[spec.agrupar_por]);
      if (contagem.get(k) > 1) {
        if (!ordem.has(k)) ordem.set(k, ordem.size + 1);
        l.grupo = ordem.get(k);
      }
    }
    grupos = ordem.size;
    if (grupos === 0) throw new Error(`linhas_reais: nenhum valor de ${spec.agrupar_por} se repete na amostra de ${spec.relacao}`);
    // Dentro de cada grupo, as colunas de distintas_em têm de variar de linha para linha.
    for (const g of ordem.values()) {
      const doGrupo = linhas.filter((l) => l.grupo === g);
      for (const c of spec.distintas_em) {
        if (new Set(doGrupo.map((l) => valorChave(l.row[c]))).size !== doGrupo.length) {
          throw new Error(`linhas_reais: em ${spec.relacao}, ${c} se repete dentro de um grupo de ${spec.agrupar_por}`);
        }
      }
    }
  }
  return {
    relacao: spec.relacao,
    grao: relacao.grain ?? null,
    colunas: spec.colunas.map((nome) => ({
      nome, sensibilidade: colunasDoPacote[nome]?.sensitivity ?? null, destaque: spec.destaque.includes(nome),
    })),
    linhas: linhas.map(({ numero, valores, grupo }) => ({ numero, valores, grupo: grupo ?? null })),
    grupos,
    agruparPor: spec.agrupar_por ?? null,
    nota: spec.nota,
  };
}
