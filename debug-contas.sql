-- ============================================
-- SCRIPT DE DEBUG - VERIFICAR DADOS DE CONTAS
-- ============================================

-- 1. Verificar se a tabela contas existe e sua estrutura
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'contas' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar se há dados na tabela contas
SELECT 
  COUNT(*) as total_contas,
  COUNT(CASE WHEN ativo = true THEN 1 END) as contas_ativas
FROM contas;

-- 3. Listar todas as contas existentes
SELECT 
  id,
  nome,
  tipo,
  saldo_atual,
  ativo,
  created_at
FROM contas
ORDER BY tipo, nome;

-- 4. Verificar contas por tipo
SELECT 
  tipo,
  COUNT(*) as quantidade,
  COUNT(CASE WHEN ativo = true THEN 1 END) as ativas
FROM contas
GROUP BY tipo
ORDER BY tipo;

-- 5. Verificar se há adquirentes vinculados
SELECT 
  c.nome as conta_nome,
  c.tipo,
  c.saldo_atual,
  a.nome as adquirente_nome,
  a.tipo_pix
FROM contas c
LEFT JOIN adquirentes a ON c.adquirente_id = a.id
ORDER BY c.tipo, c.nome;

-- ============================================
-- SCRIPT PARA INSERIR DADOS DE TESTE
-- (Execute apenas se não houver dados)
-- ============================================

-- IMPORTANTE: Substitua 'SEU_USER_ID_AQUI' pelo seu user_id real
-- Para descobrir seu user_id, execute:
-- SELECT id FROM auth.users WHERE email = 'seu-email@exemplo.com';

/*
-- Inserir conta da empresa
INSERT INTO contas (user_id, nome, tipo, saldo_atual, ativo)
VALUES (
  'SEU_USER_ID_AQUI',
  'Conta Empresa BuckPay',
  'empresa',
  10000.00,
  true
) ON CONFLICT DO NOTHING;

-- Inserir conta Pix Out
INSERT INTO contas (user_id, nome, tipo, saldo_atual, ativo)
VALUES (
  'SEU_USER_ID_AQUI',
  'Conta Pix Out - Sellers',
  'pix_out',
  5000.00,
  true
) ON CONFLICT DO NOTHING;

-- Inserir contas Pix In (baseado nas adquirentes existentes)
INSERT INTO contas (user_id, nome, tipo, adquirente_id, saldo_atual, ativo)
SELECT 
  'SEU_USER_ID_AQUI',
  nome || ' (Pix In)',
  'pix_in',
  id,
  2000.00,
  ativo
FROM adquirentes
WHERE tipo_pix = 'pix_in'
  AND user_id = 'SEU_USER_ID_AQUI'
ON CONFLICT DO NOTHING;
*/
e