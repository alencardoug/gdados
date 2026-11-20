// Layout em camadas por caminho mais longo (D02, condição 2), sem extensão do Cytoscape.js.
//
// A camada de cada nó é a distância do maior caminho desde um nó sem insumo. Um nó sem insumo é
// puxado para junto do seu primeiro consumidor (camada mínima dos consumidores − 1): assim uma
// dimensão gerada, como dim_date, não aparece ao lado de raw, e a posição segue a ordem do pipeline
// sem que o portal declare essa ordem. Ciclos, que a linhagem não deveria ter, não travam o cálculo:
// os nós restantes recebem a camada a partir dos insumos já posicionados.
// Usado no build (camadas globais do grafo de relações) e no navegador (posições do recorte).

/** @returns {Map<string, number>} camada de cada nó */
export function camadasPorCaminhoMaisLongo(ids, arestas) {
  const entradas = new Map(ids.map((id) => [id, []]));
  const saidas = new Map(ids.map((id) => [id, []]));
  for (const { source, target } of arestas) {
    if (!entradas.has(source) || !entradas.has(target) || source === target) continue;
    entradas.get(target).push(source);
    saidas.get(source).push(target);
  }
  const grau = new Map(ids.map((id) => [id, entradas.get(id).length]));
  const camada = new Map();
  const fila = ids.filter((id) => grau.get(id) === 0);
  for (const id of fila) camada.set(id, 0);
  for (let i = 0; i < fila.length; i++) {
    const id = fila[i];
    for (const s of saidas.get(id)) {
      camada.set(s, Math.max(camada.get(s) ?? 0, camada.get(id) + 1));
      grau.set(s, grau.get(s) - 1);
      if (grau.get(s) === 0) fila.push(s);
    }
  }
  for (const id of ids) {
    if (camada.has(id)) continue;
    const ja = entradas.get(id).filter((e) => camada.has(e)).map((e) => camada.get(e));
    camada.set(id, ja.length ? Math.max(...ja) + 1 : 0);
  }
  for (const id of ids) {
    if (entradas.get(id).length || !saidas.get(id).length) continue;
    camada.set(id, Math.max(0, Math.min(...saidas.get(id).map((s) => camada.get(s))) - 1));
  }
  return camada;
}

/**
 * Posições (x, y) para o layout "preset": x pela camada, y pela ordem dentro da camada.
 * `camadaDe(id)` dá a camada; `ordem(a, b)` ordena os nós de uma mesma camada.
 */
export function posicoesEmCamadas(ids, camadaDe, ordem, { dx = 260, dy = 34 } = {}) {
  const porCamada = new Map();
  for (const id of ids) {
    const c = camadaDe(id);
    if (!porCamada.has(c)) porCamada.set(c, []);
    porCamada.get(c).push(id);
  }
  const colunas = [...porCamada.keys()].sort((a, b) => a - b);
  const maior = Math.max(...[...porCamada.values()].map((v) => v.length));
  const posicoes = new Map();
  colunas.forEach((c, i) => {
    const nos = porCamada.get(c).sort(ordem);
    const deslocamento = ((maior - nos.length) * dy) / 2;
    nos.forEach((id, j) => posicoes.set(id, { x: i * dx, y: deslocamento + j * dy }));
  });
  return posicoes;
}

// Paleta das camadas, atribuída pela ordem das camadas no grafo: nenhum nome de camada é fixado
// no código. As cores são tokens de portal.css (--camada-N), com valores próprios no tema claro e
// no escuro; o mesmo índice dá a mesma cor no mapa das camadas e no grafo.
export const TAMANHO_DA_PALETA = 11;
export const tokenDaCamada = (indice) => `--camada-${indice % TAMANHO_DA_PALETA}`;
export const corDaCamada = (indice) => `var(${tokenDaCamada(indice)})`;
