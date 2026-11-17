# Decisões de implementação e publicação

Registro das decisões do portal e do seu estado. Não são ADRs aceitos. Se o Owner determinar que
uma decisão exige ADR, registrar problema, alternativas, custo, consequências e aceite antes da
implementação.

Em 14/11/2026 o Owner respondeu às pendências pelo alinhamento central feito na origem. Fonte:
`mvp_eng_dados_2/data/medicoes/base_consumidores/avisos/resposta_gdados_20261114.md` (fora do Git),
que aponta para o commit `32397cc` do `mvp_eng_dados_2`. As decisões Q12 a Q14 constam em
`PLANO_base_dos_consumidores.md` §6, rodada 4, nesse commit. Abaixo, "resposta central" designa
esse aviso.

Em 17/11/2026 o Owner instruiu fixar o pacote na `v2.1.0` da origem, validá-lo contra o esquema do
mesmo commit e passar o portal a ler `on_zero_denominator`, a partir do aviso
`mvp_eng_dados_2/data/medicoes/base_consumidores/avisos/aviso_gdados_20261117.md` (fora do Git).
Os efeitos estão na D01, na D02 e na D03.

## D01 — Estrutura da aplicação

**Estado:** decisão por prova local autorizada em 14/11/2026 (resposta central §3, A2); framework
ainda não escolhido.

**Requisito:** aplicação navegável que gere artefatos estáticos, com dados preparados antes da
execução no navegador. O destino de hospedagem depende da D04.

**Candidata:** Astro, por alinhamento com o projeto Linkedia consultado. Componentes JavaScript
interativos podem ficar restritos às áreas que os exigem. Isso não implica copiar o tema ou os
fluxos editoriais do Linkedia.

**Alternativa:** HTML/CSS/JavaScript sem framework. Avaliar manutenção de rotas, componentes,
busca, acessibilidade e build antes de optar pela menor quantidade de ferramentas.

**Como decidir:** medir as duas opções localmente contra o pacote no commit fixado (D03), hoje
`eb11709`. Até 17/11/2026 a prova seria contra o exemplo, porque o pacote ainda não estava
fixado. A escolha é independente do protótipo da etapa 2.3 do `bi-como-codigo`, porque são dois
portais (D05).

**Pendente:** executar a prova, registrar as medições e a escolha.

## D02 — Diagramas e grafos

**Estado:** prova de Mermaid com Cytoscape.js autorizada em 14/11/2026 (resposta central §3, A3);
nenhuma biblioteca adotada ainda.

**Requisito do Owner:** recursos suficientes de diagramação, ilustração e esquemas via código,
evitando figuras estáticas.

**Candidatas complementares:**

- Mermaid para fluxos, arquitetura e entidade-relacionamento declarativos. O projeto de dados
  já possui diagramas gerados nesse formato.
- Cytoscape.js para explorar a linhagem como grafo, com zoom, deslocamento, seleção, agrupamento
  e layouts automáticos. A expansão de nós e os filtros do produto serão comportamento da aplicação.

Antes de adotar, comprovar localmente legibilidade e desempenho com recortes do grafo real,
compatibilidade com a aplicação escolhida e navegação alternativa por lista/tabela. O suporte a
exportação vetorial e as eventuais extensões precisam ser avaliados por biblioteca; não se presume
que todo recurso exista no núcleo delas.

