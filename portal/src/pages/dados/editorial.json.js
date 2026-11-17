// Relatório da camada editorial, gerado no build: o que o conteúdo do portal cita e não está no
// pacote fixado ou na cópia da origem. Lido pelos testes e pela verificação da E3 (itens 1, 11 e 14).
import { termos, exemplosAusentes, definicoesAusentes, ancorasAusentes, limitacoes, percursos } from "../../lib/editorial.mjs";
import { procedencia } from "../../lib/portal.mjs";

export function GET() {
  const corpo = {
    commit: procedencia.commit,
    ref: procedencia.ref,
    termos: termos.length,
    explicados: termos.filter((t) => t.escrito).map((t) => t.id),
    pendentes: termos.filter((t) => !t.escrito).map((t) => t.id),
    com_divergencia: termos.filter((t) => t.divergencias.length).map((t) => t.id),
    limitacoes: limitacoes.map((l) => l.id),
    percursos: percursos.map((p) => p.id),
    limitacoes_com_pagina_ausente: limitacoes.flatMap((l) => l.onde.filter((o) => !o.existe).map((o) => `${l.id}: ${o.pagina}`)),
    exemplos_ausentes: exemplosAusentes,
    definicoes_ausentes: definicoesAusentes,
    ancoras_ausentes: ancorasAusentes,
  };
  return new Response(JSON.stringify(corpo, null, 2), { headers: { "Content-Type": "application/json" } });
}
