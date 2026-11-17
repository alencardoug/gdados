// Verificações estáticas da E3 sobre portal/dist, conferidas contra o pacote lido diretamente de
// origem/ — sem passar pelo código do portal, para que a fidelidade seja medida de fora.
// Cada verificação devolve { item, nome, ok, detalhe }; "item" é o número da E3 no PLANO.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const lerJson = (c) => JSON.parse(readFileSync(c, "utf8"));
const html = (dist, rota) => readFileSync(join(dist, rota.replace(/^\//, ""), "index.html"), "utf8");
const textoDe = (h) =>
  h.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ");
const relacaoDaColuna = (c) => c.split(".").slice(0, 2).join(".");

function* arquivosHtml(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const c = join(dir, e.name);
    if (e.isDirectory()) yield* arquivosHtml(c);
    else if (e.name.endsWith(".html")) yield c;
  }
}

/** Item 1: todo link interno e toda âncora apontam para algo que existe em dist/. */
function conferirLinks(dist) {
  const idsPorArquivo = new Map();
  const ids = (arquivo) => {
    if (!idsPorArquivo.has(arquivo)) {
      idsPorArquivo.set(arquivo, new Set([...readFileSync(arquivo, "utf8").matchAll(/ id="([^"]+)"/g)].map((m) => m[1])));
    }
    return idsPorArquivo.get(arquivo);
  };
  const destino = (caminho) => {
    const c = join(dist, decodeURIComponent(caminho));
    if (existsSync(c) && statSync(c).isFile()) return c;
    if (existsSync(join(c, "index.html"))) return join(c, "index.html");
    return null;
  };
  const quebrados = [];
  let total = 0;
  for (const arquivo of arquivosHtml(dist)) {
    const origemDoLink = "/" + relative(dist, arquivo).replace(/index\.html$/, "");
    for (const m of readFileSync(arquivo, "utf8").matchAll(/ (?:href|src)="([^"]+)"/g)) {
      const bruto = m[1].replace(/&amp;/g, "&");
      if (/^(https?:|data:|mailto:)/.test(bruto)) continue;
      total++;
      // Resolvido como o navegador resolve, a partir do endereço da página.
      const url = new URL(bruto, `http://portal${origemDoLink}`);
      const caminho = url.pathname;
      const ancora = url.hash ? url.hash.slice(1) : null;
      const alvo = destino(caminho);
      if (!alvo) { quebrados.push(`${origemDoLink} → ${bruto}`); continue; }
      if (ancora && alvo.endsWith(".html") && !ids(alvo).has(decodeURIComponent(ancora))) quebrados.push(`${origemDoLink} → ${bruto} (âncora)`);
    }
  }
  return { total, quebrados };
}

/** Insumos imediatos (leaves) e origens terminais recalculadas pelo caminho das folhas. */
function origensPorCaminho(L, coluna, visto = new Set()) {
  const r = L[relacaoDaColuna(coluna)]?.columns?.[coluna.split(".").slice(2).join(".")];
  if (!r || visto.has(coluna)) return new Set([coluna]);
  visto.add(coluna);
  const fim = new Set();
  for (const f of r.leaves) for (const o of origensPorCaminho(L, f, visto)) fim.add(o);
  if (!r.leaves.length) for (const o of r.origins) fim.add(o.column);
  return fim;
}

export function verificarEstatica({ dist, origem }) {
  const pacote = lerJson(join(origem, "pacote_de_metadados.json"));
  const procedencia = lerJson(join(origem, "procedencia.json"));
  const L = pacote.lineage.relations;
  const R = pacote.relations;
  const res = [];
  const add = (item, nome, ok, detalhe) => res.push({ item, nome, ok, detalhe });

  // 1. Contrato, identificadores e ligações.
  const links = conferirLinks(dist);
  add(1, "Links internos e âncoras de dist/ resolvem", links.quebrados.length === 0,
    { links_conferidos: links.total, quebrados: links.quebrados.slice(0, 50), total_quebrados: links.quebrados.length });
  const semPagina = Object.keys(R).filter((id) => !existsSync(join(dist, "governanca", "relacao", id, "index.html")));
  add(1, "Toda relação do pacote tem página", semPagina.length === 0, { relacoes: Object.keys(R).length, sem_pagina: semPagina });
  const semPergunta = Object.keys(pacote.questions).filter((id) => !existsSync(join(dist, "governanca", "pergunta", id, "index.html")));
  add(1, "Toda pergunta do pacote tem página", semPergunta.length === 0, { perguntas: Object.keys(pacote.questions).length, sem_pagina: semPergunta });

  // Grafo publicado = agregação das folhas do pacote, sem aresta a mais ou a menos (itens 2 e 9).
  const grafo = lerJson(join(dist, "dados", "grafo.json"));
  const esperado = new Map();
  for (const [destino, r] of Object.entries(L)) for (const c of Object.values(r.columns)) for (const f of c.leaves) {
    const fonte = relacaoDaColuna(f);
    if (fonte !== destino && R[fonte] && R[destino]) esperado.set(`${fonte}→${destino}`, (esperado.get(`${fonte}→${destino}`) ?? 0) + 1);
  }
  const publicado = new Map(grafo.edges.map((e) => [`${e.source}→${e.target}`, e.n]));
  const aMais = [...publicado.keys()].filter((k) => !esperado.has(k));
  const aMenos = [...esperado.keys()].filter((k) => !publicado.has(k));
  const contagemDiferente = [...esperado].filter(([k, n]) => publicado.has(k) && publicado.get(k) !== n).map(([k]) => k);
  add(2, "Nenhuma ligação fabricada no grafo por relação", !aMais.length && !aMenos.length && !contagemDiferente.length,
    { arestas: publicado.size, a_mais: aMais, a_menos: aMenos, contagem_diferente: contagemDiferente });

  // 2. Receita: a coluna de receita líquida da view da P01 chega às duas origens.
  const p01 = pacote.questions.P01;
  const receita = `${p01.view}.net_revenue_amount`;
  const porCaminho = [...origensPorCaminho(L, receita)];
  const declaradas = (L[p01.view]?.columns?.net_revenue_amount?.origins ?? []).map((o) => o.column);
  const camadasDeOrigem = [...new Set(porCaminho.map((c) => c.split(".")[0]))].sort();
  const paginaView = textoDe(html(dist, `/governanca/relacao/${p01.view}/`));
  add(2, "Receita líquida da P01 chega a raw e raw_legacy pelo caminho das folhas, igual às origens declaradas",
    camadasDeOrigem.includes("raw") && camadasDeOrigem.includes("raw_legacy") &&
      JSON.stringify([...porCaminho].sort()) === JSON.stringify([...declaradas].sort()) && declaradas.every((c) => paginaView.includes(c)),
    { coluna: receita, origens_pelo_caminho: porCaminho.sort(), origens_declaradas: declaradas.sort(), camadas: camadasDeOrigem });

  // 3. Estoque e travessias: a fato de estoque chega ao lote, ao streaming e ao legado; a travessia
  //    do streaming liga só à tabela dele; o grafo por coluna não carrega travessia.
  const estoque = new Set();
  for (const c of Object.values(L["analytics.fact_inventory_movement"]?.columns ?? {})) for (const o of c.origins) estoque.add(relacaoDaColuna(o.column));
  const travessiaStream = grafo.travessias.find((t) => t.destino === "raw.inventory_movements_stream");
  const travessiaRaw = grafo.travessias.find((t) => t.destino === "raw");
  add(3, "Estoque chega ao lote, ao streaming e ao legado; travessias sem precisão por coluna",
    estoque.has("raw.inventory_movements") && estoque.has("raw.inventory_movements_stream") && estoque.has("raw_legacy.inventory_movements") &&
      travessiaStream?.tipo === "relacao" && JSON.stringify(travessiaStream.relacoes) === '["raw.inventory_movements_stream"]' &&
      travessiaRaw?.tipo === "camada" && !travessiaRaw.relacoes.includes("raw.inventory_movements_stream"),
    { origens_da_fato: [...estoque].sort(), travessia_streaming: travessiaStream, travessia_raw: travessiaRaw && { ...travessiaRaw, relacoes: travessiaRaw.relacoes.length } });

  // 4. Coluna de seed e coluna gerada reconhecidas como terminais.
  const seedCol = Object.entries(L).flatMap(([r, x]) => Object.entries(x.columns).filter(([, c]) => c.origins.length && c.origins.every((o) => o.kind === "seed")).map(([c]) => [r, c]))[0];
  const gerCol = Object.entries(L).flatMap(([r, x]) => Object.entries(x.columns).filter(([, c]) => c.origins.length && c.origins.every((o) => o.kind === "generated")).map(([c]) => [r, c]))[0];
  // A linha da coluna vai até a próxima coluna ou o fim da tabela de colunas (há tabelas aninhadas).
  const linhaDe = (r, c) => {
    const h = html(dist, `/governanca/relacao/${r}/`);
    const i = h.indexOf(`id="coluna-${c}"`);
    const proxima = h.indexOf(' id="coluna-', i + 5);
    // A tabela de colunas é a única envolvida em div.rolagem e termina em "</tbody></table></div>";
    // as tabelas aninhadas (valores) terminam em "</table>" seguido de "</details>".
    const fimDaTabela = h.indexOf("</tbody></table></div>", i);
    const fim = proxima > 0 && proxima < fimDaTabela ? proxima : fimDaTabela;
    return h.slice(i, fim);
  };
  const linhaSeedHtml = linhaDe(...seedCol), linhaGerHtml = linhaDe(...gerCol);
  const linhaSeed = textoDe(linhaSeedHtml), linhaGer = textoDe(linhaGerHtml);
  add(4, "Seed e valor gerado aparecem como origem terminal, sem marca de ausência",
    /<span class="etiqueta">seed<\/span>/.test(linhaSeedHtml) && /<span class="etiqueta">valor gerado<\/span>/.test(linhaGerHtml) &&
      !/sem linhagem|nenhuma origem/.test(linhaSeed + linhaGer),
    { seed: `${seedCol.join(".")}: ${linhaSeed.slice(-200)}`, gerada: `${gerCol.join(".")}: ${linhaGer.slice(-200)}` });

  // 5. Itens em aberto do pacote e decisão já tomada (D66) exibidos sem reinterpretação.
  const evid = html(dist, "/governanca/evidencias/");
  const itensFaltando = pacote.open_items.filter((i) => !textoDe(evid).includes(i.id)).map((i) => i.id);
  const estadosIguais = pacote.open_items.every((i) => evid.includes(`estado ${i.state}`));
  const pend = html(dist, "/conceitos/pendencia/");
  const d66 = /href="\/origem\/docs\/pendencias\.md\/#d66--[^"]+"/.test(pend) && /id="d66--/.test(html(dist, "/origem/docs/pendencias.md/"));
  add(5, "Todos os itens de open_items com o estado do pacote; D66 lida no documento responsável",
    !itensFaltando.length && estadosIguais && d66 && pacote.open_items.every((i) => i.objects == null ? evid.includes("não declarados") : true),
    { itens: pacote.open_items.map((i) => `${i.id} ${i.state}`), faltando: itensFaltando, d66_ligada: d66 });

  // 6. Fidelidade de contagens, das regras das métricas e da comparação de infraestrutura.
  const inicio = textoDe(html(dist, "/"));
  const contagens = {
    relations: Object.keys(R).length, lineage: Object.keys(L).length, questions: Object.keys(pacote.questions).length,
    metrics: Object.keys(pacote.metrics).length, tests: Object.keys(pacote.tests).length, checks: Object.keys(pacote.checks).length,
    open_items: pacote.open_items.length, environments: pacote.environments.length,
  };
  const contagensFaltando = Object.entries(contagens).filter(([k, n]) => !new RegExp(`${k} ${n}\\b`).test(inicio)).map(([k]) => k);
  add(6, "Contagens da página inicial iguais às do pacote", !contagensFaltando.length, { contagens, divergentes: contagensFaltando });

  const met = html(dist, "/governanca/metricas/");
  const secao = (nome) => { const i = met.indexOf(`id="metrica-${nome}"`); return textoDe(met.slice(i, met.indexOf("</section>", i))); };
  const errosMetrica = [];
  for (const [nome, m] of Object.entries(pacote.metrics)) {
    const s = secao(nome);
    if (m.kind === "ratio") {
      if (m.on_zero_denominator === "returns_null" && !s.includes("returns_null")) errosMetrica.push(`${nome}: returns_null não exibido`);
      if (m.on_zero_denominator == null && !s.includes("não declarado")) errosMetrica.push(`${nome}: ausência não marcada`);
    }
    if (!s.includes(m.additivity === "additive" ? "aditiva" : m.additivity === "non_additive" ? "não aditiva" : "semiaditiva")) errosMetrica.push(`${nome}: aditividade`);
    for (const c of m.columns) if (!s.includes(c.column)) errosMetrica.push(`${nome}: coluna ${c.column}`);
  }
  const leZeroAntigo = /zero_denominator/.test(textoDe(met).replace(/on_zero_denominator/g, ""));
  add(6, "Regras das métricas fiéis ao pacote; denominador zero lido de on_zero_denominator", !errosMetrica.length && !leZeroAntigo,
    { metricas: Object.keys(pacote.metrics).length, razoes: Object.values(pacote.metrics).filter((m) => m.kind === "ratio").length, erros: errosMetrica, cita_zero_denominator: leZeroAntigo });

  const est = html(dist, "/estrutura/");
  const ambientesFaltando = pacote.environments.filter((e) => !est.includes(`id="ambiente-${e.id}"`) || !textoDe(est).includes(e.path)).map((e) => e.id);
  const indisponivel = pacote.environments.filter((e) => e.delivery === "not_available").every((e) => {
    const i = est.indexOf(`id="ambiente-${e.id}"`); return textoDe(est.slice(i, est.indexOf("</tr>", i))).includes("indisponível");
  });
  add(6, "Comparação de infraestrutura: toda entrada de environments, com o estado de entrega", !ambientesFaltando.length && indisponivel,
    { entradas: pacote.environments.length, faltando: ambientesFaltando, indisponivel_marcado: indisponivel });

  // 10. Revisão do que seria publicado: segredos e identificadores fora do escopo.
  const achados = { emails: new Set(), chaves: [], arquivos_proibidos: [], projetos_gcp: new Map() };
  const dominiosDeExemplo = /@(exemplo\.com|example\.(com|org|net))$|\.(invalid|example|test)$/;
  const PROJETOS = /\b(mvp-ed1-gcp|mvp-ed1-estudo|analisador-de-risco|da-voz-ao-produto|customer-care-prod)\b/g;
  const visitar = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const c = join(dir, e.name);
      if (e.isDirectory()) { visitar(c); continue; }
      if (/^\.env|\.tfstate|\.pem$|\.key$|credentials.*\.json$|service-account.*\.json$/.test(e.name)) achados.arquivos_proibidos.push(relative(dist, c));
      if (!/\.(html|json|js|css|txt|svg)$/.test(e.name)) continue;
      const t = readFileSync(c, "utf8");
      if (/BEGIN [A-Z ]*PRIVATE KEY/.test(t)) achados.chaves.push(relative(dist, c));
      for (const m of t.matchAll(/[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}/g)) if (!dominiosDeExemplo.test(m[0]) && !/\.(js|css)$/.test(e.name)) achados.emails.add(`${m[0]} (${relative(dist, c)})`);
      for (const m of t.matchAll(PROJETOS)) achados.projetos_gcp.set(m[1], (achados.projetos_gcp.get(m[1]) ?? new Set()).add(relative(dist, c).replace(/\/index\.html$/, "")));
    }
  };
  visitar(dist);
  add(10, "Sem segredos, chaves, arquivos proibidos ou e-mails reais em dist/",
    !achados.chaves.length && !achados.arquivos_proibidos.length && !achados.emails.size,
    { chaves: achados.chaves, arquivos_proibidos: achados.arquivos_proibidos, emails: [...achados.emails].slice(0, 20) });
  add(10, "Identificadores de projetos GCP presentes em dist/ (para a D04; não é falha)", true,
    { projetos: Object.fromEntries([...achados.projetos_gcp].map(([k, v]) => [k, [...v]])) });

  // 11. Cobertura da busca: todo termo do inventário é achado pelo título e por cada termo de busca.
  const busca = lerJson(join(dist, "dados", "busca.json"));
  const normalizar = (s) => (s ?? "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  const alvos = busca.map((e) => ({ ...e, alvo: normalizar(`${e.id} ${e.rotulo} ${e.texto ?? ""}`) }));
  const editorial = lerJson(join(dist, "dados", "editorial.json"));
  const conceitos = busca.filter((e) => e.k === "conceito");
  const naoAchados = [];
  for (const c of conceitos) {
    const termos = [c.rotulo, ...(c.texto ?? "").split(" · ")[0].split(", ").filter(Boolean)];
    for (const t of termos) {
      const partes = normalizar(t).split(/\s+/).filter(Boolean);
      if (!alvos.some((a) => a.id === c.id && a.k === "conceito" && partes.every((p) => a.alvo.includes(p)))) naoAchados.push(`${c.id}: ${t}`);
    }
  }
  add(11, "Todo termo do inventário é achado na busca pelo nome em português, pelo identificador e pelas siglas",
    !naoAchados.length && conceitos.length === editorial.termos,
    { termos: editorial.termos, explicados: editorial.explicados.length, pendentes: editorial.pendentes.length, nao_achados: naoAchados });

  // 1, 12 e 14. Camada editorial: exemplos, definições, âncoras e percursos resolvem no pacote fixado.
  add(12, "Exemplos, definições da origem, âncoras e percursos da camada editorial resolvem",
    editorial.commit === procedencia.commit && !editorial.exemplos_ausentes.length && !editorial.definicoes_ausentes.length &&
      !editorial.ancoras_ausentes.length && !editorial.limitacoes_com_pagina_ausente.length,
    { commit: editorial.commit, percursos: editorial.percursos, exemplos_ausentes: editorial.exemplos_ausentes, definicoes_ausentes: editorial.definicoes_ausentes, ancoras_ausentes: editorial.ancoras_ausentes });

  return { pacote, resultados: res };
}
