// Prova da D01: saída estática, uma pasta por rota.
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
});
