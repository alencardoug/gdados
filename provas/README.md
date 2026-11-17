# Provas da D01 e da D02

Provas locais das candidatas da [D01](../docs/decisoes.md#d01--estrutura-da-aplicação) (estrutura da
aplicação) e da [D02](../docs/decisoes.md#d02--diagramas-e-grafos) (diagramas e grafos), contra a cópia
do pacote em `origem/`. As dependências instaladas aqui servem só às provas e não são adoção
(AGENTS.md). Os resultados e a análise ficam na D01 e na D02; os números brutos, em
`medicao/resultados/`.

| Pasta | O que é |
|---|---|
| `comum/preparar_dados.mjs` | Prepara os mesmos dados para as duas candidatas (`comum/gerado/`, ignorado pelo Git) |
| `comum/cliente/` | Busca, linhagem (Cytoscape.js) e travessias (Mermaid), usados pelas duas candidatas |
| `d01-html/` | Candidata sem framework: `construir.mjs` gera as páginas com template literals |
| `d01-astro/` | Candidata Astro: as mesmas páginas como componentes e rotas |
| `medicao/` | Playwright com o Chrome instalado: `medir.mjs` mede contra as metas do PLANO, E3, item 9; `capturar.mjs` gera capturas para avaliar a legibilidade |

## Como repetir

Os caches e arquivos temporários ficam em `.cache/`, dentro do gdados:

```bash
export npm_config_cache="$PWD/.cache/npm" TMPDIR="$PWD/.cache/tmp" ASTRO_TELEMETRY_DISABLED=1 \
  PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright"
mkdir -p "$TMPDIR"
for p in provas/d01-html provas/d01-astro provas/medicao; do (cd "$p" && npm ci --no-audit); done
(cd provas/d01-html && npm run build) && (cd provas/d01-astro && npm run build)
(cd provas/medicao && node medir.mjs 5 && node capturar.mjs d01-astro)
```

O `medir.mjs` refaz cada build três vezes e abre as páginas com cache desligado, com CPU normal e
4× mais lenta.
