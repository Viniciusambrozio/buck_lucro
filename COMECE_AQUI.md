# 🚀 COMECE AQUI - Sistema BuckPay

## 👋 Bem-vindo!

Seu **Sistema de Cálculo de Lucro BuckPay** está **100% pronto**!

Este guia mostra exatamente o que fazer agora.

---

## ⚡ 3 Passos para Começar

### 1️⃣ Configure o Supabase (10 minutos)

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Vá em **Settings > API** e copie:
   - Project URL
   - anon public key

### 2️⃣ Configure o Projeto (5 minutos)

1. Na raiz deste projeto, crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=cole-sua-url-aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=cole-sua-chave-aqui
```

2. No Supabase, vá em **SQL Editor**
3. Abra o arquivo `database-setup.sql` deste projeto
4. Copie todo o conteúdo e cole no SQL Editor
5. Clique em **Run**

6. No Supabase, vá em **Authentication > Users**
7. Clique em **Add user > Create new user**
8. Crie com seu email e senha
9. ✅ Marque "Auto Confirm User"

### 3️⃣ Execute o Sistema (1 minuto)

```bash
npm install
npm run dev
```

Acesse: **http://localhost:3000**

Faça login com o email e senha que criou!

---

## 🎯 Está funcionando!

Agora você pode:

✅ Configurar seus horários preferidos  
✅ Fazer cálculos de lucro  
✅ Ver resumo do dia  
✅ Acompanhar histórico  

---

## 📚 Precisa de Ajuda?

**Guia Rápido** → [INICIO_RAPIDO.md](./INICIO_RAPIDO.md)  
**Problemas com Supabase?** → [CONFIGURACAO_SUPABASE.md](./CONFIGURACAO_SUPABASE.md)  
**Ver tudo** → [INDICE_DOCUMENTACAO.md](./INDICE_DOCUMENTACAO.md)

---

## 🚀 Quer Colocar em Produção?

Veja: [DEPLOY.md](./DEPLOY.md)

Deploy na Vercel é **gratuito** e leva **5 minutos**!

---

## ✅ Pronto!

Seu sistema está **100% funcional**.

Aproveite! 🎉

**Desenvolvido para BuckPay** 💼




