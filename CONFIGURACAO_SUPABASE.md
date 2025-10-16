# 🔧 Guia de Configuração do Supabase

Este guia detalha passo a passo como configurar o Supabase para o Sistema de Cálculo de Lucro BuckPay.

## 📋 Passo 1: Criar Conta no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em **Start your project**
3. Faça login com GitHub, Google ou crie uma conta com email

## 🗂️ Passo 2: Criar Novo Projeto

1. No painel, clique em **New Project**
2. Preencha os dados:
   - **Name**: BuckPay Lucro
   - **Database Password**: Crie uma senha forte (anote em local seguro!)
   - **Region**: Escolha South America (São Paulo) para melhor performance
   - **Pricing Plan**: Free (suficiente para começar)
3. Clique em **Create new project**
4. Aguarde 2-3 minutos enquanto o projeto é criado

## 🔑 Passo 3: Obter Credenciais

1. Com o projeto criado, vá em **Settings** (ícone de engrenagem no menu lateral)
2. Clique em **API**
3. Você verá duas informações importantes:

   **Project URL** (exemplo):
   ```
   https://xyzabc123.supabase.co
   ```

   **anon public** key (exemplo):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...
   ```

4. **COPIE ESSAS DUAS INFORMAÇÕES** - você precisará delas!

## 📝 Passo 4: Configurar Variáveis de Ambiente

1. No projeto Next.js, crie um arquivo chamado `.env.local` na raiz
2. Adicione as credenciais que você copiou:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xyzabc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. **IMPORTANTE**: Substitua pelos seus valores reais!

## 🗄️ Passo 5: Executar Script SQL

1. No painel do Supabase, clique em **SQL Editor** (ícone de banco de dados)
2. Clique em **New query**
3. Abra o arquivo `database-setup.sql` do projeto
4. Copie TODO o conteúdo do arquivo
5. Cole no SQL Editor do Supabase
6. Clique em **Run** (ou pressione Ctrl/Cmd + Enter)

Se tudo deu certo, você verá: **Success. No rows returned**

### O que esse script faz?

- Cria a tabela `calculos` (para armazenar os cálculos de lucro)
- Cria a tabela `horarios_config` (para configuração de horários)
- Configura políticas de segurança (RLS)
- Garante que cada usuário só vê seus próprios dados

## 👤 Passo 6: Criar Usuário de Teste

1. No painel do Supabase, vá em **Authentication** (ícone de cadeado)
2. Clique em **Users**
3. Clique em **Add user** > **Create new user**
4. Preencha:
   - **Email**: seu@email.com (use um email válido)
   - **Password**: Crie uma senha forte (você usará para fazer login)
   - **Auto Confirm User**: ✅ Marque esta opção
5. Clique em **Create user**

Pronto! Agora você pode fazer login no sistema com esse email e senha.

## ✅ Passo 7: Verificar Configuração

Para confirmar que está tudo certo:

1. Vá em **Table Editor** no Supabase
2. Você deve ver duas tabelas:
   - ✅ `calculos`
   - ✅ `horarios_config`

3. Vá em **Authentication** > **Users**
4. Você deve ver o usuário que criou

## 🚀 Passo 8: Testar o Sistema

1. No terminal, execute: `npm run dev`
2. Acesse `http://localhost:3000`
3. Você será redirecionado para `/login`
4. Faça login com o email e senha que criou
5. Você deve acessar o dashboard!

## 🔒 Segurança

### ✅ O que está protegido:

- Cada usuário só vê seus próprios dados (RLS habilitado)
- Senhas são criptografadas pelo Supabase
- JWT tokens gerenciam a sessão automaticamente
- Middleware protege rotas do dashboard

### ⚠️ Importante:

- **NUNCA** compartilhe seu `.env.local`
- **NUNCA** faça commit do `.env.local` no Git (já está no .gitignore)
- A chave `anon public` é segura para frontend (já vem com restrições RLS)
- A senha do banco de dados só é necessária para conexões diretas (não usamos no app)

## 🆘 Problemas Comuns

### "Invalid API key"
- ✅ Verifique se copiou a chave completa (é bem longa!)
- ✅ Confirme que não tem espaços extras no `.env.local`

### "Failed to fetch"
- ✅ Verifique se a URL está correta no `.env.local`
- ✅ Confirme que o projeto Supabase está ativo (não pausado)

### "Authentication failed"
- ✅ Confirme que marcou "Auto Confirm User" ao criar o usuário
- ✅ Tente criar um novo usuário

### "Could not find table"
- ✅ Execute novamente o script `database-setup.sql`
- ✅ Verifique se não houve erros no SQL Editor

## 📊 Monitoramento

No painel do Supabase você pode:

- Ver quantos usuários estão autenticados
- Monitorar uso do banco de dados
- Ver logs de erros
- Acompanhar requisições da API

**Plano Free**: 500MB de armazenamento, suficiente para milhares de registros!

## 🎯 Próximos Passos

Após configurar tudo:

1. ✅ Configure os horários no dashboard
2. ✅ Faça um teste de cálculo
3. ✅ Verifique se o histórico está sendo salvo
4. ✅ Teste logout e login novamente

Tudo funcionando? Parabéns! 🎉

Seu sistema está pronto para uso em produção!




