// Roteiro de aprendizado (página de conceitos §10): degraus feitos um por vez, na ordem em que o
// Owner avança. Funções puras, usadas no build (editorial.mjs) e nos testes.

/**
 * Confere o roteiro contra os pré-requisitos do inventário. Devolve a lista de erros de autoria:
 * termo desconhecido ou repetido, ciclo nos pré-requisitos e termo cujo pré-requisito não está no
 * mesmo degrau nem num anterior (o roteiro tem de ser percorrível na ordem em que é lido).
 * @param {{id: string, termos: {id: string}[]}[]} degraus
 * @param {Map<string, string[]>} prerequisitos id do termo → ids que ajudam ler antes
 */
export function verificarRoteiro(degraus, prerequisitos) {
  const erros = [];
  const vistos = new Map();
  degraus.forEach((d, i) => {
    for (const { id } of d.termos) {
      if (!prerequisitos.has(id)) erros.push(`${d.id}: termo desconhecido ${id}`);
      else if (vistos.has(id)) erros.push(`${d.id}: ${id} já está em ${degraus[vistos.get(id)].id}`);
      else vistos.set(id, i);
    }
  });
  for (const [id, i] of vistos) {
    for (const p of prerequisitos.get(id)) {
      if (!vistos.has(p)) erros.push(`${degraus[i].id}: ${id} pede ${p}, que não está no roteiro`);
      else if (vistos.get(p) > i) erros.push(`${degraus[i].id}: ${id} pede ${p}, que só vem em ${degraus[vistos.get(p)].id}`);
    }
  }
  // Ciclo: busca em profundidade sobre todo o inventário.
  const estado = new Map();
  const visitar = (id, caminho) => {
    if (estado.get(id) === "feito") return;
    if (estado.get(id) === "aberto") {
      erros.push(`ciclo nos pré-requisitos: ${[...caminho.slice(caminho.indexOf(id)), id].join(" → ")}`);
      return;
    }
    estado.set(id, "aberto");
    for (const p of prerequisitos.get(id) ?? []) visitar(p, [...caminho, id]);
    estado.set(id, "feito");
  };
  for (const id of prerequisitos.keys()) visitar(id, []);
  return erros;
}

/** Posição de cada termo no roteiro: degrau, ordem, anterior e seguinte na leitura. */
export function posicoesNoRoteiro(degraus) {
  const sequencia = degraus.flatMap((d, i) => d.termos.map((t, j) => ({ id: t.id, degrau: i, ordem: j })));
  return new Map(sequencia.map((s, k) => [s.id, { ...s, anterior: sequencia[k - 1]?.id ?? null, seguinte: sequencia[k + 1]?.id ?? null }]));
}

/** Definição Mermaid do mapa: os termos do roteiro e as setas "ajuda ler antes" entre eles. */
export function mapaDoRoteiro(degraus, prerequisitos, titulos) {
  const ids = degraus.flatMap((d) => d.termos.map((t) => t.id));
  const apelido = new Map(ids.map((id, i) => [id, `t${i}`]));
  const texto = (s) => String(s).replace(/["#<>]/g, (c) => ({ '"': "#quot;", "#": "#35;", "<": "#lt;", ">": "#gt;" })[c]);
  const linhas = ["flowchart LR", "  accTitle: Mapa do roteiro de aprendizado", "  accDescr: Cada seta vai de um termo para outro que fica mais fácil depois dele"];
  degraus.forEach((d, i) => {
    linhas.push(`  subgraph d${i}["${texto(d.titulo)}"]`);
    for (const t of d.termos) linhas.push(`    ${apelido.get(t.id)}["${texto(titulos.get(t.id) ?? t.id)}"]`);
    linhas.push("  end");
  });
  for (const id of ids) for (const p of prerequisitos.get(id) ?? []) if (apelido.has(p)) linhas.push(`  ${apelido.get(p)} --> ${apelido.get(id)}`);
  return linhas.join("\n");
}
