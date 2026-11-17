// Servidor estático local para a verificação: serve portal/dist com gzip nos tipos de texto.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { gzipSync } from "node:zlib";

const TIPOS = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2",
};
const TEXTO = new Set([".html", ".js", ".mjs", ".css", ".json", ".svg"]);

export function servir(raiz, porta) {
  const servidor = createServer(async (req, res) => {
    try {
      let caminho = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
      if (caminho.includes("..")) throw new Error("caminho inválido");
      let arquivo = join(raiz, caminho);
      if ((await stat(arquivo).catch(() => null))?.isDirectory()) arquivo = join(arquivo, "index.html");
      let corpo = await readFile(arquivo);
      const ext = extname(arquivo);
      const cabecalhos = { "Content-Type": TIPOS[ext] ?? "application/octet-stream", "Cache-Control": "no-store" };
      if (TEXTO.has(ext) && /\bgzip\b/.test(req.headers["accept-encoding"] ?? "")) {
        corpo = gzipSync(corpo, { level: 6 });
        cabecalhos["Content-Encoding"] = "gzip";
      }
      res.writeHead(200, cabecalhos).end(corpo);
    } catch {
      res.writeHead(404).end("não encontrado");
    }
  });
  return new Promise((ok) => servidor.listen(porta, "127.0.0.1", () => ok(servidor)));
}
