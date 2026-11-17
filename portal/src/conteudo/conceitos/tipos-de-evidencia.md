---
resumo: >-
  Uma afirmação sobre os dados pode ser uma proposta, uma declaração no código, uma medição feita numa
  data ou uma verificação do ambiente atual. São graus diferentes de evidência, e o portal os distingue.
exemplos:
  - tipo: pagina
    ref: "governanca/evidencias/"
    nota: resultados de uma execução, com a data
  - tipo: pagina
    ref: "estrutura/#ambientes"
    nota: declaração e registro datado
  - tipo: pagina
    ref: "procedencia/"
    nota: o estado do armazém no momento da geração do pacote
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Um número pode parecer atual só porque está na tela. Sem dizer de onde ele vem e quando foi obtido, uma
medição antiga passa por estado de hoje, e uma intenção passa por fato.

## Como funciona

- **Proposta:** o que se pretende fazer; ainda não está no código.
- **Declaração:** o que o código ou a configuração dizem; vale enquanto o código for o mesmo.
- **Medição:** o que se observou numa execução, numa data; vale para aquela data.
- **Verificação do ambiente atual:** o que se conferiu agora, no ambiente que existe hoje.

## Como aparece neste projeto

O portal lê um pacote gerado numa data e não consulta nenhum ambiente: tudo o que mostra é declaração
ou medição datada. Os resultados de testes vêm com a data da execução, e o ambiente GCP aparece pela
declaração e pelo registro datado, porque não existe mais.
