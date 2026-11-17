// Grafo por relação, agregado da linhagem por coluna (insumo imediato, leaves), com a camada de
// cada nó pelo caminho mais longo (D02, condição 2). Gerado no build a partir do pacote.
import { relacoes, arestasDeRelacoes, camadaNoGrafo, camadas, pacote } from "../../lib/portal.mjs";

export function GET() {
  const comLinhagem = new Set(Object.keys(pacote.lineage.relations));
  const ids = new Set(relacoes.map((x) => x.id));
  const corpo = {
    camadas,
    nodes: relacoes.map((x) => ({
      id: x.id,
      camada: x.camada,
      tipo: x.r.resource_type,
      rank: camadaNoGrafo.get(x.id),
      linhagem: comLinhagem.has(x.id),
    })),
    edges: arestasDeRelacoes.filter((a) => ids.has(a.source) && ids.has(a.target)),
  };
  return new Response(JSON.stringify(corpo), { headers: { "Content-Type": "application/json" } });
}
