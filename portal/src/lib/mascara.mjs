// Identificadores que não vão para o site (D04, avaliação da E4.5 de 18/11/2026): projetos GCP do
// Owner sem relação com o projeto de dados e números de conta de faturamento. Os textos da origem são
// copiados por commit e conferidos por SHA-256; a troca acontece só na exibição.
// Os projetos ficam aqui como SHA-256, para que o próprio repositório público não os repita.
import { createHash } from "node:crypto";

export const MARCADOR_DE_PROJETO = "[projeto não relacionado]";
export const MARCADOR_DE_FATURAMENTO = "[conta de faturamento]";

const PROJETOS_NAO_RELACIONADOS = new Set([
  "46cd020ec3397902b4a431a67f615ffcab016d99001c2c52a7d241b5c2440a29",
  "613bbb40221cd92644c86e155d18384a3362c46f4dc71d2643d2ea476b343ff2",
  "e2bff45a104b3273ebcdb0dd2fff55fe4ce65db09db6c646c6029b53ccb9cdfe",
]);

// Conta de faturamento: XXXXXX-XXXXXX-XXXXXX, inteira ou truncada com reticências.
const CONTA_DE_FATURAMENTO = /\b[0-9A-F]{6}-(?:[0-9A-F]{6}-[0-9A-F]{6}\b|[0-9A-F]{0,6}…)/g;
// Candidatos a ID de projeto: sequências de partes [a-z0-9] unidas por hífen. Um ID pode estar
// dentro de um nome maior (um bucket "run-sources-<projeto>-us-east1"), então cada trecho contíguo
// de partes é conferido.
const SEQUENCIA = /[a-z0-9]+(?:-[a-z0-9]+)+/g;
const MAX_PARTES = 8;

const sha256 = (s) => createHash("sha256").update(s).digest("hex");

function mascararSequencia(seq) {
  const partes = seq.split("-");
  const saida = [];
  let trocas = 0;
  for (let i = 0; i < partes.length; ) {
    let fim = -1;
    for (let j = Math.min(partes.length, i + MAX_PARTES); j > i + 1; j--) {
      if (PROJETOS_NAO_RELACIONADOS.has(sha256(partes.slice(i, j).join("-")))) { fim = j; break; }
    }
    if (fim < 0) { saida.push(partes[i]); i += 1; } else { saida.push(MARCADOR_DE_PROJETO); trocas += 1; i = fim; }
  }
  return { texto: trocas ? saida.join("-") : seq, trocas };
}

/** Troca os identificadores listados por marcadores; devolve o texto e o número de trocas. */
export function mascarar(texto) {
  let trocas = 0;
  let saida = texto.replace(CONTA_DE_FATURAMENTO, () => { trocas += 1; return MARCADOR_DE_FATURAMENTO; });
  saida = saida.replace(SEQUENCIA, (seq) => {
    const r = mascararSequencia(seq);
    trocas += r.trocas;
    return r.texto;
  });
  return { texto: saida, trocas };
}
