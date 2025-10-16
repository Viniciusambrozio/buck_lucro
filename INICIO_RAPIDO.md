# 🚀 Início Rápido - BuckPay Sistema de Lucro

## ⚡ Configuração Rápida (5 minutos)

### 1️⃣ Instalar Dependências

```bash
npm install
```

### 2️⃣ Criar arquivo .env.local

Na raiz do projeto, crie um arquivo chamado `.env.local` com:

```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
```

**Como obter as credenciais:**
- Acesse [supabase.com](https://supabase.com)
- Crie/acesse seu projeto
- Vá em Settings > API
- Copie a **Project URL** e a **anon public key**

### 3️⃣ Configurar Banco de Dados

1. No painel do Supabase, vá em **SQL Editor**
2. Abra o arquivo `database-setup.sql` deste projeto
3. Copie todo o conteúdo
4. Cole no SQL Editor e clique em **Run**

### 4️⃣ Criar Usuário

No Supabase:
1. Vá em **Authentication > Users**
2. Clique em **Add user > Create new user**
3. Preencha email e senha
4. ✅ Marque "Auto Confirm User"
5. Clique em **Create user**

### 5️⃣ Executar o Projeto

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## ✅ Pronto para Usar!

- Faça login com o email e senha criados
- Configure seus horários preferidos (opcional)
- Comece a registrar os cálculos de lucro!

## 📝 Uso Diário

1. **Login** → Entre no sistema
2. **Configure Horários** → Defina os 4 horários do dia (opcional)
3. **Preencha os Valores** → Insira os saldos das contas
4. **Calcule** → Veja o lucro calculado
5. **Salve** → Registre no histórico
6. **Acompanhe** → Veja resumo e histórico do dia

## 🆘 Problemas?

Consulte o arquivo `CONFIGURACAO_SUPABASE.md` para instruções detalhadas.

---

**Desenvolvido para BuckPay** 💼




