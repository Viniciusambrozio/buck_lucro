# 📊 Planejamento: Sistema de Saques e Lucro em Tempo Real

## 🎯 Objetivo Principal
Acompanhar o lucro em tempo real durante o dia, conforme valores vão sendo adicionados, com visibilidade por horário.

---

## 🔑 KPI Principal: TOTAL SACADO

### Dashboard - Cartão Destaque
```
┌─────────────────────────────────────┐
│  💰 SAQUE REALIZADO                 │
│                                     │
│     R$ 125.430,00                   │
│                                     │
│  [+ Registrar Novo Saque]           │
└─────────────────────────────────────┘
```

### Ao Clicar em "Registrar Novo Saque"
- Modal/Dialog abre com:
  - **Valor do Saque**
  - **Origem** (dropdown): Pix In 1, Pix In 2, ..., Pix Out, Conta Empresa
  - **Destino** (dropdown): Pix In 1, Pix In 2, ..., Pix Out, Conta Empresa
  - **Tipo de Operação** (auto-detectado ou manual)
  - **Observações** (opcional)

---

## 🏦 Entidades do Sistema

### 1. **Adquirentes Pix In**
- Recebem pagamentos dos clientes
- Podem sacar para: Pix Out, Conta Empresa
- Têm limites diários/horários

### 2. **Adquirente Pix Out**
- Conta onde sellers solicitam saques
- **Precisa ter saldo disponível** para sellers sacarem
- Saldo da Pix Out = Saldo Total - Saldo dos Sellers
- **Lucro = O que sobra após sellers sacarem**

### 3. **Conta Empresa**
- Conta bancária da empresa
- Serve como reserva/backup
- Destino final de lucro sacado

---

## 💸 Fluxos de Movimentação

### Cenário 1: Empresa → Pix Out
**Quando usar**: Garantir saldo na Pix Out para sellers sacarem

```
Conta Empresa  ──→  Pix Out
   (R$ X)            (+ R$ X)
```

**Registro**:
- Origem: Conta Empresa
- Destino: Pix Out
- Tipo: "Transferência para garantir saldo"
- Impacto: Aumenta saldo disponível para sellers

---

### Cenário 2: Pix In → Pix Out
**Quando usar**: Transferir saldo diretamente para Pix Out (prioritário)

```
Pix In  ──→  Pix Out
 (- R$ X)     (+ R$ X)
```

**Registro**:
- Origem: [Adquirente Pix In específica]
- Destino: Pix Out
- Tipo: "Transferência direta"
- Impacto: Mantém fluxo, garante saldo para sellers

**Condições**:
- ✅ Tem saldo suficiente na Pix In
- ✅ Não bateu limite da Pix In

**Se NÃO atender**: Usar Cenário 1 (Empresa → Pix Out) + depois Cenário 3

---

### Cenário 3: Pix In → Conta Empresa (LUCRO SACADO)
**Quando usar**: Sacar lucro das adquirentes

```
Pix In  ──→  Conta Empresa
 (- R$ X)      (+ R$ X) 💰 LUCRO
```

**Registro**:
- Origem: [Adquirente Pix In específica]
- Destino: Conta Empresa
- Tipo: "Saque de Lucro"
- Impacto: **Este é o lucro líquido da empresa**

---

### Cenário 4: Pix Out → Conta Empresa (LUCRO SACADO)
**Quando usar**: Sacar lucro da Pix Out (se disponível e instantâneo)

```
Pix Out  ──→  Conta Empresa
  (- R$ X)       (+ R$ X) 💰 LUCRO
```

**Registro**:
- Origem: Pix Out
- Destino: Conta Empresa
- Tipo: "Saque de Lucro"
- Condição: Só se saque for instantâneo

---

## 📈 Visibilidade por Horário/Dia

### Gráfico Principal: Lucro ao Longo do Dia

