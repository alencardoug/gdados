// Sem seleção, o grafo mantém a abertura por todas as colunas da relação, como antes.
export function columnsInFocus(requested, available) {
  const names = new Set(available);
  return requested.length ? [...new Set(requested)].filter((name) => names.has(name)) : [...names];
}
