// Ambientes lado a lado (frente de layout, rodada 10): o mapa de paridade local ↔ GCP que a origem
// mantém na Arquitetura e o que os arquivos declarativos copiados declaram (serviços dos
// docker-compose, blocos `resource` do Terraform). Tudo lido do texto fixado; nada é inventado.

// Âncora no estilo do GitHub, para achar a seção que o pacote aponta (`arquivo.md#ancora`).
export const ancoraDoTitulo = (titulo) => titulo.trim().toLowerCase()
  .replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s/g, "-");

const celulas = (linha) => linha.trim().replace(/^\|/, "").replace(/\|$/, "").split(/(?<!\\)\|/).map((c) => c.trim());

// A primeira tabela da seção cuja âncora é `ancora`. Falha se a seção ou a tabela não existirem.
export function tabelaDaSecao(markdown, ancora) {
  const linhas = markdown.split("\n");
  const inicio = linhas.findIndex((l) => /^#{1,6} /.test(l) && ancoraDoTitulo(l.replace(/^#+ /, "")) === ancora);
  if (inicio < 0) throw new Error(`paridade: seção #${ancora} não encontrada`);
  const nivel = linhas[inicio].match(/^#+/)[0].length;
  const fim = linhas.findIndex((l, i) => i > inicio && new RegExp(`^#{1,${nivel}} `).test(l));
  const secao = linhas.slice(inicio + 1, fim < 0 ? undefined : fim);
  const t = secao.findIndex((l) => l.trim().startsWith("|"));
  if (t < 0 || !/^\|?\s*:?-{3,}/.test(secao[t + 1]?.trim() ?? "")) throw new Error(`paridade: tabela ausente em #${ancora}`);
  const corpo = [];
  for (let i = t + 2; i < secao.length && secao[i].trim().startsWith("|"); i++) corpo.push(celulas(secao[i]));
  return { titulo: linhas[inicio].replace(/^#+ /, ""), cabecalho: celulas(secao[t]), linhas: corpo };
}

// Abertura curta de uma célula longa, para o cartão: o texto até a primeira pausa forte, sem
// marcação. O texto inteiro continua disponível logo abaixo (é a fonte); isto só o resume.
export function aberturaDaCelula(texto, limite = 72) {
  const plano = texto.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*`]/g, "").trim();
  const corte = [" (", "; ", ". ", ": ", " — "].map((s) => plano.indexOf(s)).filter((i) => i >= 8);
  let abertura = corte.length ? plano.slice(0, Math.min(...corte)) : plano;
  if (abertura.length > limite) abertura = abertura.slice(0, limite).replace(/\s+\S*$/, "") + "…";
  return { abertura, resumida: abertura !== plano };
}

// Serviços de um docker-compose: nome e imagem, própria ou herdada de uma âncora (`<<: *nome`).
export function servicosDoCompose(texto) {
  const linhas = texto.split("\n");
  const ancoras = new Map();
  let atual = null;
  for (const l of linhas) {
    const topo = l.match(/^[A-Za-z0-9_.-]+:\s*(?:&([A-Za-z0-9_-]+))?\s*$/);
    if (topo) { atual = topo[1] ?? null; if (atual) ancoras.set(atual, null); continue; }
    const img = atual && l.match(/^ {2}image:\s*(\S+)/);
    if (img) ancoras.set(atual, img[1]);
  }
  const ini = linhas.findIndex((l) => /^services:\s*$/.test(l));
  if (ini < 0) return [];
  const servicos = [];
  for (let i = ini + 1; i < linhas.length && !/^\S/.test(linhas[i]); i++) {
    const nome = linhas[i].match(/^ {2}([A-Za-z0-9_.-]+):\s*$/);
    if (nome) { servicos.push({ nome: nome[1], imagem: null, heranca: null }); continue; }
    const s = servicos.at(-1);
    if (!s) continue;
    const img = linhas[i].match(/^ {4}image:\s*(\S+)/);
    if (img) s.imagem = img[1];
    const her = linhas[i].match(/^ {4}<<:\s*\*([A-Za-z0-9_-]+)/);
    if (her) s.heranca = her[1];
  }
  for (const s of servicos) if (!s.imagem && s.heranca) s.imagem = ancoras.get(s.heranca) ?? null;
  return servicos;
}

// A imagem sem o digest, para leitura; o digest completo continua no título do elemento.
export const imagemLegivel = (imagem) => (imagem ? imagem.split("@")[0] : null);

// Blocos `resource "tipo" "nome"` de um arquivo Terraform, contados por tipo. Um bloco com
// `for_each` ou `count` declara várias instâncias: aqui se contam declarações, não instâncias.
export function recursosDoTerraform(texto) {
  const tipos = new Map();
  for (const [, tipo] of texto.matchAll(/^resource\s+"([^"]+)"\s+"[^"]+"/gm)) tipos.set(tipo, (tipos.get(tipo) ?? 0) + 1);
  return [...tipos].map(([tipo, n]) => ({ tipo, n })).sort((a, b) => b.n - a.n || a.tipo.localeCompare(b.tipo));
}
