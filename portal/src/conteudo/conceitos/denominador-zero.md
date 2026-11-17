---
resumo: >-
  Uma razão divide uma medida por outra. Quando o denominador é zero, a divisão não tem resultado,
  e a métrica precisa de uma regra explícita para esse caso.
exemplos:
  - tipo: metrica
    ref: on_time_rate
    nota: entregas no prazo divididas pelas entregas
  - tipo: metrica
    ref: average_order_value
didaticos:
  - titulo: Uma transportadora sem entregas no mês
    texto: >-
      Se uma transportadora não entregou nada num mês, a taxa de entrega no prazo é zero dividido
      por zero. Mostrar 0% diria que todas as entregas atrasaram, o que é falso: não houve entrega.
      Um resultado nulo diz que a taxa não existe naquele mês.
fontes: []
revisado_em: "2026-11-17"
---

## Qual problema resolve

Sem uma regra, cada ferramenta faz uma coisa diferente com a divisão por zero: dá erro, devolve
zero ou devolve nulo. Zero é o caso perigoso, porque parece um resultado legítimo.

## Como funciona

Neste projeto, cada razão declara o que acontece com o denominador zero no campo
`on_zero_denominator`. O valor `returns_null` diz que a métrica dá nulo. Nas medidas e nas
diferenças, que não dividem, o campo vem nulo, e isso quer dizer "não se aplica".

## O que não confundir

- **Nulo não é zero.** Um nulo numa taxa diz que não havia base para calculá-la; um zero diz que a
  base existia e o numerador foi zero.
- **"Não se aplica" não é informação ausente.** Na página de métricas, uma medida sem regra de
  denominador zero não está incompleta: ela não divide nada.

## Escolha e limites do projeto

O pacote ainda traz um campo antigo, `zero_denominator`, mantido só por compatibilidade e que sai
no próximo formato. O portal lê apenas `on_zero_denominator`.
