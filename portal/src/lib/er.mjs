// Diagrama entidade-relacionamento gerado das chaves do pacote (relations.*.primary_key e
// relations.*.foreign_keys, F34 da origem; D02). Nada é deduzido do nome dos testes ou das colunas.
//
// Cardinalidade: o pacote não a declara. O lado de quem referencia é sempre "zero ou mais" (}o),
// que vale para qualquer chave estrangeira. O lado referenciado é "exatamente um" (||) só quando a
// coluna tem teste not_null declarado; sem ele, "zero ou um" (o|). A coluna referenciada é a chave
// primária do destino (o build confere).

/** Chaves estrangeiras do pacote, uma por linha, com a relação de partida. */
export function chavesEstrangeiras(pacote) {
  return Object.entries(pacote.relations).flatMap(([id, r]) =>
    (r.foreign_keys ?? []).map((f) => ({ relacao: id, ...f })),
  );
}

/** Colunas com teste not_null declarado, como "relação.coluna". */
export function colunasNaoNulas(pacote) {
  return new Set(
    Object.values(pacote.tests)
      .filter((t) => t.test === "not_null" && t.column != null)
      .map((t) => `${t.relation}.${t.column}`),
  );
}

/** Relações que entram no modelo: declaram chave ou são referenciadas. */
export function relacoesDoModelo(pacote) {
  const ids = new Set();
  for (const [id, r] of Object.entries(pacote.relations)) {
    if ((r.primary_key ?? []).length || (r.foreign_keys ?? []).length) ids.add(id);
  }
  for (const f of chavesEstrangeiras(pacote)) ids.add(f.references_relation);
  return [...ids].sort();
}

/** Recorte de uma relação: ela, as que ela referencia e as que a referenciam. */
export function vizinhos(pacote, id) {
  const ids = new Set([id]);
  for (const f of chavesEstrangeiras(pacote)) {
    if (f.relacao === id) ids.add(f.references_relation);
    if (f.references_relation === id) ids.add(f.relacao);
  }
  return [...ids].sort();
}

// Identificadores do pacote seguem ^[a-z0-9_]+ (esquema); qualquer outro caractere vira "_" para não
// quebrar a sintaxe do Mermaid.
const seguro = (s) => String(s).replace(/[^a-z0-9_.]/gi, "_");
const tipo = (t) => (t == null ? "sem_tipo" : String(t).replace(/[^A-Za-z0-9_()[\]-]/g, "_"));

/**
 * Definição Mermaid (erDiagram) das relações em `ids`. Cada entidade mostra a chave primária e as
 * chaves estrangeiras; no recorte de uma relação, as vizinhas mostram só a chave primária e as
 * colunas que participam das ligações desenhadas.
 */
export function definicaoER(pacote, ids, { titulo, foco = null } = {}) {
  const dentro = new Set(ids);
  const naoNulas = colunasNaoNulas(pacote);
  const ligacoes = chavesEstrangeiras(pacote).filter(
    (f) => dentro.has(f.relacao) && dentro.has(f.references_relation) && (foco == null || f.relacao === foco || f.references_relation === foco),
  );
  const apelido = new Map(ids.map((id, i) => [id, `e${i}`]));
  const linhas = [
    "erDiagram",
    `  accTitle: ${String(titulo ?? "Modelo entidade-relacionamento").replace(/[\r\n;#{}]/g, " ")}`,
    "  accDescr: Chaves primárias e estrangeiras declaradas no pacote de metadados",
  ];
  for (const id of ids) {
    const r = pacote.relations[id];
    const pk = new Set(r?.primary_key ?? []);
    const fks = new Set(ligacoes.filter((f) => f.relacao === id).map((f) => f.column));
    const colunas = [...pk, ...[...fks].filter((c) => !pk.has(c))];
    linhas.push(`  ${apelido.get(id)}["${seguro(id)}"] {`);
    for (const c of colunas) {
      const marcas = [pk.has(c) && "PK", fks.has(c) && "FK"].filter(Boolean).join(", ");
      linhas.push(`    ${tipo(r?.columns?.[c]?.data_type)} ${seguro(c)} ${marcas}`);
    }
    linhas.push("  }");
  }
  for (const f of ligacoes) {
    const destino = naoNulas.has(`${f.relacao}.${f.column}`) ? "||" : "o|";
    const rotulo = f.column === f.references_column ? seguro(f.column) : `${seguro(f.column)} → ${seguro(f.references_column)}`;
    linhas.push(`  ${apelido.get(f.relacao)} }o--${destino} ${apelido.get(f.references_relation)} : "${rotulo}"`);
  }
  return linhas.join("\n");
}
