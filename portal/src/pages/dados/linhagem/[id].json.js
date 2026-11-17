// Linhagem por coluna de uma relação, como o pacote a traz (lineage, sem alteração).
import { pacote } from "../../../lib/portal.mjs";

export function getStaticPaths() {
  return Object.keys(pacote.lineage.relations).map((id) => ({ params: { id } }));
}
export function GET({ params }) {
  return new Response(JSON.stringify(pacote.lineage.relations[params.id].columns), {
    headers: { "Content-Type": "application/json" },
  });
}
