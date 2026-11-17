// Filtros do catálogo. O estado fica na URL (?camada=…&dominio=…), para que um link direto e o
// botão voltar devolvam o mesmo recorte (PLANO §2.1; página de conceitos §2).
export function iniciarFiltros(form, linhas, situacao) {
  const campos = [...form.elements].filter((e) => e.tagName === "SELECT");
  const params = new URLSearchParams(location.search);
  for (const c of campos) if (params.has(c.name)) c.value = params.get(c.name);

  const aplicar = () => {
    let n = 0;
    for (const tr of linhas) {
      const visivel = campos.every((c) => {
        if (!c.value) return true;
        const v = tr.dataset[c.name] ?? "";
        return c.name === "sensibilidade" ? v.split(" ").includes(c.value) : v === c.value;
      });
      tr.hidden = !visivel;
      if (visivel) n++;
    }
    situacao.textContent = `${n} de ${linhas.length} relações.`;
    const url = new URL(location.href);
    for (const c of campos) {
      if (c.value) url.searchParams.set(c.name, c.value);
      else url.searchParams.delete(c.name);
    }
    history.replaceState(history.state, "", url);
  };
  form.addEventListener("change", aplicar);
  form.addEventListener("reset", () => setTimeout(aplicar));
  form.addEventListener("submit", (e) => e.preventDefault());
  aplicar();
}
