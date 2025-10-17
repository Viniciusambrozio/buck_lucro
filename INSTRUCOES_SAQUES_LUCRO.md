# 🚀 Instruções de Instalação: Sistema de Saques e Lucro

## 📋 Passo a Passo

### 1️⃣ Aplicar o Setup no Banco de Dados (Supabase)

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral esquerdo)
4. Clique em **New Query**
5. Copie todo o conteúdo do arquivo: `setup-saques-lucro.sql`
6. Cole no editor SQL
7. Clique em **Run** (ou pressione `Ctrl+Enter`)

✅ **Resultado Esperado**: Você verá uma mensagem de sucesso dizendo:
```
✅ Setup de Saques e Lucro concluído com sucesso!
📊 Tabelas criadas: saques, saldo_pix_out
📈 Views criadas: lucro_por_horario, lucro_por_dia, resumo_saques
🔒 RLS ativado e políticas configuradas
⚡ Triggers e funções configurados
```

---

### 2️⃣ Verificar se as Tabelas Foram Criadas

No Supabase, vá em **Table Editor** e verifique se as seguintes tabelas existem:
- ✅ `saques`
- ✅ `saldo_pix_out`

---

### 3️⃣ Acessar o Sistema

1. Inicie o servidor de desenvolvimento (se ainda não estiver rodando):
   ```bash
   npm run dev
   ```

2. Acesse: `http://localhost:3000/dashboard`

3. No menu de navegação, clique em **"Saques & Lucro"**

---

## 🎯 Funcionalidades Disponíveis

### 💰 Card: Saque Realizado
- Exibe o total sacado
- Mostra lucro sacado
- Botão para registrar novo saque

### 📈 Card: Lucro Hoje
- Lucro acumulado no dia
- Variação percentual em relação a ontem

### 🏦 Card: Saldo Pix Out
- Saldo total da conta Pix Out
- Saldo comprometido com sellers (editável)
- Saldo disponível (calculado automaticamente)

### 📊 Gráfico de Lucro
- Visualização por horário (dia)
- Visualização por dia (mês)
- Filtros de data interativos

### 📝 Tabela de Últimos Saques
- Histórico das últimas 10 operações
- Origem e destino claramente identificados
- Tipo de operação (lucro, transferência, garantia)

---

## 🔄 Fluxos de Movimentação

### 1. Registrar Novo Saque

1. Clique no botão **"Registrar Novo Saque"**
2. Preencha o formulário:
   - **Valor**: Digite o valor do saque
   - **Origem**: Selecione de onde sairá o dinheiro
     - Pix In (selecione a adquirente)
     - Pix Out
     - Conta Empresa
   - **Destino**: Selecione para onde irá o dinheiro
     - Pix In (selecione a adquirente)
     - Pix Out
     - Conta Empresa
   - **Tipo de Operação**: (auto-detectado, mas pode ser alterado)
     - 💰 Saque de Lucro (Pix In/Out → Empresa)
     - 🔄 Transferência (entre contas)
     - 🏦 Garantia de Saldo (Empresa → Pix Out)
   - **Observações**: (opcional) Adicione notas

3. Clique em **"Registrar Saque"**

✅ **Resultado**: 
- Saque registrado com sucesso
- Saldos atualizados automaticamente
- Gráfico e métricas atualizados em tempo real

---

### 2. Atualizar Saldo dos Sellers (Pix Out)

1. No card **"Saldo Pix Out"**, clique no ícone de edição (lápis)
2. Digite o novo saldo dos sellers
3. Clique em **"Salvar"**

✅ **Resultado**: O saldo disponível (seu lucro) será recalculado automaticamente.

---

## 📊 Cenários de Uso Prático

### Cenário 1: Garantir Saldo para Sellers Sacarem
**Objetivo**: Transferir dinheiro para a Pix Out para que sellers possam sacar

**Passos**:
1. Registrar Novo Saque
2. Origem: **Pix In** (selecionar adquirente com saldo)
3. Destino: **Pix Out**
4. Tipo: **Transferência**
5. Registrar

**Se não tiver saldo suficiente na Pix In**:
1. Origem: **Conta Empresa**
2. Destino: **Pix Out**
3. Tipo: **Garantia de Saldo**

---

### Cenário 2: Sacar Lucro para a Empresa
**Objetivo**: Transferir lucro das adquirentes para a conta da empresa

**Passos**:
1. Registrar Novo Saque
2. Origem: **Pix In** (selecionar adquirente)
3. Destino: **Conta Empresa**
4. Tipo: **Saque de Lucro** 💰
5. Registrar

✅ Este valor aparecerá como **lucro sacado** nas métricas!

---

### Cenário 3: Sacar Lucro da Pix Out (se instantâneo)
**Objetivo**: Retirar lucro disponível da Pix Out

**Condição**: Saque deve ser instantâneo

**Passos**:
1. Registrar Novo Saque
2. Origem: **Pix Out**
3. Destino: **Conta Empresa**
4. Tipo: **Saque de Lucro** 💰
5. Registrar

---

## 🔍 Monitoramento em Tempo Real

### Visualizar Lucro por Horário
1. Acesse a página **Saques & Lucro**
2. No gráfico, alterne entre:
   - **Dia**: Veja lucro hora por hora (0h-23h)
   - **Mês**: Veja lucro dia por dia (1-31)
3. Use o seletor de data para navegar entre períodos

### KPIs Principais
- **Total Sacado**: Soma de todas as operações
- **Lucro Hoje**: Apenas saques de tipo "lucro" no dia
- **Saldo Disponível Pix Out**: O que você tem disponível após comprometer com sellers

---

## ⚠️ Validações Automáticas

O sistema valida automaticamente:
- ✅ Saldo suficiente na origem
- ✅ Origem e destino diferentes
- ✅ Valores positivos
- ✅ Adquirente obrigatória quando origem/destino é Pix In
- ✅ Saldo dos sellers não pode ser maior que saldo total

---

## 🐛 Solução de Problemas

### Erro: "Usuário não autenticado"
**Solução**: Faça login novamente em `/login`

### Erro: "Saldo insuficiente"
**Solução**: Verifique o saldo da adquirente de origem antes de registrar o saque

### Erro: "Adquirente de origem é obrigatória"
**Solução**: Ao selecionar "Pix In" como origem, você deve selecionar qual adquirente

### Gráfico não mostra dados
**Solução**: Registre pelo menos um saque de tipo "lucro" para visualizar no gráfico

---

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- 💻 Desktop
- 📱 Mobile
- 🖥️ Tablet

---

## 🔐 Segurança

- ✅ Row Level Security (RLS) ativado
- ✅ Apenas o usuário autenticado vê seus próprios dados
- ✅ Triggers automáticos para atualizar saldos
- ✅ Validações no backend e frontend

---

## 📈 Próximos Passos (Opcional)

- [ ] Adicionar exportação de relatórios (PDF/Excel)
- [ ] Notificações quando saldo Pix Out estiver baixo
- [ ] Sugestão automática de melhor rota para saques
- [ ] Dashboard com previsão de lucro baseado em histórico

---

## 📞 Suporte

Se tiver dúvidas ou encontrar problemas, consulte:
- `PLANEJAMENTO_SAQUES_LUCRO.md` - Planejamento completo
- `setup-saques-lucro.sql` - Script SQL do banco
- `ARQUITETURA.md` - Arquitetura geral do sistema

---

**Última atualização**: 16/10/2025
**Versão**: 1.0.0


