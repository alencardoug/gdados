// Leitura da cópia da origem em ../origem/ (D03): confere os SHA-256 registrados em
// procedencia.json, recusa formato diferente de 1 e valida o pacote com o esquema do mesmo commit.
// Qualquer falha interrompe a build: não existe pacote parcial (especificação da origem, §2).
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";

// A cópia fica em <raiz do gdados>/origem/. Procurada a partir do diretório de trabalho, subindo,
// porque no bundle do Astro import.meta.url aponta para dist/. GDADOS_ORIGEM sobrepõe (testes).
function acharOrigem() {
  if (process.env.GDADOS_ORIGEM) return resolve(process.env.GDADOS_ORIGEM);
  for (let d = process.cwd(); ; d = dirname(d)) {
    if (existsSync(join(d, "origem", "procedencia.json"))) return join(d, "origem");
    if (dirname(d) === d) return join(process.cwd(), "..", "origem");
  }
}
export const PASTA_DA_ORIGEM = acharOrigem();
export const FORMATO_ACEITO = 1;

export class ErroDaOrigem extends Error {
  constructor(mensagem) {
    super(`origem: ${mensagem}`);
    this.name = "ErroDaOrigem";
  }
}

const sha256 = (dados) => createHash("sha256").update(dados).digest("hex");

/** Confere cada arquivo registrado em procedencia.json; devolve a procedência. */
export function conferirProcedencia(pasta = PASTA_DA_ORIGEM) {
  const caminho = join(pasta, "procedencia.json");
  if (!existsSync(caminho)) throw new ErroDaOrigem(`não há ${caminho}; rode scripts/copiar_pacote.sh`);
  const procedencia = JSON.parse(readFileSync(caminho, "utf8"));
  const diferentes = [];
  for (const f of procedencia.files) {
    const alvo = join(pasta, f.path);
    if (!existsSync(alvo) || sha256(readFileSync(alvo)) !== f.sha256) diferentes.push(f.path);
  }
  if (diferentes.length) {
    throw new ErroDaOrigem(`a cópia difere de procedencia.json em: ${diferentes.join(", ")}`);
  }
  return procedencia;
}

// O esquema declara um único "format", date (AAAA-MM-DD). Conferido aqui para não depender de
// ajv-formats (decisão de 17/11/2026).
const dataValida = (s) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};

/** Compila o esquema JSON Schema 2020-12 da origem. */
export function compilarEsquema(esquema) {
  // Modo estrito do ajv, menos strictTypes: o esquema usa minItems e afins dentro de if/then sem
  // repetir "type", o que o JSON Schema permite.
  const ajv = new Ajv2020({ allErrors: true, strict: true, strictTypes: false });
  ajv.addFormat("date", { type: "string", validate: dataValida });
  return ajv.compile(esquema);
}

/**
 * Aplica as regras da D03 a um pacote já lido: formato 1 e validade contra o esquema.
 * Devolve o próprio pacote; lança ErroDaOrigem com até 20 erros do esquema.
 */
export function validarPacote(pacote, esquema) {
  if (pacote?.format !== FORMATO_ACEITO) {
    throw new ErroDaOrigem(
      `o pacote tem format ${JSON.stringify(pacote?.format)}; o portal só lê o formato ${FORMATO_ACEITO}`,
    );
  }
  const validar = compilarEsquema(esquema);
  if (!validar(pacote)) {
    const erros = validar.errors.slice(0, 20).map((e) => `  ${e.instancePath || "/"} ${e.message}`);
    const resto = validar.errors.length > 20 ? `\n  … e mais ${validar.errors.length - 20}` : "";
    throw new ErroDaOrigem(`o pacote não segue o esquema do mesmo commit:\n${erros.join("\n")}${resto}`);
  }
  return pacote;
}

let carregada;
/** Lê, confere e valida a origem uma vez por processo de build. */
export function carregarOrigem(pasta = PASTA_DA_ORIGEM) {
  if (carregada && carregada.pasta === pasta) return carregada;
  const procedencia = conferirProcedencia(pasta);
  const ler = (nome) => JSON.parse(readFileSync(join(pasta, nome), "utf8"));
  const pacote = validarPacote(ler("pacote_de_metadados.json"), ler("pacote_de_metadados.schema.json"));
  const arquivos = new Map(
    procedencia.files
      .filter((f) => f.path.startsWith("arquivos/"))
      .map((f) => [f.source_path, { ...f, local: join(pasta, f.path) }]),
  );
  carregada = { pasta, procedencia, pacote, arquivos };
  return carregada;
}
