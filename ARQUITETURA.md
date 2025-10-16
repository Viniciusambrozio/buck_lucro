# 🏗️ Arquitetura do Sistema - BuckPay

## 📐 Visão Geral

Sistema web minimalista desenvolvido em Next.js 14 para cálculo e registro de lucro operacional da BuckPay, com autenticação JWT e interface preto/branco.

## 🎯 Tecnologias Core

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS v4
- **Componentes**: Shadcn UI
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth (JWT)
- **Validação**: Zod
- **Datas**: date-fns

## 📁 Estrutura de Diretórios

```
├── app/
│   ├── (auth)/              # Grupo de rotas de autenticação
│   │   └── login/           # Página de login
│   ├── (dashboard)/         # Grupo de rotas protegidas
│   │   ├── dashboard/       # Página principal
│   │   └── layout.tsx       # Layout com header
│   ├── actions/             # Server Actions
│   │   ├── auth.ts          # Login/Logout
│   │   ├── calculos.ts      # CRUD de cálculos
│   │   └── horarios.ts      # CRUD de horários
│   ├── globals.css          # Estilos globais e tema
│   ├── layout.tsx           # Layout raiz
│   └── page.tsx             # Redireciona para /dashboard
├── components/
│   ├── auth/                # Componentes de autenticação
│   │   └── login-form.tsx   # Formulário de login
│   ├── dashboard/           # Componentes do dashboard
│   │   ├── config-horarios.tsx   # Config de horários
│   │   ├── form-calculo.tsx      # Formulário de cálculo
│   │   ├── historico-calculos.tsx # Tabela de histórico
│   │   └── resumo-diario.tsx     # Cards de resumo
│   └── ui/                  # Componentes Shadcn UI
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── table.tsx
├── lib/
│   ├── supabase/            # Configuração Supabase
│   │   ├── client.ts        # Cliente browser
│   │   └── server.ts        # Cliente servidor
│   ├── validations/         # Schemas Zod
│   │   └── calculo.ts
│   ├── calculos.ts          # Lógica de negócio
│   └── utils.ts             # Utilitários
├── types/
│   └── index.ts             # Tipos TypeScript
├── middleware.ts            # Proteção de rotas
└── database-setup.sql       # Script de banco
```

## 🔄 Fluxo de Dados

### Autenticação
```
Login Form (Client)
  → Server Action (auth.ts)
  → Supabase Auth
  → JWT Token armazenado em cookies
  → Middleware valida em cada requisição
```

### Cálculo de Lucro
```
Form Calculo (Client)
  → calcularLucro() local (feedback imediato)
  → Server Action (salvarCalculo)
  → Validação Zod
  → Supabase Insert
  → Revalidação da página
  → Dashboard atualiza automaticamente
```

### Carregamento de Dados
```
Dashboard Page (Server Component)
  → Parallel Data Fetching:
     - buscarCalculosDoDia()
     - calcularResumoDiario()
     - buscarHorarios()
  → Renderização no servidor
  → Hidratação no cliente
```

## 🗃️ Modelo de Dados

### Tabela: calculos
```sql
id: UUID (PK)
user_id: UUID (FK → auth.users)
data: DATE
horario: TIME
woovi_white: DECIMAL(12,2)
woovi_pixout: DECIMAL(12,2)
nomadfy: DECIMAL(12,2)
pluggou: DECIMAL(12,2)
sellers: DECIMAL(12,2)
lucro: DECIMAL(12,2)
created_at: TIMESTAMP
```

**Índices:**
- `idx_calculos_user_data` (user_id, data DESC)
- `idx_calculos_created_at` (created_at DESC)

### Tabela: horarios_config
```sql
id: UUID (PK)
user_id: UUID (FK → auth.users) UNIQUE
horario_1: TIME
horario_2: TIME
horario_3: TIME
horario_4: TIME
updated_at: TIMESTAMP
```

## 🔒 Segurança

### Row Level Security (RLS)
Todas as tabelas têm RLS habilitado:
- Usuários só acessam seus próprios dados
- Políticas aplicadas automaticamente pelo Supabase
- Zero trust: mesmo com JWT válido, dados isolados por user_id

### Autenticação
- JWT gerenciado automaticamente pelo Supabase
- Tokens armazenados em httpOnly cookies
- Middleware Next.js valida em todas as rotas protegidas
- Session refresh automático

### Validação
- Client-side: validação de tipos (TypeScript)
- Server-side: validação com Zod em todas as Server Actions
- Database: constraints e foreign keys

## 🎨 Design System

### Paleta de Cores
```css
Background: #FFFFFF
Foreground: #000000
Border: #E5E5E5
Muted: #F5F5F5
Muted Foreground: #666666
Destructive: #EF4444
```

### Tipografia
- Fonte: Inter (Google Fonts)
- Pesos: 400, 500, 600, 700

### Componentes
Todos baseados em Shadcn UI com tema neutro customizado.

## 🚀 Performance

### Server Components
- Dashboard renderizado no servidor
- Menos JavaScript no cliente
- First Paint mais rápido

### Parallel Data Fetching
```typescript
await Promise.all([
  buscarCalculosDoDia(),
  calcularResumoDiario(),
  buscarHorarios()
])
```

### Static Optimization
- Página de login pré-renderizada
- Assets otimizados automaticamente pelo Next.js

## 📱 Responsividade

### Breakpoints
- Mobile: < 768px (stack vertical)
- Desktop: ≥ 768px (grid layout)

### Adaptações Mobile
- Cards de resumo: grid → stack
- Tabela: scroll horizontal
- Inputs: touch-friendly (min 44px)

## 🔧 Server Actions vs API Routes

**Escolha: Server Actions**

Vantagens:
- Menos boilerplate
- Integração nativa com formulários
- Type-safety automática
- Revalidação simplificada

## 📦 Build e Deploy

### Build
```bash
npm run build
```

Gera:
- Static pages: /, /_not-found, /login
- Dynamic pages: /dashboard (server-rendered)
- Middleware: 74.6 kB

### Deploy Recomendado
**Vercel** (zero-config):
1. Push para Git
2. Import no Vercel
3. Configurar variáveis de ambiente
4. Deploy automático

## 🧪 Testes

### Validações Implementadas
- ✅ Zod schemas para todos os inputs
- ✅ TypeScript strict mode
- ✅ RLS no banco de dados

### Testes Manuais
Ver `CHECKLIST_TESTES.md` para validação completa.

## 📈 Escalabilidade

### Limites do Plano Free Supabase
- 500 MB de armazenamento
- 50.000 usuários autenticados
- 2 GB de transferência

**Estimativa:**
- ~50.000 registros de cálculos
- Suficiente para anos de uso

### Otimizações Futuras
Se necessário:
- Paginação do histórico
- Filtros avançados (mês, ano)
- Exportação CSV
- Gráficos de tendência
- Cache de resumos diários

## 🔄 Manutenção

### Atualizações de Dependências
```bash
npm update
npm audit fix
```

### Backup
Supabase oferece backups automáticos (7 dias no plano free).

### Monitoramento
Painel Supabase mostra:
- Requisições API
- Uso de banco
- Usuários ativos
- Logs de erro

## 📚 Documentação Adicional

- `README.md` - Visão geral e instalação
- `CONFIGURACAO_SUPABASE.md` - Setup detalhado
- `INICIO_RAPIDO.md` - Guia rápido
- `CHECKLIST_TESTES.md` - Validação funcional

---

**Arquitetura projetada para simplicidade, segurança e manutenibilidade.**




