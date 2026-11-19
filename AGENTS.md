# Instruções para agentes — gdados

Caixa de correio: ao iniciar a sessão, leia @alinhamento.md; se houver aviso depois de "a partir daqui", leu, atua, apaga (regras no próprio arquivo).

## Antes de trabalhar

Leia [README.md](README.md), [PLANO.md](PLANO.md) e [docs/decisoes.md](docs/decisoes.md).
O pedido vivo do Owner define o trabalho: avaliar um plano não autoriza implementar a aplicação.

## Limite de escrita

- Toda escrita deste trabalho, inclusive planos, rascunhos, resultados, caches e artefatos, fica
  dentro de `/home/doug/Projetos/gdados`.
- O `mvp_eng_dados_2` (fonte vigente, lida por commit fixado), o `mvp_eng_dados_1` (arquivado,
  referência histórica) e o Linkedia são fontes somente para leitura.
- Não executar comandos nesses projetos que gerem logs, atualizem caches, compilem modelos,
  modifiquem bancos ou acionem infraestrutura. Ler arquivos existentes é permitido. No
  `mvp_eng_dados_2`, usar só leitura de arquivos e `git show`/`git log`; nenhum comando do projeto,
  nem os que parecem só ler (`docs/consumidores.md` §2 da origem).
- Se faltar uma exportação da origem, registrar a dependência e encaminhar a necessidade ao Owner.
- Exceção (Owner, 18/11/2026): avisos a outros projetos vão para o `alinhamento.md` da raiz deles,
  acrescentados ao fim, conforme a nota de uso do próprio arquivo. É a única escrita permitida fora
  do gdados.
- Não desfazer alterações de outras sessões. Desfazer somente alterações próprias identificadas.

## Estado da autorização

Em 14/11/2026 o Owner fechou a E0 e autorizou as provas locais da D01 e da D02, a E1 como
consumidora do formato da origem e a E2. Em 17/11/2026 fixou o pacote da origem na `v2.1.0`; as
provas e as etapas passam a usar o pacote do commit fixado na D03. No mesmo dia, a resposta da
origem, a pedido do Owner, liberou a E1 à E3 contra esse pacote, sem esperar a tag seguinte. Em 17/11/2026 a E3 foi
feita e a E4 começou; os pedidos da avaliação, como o roteiro de aprendizado, que aguarda o "pode
fazer" do Owner, estão no PLANO, E4. Em 18/11/2026 o Owner
criou, como exceção à Q14, o projeto "Extras" (`extras-douglas-alencar`, sem faturamento) e o site
`governadados.web.app`. No mesmo dia autorizou a E5: repositório público `alencardoug/gdados` e
deploy sem chave a cada push no `main`, depois do build e dos testes (D04). Fora isso, não há recurso
novo autorizado no GCP (Q14), e o "Extras" não deve ser ligado a uma conta de faturamento. Os registros estão em
[docs/decisoes.md](docs/decisoes.md).

## Fontes e evidências

- Português brasileiro em documentos, comentários e textos da interface; inglês nos identificadores
  de código e nos nomes técnicos existentes das fontes.
- Não inventar métricas, contagens, resultados de testes ou relações de linhagem.
- Distinguir: proposto, declarado em código, medido em uma data e verificado no ambiente atual.
- Metadados gerados devem informar origem, commit, ambiente, data do artefato e data da exportação.
- Não transformar a classificação de sensibilidade em decisão de exposição ou permissão.
- Não apresentar uma coluna gerada ou uma seed como quebra de linhagem.
- Preservar limitações e decisões pendentes do projeto de dados; o portal não as resolve por conta própria.
- Não copiar segredos, arquivos `.env`, estados Terraform ou credenciais para o portal. Amostras de
  registros só entram como exportação versionada da origem, lida por commit e nas condições da
  [D06](docs/decisoes.md#d06--amostras-de-registros-no-portal) (exceção aberta pelo Owner em
  18/11/2026); nunca lidas de banco.

## Diagramas

Diagramas, esquemas e ilustrações devem ser definidos por código ou dados declarativos. Não usar
figuras estáticas como fonte de verdade. Derivar relações dos artefatos responsáveis e oferecer
uma alternativa textual ou tabular à visualização interativa.

Em 17/11/2026 o Owner adotou Astro (D01) e Mermaid com Cytoscape.js (D02), com as condições
registradas em `docs/decisoes.md`. Outras bibliotecas e extensões continuam dependendo de decisão.

## Mudanças e validação

- Não adicionar dependências ou provisionar serviços antes das decisões pertinentes do Owner.
  Astro, Mermaid e Cytoscape.js estão adotados (D01, D02); as provas instalam candidatas só dentro
  de `provas/`, sem que isso seja adoção.
- Caches, temporários e downloads de ferramentas ficam em `.cache/` (variáveis em `provas/README.md`).
- Validar a aplicação localmente antes de propor a publicação.
- Publicar só pelo workflow `.github/workflows/deploy.yml` (push no `main`). Criar projetos cloud ou
  mudar IAM continua dependendo do Owner (D04).
- Cada assunto tem um dono documental; não manter a mesma regra em vários arquivos.
- Se houver commits, usar Conventional Commits com descrição em português e um assunto por commit.
