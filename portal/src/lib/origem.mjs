// Leitura da cópia da origem em ../origem/ (D03, D06): confere os SHA-256 registrados em
// procedencia.json, recusa formato diferente de 1 e valida o pacote e as amostras de registros com
// os esquemas do mesmo commit.
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

export const MARCADOR_PESSOAL = "<personal>";

/**
 * Aplica as regras da D06 às amostras de registros (ADR-0058 da origem), já lidas: formato 1,
 * esquema do mesmo commit e o que dá para conferir sem o armazém, como o check-offline da origem:
 * o conjunto de relações igual ao do pacote, as colunas iguais às declaradas, as mascaradas iguais
 * às `personal` e todo valor escalar de coluna `personal` como marcador ou nulo. Valor JSON de coluna
 * `personal` (os payloads do legado) é mascarado por folha pela origem, que prova a máscara por
 * ocorrência; o portal não a refaz. Devolve as próprias amostras.
 */
export function validarAmostras(amostras, esquema, pacote) {
  if (amostras?.format !== FORMATO_ACEITO) {
    throw new ErroDaOrigem(
      `as amostras têm format ${JSON.stringify(amostras?.format)}; o portal só lê o formato ${FORMATO_ACEITO}`,
    );
  }
  const validar = compilarEsquema(esquema);
  if (!validar(amostras)) {
    const erros = validar.errors.slice(0, 20).map((e) => `  ${e.instancePath || "/"} ${e.message}`);
    throw new ErroDaOrigem(`as amostras não seguem o esquema do mesmo commit:\n${erros.join("\n")}`);
  }
  const problemas = [];
  const doPacote = new Set(Object.keys(pacote.relations));
  const daAmostra = new Set(Object.keys(amostras.relations));
  for (const id of doPacote) if (!daAmostra.has(id)) problemas.push(`${id}: sem amostra`);
  for (const id of daAmostra) if (!doPacote.has(id)) problemas.push(`${id}: fora do pacote`);
  const iguais = (a, b) => a.length === b.length && [...a].sort().every((v, i) => v === [...b].sort()[i]);
  for (const [id, s] of Object.entries(amostras.relations)) {
    const r = pacote.relations[id];
    if (!r) continue;
    const pessoais = Object.entries(r.columns).filter(([, c]) => c.sensitivity === "personal").map(([n]) => n);
    if (!iguais(s.columns, Object.keys(r.columns))) problemas.push(`${id}: colunas diferentes das do pacote`);
    if (!iguais(s.masked_columns, pessoais)) problemas.push(`${id}: colunas mascaradas diferentes das personal`);
    if (s.rows.length > Math.min(5, s.row_count)) problemas.push(`${id}: mais linhas que o total declarado`);
    const indices = pessoais.map((n) => s.columns.indexOf(n));
    s.rows.forEach((linha, k) => {
      if (linha.length !== s.columns.length) problemas.push(`${id}, linha ${k + 1}: número de valores diferente do de colunas`);
      for (const i of indices) {
        const v = linha[i];
        if (v !== null && v !== MARCADOR_PESSOAL && typeof v !== "object") {
          problemas.push(`${id}, linha ${k + 1}: ${s.columns[i]} é personal e não está mascarada`);
        }
      }
    });
  }
  if (problemas.length) {
    const resto = problemas.length > 20 ? `\n  … e mais ${problemas.length - 20}` : "";
    throw new ErroDaOrigem(`as amostras não conferem com o pacote:\n  ${problemas.slice(0, 20).join("\n  ")}${resto}`);
  }
  return amostras;
}

let carregada;
/** Lê, confere e valida a origem uma vez por processo de build. */
export function carregarOrigem(pasta = PASTA_DA_ORIGEM) {
  if (carregada && carregada.pasta === pasta) return carregada;
  const procedencia = conferirProcedencia(pasta);
  const ler = (nome) => JSON.parse(readFileSync(join(pasta, nome), "utf8"));
  const pacote = validarPacote(ler("pacote_de_metadados.json"), ler("pacote_de_metadados.schema.json"));
  const amostras = validarAmostras(
    ler("amostras_de_registros.json"), ler("amostras_de_registros.schema.json"), pacote,
  );
  const arquivos = new Map(
    procedencia.files
      .filter((f) => f.path.startsWith("arquivos/"))
      .map((f) => [f.source_path, { ...f, local: join(pasta, f.path) }]),
  );
  carregada = { pasta, procedencia, pacote, amostras, arquivos };
  return carregada;
}
