// Lê os nomes e links realmente publicados, tanto nos braços quanto na tabela.
import { isDeepStrictEqual } from "node:util";

const plain = (text) => text.replace(/<[^>]+>/g, "");
export function checkStar(pkg, id, fragment, dimensions) {
  const fact = pkg.relations[id];
  const declared = (fact.foreign_keys ?? []).filter((f) => {
    const dim = pkg.relations[f.references_relation];
    return dim?.schema === "analytics" && dim.name.startsWith("dim_") &&
      isDeepStrictEqual(dim.primary_key, [f.references_column]);
  });
  const expected = declared.map((f) => [f.column, f.references_relation, f.references_column]);
  const drawn = [], rows = [], errors = [];
  if (!fragment.includes(`class="fact-star" data-fact="${id}"`)) errors.push("estrela ausente");
  const hub = plain(fragment.match(/<div class="star-hub">([\s\S]*?)<\/div>/)?.[1] ?? "");
  if (!hub.includes(fact.name) || !hub.includes("Uma linha da fato = " + (fact.grain ?? "grão não declarado")) ||
    fact.primary_key.some((pk) => !hub.includes(pk))) errors.push("centro");

  for (const [, dim, highlight, body] of fragment.matchAll(/<li class="star-arm" data-dimension="([^"]+)"( data-used="true")?>([\s\S]*?)<\/li>/g)) {
    const keys = plain(body.match(/class="arm-keys">([\s\S]*?)<\/div>/)?.[1] ?? "").split(" → ");
    drawn.push([keys[0], dim, keys[1]]);
    if (!body.includes(`href="/governanca/relacao/${dim}/"`)) errors.push("ficha " + dim);
    const snapshotInputs = new Set();
    for (const col of Object.values(pkg.lineage.relations[dim]?.columns ?? {})) {
      for (const leaf of col.leaves) {
        const source = leaf.slice(0, leaf.lastIndexOf("."));
        if (pkg.relations[source]?.resource_type === "snapshot") snapshotInputs.add(source);
      }
    }
    const snapshots = new Set([...body.matchAll(/class="snapshot-link" href="\/governanca\/relacao\/([^/]+)\/"/g)].map((m) => m[1]));
    if (!isDeepStrictEqual(snapshots, snapshotInputs)) errors.push("snapshots " + dim);
    const used = dimensions.includes(dim);
    if (used !== Boolean(highlight) || used !== body.includes("Dimensão da pergunta")) errors.push("destaque " + dim);
  }
  const table = fragment.match(/<details class="star-table">([\s\S]*?)<\/details>/)?.[1] ?? "";
  for (const [, row] of table.matchAll(/<tr>([\s\S]*?)<\/tr>/g)) {
    if (!row.includes("<td>")) continue;
    const [fk, pk] = [...row.matchAll(/href="\/governanca\/relacao\/([^/]+)\/#coluna-([^"]+)">([\s\S]*?)<\/a>/g)];
    if (fk?.[1] !== id || plain(fk[3]) !== fk[2] || !pk || plain(pk[3]) !== pk[1] + "." + pk[2]) errors.push("colunas da tabela");
    rows.push([fk?.[2], pk?.[1], pk?.[2]]);
  }
  if (!isDeepStrictEqual(drawn, expected)) errors.push("braços");
  if (!isDeepStrictEqual(rows, expected)) errors.push("tabela");
  if (expected.length && !fragment.includes(`href="/estrutura/?er=${id}#entidades"`)) errors.push("diagrama ER");
  return { errors, arms: drawn.length };
}
