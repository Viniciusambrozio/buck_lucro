# ⚡ Quick Start: Sistema de Saques e Lucro

## 🚀 Instalação em 3 Passos

### 1️⃣ Execute o SQL no Supabase (2 min)

```bash
1. Acesse: https://app.supabase.com
2. Abra seu projeto
3. Vá em SQL Editor
4. Copie TODO o conteúdo de: setup-saques-lucro.sql
5. Cole no editor
6. Clique em "Run" (Ctrl+Enter)
```

✅ **Espere a mensagem**: "Setup de Saques e Lucro concluído com sucesso!"

---

### 2️⃣ Reinicie o Servidor (1 min)

```bash
# No terminal, pare o servidor (Ctrl+C)
# Inicie novamente:
npm run dev
```

---

### 3️⃣ Acesse o Sistema (10 seg)

```bash
1. Abra: http://localhost:3000/dashboard
2. Clique em "Saques & Lucro" no menu
3. Pronto! 🎉
```

---

## 🎯 Primeiro Uso

### Registrar Seu Primeiro Saque

1. Clique no botão **"Registrar Novo Saque"**
2. Preencha:
   ```
   Valor: R$ 5.000,00
   Origem: Pix In (escolha uma adquirente)
   Destino: Conta Empresa
   Tipo: Saque de Lucro
   ```
3. Clique em **"Registrar Saque"**

✅ **Sucesso!** Seu saque aparecerá no gráfico e no histórico!

---

## 📊 O Que Você Verá

### Dashboard Principal
```
┌──────────────────────────────────────┐
│ 💰 Saque Realizado: R$ 5.000,00      │
│ 📈 Lucro Hoje: R$ 5.000,00           │
│ 🏦 Saldo Pix Out: R$ 0,00            │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  Gráfico de Lucro por Horário        │
│  [Barras mostrando seu saque]        │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  Últimos Saques                      │
│  16/10 14:30 | Pix In → Empresa     │
│  R$ 5.000,00 | Saque de Lucro       │
└──────────────────────────────────────┘
```

---

## 🔄 Fluxos Principais

### Fluxo 1: Sacar Lucro
```
Pix In → Conta Empresa = 💰 LUCRO
```

### Fluxo 2: Garantir Saldo para Sellers
```
Pix In → Pix Out = 🔄 Transferência
```

### Fluxo 3: Aportar da Empresa
```
Conta Empresa → Pix Out = 🏦 Garantia
```

---

## ⚠️ Resolvendo Problemas

### Erro: "Tabela não encontrada"
```bash
# Solução:
1. Verifique se executou o SQL no Supabase
2. Vá em Supabase > Table Editor
3. Confirme que existe: contas, saques, saldo_pix_out, movimentacoes
```

### Erro: "Saldo insuficiente"
```bash
# Solução:
1. Vá em /adquirentes
2. Adicione saldo à adquirente
3. Tente o saque novamente
```

### Gráfico está vazio
```bash
# Solução:
1. Registre um saque do tipo "Saque de Lucro"
2. O gráfico atualizará automaticamente
```

### Dashboard não carrega
```bash
# Solução:
1. Ctrl+C (para o servidor)
2. npm run dev (reinicia)
3. Acesse /dashboard novamente
```

---

## 📁 Arquivos Importantes

### Documentação:
- `RESUMO_FINAL_SAQUES_LUCRO.md` - Visão geral completa
- `INSTRUCOES_SAQUES_LUCRO.md` - Guia detalhado
- `PLANEJAMENTO_SAQUES_LUCRO.md` - Planejamento técnico
- `QUICK_START_SAQUES.md` - Este arquivo

### SQL:
- `setup-saques-lucro.sql` - Execute este no Supabase!

### Código:
- `app/actions/saques.ts` - Backend
- `components/saques/*` - Componentes UI
- `app/(dashboard)/saques-lucro/page.tsx` - Página principal

---

## 🎯 Checklist de Verificação

Após instalação, confirme:

- [ ] Executei o `setup-saques-lucro.sql` no Supabase
- [ ] Vi a mensagem de sucesso no SQL Editor
- [ ] Reiniciei o servidor (`npm run dev`)
- [ ] Consigo acessar `/saques-lucro` sem erros
- [ ] Vejo os 3 cards principais (Saque, Lucro, Saldo)
- [ ] Consigo abrir o modal "Registrar Novo Saque"
- [ ] Registrei meu primeiro saque com sucesso
- [ ] O saque aparece no gráfico e na tabela

✅ **Se todos marcados**: Sistema está funcionando perfeitamente!

---

## 💡 Dicas Rápidas

### Navegação:
```
Dashboard → Menu "Saques & Lucro" → Sistema completo
```

### Filtros do Gráfico:
```
[Dia] = Hora por hora (0h-23h)
[Mês] = Dia por dia (1-31)
📅 = Seletor de data
```

### Editar Saldo Sellers:
```
Card "Saldo Pix Out" → Clique no ícone de lápis → Digite valor → Salvar
```

### Ver Histórico Completo:
```
Role a página até "Últimos Saques"
```

---

## 📞 Suporte

### Problemas?
1. Leia: `SOLUCAO_ERRO_CONTAS.md`
2. Verifique: Console do navegador (F12)
3. Confirme: Tabelas existem no Supabase

### Funcionalidades:
1. Leia: `INSTRUCOES_SAQUES_LUCRO.md`
2. Veja: `PLANEJAMENTO_SAQUES_LUCRO.md`

---

## 🎉 Pronto!

Seu **Sistema de Saques e Lucro** está funcionando!

### Próximos Passos:
1. ✅ Registre saques reais
2. ✅ Acompanhe lucro por horário
3. ✅ Gerencie saldo da Pix Out
4. ✅ Analise tendências no gráfico

**Aproveite! 🚀**

---

**Última atualização**: 16/10/2025  
**Tempo de instalação**: ~3 minutos  
**Dificuldade**: Fácil 😊


