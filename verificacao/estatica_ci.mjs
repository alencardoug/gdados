// Verificações estáticas da E3 para o CI (E5): só estatica.mjs, sem navegador. As medidas de
// desempenho no Chrome continuam locais (verificar.mjs), porque dependem da máquina.
import { verificarEstatica } from "./estatica.mjs";

const { resultados: r } = await verificarEstatica({ dist: "../portal/dist", origem: "../origem" });
const falhas = r.filter((x) => !x.ok);
for (const x of r) console.log(`${x.ok ? "ok   " : "FALHA"} ${x.item}. ${x.nome}`);
console.log(`${r.length} verificações, ${falhas.length} falhas`);
process.exit(falhas.length ? 1 : 0);
