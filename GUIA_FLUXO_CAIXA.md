# 💰 Guia do Sistema de Fluxo de Caixa

## 📋 Visão Geral

O Sistema de Fluxo de Caixa da BuckPay permite gerenciar e visualizar todas as movimentações financeiras entre:
- **Contas Empresa**: Contas bancárias da empresa
- **Contas Pix In**: Adquirentes que recebem pagamentos
- **Conta Pix Out**: Conta dedicada para saques dos sellers

## 🎯 Funcionalidades Principais

### 1. Dashboard com KPIs
- **Total Sacado Hoje**: Valor total de todas as movimentações do dia
- **Total Sacado no Mês**: Acumulado mensal de saques
- **Saldo Pix Out**: Saldo disponível para pagamentos aos sellers
- **Lucro Disponível**: Total em contas da empresa (lucro líquido)

### 2. Gráfico de Lucro por Horário
- Visualização interativa do lucro ao longo do dia ou mês
- Toggle entre visualização diária e mensal
- Navegação por data com setas
- Tooltip com detalhes ao passar o mouse
- Métricas: lucro total, lucro médio e número de registros

### 3. Registro de Saques
Três tipos de movimentação:

#### a) **Pix In → Empresa** (Sacar Lucro)
- Transfere dinheiro de adquirentes Pix In para conta empresa
- Representa o lucro que está sendo sacado
- Exemplo: Woovi White → Conta Empresa BuckPay

#### b) **Pix In → Pix Out** (Abastecer Sellers)
- Transfere dinheiro de adquirentes Pix In para conta Pix Out
- Garante saldo para pagamento aos sellers
- Exemplo: NomadFy → Conta Pix Out Sellers

#### c) **Empresa → Pix Out** (Cobrir Saque Sellers)
- Transfere da conta empresa para conta Pix Out
- Usado quando adquirentes Pix In não têm saldo suficiente
- Exemplo: Conta Empresa → Conta Pix Out Sellers

### 4. Histórico de Movimentações
- Visualização completa de todas as transferências
- Filtros por data, tipo e conta
- Detalhes: origem, destino, valor, tipo e observações
- Página dedicada com histórico dos últimos 30 dias

## 🚀 Como Configurar

### Passo 1: Executar Script SQL
1. Acesse o painel do Supabase
2. Vá em **SQL Editor**
3. Abra o arquivo `database-fluxo-caixa.sql`
4. Execute o script completo

Isso criará:
- Tabela `contas` (contas bancárias e adquirentes)
- Tabela `movimentacoes` (registro de saques/transferências)
- Tabela `snapshots_saldo` (histórico de saldos)
- Views para relatórios
- Triggers para atualização automática de saldos
- Políticas de segurança (RLS)

### Passo 2: Criar Contas Iniciais
No Supabase, execute (substitua `SEU_USER_ID` pelo ID do seu usuário):

```sql
-- Conta da Empresa
INSERT INTO contas (user_id, nome, tipo, saldo_atual, ativo)
VALUES ('SEU_USER_ID', 'Conta Empresa BuckPay', 'empresa', 0.00, true);

-- Conta Pix Out (Sellers)
INSERT INTO contas (user_id, nome, tipo, saldo_atual, ativo)
VALUES ('SEU_USER_ID', 'Conta Pix Out - Sellers', 'pix_out', 0.00, true);

-- Vincular adquirentes existentes como Pix In
-- (Opcional, pode criar manualmente via sistema)
```

### Passo 3: Vincular Adquirentes
Se você já tem adquirentes cadastrados, pode vinculá-los como contas Pix In:

```sql
-- Para cada adquirente Pix In
INSERT INTO contas (user_id, nome, tipo, adquirente_id, saldo_atual, ativo)
SELECT 
  user_id,
  nome,
  'pix_in',
  id,
  0.00,
  ativo
FROM adquirentes
WHERE tipo_pix = 'pix_in';
```

## 📖 Como Usar

### Registrar um Saque

1. **No Dashboard**, clique em **"Registrar Saque"**
2. Selecione o **tipo de movimentação**:
   - **Pix In → Empresa**: Para sacar seu lucro
   - **Pix In → Pix Out**: Para garantir saldo aos sellers
   - **Empresa → Pix Out**: Para cobrir saques quando necessário

