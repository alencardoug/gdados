---
resumo: >-
  Terraform é uma ferramenta de infraestrutura como código: a infraestrutura de nuvem é declarada em
  arquivos, e a ferramenta cria, altera ou destrói os recursos para que fiquem como declarado.
exemplos:
  - tipo: arquivo
    ref: terraform/
    nota: a infraestrutura GCP declarada pela origem
  - tipo: pagina
    ref: "estrutura/#ambientes"
    nota: declaração congelada e o registro datado da fase GCP
fontes:
  - titulo: "Documentação do Terraform"
    url: "https://developer.hashicorp.com/terraform/docs"
revisado_em: "2026-11-17"
---

## Qual problema resolve

Infraestrutura criada à mão no console é difícil de reproduzir, revisar e desmontar. Declarada em
código, ela passa por revisão, fica versionada e pode ser recriada ou destruída de forma controlada.

## Como funciona

Os arquivos declaram os recursos (rede, banco, armazém, permissões). A ferramenta compara a declaração
com o que existe, mostra o plano de mudanças e o aplica. O estado de execução da ferramenta é guardado
à parte e não é copiado para o portal.

## Escolha e limites do projeto

O Terraform da origem é **declaração**: os recursos foram destruídos em 13/11/2026, como registra o
pacote. O que se observou deles enquanto existiam está no registro da fase GCP, com datas. O portal
não executa o Terraform nem consulta a nuvem.
