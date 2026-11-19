// Ordem de leitura e funções da Arquitetura, seção 2. Somente a linhagem pode ligar duas camadas.
export const mainLayers = ["raw", "staging", "trusted", "analytics", "consumption"];
export const layerRoles = new Map([
  ["raw", "Cópia da origem principal"], ["raw_legacy", "Capturas do legado"],
  ["staging", "Padroniza tipos e valores"], ["trusted", "Aplica regras de negócio"],
  ["analytics", "Organiza fatos e dimensões"], ["consumption", "Entrega views de leitura"],
  ["quarantine", "Guarda rejeições e motivos"], ["snapshots", "Preserva versões das dimensões"],
  ["governance", "Registra execuções e controles"],
]);
export const otherFunction = (layer) => layer != null && layer !== "raw_legacy" && !mainLayers.includes(layer);

// Cada aresta recebida já representa um par distinto de relações com ao menos uma folha imediata.
export function layerFlows(edges, layerOf) {
  const bySource = new Map();
  for (const edge of edges) {
    const source = layerOf(edge.source);
    const target = layerOf(edge.target);
    if (source == null || target == null) continue;
    if (!bySource.has(source)) bySource.set(source, new Map());
    const targets = bySource.get(source);
    targets.set(target, (targets.get(target) ?? 0) + 1);
  }
  return [...bySource].flatMap(([source, targets]) =>
    [...targets].map(([target, pairs]) => ({ source, target, pairs })));
}

export function planLayerMap(layers, flows) {
  const spine = mainLayers.filter((layer) => layers.includes(layer));
  const extra = new Set(flows);
  const stations = spine.map((layer, i) => {
    const next = flows.find((f) => f.source === layer && f.target === spine[i + 1]);
    extra.delete(next);
    return { layer, next, branches: [] };
  });
  const detached = [];
  for (const layer of layers.filter((l) => !spine.includes(l))) {
    // Ancora primeiro em quem fornece ao ramal. Sem entrada, usa a primeira saída para a linha.
    const anchor = stations.find((s) => flows.some((f) => f.source === s.layer && f.target === layer))
      ?? stations.find((s) => flows.some((f) => f.source === layer && f.target === s.layer));
    if (!anchor) {
      detached.push(layer);
      continue;
    }
    const edge = flows.find((f) => f.source === anchor.layer && f.target === layer)
      ?? flows.find((f) => f.source === layer && f.target === anchor.layer);
    anchor.branches.push({ layer, edge });
    extra.delete(edge);
  }
  return { stations, detached, extra: [...extra] };
}

export function neighborLayers(edges, end, layerOf) {
  const groups = new Map();
  for (const edge of edges) {
    const id = edge[end];
    const layer = layerOf(id) ?? null;
    if (!groups.has(layer)) groups.set(layer, []);
    groups.get(layer).push({ id, n: edge.n });
  }
  return [...groups].map(([layer, items]) => ({ layer, items }));
}
