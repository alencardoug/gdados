// Leitura dos dados preparados no build (preparar_dados.mjs), a partir da raiz desta prova.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const pasta = join(process.cwd(), "..", "comum", "gerado", "dados");
export const ler = (nome) => JSON.parse(readFileSync(join(pasta, nome), "utf8"));
export const procedencia = ler("procedencia.json");
export const relacoes = ler("relacoes.json");
export const detalhes = () =>
  readdirSync(join(pasta, "relacao")).map((a) => JSON.parse(readFileSync(join(pasta, "relacao", a), "utf8")));
