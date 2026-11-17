// Portal gdados (D01): saída estática, uma pasta por rota, dados preparados no build.
// A base de publicação depende da D04; enquanto isso, a raiz.
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
  devToolbar: { enabled: false },
});
