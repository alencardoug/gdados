// Funções puras da vista "antes e depois" do legado: reunir as etapas de uma mesma linha, marcar o
// que a limpeza mudou, destacar o delimitador declarado e agrupar os tipos pelo tratamento que o
// catálogo da origem declara. Nada aqui atribui significado: tudo sai da amostra ou do catálogo.

// A identidade da linha do legado é a ocorrência física (`legacy_row_id`) em cada captura
// (`snapshot_id`), da tabela de origem: é o grão que a origem declara para `raw_legacy`
// (ADR-0037). Sem os três valores, o achado fica sozinho, sem ser ligado a nenhum outro.
export function chaveDaLinha(item) {
  const partes = [item.table, item.rowId, item.capture];
  return partes.every((p) => p !== undefined && p !== null) ? partes.join("|") : null;
}

const ORDEM_DAS_CAMADAS = ["raw_legacy", "staging", "trusted", "quarantine"];
const posicao = (schema) => {
  const i = ORDEM_DAS_CAMADAS.indexOf(schema);
  return i === -1 ? ORDEM_DAS_CAMADAS.length : i;
};

// Reúne os achados de um mesmo tipo pela linha a que pertencem, com as etapas na ordem das
// camadas (o achado de staging antes da classificação de trusted). A ordem dos grupos segue a
// primeira aparição na lista recebida, para preservar a ordenação de quem chama.
export function agruparPorLinha(itens, schemaDe) {
  const grupos = new Map();
  for (const item of itens) {
    const chave = chaveDaLinha(item) ?? "achado:" + item.anchor;
    if (!grupos.has(chave)) grupos.set(chave, { chave, itens: [] });
    grupos.get(chave).itens.push(item);
  }
  for (const grupo of grupos.values()) {
    grupo.itens.sort((a, b) => posicao(schemaDe(a.relation)) - posicao(schemaDe(b.relation)));
  }
  return [...grupos.values()];
}

// Trechos de um texto, cada um marcado como igual, mudado (só existe de um lado) ou delimitador.
const juntar = (trechos) => trechos.reduce((acc, t) => {
  const ultimo = acc.at(-1);
  if (ultimo && ultimo.tipo === t.tipo) ultimo.texto += t.texto;
  else acc.push({ ...t });
  return acc;
}, []);

// Diferença por caractere (maior subsequência comum). Só para textos curtos, onde a marcação
// ajuda a ler; acima do limite, ou com textos iguais, não há marcação.
export const LIMITE_DA_DIFERENCA = 300;
export function diferencaDeTexto(antes, depois) {
  if (typeof antes !== "string" || typeof depois !== "string" || antes === depois) return null;
  const a = [...antes], b = [...depois];
  if (a.length > LIMITE_DA_DIFERENCA || b.length > LIMITE_DA_DIFERENCA) return null;
  const n = a.length, m = b.length;
  const tabela = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      tabela[i][j] = a[i] === b[j] ? tabela[i + 1][j + 1] + 1 : Math.max(tabela[i + 1][j], tabela[i][j + 1]);
    }
  }
  const ladoA = [], ladoB = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { ladoA.push({ tipo: "igual", texto: a[i++] }); ladoB.push({ tipo: "igual", texto: b[j++] }); }
    else if (tabela[i + 1][j] >= tabela[i][j + 1]) ladoA.push({ tipo: "mudou", texto: a[i++] });
    else ladoB.push({ tipo: "mudou", texto: b[j++] });
  }
  while (i < n) ladoA.push({ tipo: "mudou", texto: a[i++] });
  while (j < m) ladoB.push({ tipo: "mudou", texto: b[j++] });
  if (!ladoA.some((t) => t.tipo === "igual")) return null; // nada em comum: a marcação não ensina
  return { antes: juntar(ladoA), depois: juntar(ladoB) };
}

// Separa o delimitador declarado dentro dos trechos iguais, para que ele apareça marcado.
export function marcarDelimitador(trechos, delimitador) {
  if (!delimitador) return trechos;
  return juntar(trechos.flatMap((t) => t.tipo !== "igual" ? [t] :
    t.texto.split(delimitador).flatMap((parte, k) => k === 0 ? [{ tipo: "igual", texto: parte }] :
      [{ tipo: "delimitador", texto: delimitador }, { tipo: "igual", texto: parte }]))
    .filter((t) => t.texto !== ""));
}

// O tratamento de cada tipo, como o catálogo declara: `conversao` com `recuperacao`
// (`original` ou `nulo`) ou `rejeicao`; as duas são mutuamente exclusivas no catálogo.
export const TRATAMENTOS = ["recupera", "anula", "converte", "rejeita", "indefinido"];
export function tratamentoDoTipo(regra) {
  if (!regra || typeof regra !== "object") return "indefinido";
  if (regra.rejeicao) return "rejeita";
  if (regra.conversao) return regra.recuperacao === "original" ? "recupera" : regra.recuperacao === "nulo" ? "anula" : "converte";
  return "indefinido";
}

// Campos que chegaram nulos na mesma carga original, fora o campo do achado.
export function camposNulos(payload, campo) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return [];
  return Object.entries(payload).filter(([k, v]) => k !== campo && v === null).map(([k]) => k).sort();
}
