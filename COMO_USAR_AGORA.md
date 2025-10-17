# 🚀 Como Usar o Sistema Agora

## ⚡ Início Rápido (5 minutos)

### Passo 1: Configure o Banco de Dados
```bash
# 1. Acesse: https://app.supabase.com
# 2. Selecione seu projeto BuckPay
# 3. Vá em: SQL Editor
```

**Execute os scripts nesta ordem:**

#### Script 1: `database-fluxo-caixa.sql`
```sql
-- Cole todo o conteúdo do arquivo e execute
-- Isso cria: tabelas, triggers, views e políticas RLS
```

#### Script 2: Descubra seu user_id
```sql
-- Execute no SQL Editor:
SELECT id, email FROM auth.users;

-- Copie o ID que apareceu
```

#### Script 3: `setup-contas-inicial.sql`
```sql
-- 1. Abra o arquivo
-- 2. Substitua 'SEU_USER_ID_AQUI' pelo ID copiado
-- 3. Cole no SQL Editor e execute
-- Isso cria suas contas iniciais
```

### Passo 2: Verifique se Funcionou
```sql
-- Execute no SQL Editor para confirmar:
SELECT nome, tipo, saldo_atual 
FROM contas 
WHERE user_id = 'SEU_USER_ID';

-- Você deve ver:
-- - Conta Empresa BuckPay (empresa)
-- - Conta Pix Out - Sellers (pix_out)
-- - Suas contas Pix In (se tiver adquirentes)
```

### Passo 3: Acesse o Sistema
```bash
# No terminal, na pasta do projeto:
npm run dev

# Acesse: http://localhost:3000
```

### Passo 4: Faça Seu Primeiro Saque
1. Faça login
2. No dashboard, clique em **"Registrar Saque"**
3. Selecione:
   - Tipo: **Pix In → Empresa** (sacar lucro)
   - Origem: Qualquer conta Pix In
   - Destino: Conta Empresa BuckPay
   - Valor: R$ 1.000,00 (teste)
4. Clique em **"Registrar Saque"**

✅ Se deu certo:
- Uma mensagem de sucesso aparece
- Os KPIs atualizam
- A movimentação aparece no histórico

## 📊 Explorando o Sistema

### Dashboard Principal (`/dashboard`)

**O que você vê:**
- 🎯 4 KPIs de fluxo de caixa
- 📈 Gráfico de lucro por horário
- 📝 Formulário de cálculo de lucro
- 📋 Últimas movimentações

**O que você pode fazer:**
- Clicar em **"Registrar Saque"** para nova movimentação
- Navegar pelo gráfico usando setas ← →
- Alternar entre visualização Dia/Mês
- Ver últimas movimentações do dia

### Página Fluxo de Caixa (`/fluxo-caixa`)

**O que você vê:**
- 🎯 Métricas consolidadas
- 📋 Histórico completo (30 dias)
- 🔍 Todas as movimentações detalhadas

**O que você pode fazer:**
- Registrar novos saques
- Ver histórico completo
- Analisar fluxo dos últimos 30 dias
- Identificar padrões de movimentação

## 💰 Entendendo os 3 Tipos de Fluxo

### 1️⃣ Pix In → Empresa (Sacar Lucro)
```
Quando usar: Você quer transferir lucro para sua conta bancária
Exemplo: Woovi White → Conta Empresa
O que acontece:
  ✅ Saldo Woovi White diminui
  ✅ Lucro Disponível aumenta
  ✅ Registra como "lucro sacado"
```

### 2️⃣ Pix In → Pix Out (Garantir Saldo Sellers)
```
Quando usar: Sellers precisam de saldo para sacar
Exemplo: NomadFy → Conta Pix Out Sellers
O que acontece:
  ✅ Saldo NomadFy diminui
  ✅ Saldo Pix Out aumenta
  ✅ Sellers podem sacar
```

