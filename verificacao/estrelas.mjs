// Confere o centro, as caixas abertas/recolhidas e cada FK desenhada contra o pacote bruto.
import { isDeepStrictEqual } from "node:util";

const plain = (text) => text.replace(/<[^>]+>/g, "");
export function checkStar(pkg, id, fragment, question, stepColumns = []) {
  const fact = pkg.relations[id];
  const declared = (fact.foreign_keys ?? []).filter((f) => {
    const dim = pkg.relations[f.references_relation];
    return dim?.schema === "analytics" && dim.name.startsWith("dim_") &&
      isDeepStrictEqual(dim.primary_key, [f.references_column]);
  });
  const expected = declared.map((f) => [f.column, f.references_relation, f.references_column].join("/")).sort();
  const dimensions = new Set(declared.map((f) => f.references_relation));
  const drawn = [], rows = [], boxes = [], errors = [];
  if (!fragment.includes(`class="fact-star" data-fact="${id}"`)) errors.push("estrela ausente");
  const hub = fragment.match(/<div class="star-hub">([\s\S]*?)<\/div>/)?.[1] ?? "";
  if (!plain(hub).includes(fact.name) || !plain(hub).includes("Uma linha da fato = " + (fact.grain ?? "grão não declarado")) ||
    fact.primary_key.some((pk) => !plain(hub).includes(pk))) errors.push("centro");
  if (question && (!hub.includes("Entram na conta") || !isDeepStrictEqual(
    [...hub.matchAll(/<li data-column="([^"]+)"/g)].map((m) => m[1]), stepColumns))) errors.push("insumos da conta");
  const folded = fragment.match(/<details class="star-others">([\s\S]*?)<\/details>/)?.[1] ?? "";
  const hidden = [...dimensions].filter((d) => question && !question.dimensions.includes(d));
  if (hidden.length && !folded.includes(`Mais ${hidden.length} `)) errors.push("contagem recolhida");

  for (const [, dim, highlight, body] of fragment.matchAll(/<li class="star-arm" data-dimension="([^"]+)"( data-used="true")?>([\s\S]*?)<\/li>/g)) {
    boxes.push(dim);
    for (const [, keys] of body.matchAll(/class="arm-keys">([\s\S]*?)<\/div>/g)) {
      const [fk, pk] = plain(keys).trim().split(" → ");
      drawn.push([fk, dim, pk].join("/"));
      if (!keys.includes('class="arm-line"')) errors.push("traço " + fk);
      if (declared.filter((f) => f.references_relation === dim).length > 1 && fact.columns[fk]?.description &&
        !body.includes(`href="/governanca/relacao/${id}/#coluna-${fk}">Descrição da FK na origem`)) errors.push("papel " + fk);
    }
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
    const used = question?.dimensions.includes(dim) ?? false;
    if (used !== Boolean(highlight) || used !== body.includes("Dimensão da pergunta") ||
      folded.includes(`data-dimension="${dim}"`) !== hidden.includes(dim)) errors.push("destaque " + dim);
    if (question) {
      const expectedCols = Object.entries(pkg.lineage.relations[question.view]?.columns ?? {})
        .filter(([, col]) => used && col.leaves.some((leaf) => leaf.startsWith(dim + "."))).map(([name]) => name);
      const viewLinks = [...body.matchAll(/href="\/governanca\/relacao\/([^/]+)\/#coluna-([^"]+)"/g)].filter((m) => m[1] === question.view);
      if (!isDeepStrictEqual(expectedCols, viewLinks.map((m) => m[2]))) errors.push("colunas da view " + dim);
    }
  }
  const table = fragment.match(/<details class="star-table">([\s\S]*?)<\/details>/)?.[1] ?? "";
  for (const [, row] of table.matchAll(/<tr>([\s\S]*?)<\/tr>/g)) {
    if (!row.includes("<td>")) continue;
    const [fk, pk] = [...row.matchAll(/href="\/governanca\/relacao\/([^/]+)\/#coluna-([^"]+)">([\s\S]*?)<\/a>/g)];
    if (fk?.[1] !== id || plain(fk[3]) !== fk[2] || !pk || plain(pk[3]) !== pk[1] + "." + pk[2]) errors.push("colunas da tabela");
    rows.push([fk?.[2], pk?.[1], pk?.[2]].join("/"));
  }
  if (!isDeepStrictEqual(boxes.sort(), [...dimensions].sort())) errors.push("caixas");
  if (!isDeepStrictEqual(drawn.sort(), expected)) errors.push("braços");
  if (!isDeepStrictEqual(rows.sort(), expected)) errors.push("tabela");
  if (expected.length && !fragment.includes(`href="/estrutura/?er=${id}#entidades"`)) errors.push("diagrama ER");
  return { errors, arms: drawn.length };
}