```
Lucro (R$)
    │
15k │         ╱─╲
    │        ╱   ╲
10k │   ╱───╯     ╲___
    │  ╱               ╲
 5k │ ╱                 ╲
    │╱                   ╲
 0  └───────────────────────
    0h  6h  12h  18h  24h
    
    [Filtro: ○ Dia  ● Mês]
```

### Dados Necessários
- **Timestamp** de cada operação
- **Valor** da operação
- **Tipo**: Entrada (Pix In), Saída (Saque), Transferência
- **Lucro acumulado** até aquele horário

### Métricas por Período

**Visão Diária**:
- Lucro por hora (0h-23h)
- Total sacado no dia
- Maior/menor lucro por hora

**Visão Mensal**:
- Lucro por dia (1-31)
- Total sacado no mês
- Média diária
- Dias com maior/menor lucro

---

## 🗄️ Estrutura de Dados

### Tabela: `saques`
```sql
CREATE TABLE saques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  valor DECIMAL(15, 2) NOT NULL,
  origem TEXT NOT NULL, -- 'pix_in_X', 'pix_out', 'conta_empresa'
  destino TEXT NOT NULL, -- 'pix_in_X', 'pix_out', 'conta_empresa'
  tipo_operacao TEXT NOT NULL, -- 'lucro', 'transferencia', 'garantia_saldo'
  adquirente_origem_id UUID REFERENCES adquirentes(id),
  adquirente_destino_id UUID REFERENCES adquirentes(id),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_saques_created_at ON saques(created_at);
CREATE INDEX idx_saques_user_tipo ON saques(user_id, tipo_operacao);
```

### Tabela: `saldo_pix_out` (Nova)
```sql
CREATE TABLE saldo_pix_out (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  saldo_total DECIMAL(15, 2) NOT NULL DEFAULT 0,
  saldo_sellers DECIMAL(15, 2) NOT NULL DEFAULT 0,
  saldo_disponivel DECIMAL(15, 2) GENERATED ALWAYS AS (saldo_total - saldo_sellers) STORED,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### View: `lucro_por_horario`
```sql
CREATE VIEW lucro_por_horario AS
SELECT 
  user_id,
  DATE_TRUNC('hour', created_at) as horario,
  DATE(created_at) as dia,
  SUM(CASE 
    WHEN tipo_operacao = 'lucro' AND destino = 'conta_empresa' THEN valor 
    ELSE 0 
  END) as lucro_horario,
  COUNT(*) as num_operacoes
FROM saques
GROUP BY user_id, DATE_TRUNC('hour', created_at), DATE(created_at)
ORDER BY horario DESC;
```

---

## 🎨 Interface do Usuário

### 1. Dashboard Principal

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Dashboard - Buck                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ 💰 SAQUE REALIZADO│  │ 📈 LUCRO HOJE   │               │
│  │                  │  │                  │               │
│  │  R$ 125.430,00   │  │  R$ 45.230,00   │               │
│  │                  │  │  ↑ 15% vs ontem │               │
│  │  [+ Novo Saque]  │  │                  │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Lucro por Horário                                  │   │
│  │  [○ Dia  ● Mês]  [📅 16/10/2025]                   │   │
│  │                                                     │   │
│  │  [Gráfico de Linha aqui]                           │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Últimos Saques                                     │   │
│  │  -------------------------------------------------- │   │
│  │  16/10 14:30  Pix In 1 → Empresa    R$ 5.000,00    │   │
│  │  16/10 12:15  Empresa → Pix Out     R$ 10.000,00   │   │
│  │  16/10 09:45  Pix In 2 → Pix Out    R$ 8.500,00    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2. Modal: Registrar Novo Saque

```
┌─────────────────────────────────────────┐
│  💸 Registrar Novo Saque                │
├─────────────────────────────────────────┤
│                                         │
│  Valor do Saque                         │
│  ┌───────────────────────────────────┐  │
│  │ R$ ____________________           │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Origem                                 │
│  ┌───────────────────────────────────┐  │
│  │ [Selecione...]             ▼     │  │
│  └───────────────────────────────────┘  │
│  • Pix In - Adquirente 1               │
│  • Pix In - Adquirente 2               │
│  • Pix Out                             │
│  • Conta Empresa                       │
│                                         │
│  Destino                                │
│  ┌───────────────────────────────────┐  │
│  │ [Selecione...]             ▼     │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Tipo de Operação                       │
│  ┌───────────────────────────────────┐  │
│  │ ○ Saque de Lucro                  │  │
│  │ ○ Transferência para Pix Out      │  │
│  │ ○ Garantia de Saldo               │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Observações (opcional)                 │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [Cancelar]  [Registrar Saque]         │
└─────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Decisão: Qual Rota Usar?

