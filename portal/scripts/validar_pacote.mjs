// Valida a cópia da origem sem construir o site: SHA-256, formato e esquema (D03).
// Uso: npm run validar   (código de saída 1 se a cópia for recusada)
import { carregarOrigem, ErroDaOrigem } from "../src/lib/origem.mjs";

try {
  const { procedencia, pacote } = carregarOrigem();
  console.log(
    `pacote válido: formato ${pacote.format}, ${procedencia.repository} ${procedencia.ref} ` +
      `(${procedencia.commit.slice(0, 7)}), ${procedencia.files.length} arquivos conferidos`,
  );
} catch (e) {
  if (!(e instanceof ErroDaOrigem)) throw e;
  console.error(e.message);
  process.exit(1);
}
