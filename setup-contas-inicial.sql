-- ============================================
-- SCRIPT DE CONFIGURAÇÃO INICIAL - CONTAS
-- Execute após configurar o banco principal
-- ============================================

-- INSTRUÇÕES:
-- 1. Descubra seu user_id executando no Supabase:
--    SELECT id FROM auth.users WHERE email = 'seu-email@exemplo.com';
-- 
-- 2. Substitua 'SEU_USER_ID_AQUI' pelo ID retornado
-- 
-- 3. Execute este script completo

-- ============================================
-- CRIAR CONTA DA EMPRESA
-- ============================================

INSERT INTO contas (user_id, nome, tipo, saldo_atual, ativo)
VALUES (
  'SEU_USER_ID_AQUI',
  'Conta Empresa BuckPay',
  'empresa',
  0.00,
  true
)
ON CONFLICT DO NOTHING;

-- ============================================
-- CRIAR CONTA PIX OUT (SELLERS)
-- ============================================

INSERT INTO contas (user_id, nome, tipo, saldo_atual, ativo)
VALUES (
  'SEU_USER_ID_AQUI',
  'Conta Pix Out - Sellers',
  'pix_out',
  0.00,
  true
)
ON CONFLICT DO NOTHING;

-- ============================================
-- VINCULAR ADQUIRENTES EXISTENTES COMO PIX IN
-- (Apenas se você já tem adquirentes cadastrados)
-- ============================================

INSERT INTO contas (user_id, nome, tipo, adquirente_id, saldo_atual, ativo)
SELECT 
  user_id,
  nome || ' (Pix In)',
  'pix_in',
  id,
  0.00,
  ativo
FROM adquirentes
WHERE tipo_pix = 'pix_in'
  AND user_id = 'SEU_USER_ID_AQUI'
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICAR CONTAS CRIADAS
-- ============================================

SELECT 
  nome,
  tipo,
  saldo_atual,
  ativo,
  created_at
FROM contas
WHERE user_id = 'SEU_USER_ID_AQUI'
ORDER BY tipo, nome;

-- ============================================
-- OPCIONAL: CRIAR CONTAS PIX IN MANUALMENTE
-- (Se não tiver adquirentes ou quiser criar do zero)
-- ============================================

-- Exemplo: Woovi White
-- INSERT INTO contas (user_id, nome, tipo, saldo_atual, ativo)
-- VALUES ('SEU_USER_ID_AQUI', 'Woovi White', 'pix_in', 0.00, true);

-- Exemplo: NomadFy
-- INSERT INTO contas (user_id, nome, tipo, saldo_atual, ativo)
-- VALUES ('SEU_USER_ID_AQUI', 'NomadFy', 'pix_in', 0.00, true);

-- Exemplo: Pluggou
-- INSERT INTO contas (user_id, nome, tipo, saldo_atual, ativo)
-- VALUES ('SEU_USER_ID_AQUI', 'Pluggou', 'pix_in', 0.00, true);

-- ============================================
-- ADICIONAR SALDO INICIAL (OPCIONAL)
-- Execute apenas se quiser começar com saldo
-- ============================================

-- Exemplo: Adicionar R$ 10.000 na Conta Empresa
-- UPDATE contas 
-- SET saldo_atual = 10000.00
-- WHERE user_id = 'SEU_USER_ID_AQUI' 
--   AND tipo = 'empresa' 
--   AND nome = 'Conta Empresa BuckPay';

-- Exemplo: Adicionar R$ 5.000 na Conta Pix Out
-- UPDATE contas 
-- SET saldo_atual = 5000.00
-- WHERE user_id = 'SEU_USER_ID_AQUI' 
--   AND tipo = 'pix_out';

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- Após executar, suas contas estarão prontas para uso!
-- Acesse o dashboard e comece a registrar saques.