```
┌─────────────────────────────────┐
│  Precisa garantir saldo Pix Out?│
└────────────┬────────────────────┘
             │
             ↓
    ┌────────────────┐
    │ Tem saldo em   │  SIM → [Pix In → Pix Out]
    │ Pix In?        │
    └────────┬───────┘
             │ NÃO
             ↓
    [Empresa → Pix Out]
             │
             ↓
    (Depois: Pix In → Empresa)
```

```
┌─────────────────────────────────┐
│  Quer sacar lucro?              │
└────────────┬────────────────────┘
             │
             ↓
    ┌────────────────────┐
    │ Pix Out instantâneo?│  SIM → [Pix Out → Empresa]
    └────────┬───────────┘
             │ NÃO
             ↓
    ┌────────────────┐
    │ Tem saldo em   │  SIM → [Pix In → Empresa]
    │ Pix In?        │
    └────────────────┘
```

---

## ✅ Checklist de Implementação

### Fase 1: Banco de Dados
- [ ] Criar tabela `saques`
- [ ] Criar tabela `saldo_pix_out`
- [ ] Criar view `lucro_por_horario`
- [ ] Adicionar RLS (Row Level Security)
- [ ] Criar índices para performance

### Fase 2: Backend (Actions)
- [ ] `registrarSaque(origem, destino, valor, tipo, obs)`
- [ ] `obterLucroPorHorario(data, periodo)` // 'dia' ou 'mes'
- [ ] `obterTotalSacado(periodo)`
- [ ] `obterSaldoPixOut()`
- [ ] `validarSaque(origem, valor)` // Verifica saldo/limites

### Fase 3: Componentes UI
- [ ] `card-saque-realizado.tsx` - KPI principal
- [ ] `modal-registrar-saque.tsx` - Formulário de registro
- [ ] `grafico-lucro-horario.tsx` - Gráfico de linha
- [ ] `tabela-ultimos-saques.tsx` - Histórico recente
- [ ] `filtro-periodo.tsx` - Dia/Mês

### Fase 4: Dashboard
- [ ] Integrar componentes no dashboard
- [ ] Adicionar atualização em tempo real
- [ ] Implementar filtros e navegação

### Fase 5: Validações e Regras
- [ ] Validar saldo antes de permitir saque
- [ ] Calcular lucro disponível automaticamente
- [ ] Sugerir melhor rota baseado em saldo/limites
- [ ] Alertas quando saldo Pix Out está baixo

---

## 📊 Métricas e KPIs

### Dashboard Principal
1. **Total Sacado** (hoje, semana, mês)
2. **Lucro em Tempo Real** (acumulado no dia)
3. **Saldo Disponível Pix Out**
4. **Maior Lucro por Horário** (highlight)
5. **Tendência** (crescimento/queda vs período anterior)

### Relatórios
- Lucro por adquirente
- Lucro por tipo de operação
- Volume de saques por período
- Eficiência de rotas (qual fluxo é mais usado)

---

## 🚀 Próximos Passos

1. ✅ **Revisar e aprovar este planejamento**
2. Implementar banco de dados
3. Criar actions no backend
4. Desenvolver componentes UI
5. Integrar no dashboard
6. Testar fluxos completos
7. Deploy

---

**Documento criado em**: 16/10/2025
**Status**: Aguardando aprovação para implementação