3. Escolha a **conta de origem** (mostra saldo disponível)
4. Escolha a **conta de destino**
5. Informe o **valor** da transferência
6. Adicione uma **observação** (opcional)
7. Clique em **"Registrar Saque"**

✅ O sistema automaticamente:
- Debita o valor da conta origem
- Credita o valor na conta destino
- Registra data, hora e tipo da movimentação
- Atualiza os KPIs no dashboard

### Visualizar Gráfico de Lucro

1. No **Dashboard**, veja o gráfico "Lucro por Horário"
2. Use os botões **"←"** e **"→"** para navegar entre datas
3. Clique em **"Dia"** ou **"Mês"** para alternar visualização
4. Passe o mouse sobre os pontos para ver detalhes
5. Visualize métricas: lucro total, média e registros

### Acessar Histórico Completo

1. No **menu superior**, clique em **"Fluxo de Caixa"**
2. Visualize:
   - KPIs consolidados
   - Histórico dos últimos 30 dias
   - Todas as movimentações com filtros
3. Registre novos saques diretamente desta página

## 🔍 Entendendo os Fluxos

### Cenário 1: Sacar Lucro
```
Adquirente Pix In (R$ 10.000) → Conta Empresa (R$ 10.000)
```
- Você está movendo o lucro para sua conta bancária
- Lucro disponível aumenta em R$ 10.000

### Cenário 2: Garantir Saldo para Sellers
```
Adquirente Pix In (R$ 5.000) → Pix Out (R$ 5.000)
```
- Você está garantindo que sellers possam sacar
- Saldo Pix Out aumenta em R$ 5.000
- Sellers podem solicitar até R$ 5.000 em saques

### Cenário 3: Cobrir Saques (sem saldo em Pix In)
```
Conta Empresa (R$ 3.000) → Pix Out (R$ 3.000)
```
- Você está usando lucro da empresa para cobrir saques
- Saldo Pix Out aumenta em R$ 3.000
- Lucro disponível diminui em R$ 3.000

## 📊 Métricas e KPIs

### Total Sacado
- Soma de todas as movimentações do dia/mês
- Indica o volume de dinheiro em circulação
- KPI principal para acompanhamento diário

### Saldo Pix Out
- Quanto está disponível para sellers sacarem
- Deve ser >= soma dos saldos dos sellers
- Alerta se ficar muito baixo

### Lucro Disponível
- Total em contas da empresa
- Representa lucro líquido sacado
- Pode ser reinvestido ou distribuído

## 🔒 Segurança

- ✅ Todas as tabelas têm **Row Level Security (RLS)**
- ✅ Usuários só veem suas próprias contas e movimentações
- ✅ Validação de saldo antes de cada movimentação
- ✅ Triggers automáticos para consistência de dados
- ✅ Auditoria completa com timestamps

## ⚠️ Avisos Importantes

1. **Saldo Insuficiente**: O sistema não permite sacar mais do que o saldo disponível
2. **Conta Origem = Destino**: Não é possível transferir para a mesma conta
3. **Exclusão de Movimentações**: Ao deletar, os saldos NÃO são revertidos automaticamente (use com cuidado)
4. **Contas Inativas**: Contas marcadas como inativas não aparecem nas opções de saque

## 🎨 Design e UX

- Interface **minimalista** preto e branco
- Cards de métricas com **ícones intuitivos**
- Gráfico **interativo** com tooltip
- Formulário de saque com **seleção guiada**
- Tabela de histórico com **badges coloridos**
- Responsivo para **mobile e desktop**

## 📈 Próximas Melhorias Possíveis

- [ ] Exportação de relatórios em PDF/CSV
- [ ] Alertas quando saldo Pix Out ficar baixo
- [ ] Projeção de fluxo de caixa
- [ ] Integração com APIs bancárias
- [ ] Relatórios por adquirente
- [ ] Dashboard comparativo mês a mês
- [ ] Agendamento de transferências

## 🆘 Suporte

Em caso de dúvidas ou problemas:

1. Verifique se o script SQL foi executado corretamente
2. Confirme que as contas iniciais foram criadas
3. Verifique permissões RLS no Supabase
4. Consulte os logs no navegador (F12 > Console)
5. Verifique os logs do Supabase (Logs > API Logs)

---

**Sistema desenvolvido para BuckPay | Versão 2.0**


