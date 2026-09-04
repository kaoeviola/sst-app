# Tasks — Geração assistida de APR por agentes LLM

## Projeto

- Nome: Geração assistida de APR por agentes LLM
- SPEC: `docs/specs/apr-llm/spec.md`
- Plano tecnico: `docs/specs/apr-llm/plan.md`

## Regras

- Executar uma task por vez.
- Antes de alterar arquivos, explicar a mudanca.
- Nao misturar mudancas de API, banco, agentes e testes na mesma task quando puder separar.
- Mudancas em banco, auth, RLS, env vars, storage, permissoes e dependencias exigem confirmacao explicita.
- Ao final de cada task, listar arquivos alterados, como testar, riscos e pendencias.

## Task 1: Ajustar contrato publico da API

- Objetivo: garantir que a API nao exponha metadados internos e sempre retorne o aviso obrigatorio de revisao humana.
- Arquivos envolvidos: `src/app/api/ia/gerar-apr/route.ts`
- Criterio de conclusao: resposta de sucesso contem `success`, `status: "RASCUNHO_IA"`, `aviso`, `analise`, `apr`, `revisaoAutomatizada` e `errosValidacao`; resposta publica nao contem custo, tokens, modelo, provider ou latencia.
- Como testar: chamar a rota com entrada valida e conferir o JSON retornado; chamar com input invalido e conferir erro seguro.
- Risco: medio, porque altera contrato de API consumido pelo frontend.
- Precisa de confirmacao antes de executar: sim, por alterar API publica.
- Status: concluida
- Nota de execucao: a rota publica foi ajustada para remover `custoTotalUSD`, remover `latenciaTotalMs`, nao expor metadados internos, adicionar `status: "RASCUNHO_IA"` e adicionar o aviso obrigatorio de revisao humana.

## Task 2: Padronizar erros seguros da API

- Objetivo: garantir respostas seguras para usuario nao autenticado, input invalido e falha tecnica.
- Arquivos envolvidos: `src/app/api/ia/gerar-apr/route.ts`
- Criterio de conclusao: erros nao retornam stack trace, detalhes crus de provider, custo, tokens, modelo ou informacoes sensiveis.
- Como testar: simular ausencia de sessao, body invalido e falha controlada do orquestrador.
- Risco: baixo a medio, porque muda mensagens de erro.
- Precisa de confirmacao antes de executar: sim, por alterar API publica.
- Status: pendente

## Task 3: Revisar semantica de success e status

- Objetivo: alinhar `success: true` ao significado aprovado: rascunho valido gerado com validacao minima, sem aprovacao oficial.
- Arquivos envolvidos: `src/lib/agents/apr/orquestrador-apr.ts`, possivelmente `src/app/api/ia/gerar-apr/route.ts`
- Criterio de conclusao: o retorno diferencia rascunho gerado, validacoes automatizadas e aprovacao humana pendente.
- Como testar: gerar APR com revisao automatizada sem erros criticos e com erros de validacao, verificando semantica do retorno.
- Risco: medio, porque mexe no comportamento central da feature.
- Precisa de confirmacao antes de executar: sim, por alterar agentes e contrato de resposta.
- Status: concluida
- Nota de execucao: executada nesta rodada operacional como Task 2; o retorno agora separa `rascunhoGerado`, `aprovadoRevisaoAutomatizada`, `requerRevisaoHumana` e problemas/pendencias da revisao automatizada, sem expor custo, latencia ou metadados internos.

## Task 4: Revisar revisao automatizada como apoio, nao aprovacao

- Objetivo: impedir que revisao deterministica ou LLM seja apresentada como aprovacao oficial.
- Arquivos envolvidos: `src/lib/agents/apr/orquestrador-apr.ts`, `src/lib/agents/revisor/*`
- Criterio de conclusao: revisoes automatizadas retornam problemas, avisos ou validacoes, mas nao transformam o rascunho em documento aprovado.
- Como testar: caso com problema critico deve retornar rascunho e validacoes claras, sem status de aprovado.
- Risco: medio, por envolver interpretacao de seguranca do trabalho.
- Precisa de confirmacao antes de executar: sim, por alterar agentes.
- Status: pendente

## Task 5: Confirmar modelo de logs LLM antes de alterar banco

