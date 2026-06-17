# Plano Tecnico — Geração assistida de APR por agentes LLM

## 1. Referencia da SPEC

- Nome da SPEC: SPEC Revisada — Geração assistida de APR por agentes LLM
- Arquivo: `docs/specs/apr-llm/spec.md`
- Status: aprovada para planejamento tecnico

## 2. Resumo tecnico

A feature deve expor uma API autenticada para gerar um rascunho tecnico de APR com apoio de agentes LLM. O MVP nao deve persistir a APR gerada, nao deve salvar prompt completo, nao deve salvar resposta completa da LLM e nao deve expor metadados internos ao frontend.

O resultado publico da API deve conter apenas dados necessarios ao usuario: status de rascunho, aviso obrigatorio de revisao humana, analise tecnica, APR gerada, revisao automatizada e erros/avisos seguros. Metadados de custo, tokens, modelo, provider e latencia podem ser usados internamente e gravados como log, mas nao devem aparecer na resposta publica do MVP.

## 3. Arquitetura atual observada

- Backend: rota API em Next.js para geracao de APR.
- Auth: a rota usa sessao autenticada para obter usuario e empresa.
- Validacao: entrada validada com Zod no servidor.
- Agentes: estrutura separada em analisador, gerador de APR, revisor deterministico e revisor LLM.
- Orquestracao: fluxo de analise, geracao, revisao e retorno consolidado.
- Logs: existe intencao de registrar metadados de chamadas LLM por agente, empresa e usuario.
- Banco: existe proposta de tabela/modelo para logs LLM, mas qualquer mudanca de banco exige confirmacao explicita antes de continuar.
- Teste manual: existe proposta de script de teste da geracao APR, mas scripts nao fazem parte desta etapa de documentacao.

## 4. Decisoes tecnicas do MVP

- A APR gerada por IA e sempre rascunho tecnico.
- A APR gerada por IA nao e documento oficial.
- A APR nao sera persistida no banco no MVP.
- O retorno deve conter aviso obrigatorio de revisao humana.
- `success: true` significa apenas que um rascunho valido foi gerado com validacao minima.
- Prompt completo nao sera salvo.
- Resposta completa da LLM nao sera salva.
- Logs LLM devem salvar apenas metadados.
- Metadados internos nao devem ser expostos ao frontend.
- Falhas de log nao devem vazar detalhes sensiveis ao usuario.
- Limite de uso por empresa/usuario deve ser definido antes de producao.
- Mudancas em banco, auth, RLS, env vars, storage, permissoes e dependencias exigem confirmacao antes de implementar.

## 5. Contrato da API

### Endpoint

```txt
POST /api/ia/gerar-apr
```

### Entrada

```json
{
  "descricaoAtividade": "string obrigatoria",
  "local": "string obrigatoria",
  "contextoEmpresa": "string opcional",
  "episDisponiveis": ["string opcional"]
}
```

### Saida publica de sucesso

```json
{
  "success": true,
  "status": "RASCUNHO_IA",
  "aviso": "APR gerada por IA deve ser revisada por responsável técnico antes de uso oficial.",
  "analise": {},
  "apr": {},
  "revisaoAutomatizada": {},
  "errosValidacao": []
}
```

### Saida publica de erro

```json
{
  "success": false,
  "error": "Mensagem segura para o usuario",
  "issues": []
}
```

### Campos que nao devem sair para o frontend no MVP

- `costUSD`
- `latenciaTotalMs`
- `model`
- `provider`
- `inputTokens`
- `outputTokens`
- stack trace, mensagens internas ou erros crus de provider

## 6. Ajustes necessarios na API

- Garantir que a resposta publica nao exponha custo, tokens, modelo, provider ou latencia.
- Garantir que respostas de sucesso sempre incluam `status: "RASCUNHO_IA"`.
- Garantir que respostas de sucesso sempre incluam o aviso obrigatorio.
- Padronizar erros seguros para usuario nao autenticado, input invalido e falhas tecnicas.
- Confirmar se o contrato anterior da rota precisa ser mantido ou pode ser alterado.
- Confirmar se `session.user.companyId` esta disponivel e tipado antes de depender dele em producao.
- Evitar retornar dados internos de revisao que possam confundir rascunho com aprovacao oficial.

## 7. Ajustes necessarios nos agentes

- Garantir que o orquestrador separe rascunho gerado de aprovacao oficial.
- Garantir que `success: true` dependa de validacao minima real do rascunho.
- Garantir que erros de revisao sejam retornados como validacoes/avisos, sem declarar aprovacao oficial.
- Avaliar se a revisao automatizada deve realimentar a geracao ou apenas registrar problemas no MVP.
- Garantir que prompts enviem apenas o contexto necessario para a LLM.
- Documentar quais campos podem sair do sistema para provedores LLM.
- Corrigir mensagens e nomenclaturas que possam sugerir documento final aprovado.

## 8. Ajustes necessarios nos logs LLM

- Confirmar explicitamente o modelo de log antes de qualquer alteracao de banco.
- Salvar apenas metadados aprovados: agente, modelo, provider, tokens, custo estimado, latencia, status, `companyId`, `userId` e tipo de documento.
- Nao salvar prompt completo.
- Nao salvar resposta completa.
- Nao salvar conteudo integral da APR.
- Tratar falhas de log sem expor erro sensivel ao usuario.
- Definir antes de producao politica de retencao, acesso e consulta dos logs.
- Definir antes de producao limite de uso por empresa/usuario.

## 9. Pontos de seguranca

- Exigir autenticacao para gerar rascunho.
- Validar entrada no servidor.
- Evitar dados pessoais ou comerciais desnecessarios no prompt.
- Nao expor secrets, provider, modelo, custo, tokens ou latencia ao frontend no MVP.
- Separar claramente rascunho IA de aprovacao humana.
- Exigir revisao humana antes de uso oficial.
- Revisar acesso por empresa/usuario antes de producao.
- Revisar logs e retencao antes de producao.
- Exigir confirmacao para banco, auth, RLS, env vars, storage, permissoes e dependencias.

## 10. Riscos tecnicos

- Usuario interpretar rascunho como APR aprovada.
- API expor metadados internos por acidente.
- Logs armazenarem dados sensiveis alem do permitido.
- Falha de log esconder problemas operacionais importantes.
- Mudanca do contrato da API quebrar telas ou chamadas existentes.
- Dependencia de campos de sessao ainda nao confirmados.
- Custo crescer sem limite antes de rate limit/cotas.
- Revisao automatizada falhar em detectar risco critico.
- Mudancas de banco serem aplicadas sem aprovacao explicita.

## 11. Ordem recomendada de implementacao

1. Ajustar contrato publico da API para ocultar metadados internos e incluir aviso obrigatorio.
2. Revisar semantica de `success` e `status` no retorno.
3. Padronizar erros seguros da API.
4. Revisar orquestrador para separar rascunho, validacao automatizada e aprovacao humana.
5. Confirmar modelo de logs LLM antes de qualquer mudanca de banco.
6. Ajustar persistencia de logs para metadados aprovados e falha segura.
7. Revisar dados enviados aos provedores LLM.
8. Planejar testes manuais e automatizados.
9. Fazer code review e security review antes de qualquer uso em producao.
