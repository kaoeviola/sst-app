# SST App

Aplicação web (e API para app mobile) para gestão de segurança do trabalho: emissão de APR (Análise Preliminar de Risco) e PT (Permissão de Trabalho) com apoio de IA, assinatura digital e funcionamento offline em campo.

## Funcionalidades

- **Geração de APR/PT assistida por IA**: pipeline de agentes (analisador de atividade → gerador → revisor técnico contra normas regulamentadoras → revisor determinístico) que produz o documento a partir da descrição da atividade.
- **Log de chamadas LLM**: cada geração de IA fica registrada para auditoria e depuração do pipeline.
- **Assinatura digital** dos documentos emitidos.
- **PWA com suporte offline**: cache local via IndexedDB (Dexie.js) para uso em campo sem conexão.
- **API mobile**: endpoints de autenticação (login/registro/refresh) que servem o app Flutter companion do projeto.

## Stack

- Next.js 14 App Router
- TypeScript em strict mode
- Tailwind CSS + shadcn/ui
- Prisma ORM + PostgreSQL Neon
- NextAuth v5/Auth.js com Credentials provider
- Zod + React Hook Form
- OpenAI SDK usando `gpt-4o`
- PWA com `next-pwa`
- Dexie.js para cache offline em IndexedDB

## Setup

1. Instale as dependencias:

```bash
npm install
```

2. Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

3. Preencha as variaveis:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="gere-um-segredo-forte"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="sk-..."
```

4. Gere o Prisma Client e rode a primeira migration:

```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Inicie o app:

```bash
npm run dev
```

Abra `http://localhost:3000`.

## Multi-tenant

Toda entidade de cliente possui `companyId`. A funcao `dbForCompany(companyId)` em `src/lib/db/tenant.ts` injeta o `companyId` nas queries dos modelos tenant-aware:

- `Obra`
- `Funcionario`
- `Atividade`
- `Apr`
- `Pt`
- `Assinatura`
- `SyncEvent`

Use sempre `dbForCompany(session.user.companyId)` em rotas e paginas autenticadas que leem ou gravam dados de cliente.

## PWA e offline

O `next-pwa` esta configurado em `next.config.mjs` com:

- `NetworkFirst` para rotas da aplicacao
- `CacheFirst` para assets
- pre-cache de `/apr/novo`, `/pt/novo`, `/login` e `/register`

Os rascunhos offline sao armazenados no IndexedDB via Dexie em `src/lib/offline`.

## Estrutura

```txt
src/
  app/
    (auth)/login
    (auth)/register
    (app)/dashboard
    (app)/obras
    (app)/funcionarios
    (app)/atividades
    (app)/apr/[id]
    (app)/apr/novo
    (app)/pt/[id]
    (app)/pt/novo
    (app)/assinaturas
    api/
  lib/
    auth/
    crypto/
    db/
    ia/
    offline/
    pdf/
  components/
    apr/
    forms/
    pt/
    ui/
  types/
prisma/
  schema.prisma
```

## Scripts

- `npm run dev`: servidor de desenvolvimento
- `npm run build`: gera Prisma Client e build de producao
- `npm run lint`: lint do Next.js
- `npm run typecheck`: checagem TypeScript
- `npm run prisma:migrate`: cria/aplica migrations
- `npm run prisma:studio`: abre Prisma Studio