- Objetivo: revisar se os metadados aprovados exigem ou nao mudanca em Prisma/migration.
- Arquivos envolvidos: `prisma/schema.prisma`, `prisma/migrations/20260616143818_add_llm_call_log/`
- Criterio de conclusao: decisao registrada sobre campos, indices, FKs, retencao e se a migration atual pode seguir.
- Como testar: nao executar migration; apenas revisar schema proposto e comparar com metadados aprovados.
- Risco: alto, porque envolve banco.
- Precisa de confirmacao antes de executar: sim, obrigatoria por envolver banco/Prisma/migration.
- Status: pendente

## Task 6: Ajustar persistencia de logs LLM

- Objetivo: garantir que apenas metadados aprovados sejam salvos e que falhas de log nao exponham erro sensivel ao usuario.
- Arquivos envolvidos: `src/lib/agents/core/persistence.ts`, possivelmente `src/lib/agents/core/base-agent.ts`
- Criterio de conclusao: persistencia nao recebe prompt completo, resposta completa ou conteudo integral da APR; erro de log e tratado de modo seguro.
- Como testar: simular sucesso e falha de log, garantindo que a API continua com resposta segura.
- Risco: medio a alto, porque envolve logs, privacidade e banco.
- Precisa de confirmacao antes de executar: sim, por envolver logs LLM e possivelmente banco.
- Status: concluida
- Nota de execucao: mensagens brutas de SDK/provedor nao sao mais persistidas em `errorMessage`; erros sao classificados em codigos seguros curtos e falhas de persistencia de log nao imprimem objeto/payload bruto no console.

## Task 7: Revisar dados enviados para provedores LLM

- Objetivo: reduzir contexto enviado ao minimo necessario e evitar dados pessoais ou sensiveis desnecessarios.
- Arquivos envolvidos: `src/lib/agents/analisador/prompt.ts`, `src/lib/agents/apr/prompt.ts`, `src/lib/agents/revisor/prompt.ts`
- Criterio de conclusao: prompts documentam e usam apenas campos necessarios para gerar o rascunho.
- Como testar: revisar payloads de entrada dos agentes e validar manualmente casos com contextoEmpresa e EPIs.
- Risco: medio, porque pode afetar qualidade da geracao.
- Precisa de confirmacao antes de executar: sim, por envolver dados enviados a provedor externo.
- Status: pendente

## Task 8: Validar dependencia de auth e companyId

- Objetivo: confirmar que a sessao contem `user.id` e `user.companyId` de forma segura e tipada.
- Arquivos envolvidos: `src/app/api/ia/gerar-apr/route.ts`, arquivos de auth/types existentes se necessario.
- Criterio de conclusao: rota nao depende de campo inexistente ou indefinido; erro seguro caso companyId nao esteja disponivel.
- Como testar: testar usuario autenticado com companyId e cenario sem companyId.
- Risco: alto, porque envolve auth/permissoes.
- Precisa de confirmacao antes de executar: sim, obrigatoria por envolver auth/permissoes.
- Status: pendente

## Task 9: Planejar limite de uso antes de producao

- Objetivo: definir regra de limite por empresa/usuario antes de liberar em producao.
- Arquivos envolvidos: documentacao e, futuramente, rota/API/logs.
- Criterio de conclusao: decisao aprovada sobre limite por periodo, escopo e comportamento quando exceder.
- Como testar: ainda nao aplicavel no MVP sem implementacao.
- Risco: alto se ignorado antes de producao, por custo e abuso.
- Precisa de confirmacao antes de executar: sim, por envolver regra de produto e possivelmente banco/permissoes.
- Status: pendente

## Task 10: Criar matriz de testes da feature

- Objetivo: listar testes manuais e automatizados para API, agentes, logs, seguranca e erros.
- Arquivos envolvidos: documentacao de testes ou arquivos de teste futuros.
- Criterio de conclusao: matriz cobre fluxo feliz, usuario sem auth, input invalido, falha LLM, falha de log, revisao com problema critico e ausencia de metadados internos no frontend.
- Como testar: revisar checklist antes de implementar testes.
- Risco: baixo.
- Precisa de confirmacao antes de executar: nao, se for apenas documentacao; sim, se criar/alterar scripts ou testes executaveis.
- Status: pendente

## Checklist Final

- SPEC atendida
- Plano seguido
- Uma task executada por vez
- Testes planejados e executados quando permitido
- Codigo revisado
- Seguranca revisada
- Confirmacoes sensiveis registradas
- Arquivos alterados listados
- Pendencias documentadas
