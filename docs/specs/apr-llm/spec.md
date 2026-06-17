# SPEC Revisada — Geração assistida de APR por agentes LLM

## 1. Visão geral

Criar uma funcionalidade de geração assistida de APR por agentes LLM. A IA deve produzir um **rascunho técnico** de APR a partir de uma descrição de atividade, local e contexto opcional.

O resultado não é documento oficial e não substitui revisão humana.

## 2. Problema

Criar APRs manualmente pode ser demorado e sujeito a lacunas iniciais. A IA pode acelerar a elaboração de um primeiro rascunho técnico, mas o conteúdo envolve segurança do trabalho e precisa de validação humana antes de uso real.

## 3. Objetivo

Permitir que um usuário autenticado gere um rascunho estruturado de APR com apoio de agentes LLM, incluindo análise da atividade, riscos, medidas preventivas, EPIs, EPCs e normas aplicáveis.

## 4. Usuários

- Usuário autenticado da empresa.
- Responsável técnico que revisa/aprova a APR antes de uso oficial.
- Administrador ou gestor, futuramente, para acompanhar uso e limites.

## 5. Escopo do MVP

- Receber dados básicos da atividade.
- Gerar análise técnica inicial por IA.
- Gerar rascunho estruturado de APR.
- Aplicar validação mínima de estrutura.
- Aplicar revisão técnica automatizada como apoio.
- Retornar o rascunho pela API.
- Incluir aviso claro de revisão humana obrigatória.
- Registrar apenas metadados de chamadas LLM.
- Não expor metadados internos de custo/modelo/tokens ao frontend.

## 6. Fora de escopo

- Persistir a APR gerada no banco.
- Considerar a APR oficialmente aprovada.
- Salvar prompt completo.
- Salvar resposta completa da LLM.
- Criar workflow completo de aprovação humana.
- Criar dashboard de custos.
- Definir limite de uso por empresa/usuário.
- Criar regras de RLS novas sem confirmação explícita.
- Alterar produção, env vars, storage ou permissões sem confirmação.

## 7. Decisões aprovadas para o MVP

1. A APR gerada por IA será rascunho técnico, não documento final.
2. A APR precisa de revisão/aprovação humana antes de uso oficial.
3. Prompt completo não será salvo no banco.
4. Resposta completa da LLM não será salva no banco.
5. Logs LLM salvarão apenas metadados.
6. Custo, tokens, modelo, provider e latência não serão expostos ao frontend.
7. A APR gerada não será persistida no banco no MVP.
8. Se futuramente for persistida, deve ter status explícito: `RASCUNHO`, `EM_REVISAO`, `APROVADA`.
9. `success: true` significa apenas rascunho válido gerado com validação mínima.
10. Falha no log não deve expor erro sensível ao usuário.
11. O retorno deve incluir o aviso: “APR gerada por IA deve ser revisada por responsável técnico antes de uso oficial.”
12. Banco, auth, RLS, env vars, storage, permissões e dependências exigem confirmação antes de implementar.
13. Antes de produção, será necessário definir limite de uso por empresa/usuário.

## 8. Decisões adiadas para versões futuras

- Persistência da APR no banco.
- Workflow formal de revisão e aprovação.
- Status oficiais da APR gerada por IA.
- Auditoria detalhada de uso.
- Dashboard de custos.
- Rate limit por empresa/usuário.
- Cotas mensais.
- Histórico de versões de APR geradas.
- Políticas de retenção de logs.
- Interface administrativa para revisão técnica.

## 9. Fluxo esperado

1. Usuário autenticado envia descrição da atividade.
2. Sistema valida os dados de entrada.
3. Agente analisa a atividade e classifica riscos.
4. Agente gera rascunho técnico da APR.
5. Sistema aplica validações mínimas.
6. Sistema pode aplicar revisão automatizada de apoio.
7. Sistema registra metadados das chamadas LLM.
8. API retorna rascunho, validações e aviso obrigatório.
9. Usuário encaminha o conteúdo para revisão humana antes de uso oficial.

