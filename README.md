# 💼 BuckPay - Sistema de Cálculo de Lucro

Sistema web minimalista e profissional para calcular e registrar o lucro operacional da BuckPay 4 vezes ao dia.

## 📋 Sobre o Projeto

O sistema permite calcular o lucro com base em múltiplas contas (Woovi White, Woovi Pix Out, NomadFy e Pluggou) subtraindo o saldo de Sellers, oferecendo uma interface limpa em preto e branco para acompanhamento diário.

### Fórmula de Cálculo

```
Lucro = (Woovi White + Woovi Pix Out + NomadFy + Pluggou) - Saldo de Sellers
```

## 🚀 Funcionalidades

- ✅ **Autenticação JWT** via Supabase Auth
- ✅ **Configuração personalizada** de 4 horários diários
- ✅ **Formulário de lançamento** com cálculo automático de lucro
- ✅ **Resumo diário** com total, média e contagem de registros
- ✅ **Histórico completo** dos cálculos do dia
- ✅ **Interface minimalista** preto e branco
- ✅ **Responsivo** para desktop e mobile

## 🛠️ Tecnologias Utilizadas

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Shadcn UI** (componentes)
- **Supabase** (banco de dados e autenticação)
- **Zod** (validação)
- **date-fns** (manipulação de datas)

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita)

### Passo 1: Clone o projeto

```bash
cd "Calculo Lucro Buck"
```

### Passo 2: Instale as dependências

```bash
npm install
```

### Passo 3: Configure o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Vá em **Settings > API**
4. Copie a **URL** e a **anon/public key**

### Passo 4: Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase
```

### Passo 5: Configure o banco de dados

1. No painel do Supabase, vá em **SQL Editor**
2. Abra o arquivo `database-setup.sql` do projeto
3. Copie todo o conteúdo e cole no SQL Editor
4. Execute o script

### Passo 6: Crie um usuário

No painel do Supabase:
1. Vá em **Authentication > Users**
2. Clique em **Add user**
3. Crie um usuário com email e senha

### Passo 7: Execute o projeto

```bash
npm run dev
```

O sistema estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
├── app/
│   ├── (auth)/
│   │   └── login/              # Página de login
│   ├── (dashboard)/
│   │   ├── dashboard/          # Página principal do dashboard
│   │   └── layout.tsx          # Layout do dashboard
│   ├── actions/                # Server Actions
│   │   ├── auth.ts             # Ações de autenticação
│   │   ├── calculos.ts         # Ações de cálculos
│   │   └── horarios.ts         # Ações de horários
│   ├── globals.css             # Estilos globais
│   ├── layout.tsx              # Layout raiz
│   └── page.tsx                # Página inicial (redireciona)
├── components/
│   ├── dashboard/              # Componentes do dashboard
│   │   ├── config-horarios.tsx # Configuração de horários
│   │   ├── form-calculo.tsx    # Formulário de lançamento
│   │   ├── historico-calculos.tsx # Tabela de histórico
│   │   └── resumo-diario.tsx   # Cards de resumo
│   └── ui/                     # Componentes Shadcn UI
├── lib/
│   ├── supabase/               # Configuração Supabase
│   │   ├── client.ts           # Cliente para browser
│   │   └── server.ts           # Cliente para servidor
│   ├── validations/            # Schemas de validação Zod
│   │   └── calculo.ts
│   ├── calculos.ts             # Lógica de cálculo de lucro
│   └── utils.ts                # Utilitários
├── types/
│   └── index.ts                # Tipos TypeScript
├── database-setup.sql          # Script SQL do banco
├── middleware.ts               # Middleware de autenticação
└── README.md
```

## 🎨 Design

O sistema segue um design minimalista com:

- **Paleta de cores**: Preto, branco e tons de cinza
- **Tipografia**: Inter (Google Fonts)
- **Componentes**: Shadcn UI com tema neutro
- **Layout**: Centralizado com largura máxima de 1200px

## 🔐 Segurança

- ✅ Row Level Security (RLS) habilitado no Supabase
- ✅ Autenticação JWT via Supabase Auth
- ✅ Middleware protegendo rotas do dashboard
- ✅ Validação de dados com Zod
- ✅ Políticas de acesso por usuário

## 📊 Banco de Dados

### Tabelas

**calculos**
- Armazena os cálculos de lucro realizados
- Campos: woovi_white, woovi_pixout, nomadfy, pluggou, sellers, lucro
- Vinculado ao usuário via `user_id`

**horarios_config**
- Configuração personalizada dos 4 horários
- Valores padrão: 09:00, 13:00, 18:00, 22:00
- Um registro por usuário

## 🤝 Como Usar

1. **Login**: Acesse com suas credenciais do Supabase
2. **Configure Horários**: Defina os 4 horários que você usa para registrar (opcional)
3. **Faça um Lançamento**:
   - Preencha os valores das contas (Woovi White, Woovi Pix Out, NomadFy, Pluggou)
   - Preencha o saldo de Sellers
   - Clique em "Calcular Lucro"
   - Confira o resultado e clique em "Salvar"
4. **Acompanhe**: Veja o resumo diário e o histórico completo

## 📝 Scripts Disponíveis

```bash
# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar produção
npm start

# Linter
npm run lint
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do código para um repositório Git
2. Acesse [vercel.com](https://vercel.com)
3. Importe o projeto
4. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

## 📄 Licença

Este projeto foi desenvolvido para uso interno da BuckPay.

## 👨‍💻 Suporte

Para dúvidas ou problemas:
1. Verifique se as variáveis de ambiente estão corretas
2. Confirme que o script SQL foi executado no Supabase
3. Verifique se o usuário foi criado no Supabase Auth
