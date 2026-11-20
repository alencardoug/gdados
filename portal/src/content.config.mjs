// Camada editorial do gdados (E1; docs/pagina_de_conceitos.md §9). É conteúdo do portal, não do
// pacote: a origem continua dona das definições, e o portal, da explicação e dos percursos (D05).
import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

const grupos = defineCollection({
  loader: file("src/conteudo/grupos.yml"),
  schema: z.object({ titulo: z.string() }),
});

// Caminho de um arquivo da origem, relativo à raiz do repositório dela, com âncora opcional.
const caminhoDaOrigem = z.string().regex(/^[^/#][^#]*(#.+)?$/, "caminho relativo à raiz da origem");

const inventario = defineCollection({
  loader: file("src/conteudo/inventario.yml"),
  schema: z.object({
    titulo: z.string(),
    grupo: z.string(),
    termos: z.array(z.string()).default([]),
    definicoes: z.array(z.object({ arquivo: caminhoDaOrigem, termo: z.string() })).default([]),
    leituras: z.array(caminhoDaOrigem).default([]),
    prerequisitos: z.array(z.string()).default([]),
  }),
});

const TIPOS_DE_EXEMPLO = ["relacao", "coluna", "pergunta", "metrica", "filtro", "arquivo", "pagina"];

const conceitos = defineCollection({
  loader: glob({ pattern: "*.md", base: "src/conteudo/conceitos" }),
  schema: z.object({
    // "O que é": uma ou duas frases, em linguagem simples.
    resumo: z.string(),
    // Aplicação real: identificador do pacote ou do portal, resolvido no build.
    exemplos: z
      .array(z.object({ tipo: z.enum(TIPOS_DE_EXEMPLO), ref: z.string(), nota: z.string().optional() }))
      .default([]),
    // Exemplo didático: simplificação rotulada, sem números apresentados como medição do projeto.
    didaticos: z.array(z.object({ titulo: z.string(), texto: z.string() })).default([]),
    // Linhas reais: a amostra exportada pela origem (D06) de uma relação, com as colunas escolhidas.
    // As afirmações da nota que dependem dos dados são conferidas no build (agrupar_por, distintas_em).
    linhas_reais: z
      .array(z.object({
        relacao: z.string(),
        colunas: z.array(z.string()).min(1),
        destaque: z.array(z.string()).default([]),
        agrupar_por: z.string().optional(),
        distintas_em: z.array(z.string()).default([]),
        nota: z.string(),
      }))
      .default([]),
    // Divergência entre fontes da origem: o portal aponta e não escolhe (página de conceitos §7).
    divergencias: z
      .array(z.object({ texto: z.string(), fontes: z.array(caminhoDaOrigem).min(2), encaminhamento: z.string() }))
      .default([]),
    // Referências gerais, fora da origem.
    fontes: z.array(z.object({ titulo: z.string(), url: z.string().url().optional() })).default([]),
    revisado_em: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
});

const limitacoes = defineCollection({
  loader: file("src/conteudo/limitacoes.yml"),
  schema: z.object({
    titulo: z.string(),
    descricao: z.string(),
    onde: z.array(z.object({ rotulo: z.string(), pagina: z.string() })).min(1),
    responsavel: z.enum(["origem", "gdados"]),
    situacao: z.string(),
  }),
});

const percursos = defineCollection({
  loader: file("src/conteudo/percursos.yml"),
  schema: z.object({
    titulo: z.string(),
    objetivo: z.string(),
    passos: z.array(z.object({ rotulo: z.string(), termos: z.array(z.string()).min(1) })).min(2),
    pratica: z.array(z.object({ tipo: z.enum(TIPOS_DE_EXEMPLO), ref: z.string(), nota: z.string().optional() })).min(1),
  }),
});

// Roteiro de aprendizado (página de conceitos §10): um degrau por vez, na ordem em que o Owner avança.
const roteiro = defineCollection({
  loader: file("src/conteudo/roteiro.yml"),
  schema: z.object({
    titulo: z.string(),
    feito_em: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    objetivo: z.string(),
    introducao: z.string(),
    didatico: z.object({ titulo: z.string(), texto: z.string() }).optional(),
    termos: z.array(z.object({ id: z.string(), porque: z.string() })).min(1),
    pratica: z.array(z.object({ tipo: z.enum(TIPOS_DE_EXEMPLO), ref: z.string(), nota: z.string().optional() })).min(1),
    perguntas: z.array(z.string()).default([]),
  }),
});

// O catálogo da origem é YAML. O loader nativo mantém cada seção sob sua chave.
const catalogoLegado = defineCollection({
  loader: file("../origem/arquivos/src/mvp_ed1/legacy/catalogo.yml"),
  // O Astro expõe objetos em entry.data, inclusive para a seção escalar versao.
  schema: z.unknown().transform((value) => ({ value })),
});

export const collections = { catalogoLegado, grupos, inventario, conceitos, limitacoes, percursos, roteiro };
