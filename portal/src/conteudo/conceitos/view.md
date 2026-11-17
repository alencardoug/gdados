---
resumo: >-
  Uma view é uma consulta guardada com nome, que se lê como uma tabela. Neste projeto, as views de
  consumo são o contrato estável de leitura para análise.
exemplos:
  - tipo: relacao
    ref: consumption.monthly_revenue_by_channel_and_category
    nota: a view da P01
  - tipo: pagina
    ref: "governanca/perguntas/"
    nota: uma view por pergunta de negócio
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Quem analisa precisa de um ponto de leitura que não mude quando o pipeline muda por dentro. A view
de consumo dá esse ponto: as tabelas por trás podem ser refeitas, e o que a análise lê continua igual.

## Como funciona

A view não guarda dados: cada leitura executa a consulta (ver [materialização](../materializacao/)).
Na Arquitetura da origem, §2, a camada `consumption` só faz seleção e apresentação. É a camada que o
papel de análise lê; fora dela, ele só lê uma view de procedência do armazém em `governance`
(Política de Governança, §7).

## O que não confundir

Nem toda view é contrato: há views em `staging` que são só passos do pipeline. O contrato é o papel
da camada de consumo, não da materialização.

## Como aparece neste projeto

Cada view de consumo responde a uma pergunta de negócio e tem a montagem declarada (grão, fontes e
papel de cada coluna), mostrada na página da pergunta. Na fase GCP, a view correspondente era uma
*authorized view* em dataset próprio (Arquitetura, §5).
