---
resumo: >-
  O certificado de captura é o registro que cada sincronização da origem legada deixa, por tabela:
  contagem e assinatura do conteúdo antes e depois da cópia e o que chegou ao armazém.
exemplos:
  - tipo: relacao
    ref: governance.legacy_captures
    nota: onde os certificados ficam
  - tipo: pagina
    ref: "estrutura/#travessias"
    nota: a travessia da captura do legado
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Uma cópia pode terminar sem erro e ainda assim estar incompleta, ou pegar a origem no meio de uma
mudança. O certificado permite provar, depois, que o que chegou é o que havia na origem.

## Como funciona

Segundo a Política de Governança da origem, §6, toda sincronização do legado registra, por tabela, a
contagem e o *hash* do conteúdo da origem antes e depois da cópia, o recebido no bruto e o vínculo com
a execução. Só uma captura completa em todas as tabelas é elegível para seguir no pipeline
(ADR-0044 da origem).

## O que não confundir

O certificado fica em `governance`, fora do fluxo. A única leitura dele pelo pipeline é a dos modelos
do legado, só para saber se uma captura é elegível (Arquitetura, §2).