**Insumos da prova:** desde 17/11/2026, o pacote no commit fixado (D03), para legibilidade e
desempenho. A seção `lineage` traz 200 relações e 3.019 colunas
([Verificação §10.2](verificacao_de_viabilidade.md#102-o-que-o-pacote-declara)). A cópia datada
`linhagem_20261113.json`, prevista em 14/11/2026 só para o desempenho enquanto o pacote não estava
fixado, deixa de ser necessária.

Fontes primárias consultadas em 10/11/2026:

- [Sintaxe do Mermaid](https://mermaid.js.org/intro/syntax-reference).
- [Acessibilidade do Mermaid](https://mermaid.js.org/config/accessibility).
- [Documentação do Cytoscape.js](https://js.cytoscape.org/index.html).

**Pendente:** executar a prova; confirmar a combinação ou registrar alternativa que cumpra os
mesmos critérios.

## D03 — Pacote e atualização de metadados

**Estado:** decidida em 14/11/2026 (resposta central §1 e §3, A4 a A6). Em 17/11/2026, o pacote foi
fixado na `v2.1.0` da origem, por instrução do Owner. A implementação está pendente na E1.

**Contrato:** o formato 1 do pacote da origem, especificado antes da geração por decisão do Owner
(Q13) e gerado pela origem desde 14/11/2026.

**Commit fixado:** `eb11709`, tag `v2.1.0` do `mvp_eng_dados_2`, o fechamento da fase da base dos
consumidores. A origem o marca em `docs/consumidores.md` §6 como o marco a preferir; o aviso dela é
`data/medicoes/base_consumidores/avisos/aviso_gdados_20261117.md`, fora do Git. O commit anterior,
`32397cc`, só publicava a especificação, o esquema e o exemplo. A validação de 17/11/2026 e o
inventário do pacote estão na [Verificação §10](verificacao_de_viabilidade.md#10-pacote-fixado-na-v210-17112026).

| Arquivo da origem em `eb11709` | O que é |
|---|---|
| `docs/pacote_de_metadados.json` | O pacote, fonte do portal |
| `docs/pacote_de_metadados.schema.json` | Esquema JSON Schema 2020-12; o pacote é validado com o **deste** commit |
| `docs/pacote_de_metadados.md` | Especificação: campos, regras que o consumidor pode presumir, o que a versão 1 não leva |
| `docs/pacote_de_metadados.exemplo.json` | Recorte ilustrativo de 13/11/2026; não é regenerado. Serve a testes de mecanismo, não a conteúdo exibido |

O site deve funcionar sem conexão com bancos ou credenciais no navegador.

A geração e o gatilho pertencem à origem (D91 de lá, herdada pelo `mvp_eng_dados_2`). O gdados
não gera pacote nem o completa: o que faltar no formato para alguma página é pedido à origem pelo
[arquivo de alinhamento](alinhamento_entre_projetos.md), e a origem acrescenta o campo sem quebrar o
formato. Trocar o commit fixado é decisão registrada aqui, depois de validar o pacote novo.

**Distribuição (A4):** cópia para o gdados por **comando local explícito**, que lê o commit fixado
com `git show` e registra ao lado o commit e o SHA-256 de cada arquivo. Copiam-se o pacote e o
esquema; o exemplo, se servir aos testes. Ficam descartados a leitura do checkout da origem durante
o build, a leitura de `dbt/target/` e o artefato de release com hash.

**Pacote incompleto ou desatualizado (A6):** regras do formato (especificação §2) que o portal aplica:

- `format` diferente de `1` recusa o build;
- o pacote é validado com o esquema **do mesmo commit**;
- `null` é exibido como **ausente**, nunca como zero ou texto vazio;
- `result: null` de um teste ou de um `check` é exibido como **sem resultado**;
- `provenance.warehouse.status` é exibido como está: `verified`, com commit e data do build, ou
  `not_verified`, com o motivo;
- a data dos artefatos e o commit fixado ficam sempre visíveis;
- a chave desconhecida é ignorada.

A especificação também garante que não existe pacote parcial e que campo novo não muda o número do
formato.

**Denominador zero das métricas (17/11/2026):** o portal lê `metrics.*.on_zero_denominator`:
`"returns_null"` diz que a razão resulta nula quando o denominador é zero; `null` diz que o caso não
se aplica (medida, diferença), e não deve ser exibido como ausência de informação. O
`zero_denominator` antigo **não é lido**: a origem o mantém só por compatibilidade e o retira no
próximo formato, que o portal recusará até ser adaptado.

**Conteúdo:** em `eb11709`, o formato 1 traz `provenance`, `relations` (com `grain` e
`grants_select`), `lineage` (o `lineage --json` sem alteração), `crossings`, `questions`,
`metrics`, `filters`, `view_rules`, `description_gaps`, `tests`, `checks` (resultados do `pytest`),
`open_items` (decisões e verificações em aberto), `view_audits` e `environments`. Continuam fora:
o texto de documentos, ADRs e glossário, os objetos tocados por item em aberto
(`open_items.*.objects` é `null`, e o portal não infere) e as evidências do GCP. O portal lê os
textos por commit fixado e mostra o resto como indisponível. Decisão já tomada na origem, como a
D66 (ADR-0053), não está em `open_items`: é lida no documento responsável. Mudanças de valor ou
texto que o portal exibe são anunciadas em `docs/consumidores.md` §5 da origem.

**Evidências GCP:** registradas pela origem como L10. Em `eb11709` aparecem como `not_available` em
`environments` (`evidencias_gcp`); se entram e como são sanitizadas, é decisão pendente da origem.

**Próxima troca do commit fixado:** a resposta da origem de 17/11/2026
(`resposta_gdados_20261117.md`, fora do Git) anuncia uma fase curta de correções que termina numa
tag nova, sem data, com mudanças aditivas no formato 1: `description_gaps` sem relações faltando
(F32); entrada nova em `environments` para a Capacidade §2.14 e nota de `registro_fase_gcp`
atualizada (F33); `view_audits` com os ids das verificações em `checks`; na especificação, a chave
de uma view como a união das colunas `grain` e `identity` de `view_rules`, com
`relations.*.grain` nulo nas views; e `open_items` com outra composição (saem D63, D64, V5, V6 e
V7; entra a D93). Quando a tag for anunciada em Consumidores §6, o gdados refixa por este comando e
valida contra o esquema do mesmo commit. Até lá, o commit fixado continua `eb11709`.

**Leitura que não precisa ser refeita (resposta da origem, §3):**

- `description_gaps`, `environments`, `open_items` e as demais coleções são lidas com tamanho e
  identificadores variáveis; nenhuma contagem ou ID do pacote de hoje é fixado no código ou no texto
  editorial;
- campo novo do formato 1 que o portal não usa é tolerado, conforme as regras acima.

**Pendente:** implementar na E1 o comando de cópia, a validação e o tratamento acima. A validação
de 17/11/2026 foi avulsa e não escolhe a ferramenta do comando, que acompanha a D01.

## D04 — Identidade e audiência da publicação

**Estado:** pendente do Owner até a E5; conflito com a Q14 registrado em 14/11/2026.

**Diretriz de 10/11/2026:** GitHub → Firebase Hosting, seguindo o padrão do Linkedia, depois das
verificações e da avaliação locais.

**Conflito com a Q14:** o Owner decidiu em 14/11/2026 que não se cria **nenhum recurso novo no
GCP**, em nenhum projeto. Um projeto Firebase é um projeto GCP. Quando a E5 chegar, a D04 volta ao
Owner à luz da Q14: usar um projeto que já existe, outra hospedagem ou uma exceção à Q14. Nada a
fazer antes disso.

**Pendente:** hospedagem, repositório GitHub, identificação do site, domínio, audiência,
permissões do workflow e forma de aceite para publicar. O usuário citar o Linkedia não autoriza
reutilizar suas contas, seus recursos ou seus vínculos IAM.

A escolha entre acesso público e restrito afeta a solução de publicação; não assumir uma audiência.

## D05 — Relação com o portal da etapa 2.7 do `bi-como-codigo`

**Estado:** decidida pelo Owner em 14/11/2026 (Q12).

**Decisão:** **dois portais, um pacote.**

- O gdados mantém o escopo do próprio [plano](../PLANO.md), e a etapa 2.7 do BI mantém o dela.
- Os dois leem **só** o pacote da origem. A parte comum (catálogo, perguntas, vocabulário e
  linhagem) nasce do mesmo pacote e não diverge.
- Os dois andam de forma independente; nenhum espera o outro publicar.

**Consequência para o gdados:** o que for específico do gdados, como a camada editorial da página
de conceitos (E1), não vira requisito do pacote nem do portal do BI.
