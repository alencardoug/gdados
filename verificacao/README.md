# Verificação local do portal (E3)

Verifica o portal construído contra o pacote fixado em `origem/`, conforme o [plano](../PLANO.md), E3.
O Playwright fica aqui, fora das dependências do portal (aprovação do Owner em 17/11/2026), e usa o
Chrome instalado na máquina. Os resultados brutos ficam em `resultados/`, e o relatório, em
[docs/relatorio_e3.md](../docs/relatorio_e3.md).

| Arquivo | O que faz |
|---|---|
| `verificar.mjs` | Valida a cópia, roda os testes do portal, faz três builds (tempo e reprodutibilidade) e chama os demais |
| `estatica.mjs` | Confere `portal/dist` contra o pacote lido diretamente de `origem/`, sem o código do portal: links e âncoras, fidelidade do grafo, caminhos da receita e do estoque, terminais, itens em aberto, contagens, métricas, ambientes, segredos, busca e camada editorial |
| `navegador.mjs` | Mede no Chrome as metas de desempenho, com CPU normal e 4× mais lenta, e verifica busca, filtros, histórico, links diretos, teclado, telas de 390 px e a ida e volta das explicações |
| `servidor.mjs` | Serve `portal/dist` com gzip, como nas provas |

## Como rodar

```bash
export npm_config_cache="$PWD/.cache/npm" TMPDIR="$PWD/.cache/tmp" \
  PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright"
mkdir -p "$TMPDIR"
(cd portal && npm ci --no-audit) && (cd verificacao && npm ci --no-audit)
(cd verificacao && node verificar.mjs 5)   # 5 repetições por medida; código de saída 1 se algo falhar
```

As medições são locais, nesta máquina, e valem para a data e o commit registrados no resultado. Não
são desempenho publicado.
