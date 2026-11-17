// Capturas de tela das provas para avaliar a legibilidade (D02). Uso: node capturar.mjs <candidata>
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { servir } from "./servidor.mjs";

const aqui = dirname(fileURLToPath(import.meta.url));
const candidata = process.argv[2] ?? "d01-astro";
const saida = join(aqui, "capturas", candidata);
mkdirSync(saida, { recursive: true });
const servidor = await servir(join(aqui, "..", candidata, "dist"), 4400);
const navegador = await chromium.launch({ channel: "chrome" });
const pagina = await navegador.newPage({ viewport: { width: 1280, height: 900 } });
const casos = [
  ["linhagem_relacao", "/linhagem/?r=consumption.monthly_revenue_by_channel_and_category", "linhagemPronta"],
  ["linhagem_tudo", "/linhagem/?modo=tudo", "linhagemPronta"],
  ["linhagem_coluna", "/linhagem/?modo=coluna&r=analytics.fact_shipment_item", "linhagemPronta"],
  ["linhagem_coluna_acima_do_limite", "/linhagem/?modo=coluna&r=trusted.legacy_records", "linhagemPronta"],
  ["travessias", "/travessias/", "travessiasProntas"],
  ["relacao", "/relacao/consumption.monthly_revenue_by_channel_and_category/", null],
];
for (const [nome, rota, pronto] of casos) {
  await pagina.goto(`http://127.0.0.1:4400${rota}`);
  if (pronto) await pagina.waitForFunction((k) => document.documentElement.dataset[k] === "1", pronto);
  await pagina.screenshot({ path: join(saida, `${nome}.png`) });
}
await navegador.close();
servidor.close();
console.log(`capturas em ${saida}`);
