---
resumo: >-
  No acesso por papel, as permissões são dadas a papéis, como "analista" ou "auditor", e não a
  pessoas ou processos individuais. Cada relação declara quais papéis podem lê-la.
exemplos:
  - tipo: relacao
    ref: consumption.monthly_revenue_by_channel_and_category
    nota: uma view de consumo, lida pelo papel de análise
  - tipo: relacao
    ref: quarantine.rejected_legacy_records
    nota: a quarentena, lida pela auditoria
  - tipo: relacao
    ref: raw.inventory_movements_stream
    nota: a única relação gravada pelo papel de streaming
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Conceder acesso tabela a tabela e pessoa a pessoa fica impossível de auditar. Com papéis, a pergunta
"quem lê isto?" tem uma resposta declarada, e trocar alguém de função muda o papel, não as concessões.

## Como funciona

A Política de Governança, §7, define cinco papéis, com o que cada um grava e lê:
`ingestor` (ingestão), `transformer` (transformação), `streamer` (streaming), `analyst` (análise) e
`auditor` (auditoria). A concessão de leitura é declarada por camada nos modelos e por fonte nas
*sources*, e o pacote a traz em `grants_select`, que o portal mostra como "papéis com leitura".

## O que não confundir

- **Acesso e classificação.** A [sensibilidade](../sensibilidade/) descreve o dado; o papel decide
  quem o lê. O portal não deduz uma coisa da outra.
- **Declarado e verificado.** `grants_select` é o que o projeto declara. A origem tem testes que
  conferem o acesso por execução, listados nas [verificações](../teste/); o pacote não diz, relação
  por relação, qual teste confere qual concessão.

## Como aparece neste projeto

Na fase local, os papéis são *roles* do PostgreSQL; na fase GCP eram contas de serviço e grupos do
IAM por dataset (Política de Governança, §7).