## 10. Regras de negócio

- Apenas usuário autenticado pode gerar rascunho.
- O rascunho pertence ao contexto da empresa do usuário.
- A APR gerada por IA nunca deve ser tratada como aprovada no MVP.
- `success: true` indica geração técnica bem-sucedida, não aprovação oficial.
- O aviso de revisão humana deve sempre acompanhar respostas bem-sucedidas.
- Erros internos de log não devem ser expostos ao usuário.
- A resposta pública da API não deve conter custo, tokens, modelo, provider ou latência.
- Mudanças sensíveis exigem confirmação explícita antes de implementação.

## 11. Contrato da API proposto

Endpoint:

```txt
POST /api/ia/gerar-apr
```

Entrada proposta:

```json
{
  "descricaoAtividade": "string obrigatoria",
  "local": "string obrigatoria",
  "contextoEmpresa": "string opcional",
  "episDisponiveis": ["string opcional"]
}
```

Resposta de sucesso proposta:

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

Resposta de erro proposta:

```json
{
  "success": false,
  "error": "Mensagem segura para o usuario",
  "issues": []
}
```

Não devem retornar no MVP:

- `costUSD`
- `latenciaTotalMs`
- `model`
- `provider`
- `inputTokens`
- `outputTokens`

## 12. Dados e privacidade

- Não salvar prompt completo.
- Não salvar resposta completa da LLM.
- Evitar envio de dados pessoais desnecessários para a LLM.
- Não expor informações internas de execução ao frontend.
- Não registrar erro sensível em resposta pública.
- Revisar qualquer campo que possa conter dados sensíveis antes de produção.

## 13. Logs de LLM

Salvar apenas metadados:

- Agente
- Modelo
- Provider
- Tokens de entrada
- Tokens de saída
- Custo estimado
- Latência
- Status
- `companyId`
- `userId`
- Tipo de documento

Não salvar no MVP:

- Prompt completo
- Resposta completa
- Dados sensíveis da atividade
- Conteúdo integral da APR

## 14. Segurança

- Exigir autenticação.
- Validar entrada no servidor.
- Não expor secrets ou detalhes de provider.
- Não expor custo/tokens/modelo/provider/latência ao frontend.
- Tratar falhas de log de forma silenciosa para o usuário.
- Confirmar antes de qualquer mudança em banco, auth, RLS, env vars, storage, permissões ou dependências.
- Definir limite de uso antes de produção.

## 15. Critérios de aceite

- Usuário não autenticado recebe erro seguro.
- Input inválido retorna erro de validação.
- Input válido retorna rascunho estruturado de APR.
- Resposta de sucesso sempre contém o aviso obrigatório.
- `success: true` não comunica aprovação oficial.
- APR não é persistida no banco no MVP.
- Prompt completo não é salvo.
- Resposta completa da LLM não é salva.
- Logs salvam apenas metadados.
- Frontend não recebe custo, tokens, modelo, provider ou latência.
- Falha no log não expõe detalhe sensível ao usuário.

## 16. Riscos

- Usuário interpretar rascunho como documento aprovado.
- Dados sensíveis serem enviados à LLM por acidente.
- Custos crescerem sem limite por empresa/usuário.
- Falhas técnicas serem ocultadas demais e dificultarem diagnóstico.
- Validação automatizada não detectar lacunas críticas.
- Mudança de contrato da API afetar telas existentes.

## 17. Próximas tasks recomendadas

1. Validar contrato público da API.
2. Ajustar resposta para ocultar metadados internos.
3. Garantir aviso obrigatório no retorno.
4. Confirmar modelo de log LLM antes de qualquer mudança em banco.
5. Revisar significado de `success`.
6. Definir tratamento seguro para falha de log.
7. Planejar limite de uso antes de produção.
