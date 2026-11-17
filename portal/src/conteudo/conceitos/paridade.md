---
resumo: >-
  Paridade é a correspondência entre o ambiente local e o da nuvem: para cada conceito, o que o
  implementa em cada um. Ela permite comparar os dois sem supor que são iguais.
exemplos:
  - tipo: arquivo
    ref: "docs/arquitetura.md#5-mapa-de-paridade-local--gcp"
    nota: o mapa de paridade da origem
  - tipo: pagina
    ref: "estrutura/#ambientes"
    nota: declaração e registro datado de cada ambiente
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Um projeto desenvolvido localmente e levado à nuvem pode descobrir tarde que uma decisão local não
tem equivalente lá. O mapa de paridade obriga a responder essa pergunta antes.

## Como funciona

A Arquitetura da origem, §5, lista cada conceito (origem transacional, camada de dados, ingestão,
transformação, orquestração, transporte de eventos, controle de acesso) com a implementação local e a
da fase GCP, e diz que o mapa cumpre um princípio do projeto: nenhuma decisão local pode exigir
reprojeto na nuvem.

## O que não confundir

- **Mesmo papel, objeto diferente.** Uma camada é um schema no PostgreSQL local e um dataset no
  BigQuery; uma view de consumo local é uma *authorized view* na nuvem. O significado se mantém; a
  implementação e as garantias mudam.
- **Declarado e observado.** O mapa e o Terraform declaram o ambiente GCP. Ele foi desmontado em
  13/11/2026; o que se observou dele está no registro datado da fase GCP, não num estado atual.
