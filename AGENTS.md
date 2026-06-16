# AGENTS.md

## Contexto Do Projeto

- Nome: sst-app
- Objetivo: Projeto existente em Next.js/TypeScript para gestao de fluxos do aplicativo.
- Usuario principal: A definir por SPEC antes de funcionalidades grandes.
- Stack: Next.js, TypeScript, Tailwind CSS, Prisma e padroes locais do projeto.
- Deploy: A confirmar no projeto antes de alterar deploy.
- Banco: A confirmar no projeto antes de qualquer alteracao.
- Auth: A confirmar no projeto antes de qualquer alteracao.

## Kaoe AI Brain

- Brain local: `C:\Users\kally\Desktop\kaoe-ai-brain`
- Antes de funcionalidades grandes, ler e seguir o fluxo SDD do Kaoe AI Brain.
- Referencias principais:
  - `C:\Users\kally\Desktop\kaoe-ai-brain\AGENTS.md`
  - `C:\Users\kally\Desktop\kaoe-ai-brain\sdd\sdd-flow.md`
  - `C:\Users\kally\Desktop\kaoe-ai-brain\sdd\perguntas-iniciais.md`
  - `C:\Users\kally\Desktop\kaoe-ai-brain\project-templates\existing-project-setup.md`

## Regras Do Agente

- Nao comecar funcionalidades grandes direto no codigo.
- Funcionalidades grandes devem seguir SDD antes de implementar.
- Antes de alterar arquivos, ler o projeto existente.
- Ao ler o projeto, identificar stack, README, package, configs, estrutura de pastas, rotas, banco, auth, deploy e regras locais.
- Entrevistar antes de especificar.
- Gerar SPEC antes do plano tecnico.
- Gerar plano tecnico antes das tasks.
- Gerar tasks pequenas antes da implementacao.
- Trabalhar em tasks pequenas, uma por vez.
- Explicar antes de alterar arquivos.
- Manter mudancas pequenas e focadas.
- Nao refatorar partes nao relacionadas sem necessidade.
- Respeitar padroes existentes do projeto.
- Confirmar premissas quando houver risco.
- Listar arquivos alterados no final.

## Confirmacao Obrigatoria

Alteracoes nas areas abaixo exigem confirmacao explicita antes de executar:

- Banco de dados
- Auth
- RLS
- Variaveis de ambiente
- Storage
- Permissoes
- Dependencias importantes
- Package manager, instalacoes ou alteracoes em `package.json`
- Deploy ou configuracoes de infraestrutura

## Fluxo SDD Para Funcionalidades Grandes

1. Entrevista inicial
2. SPEC
3. Plano tecnico
4. Tasks pequenas
5. Implementacao task por task
6. Testes
7. Code review
8. Security review
9. Resumo final com arquivos alterados

## Seguranca

- Revisar RLS quando houver banco ou Supabase.
- Proteger dados sensiveis.
- Validar entrada no servidor.
- Nao expor secrets no frontend.
- Revisar permissoes por perfil.
- Validar uploads.
- Verificar variaveis de ambiente.
- Evitar logs que exponham informacoes privadas.

## Finalizacao

Ao concluir uma tarefa, responder com:

- O que mudou
- Arquivos alterados
- Como testar
- Riscos ou pendencias