### 3️⃣ Empresa → Pix Out (Cobrir Saques)
```
Quando usar: Pix In sem saldo, mas sellers precisam sacar urgente
Exemplo: Conta Empresa → Conta Pix Out Sellers
O que acontece:
  ✅ Lucro Disponível diminui
  ✅ Saldo Pix Out aumenta
  ✅ Você "adianta" o dinheiro aos sellers
```

## 📈 Usando o Gráfico de Lucro

### Visualização por Dia
1. Certifique-se que **"Dia"** está selecionado
2. Use as setas para navegar entre datas
3. Veja o lucro por horário do dia
4. Passe o mouse sobre os pontos para detalhes

**Use para:**
- Identificar horários de maior lucro
- Ver evolução do lucro ao longo do dia
- Comparar dias diferentes

### Visualização por Mês
1. Clique em **"Mês"**
2. Use as setas para navegar entre meses
3. Veja o lucro total por dia do mês
4. Analise tendências mensais

**Use para:**
- Ver crescimento mês a mês
- Identificar dias mais lucrativos
- Planejar estratégias

## 🎯 Casos de Uso Práticos

### Rotina Diária
```
09:00 - Verificar KPIs no dashboard
       - Total sacado hoje
       - Saldo Pix Out
       - Lucro disponível

13:00 - Registrar cálculo de lucro
       - Usar formulário existente
       - Ver lucro atualizado no gráfico

18:00 - Sacar parte do lucro
       - Pix In → Empresa
       - Deixar reserva para sellers

22:00 - Revisar movimentações do dia
       - Checar histórico
       - Analisar gráfico
```

### Toda Segunda-Feira
```
1. Ver gráfico da semana anterior
2. Comparar com semanas anteriores
3. Identificar tendências
4. Ajustar estratégias
```

### Todo Início de Mês
```
1. Alternar gráfico para visualização mensal
2. Ver crescimento mês a mês
3. Exportar dados se necessário
4. Planejar metas do novo mês
```

## ⚠️ Avisos Importantes

### ❌ NÃO faça:
- Deletar movimentações (saldos não revertem automaticamente)
- Criar movimentações com valores negativos
- Transferir de uma conta para ela mesma

### ✅ Sempre faça:
- Verifique saldo antes de sacar
- Adicione observações nas movimentações
- Mantenha saldo Pix Out >= soma dos saldos dos sellers
- Revise histórico periodicamente

## 🔧 Solução de Problemas

### Erro: "Saldo insuficiente"
**Causa:** Conta origem não tem saldo suficiente
**Solução:** Escolha outra conta ou diminua o valor

### Erro: "Conta inválida"
**Causa:** Conta foi desativada ou não existe
**Solução:** Verifique se as contas estão ativas

### KPIs não atualizam
**Causa:** Cache do navegador
**Solução:** Recarregue a página (F5)

### Gráfico não carrega
**Causa:** Sem dados para o período
**Solução:** Verifique se há cálculos registrados

## 📞 Próximos Passos

1. ✅ Execute os scripts SQL
2. ✅ Teste registrando um saque
3. ✅ Explore o gráfico de lucro
4. ✅ Navegue pelo histórico
5. ✅ Integre na sua rotina diária

## 📚 Documentação Completa

- **GUIA_FLUXO_CAIXA.md** - Guia detalhado do usuário
- **IMPLEMENTACAO_FLUXO_CAIXA.md** - Detalhes técnicos completos
- **RESUMO_EXECUTIVO_FLUXO_CAIXA.md** - Visão geral executiva
- **README.md** - Documentação geral do sistema

---

## 🎉 Pronto para Usar!

Seu sistema está completo e funcional. Agora você tem:

✅ Visibilidade total do fluxo de caixa
✅ Controle de saques e transferências
✅ Gráficos para análise de tendências
✅ Histórico completo de movimentações
✅ Separação clara entre lucro empresa e saldo sellers

**Comece agora e tenha controle total do seu fluxo de caixa! 🚀**


