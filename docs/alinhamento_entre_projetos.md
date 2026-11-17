# Alinhamento entre projetos

| Campo | Informação |
|---|---|
| Aberto em | 13/11/2026 |
| Última revisão | 17/11/2026, com o aviso da `v2.1.0` e a resposta da origem aos itens da §7 |
| Escopo | O que o gdados espera de cada projeto vizinho e o que depende do Owner |
| Origem fixada | `mvp_eng_dados_2` na `v2.1.0` (`eb11709`), somente leitura; dono: [D03](decisoes.md#d03--pacote-e-atualização-de-metadados) |

Este arquivo reúne as pendências que envolvem mais de um projeto. Ele é um índice: cada item aponta
para o documento responsável, e as decisões continuam registradas nos respectivos donos. Quando
um item fechar, registrar a resposta no dono e marcar aqui o fechamento com data.

É também o **canal de entrada** do gdados para a origem: a sessão do `mvp_eng_dados_2` o lê no
início de cada bloco do plano dela e quando o Owner avisa (`docs/consumidores.md` §1 e §4 da
origem, em `32397cc`). A saída da origem para o gdados é esse `docs/consumidores.md`. O gdados não
escreve nos outros repositórios.

A resposta de 14/11/2026 está em
`mvp_eng_dados_2/data/medicoes/base_consumidores/avisos/resposta_gdados_20261114.md`, e o aviso da
`v2.1.0`, em `aviso_gdados_20261117.md` na mesma pasta, e a resposta aos itens de 17/11/2026, em
`resposta_gdados_20261117.md`, todos fora do Git. A fase da base dos consumidores fechou na `v2.1.0`;
a resposta abre uma fase curta de correções na origem, que terminará numa tag nova, sem data.

## 1. Direção decidida

| Ponto | Decisão | Dono |
|---|---|---|
| Fonte do portal | `mvp_eng_dados_2`, lido por commit fixado; desde 17/11/2026, a `v2.1.0` (`eb11709`) | D92 da origem; [D03](decisoes.md#d03--pacote-e-atualização-de-metadados) |
| Projeto anterior | `mvp_eng_dados_1` arquivado em `v2.0.0` (`f86b9fb`), só referência histórica | D92 da origem |
| Portais | Dois portais, um pacote: gdados e etapa 2.7 do BI, independentes (Q12, 14/11) | [D05](decisoes.md#d05--relação-com-o-portal-da-etapa-27-do-bi-como-codigo) |
| Contrato de dados | Formato 1 do pacote; o gdados não gera nem completa pacote (Q13, 14/11); pacote fixado e validado em 17/11 | [D03](decisoes.md#d03--pacote-e-atualização-de-metadados) |
| E1 | Consome o pacote da origem; o gdados define só a camada editorial | [PLANO](../PLANO.md), E1 |
| GCP | Nenhum recurso novo no GCP, em nenhum projeto (Q14, 14/11) | Consumidores §7 da origem; [D04](decisoes.md#d04--identidade-e-audiência-da-publicação) |
| Banco | O portal não lê banco | [PLANO](../PLANO.md), E1 |
| Leitura da origem | Só arquivos e `git show`/`git log`; nenhum comando do projeto | Consumidores §2 da origem; [AGENTS](../AGENTS.md) |

## 2. Decisões do Owner

| # | Pendência | Situação | Dono |
|---|---|---|---|
| A1 | Aprovar o plano (E0) | **Fechada em 14/11/2026**, após a E1 reescrita e a D05 respondida | [PLANO](../PLANO.md), E0 |
| A2 | D01: estrutura da aplicação | Autorizada em 14/11/2026 a decisão por prova local; desde 17/11/2026, contra o pacote fixado; prova a fazer | [D01](decisoes.md#d01--estrutura-da-aplicação) |
| A3 | D02: bibliotecas de diagramas | Autorizada em 14/11/2026 a prova de Mermaid com Cytoscape.js; desde 17/11/2026, com a linhagem do pacote fixado; prova a fazer | [D02](decisoes.md#d02--diagramas-e-grafos) |
| A4 | D03: forma de consumo do pacote | **Fechada em 14/11/2026:** cópia por comando local explícito, com commit e SHA-256 | [D03](decisoes.md#d03--pacote-e-atualização-de-metadados) |
| A5 | D03: esperar o pacote ou pacote provisório | **Fechada em 14/11/2026 (Q13):** nenhum dos dois; construir contra esquema e exemplo. Superada em 17/11/2026: o pacote real está fixado | [D03](decisoes.md#d03--pacote-e-atualização-de-metadados) |
| A6 | D03: pacote incompleto ou desatualizado | **Fechada em 14/11/2026:** regras do formato registradas na D03 | [D03](decisoes.md#d03--pacote-e-atualização-de-metadados) |
| A7 | D05: dois portais? Mesmo pacote? | **Fechada em 14/11/2026 (Q12):** dois portais, um pacote | [D05](decisoes.md#d05--relação-com-o-portal-da-etapa-27-do-bi-como-codigo) |
| A8 | D04: hospedagem, repositório, site, domínio e audiência | Aberta; volta ao Owner na E5, à luz da Q14 | [D04](decisoes.md#d04--identidade-e-audiência-da-publicação) |
| A9 | Fixar o pacote na `v2.1.0`, validá-lo e ler `on_zero_denominator` | **Instruída em 17/11/2026;** fixado e validado no mesmo dia; leitura do campo registrada para a E1 | [D03](decisoes.md#d03--pacote-e-atualização-de-metadados) |

## 3. Dependências do `mvp_eng_dados_2`

| # | Pendência | Situação em 17/11/2026 | Referência na origem |
|---|---|---|---|
| O1 | Gerar o pacote | **Fechada:** gerado desde 14/11/2026; fixado pelo gdados na `v2.1.0` em 17/11/2026 | `docs/pacote_de_metadados.md`; Consumidores §6 |
| O2 | Fechar nome, caminho, versão e tratamento de artefato incompleto | **Fechada em 14/11/2026:** `docs/pacote_de_metadados.json`, `format: 1`, nenhum pacote parcial, campo novo não muda o número | `docs/pacote_de_metadados.md` |
| O3 | Evidências GCP que ficaram só no `mvp_eng_dados_1` | Aberta na origem (L10): `not_available` em `eb11709`; entrada e sanitização são decisão pendente de lá | `environments` do pacote |
| O4 | Fonte da página de estrutura e ambientes | **Fechada:** `environments` em `eb11709`, nove entradas | `docs/pacote_de_metadados.md` §3 |
| O5 | Procedência do armazém | **Fechada:** `verified` em `eb11709`, build do commit `4137dc7` (L5, ADR-0054) | `docs/pacote_de_metadados.md` §3 |
| O6 | Correções de valor e texto antes do pacote | **Fechada:** feitas e anunciadas em Consumidores §5; a mudança de valor das views pelo dado regerado não foi medida view a view (Q63) | Consumidores §5 |
| O7 | Canal de volta do gdados | **Fechada em 14/11/2026:** este arquivo (entrada) e `docs/consumidores.md` (saída); achado do gdados sobre a origem recebe ID de F14 em diante | Consumidores §4 |
| O8 | Fase curta de correções e tag nova | Aberta desde 17/11/2026, sem data (P5 da origem): corrige F32, F33 e a ordem de Consumidores §5, com mudanças aditivas no formato 1. A tag será anunciada em Consumidores §6 e num aviso. O gdados não espera: desenvolve contra a `v2.1.0` e, na tag nova, refixa e revalida pela [D03](decisoes.md#d03--pacote-e-atualização-de-metadados) | `resposta_gdados_20261117.md`, §2 a §4 |

## 4. Dependências do `mvp_eng_dados_1`

| # | Pendência | Situação | Referência |
|---|---|---|---|
| H1 | Custo real da fase GCP | **Fechada:** lido em 16/11/2026; o portal o lê do `mvp_eng_dados_2`, Capacidade §2.14 | D92 e V3 da origem |
| H2 | Onde o portal lê esse custo | **Fechada em 14/11/2026 (L13):** o custo entra no mesmo dia também no `mvp_eng_dados_2`, de onde o portal o lê | Consumidores §7 |

As fotografias de 10 e 13/11 da [verificação](verificacao_de_viabilidade.md) citam commits que só
existem no `mvp_eng_dados_1`. Continuam válidas como históricas e não exigem ação.

## 5. `bi-como-codigo` e `nl_sql`

- **`bi-como-codigo`:** a Q12 vale para os dois portais. O canal do BI com a origem é próprio, e
  as escolhas do gdados não dependem do protótipo da etapa 2.3 de lá.
- **`nl_sql`:** não há dependência direta com o gdados. Os achados dele chegam ao portal pelas
  correções da origem e pelo pacote.

## 6. O que o gdados faz

| # | Ação | Situação |
|---|---|---|
| G1 | Reconferir as evidências sobre um commit fixado do `mvp_eng_dados_2` | **Feita em 14/11/2026** sobre `32397cc` ([Verificação §9](verificacao_de_viabilidade.md#9-reconferência-sobre-32397cc-14112026)) |
| G5 | Fixar o pacote na `v2.1.0` e validá-lo contra o esquema do mesmo commit | **Feita em 17/11/2026** ([Verificação §10](verificacao_de_viabilidade.md#10-pacote-fixado-na-v210-17112026)) |
| G2 | Responder à origem como consumidor do contrato | Por este arquivo, seção 7 |
| G3 | Definir como a página de ambientes exibe a evidência GCP datada e congelada | Na E1: `evidencias_gcp` aparece como indisponível enquanto a L10 estiver aberta na origem |
| G4 | E1 a E3 | Autorizadas; desde 17/11/2026 contra o pacote fixado, sem espera da origem ([PLANO](../PLANO.md), §5) |

## 7. Para a origem

Itens que o gdados encaminha à sessão do `mvp_eng_dados_2`. Cada um recebe resposta lá, pela regra
de entrada.

| Data | Item | Situação |
|---|---|---|
| 14/11/2026 | Nenhum item novo. O mapeamento de campos da E1 ainda não começou; o que faltar no formato entrará aqui | — |
| 17/11/2026 | Recebido o aviso da `v2.1.0`: pacote fixado em `eb11709`, validado contra o esquema do mesmo commit, e `on_zero_denominator` adotado na leitura. Nenhum item novo | — |
| 17/11/2026 | **Relações sem descrição, sem catraca.** Em `eb11709`, `description_gaps` lista 123 relações sem descrição (`column: null`): 70 *sources*, 49 modelos (29 em `trusted`, como `trusted.customers` e `trusted.carriers`; 19 em `staging`) e 4 *snapshots*. Nenhuma coluna declarada está sem descrição. O Dicionário de Dados §1.1 diz que "objeto sem descrição [...] bloqueia a conclusão da etapa", mas o `tests/test_descricao.py` só conta colunas (`TETO_SEM_DESCRICAO`), e a falta de descrição de relação não tem teto: pode crescer sem falhar o `check`. O "141 → 0" de Consumidores §5 é das colunas. Cabe à origem escolher entre descrever, pôr catraca ou ajustar a regra; o portal exibirá as faltas como estão | **Aceito como F32** em 17/11/2026: as 123 relações serão descritas e `tests/test_descricao.py` passará a cobrir relações com teto zero; a regra não será afrouxada. Entra na tag nova (O8) |
| 17/11/2026 | **Nota desatualizada sobre o custo do GCP.** Em `eb11709`, a entrada `registro_fase_gcp` de `environments` diz "o custo real entra quando o faturamento fechar" (`src/mvp_ed1/models/pacote.py:97`; repetida no exemplo). O custo foi lido em 16/11/2026 e está em Capacidade §2.14 (R$ 294,33 bruto, R$ 0,00 líquido), de onde Consumidores §7 manda os portais o lerem; porém `environments` não tem entrada para esse documento. Sugestão: atualizar a nota e, se a origem concordar, acrescentar a entrada. A mesma frase aparece em `docs/plano_de_desenvolvimento.md:347` | **Aceito em parte como F33** em 17/11/2026: a nota muda e `environments` ganha uma entrada para a Capacidade §2.14. O `plano_de_desenvolvimento.md:347` fica, porque a frase já é seguida de "lido em 16/11/2026: Registro §61". Entra na tag nova (O8) |
| 17/11/2026 | **Ordem em Consumidores §5 (cosmético).** A linha de 17/11/2026 de `on_zero_denominator` (`905ba9c`) aparece antes da linha de 16/11/2026 do Bloco 6 (`d4297ed`, `e1ac94f`). Não afeta a leitura do pacote | **Aceito sem ID** (cosmético) em 17/11/2026: a ordem será corrigida; um teste que a guarde depende de pergunta da origem ao Owner |
| 17/11/2026 | Resposta registrada: a origem aceitou os três itens acima e liberou o desenvolvimento da E1 à E3 contra a `v2.1.0`, sem espera. Nenhum item novo | — |
| 17/11/2026 | **Destino das chaves estrangeiras fora do pacote (L1 do [mapeamento](mapeamento_do_pacote.md#4-lacunas-do-formato-para-as-páginas)).** Em `eb11709`, os 76 testes `relationships` trazem a relação e a coluna testadas, mas não a relação e a coluna referenciadas, e as 26 PKs e 58 FKs de `analytics` (ADR-0056) não constam do pacote. A página de estrutura precisa delas para o diagrama entidade-relacionamento e não infere a ligação pelo nome do teste. Pedido: campo novo no formato 1 com o destino de cada `relationships` (relação e coluna) ou as *constraints* declaradas por relação, à escolha da origem | Aberto; aguarda resposta e ID na origem |
