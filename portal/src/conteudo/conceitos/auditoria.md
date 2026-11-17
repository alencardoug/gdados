---
resumo: >-
  Auditoria é a verificação independente de que os dados e os processos fazem o que dizem fazer, com
  evidência guardada para quem precisar conferir depois.
exemplos:
  - tipo: pagina
    ref: "governanca/evidencias/#auditorias"
    nota: as auditorias das views de consumo
  - tipo: relacao
    ref: quarantine.rejected_legacy_records
    nota: evidência de auditoria, lida pelo papel de auditoria
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Um processo que se avalia sozinho tende a confirmar a si mesmo. A auditoria compara o resultado com
uma referência independente e preserva o que encontrou.

## Como funciona

Neste projeto, a palavra aparece em três lugares:

- **Auditoria das views:** cada view de consumo foi conferida contra critérios e uma consulta de
  referência, com o commit e os achados registrados no pacote (`view_audits`).
- **Papel de auditoria:** o `auditor` lê a quarentena e o schema `governance`, e não grava nada
  (Política de Governança, §7).
- **Evidência preservada:** a quarentena é permanente porque guarda o que foi rejeitado e o motivo
  ([retenção](../retencao/)).

## O que não confundir

Auditada não quer dizer correta para sempre: o estado vale para o commit e os critérios registrados.
