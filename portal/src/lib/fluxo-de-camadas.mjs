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

// Coordenadas da grade da inicial (linha / coluna / fim da linha / fim da coluna).
// A posição expressa o papel da camada. Cada traço só existe se o pacote trouxer o par.
const stationSlots = [
  ["raw", "1 / 1 / 2 / 12"], ["raw_legacy", "1 / 14 / 2 / 25"],
  ["staging", "3 / 1 / 4 / 12"], ["governance", "3 / 15 / 4 / 23"],
  ["trusted", "5 / 1 / 6 / 25"],
  ["analytics", "7 / 1 / 8 / 9"], ["quarantine", "7 / 10 / 8 / 17"], ["snapshots", "7 / 18 / 8 / 25"],
  ["consumption", "9 / 1 / 10 / 9"],
];
const routeSlots = [
  ["raw", "staging", "down", "2 / 1 / 3 / 12"],
  ["raw_legacy", "staging", "bend", "2 / 9 / 3 / 18"],
  ["raw_legacy", "trusted", "down", "2 / 23 / 5 / 25"],
  ["governance", "staging", "left", "3 / 12 / 4 / 15"],
  ["staging", "trusted", "down", "4 / 1 / 5 / 12"],
  ["trusted", "analytics", "down", "6 / 1 / 7 / 9"],
  ["trusted", "quarantine", "down", "6 / 10 / 7 / 17"],
  ["trusted", "snapshots", "down", "6 / 18 / 7 / 25"],
  ["analytics", "consumption", "down", "8 / 1 / 9 / 9"],
];

export function planLayerMap(layers, flows) {
  const remaining = new Set(flows);
  const routes = [];
  for (const [source, target, shape, area] of routeSlots) {
    const edge = flows.find((f) => f.source === source && f.target === target);
    if (edge) {
      routes.push({ edge, shape, area });
      remaining.delete(edge);
    }
  }
  const slots = new Map(stationSlots);
  const station = (layer) => {
    const loop = flows.find((f) => f.source === layer && f.target === layer);
    remaining.delete(loop);
    return { layer, loop, area: slots.get(layer) };
  };
  const stations = stationSlots.filter(([layer]) => layers.includes(layer)).map(([layer]) => station(layer));
  const others = layers.filter((layer) => !slots.has(layer)).map(station);
  return { stations, others, routes, extra: [...remaining] };
}

// Interpolação linear entre o menor traço legível e o espaço reservado às setas.
export function flowWidth(pairs, largest, minimum = 1) {
  if (!pairs) return 1; // Traço de contexto, fora da medida selecionada.
  return largest <= 1 ? minimum : minimum + (10 - minimum) * (pairs - 1) / (largest - 1);
}

export function examplePair(edges, layerOf) {
  const mapped = edges.filter((e) => layerOf(e.source) != null && layerOf(e.target) != null);
  const multiple = mapped.filter((e) => e.n > 1);
  // O leitor pode localizar o exemplo no desvio do legado. Nomes curtos cabem melhor no celular.
  const bypass = multiple.filter((e) => layerOf(e.source) === "raw_legacy" && layerOf(e.target) === "trusted");
  const candidates = bypass.length ? bypass : multiple;
  return candidates.toSorted((a, b) => (a.source.length + a.target.length) - (b.source.length + b.target.length))[0]
    ?? mapped[0];
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
