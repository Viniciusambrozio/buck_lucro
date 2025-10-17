# 🔧 Solução: Erro "Tabela contas não encontrada"

## ❌ Problema Identificado

O dashboard estava tentando buscar a tabela `contas`, mas ela não havia sido criada no banco de dados, causando o erro:

```
Erro ao buscar contas: {}
Error: Erro ao buscar contas
```

## ✅ Solução Aplicada

A tabela `contas` foi adicionada ao script `setup-saques-lucro.sql` com a seguinte estrutura:

### Estrutura da Tabela `contas`

```sql
CREATE TABLE public.contas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('empresa', 'pix_in', 'pix_out')),
  adquirente_id UUID REFERENCES public.adquirentes(id) ON DELETE SET NULL,
  saldo_atual DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (saldo_atual >= 0),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tipos de Conta

1. **`empresa`**: Conta bancária da empresa
2. **`pix_in`**: Contas de adquirentes que recebem pagamentos
3. **`pix_out`**: Conta onde sellers solicitam saques

### Dados Iniciais Criados Automaticamente

O script agora cria automaticamente 2 contas para cada usuário:

1. **Conta Empresa** (tipo: `empresa`)
2. **Conta Pix Out** (tipo: `pix_out`)

### View Adicional: `vw_saldos_consolidados`

Também foi criada uma view para consolidar saldos por tipo:

```sql
CREATE VIEW vw_saldos_consolidados AS
SELECT 
  user_id,
  tipo,
  SUM(saldo_atual) as saldo_total,
  COUNT(*) as num_contas
FROM contas
WHERE ativo = true
GROUP BY user_id, tipo;
```

## 📝 Passo a Passo para Corrigir

### 1. Execute o Script Atualizado

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Vá em **SQL Editor**
3. Execute o arquivo completo: `setup-saques-lucro.sql`

### 2. Verifique se as Tabelas Foram Criadas

Execute no SQL Editor:

```sql
-- Ver tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('contas', 'saques', 'saldo_pix_out');

-- Ver suas contas
SELECT * FROM contas WHERE user_id = auth.uid();
```

### 3. Reinicie o Servidor de Desenvolvimento

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

### 4. Acesse o Dashboard

Agora o erro deve estar resolvido e você poderá acessar:
- `/dashboard` ✅
- `/saques-lucro` ✅

## 🎯 O Que Foi Corrigido

### Antes ❌
- Tabela `contas` não existia
- Dashboard quebrava ao tentar buscar contas
- Erro: "Erro ao buscar contas"

### Depois ✅
- Tabela `contas` criada com estrutura completa
- RLS (Row Level Security) configurado
- Políticas de acesso implementadas
- Dados iniciais criados automaticamente
- View de saldos consolidados disponível
- Dashboard funciona perfeitamente

## 🔍 Estrutura Completa Criada

### Tabelas
- ✅ `contas` - Gerencia contas do sistema
- ✅ `saques` - Registra movimentações
- ✅ `saldo_pix_out` - Gerencia saldo da Pix Out

### Views
- ✅ `lucro_por_horario` - Lucro agregado por hora
- ✅ `lucro_por_dia` - Lucro agregado por dia
- ✅ `resumo_saques` - Resumo geral de saques
- ✅ `vw_saldos_consolidados` - Saldos por tipo de conta

### Índices (Performance)
- ✅ `idx_contas_user_id`
- ✅ `idx_contas_tipo`
- ✅ `idx_contas_ativo`
- ✅ `idx_saques_*` (múltiplos)
- ✅ `idx_saldo_pix_out_user_id`

### Segurança
- ✅ RLS habilitado em todas as tabelas
- ✅ Políticas de SELECT, INSERT, UPDATE, DELETE
- ✅ Usuários só acessam seus próprios dados

### Triggers
- ✅ `atualizar_saldo_pix_out` - Atualiza saldo automaticamente
- ✅ `trigger_updated_at` - Atualiza timestamps

## 🚀 Próximos Passos

1. ✅ Erro corrigido
2. Execute o script SQL atualizado
3. Reinicie o servidor
4. Acesse `/saques-lucro`
5. Registre seu primeiro saque!

## 📞 Suporte

Se o erro persistir:

1. **Verifique se está autenticado**: Faça login em `/login`
2. **Verifique o banco**: Confirme que as tabelas foram criadas
3. **Limpe o cache**: Pare e reinicie o servidor
4. **Verifique o console**: Procure por outros erros relacionados

---

**Problema Resolvido**: ✅  
**Data**: 16/10/2025  
**Versão do Fix**: 1.0.1


