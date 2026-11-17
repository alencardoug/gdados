// Copia para public/ os dados preparados e o estilo comum, servidos como arquivos estáticos.
import { cpSync, rmSync } from "node:fs";

rmSync("public", { recursive: true, force: true });
cpSync("../comum/gerado/dados", "public/dados", { recursive: true });
cpSync("../comum/cliente/estilo.css", "public/cliente/estilo.css");
