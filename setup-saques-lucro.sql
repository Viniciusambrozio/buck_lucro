-- ============================================
-- SETUP: Sistema de Saques e Lucro em Tempo Real
-- Criado em: 16/10/2025
-- ============================================

-- ============================================
-- 0. TABELA: contas
-- Gerencia contas do sistema (Empresa, Pix In, Pix Out)
-- ============================================
CREATE TABLE IF NOT EXISTS public.contas (
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

COMMENT ON TABLE public.contas IS 'Gerencia contas do sistema (Empresa, Pix In, Pix Out)';
COMMENT ON COLUMN public.contas.tipo IS 'Tipo de conta: empresa, pix_in, pix_out';
COMMENT ON COLUMN public.contas.adquirente_id IS 'Vincula conta Pix In a uma adquirente (opcional)';

-- Índices
CREATE INDEX IF NOT EXISTS idx_contas_user_id ON public.contas(user_id);
CREATE INDEX IF NOT EXISTS idx_contas_tipo ON public.contas(tipo);
CREATE INDEX IF NOT EXISTS idx_contas_ativo ON public.contas(ativo);

-- RLS para contas
ALTER TABLE public.contas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver suas próprias contas" ON public.contas;
CREATE POLICY "Usuários podem ver suas próprias contas"
  ON public.contas FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir suas próprias contas" ON public.contas;
CREATE POLICY "Usuários podem inserir suas próprias contas"
  ON public.contas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias contas" ON public.contas;
CREATE POLICY "Usuários podem atualizar suas próprias contas"
  ON public.contas FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar suas próprias contas" ON public.contas;
CREATE POLICY "Usuários podem deletar suas próprias contas"
  ON public.contas FOR DELETE
  USING (auth.uid() = user_id);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contas TO authenticated;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_contas_updated_at ON public.contas;
CREATE TRIGGER trigger_contas_updated_at
  BEFORE UPDATE ON public.contas
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_updated_at();

-- ============================================
-- 0.5 TABELA: movimentacoes
-- Registra movimentações de fluxo de caixa entre contas
-- ============================================
CREATE TABLE IF NOT EXISTS public.movimentacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  horario TIME NOT NULL,
  conta_origem_id UUID NOT NULL REFERENCES public.contas(id) ON DELETE RESTRICT,
  conta_destino_id UUID NOT NULL REFERENCES public.contas(id) ON DELETE RESTRICT,
  valor DECIMAL(15, 2) NOT NULL CHECK (valor > 0),
  tipo_movimentacao TEXT NOT NULL CHECK (tipo_movimentacao IN ('saque', 'transferencia', 'aporte')),
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT conta_origem_destino_diferentes CHECK (conta_origem_id != conta_destino_id)
);

COMMENT ON TABLE public.movimentacoes IS 'Registra movimentações de fluxo de caixa entre contas';
COMMENT ON COLUMN public.movimentacoes.tipo_movimentacao IS 'saque: retirada | transferencia: entre contas | aporte: entrada';

-- Índices
CREATE INDEX IF NOT EXISTS idx_movimentacoes_user_id ON public.movimentacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data ON public.movimentacoes(data DESC);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_user_data ON public.movimentacoes(user_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_tipo ON public.movimentacoes(tipo_movimentacao);

-- RLS para movimentacoes
ALTER TABLE public.movimentacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver suas próprias movimentações" ON public.movimentacoes;
CREATE POLICY "Usuários podem ver suas próprias movimentações"
  ON public.movimentacoes FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir suas próprias movimentações" ON public.movimentacoes;
CREATE POLICY "Usuários podem inserir suas próprias movimentações"
  ON public.movimentacoes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias movimentações" ON public.movimentacoes;
CREATE POLICY "Usuários podem atualizar suas próprias movimentações"
  ON public.movimentacoes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar suas próprias movimentações" ON public.movimentacoes;
CREATE POLICY "Usuários podem deletar suas próprias movimentações"
  ON public.movimentacoes FOR DELETE
  USING (auth.uid() = user_id);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.movimentacoes TO authenticated;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_movimentacoes_updated_at ON public.movimentacoes;
CREATE TRIGGER trigger_movimentacoes_updated_at
  BEFORE UPDATE ON public.movimentacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_updated_at();

-- ============================================
-- 0.6 VIEW: vw_movimentacoes_detalhadas
-- View com detalhes completos das movimentações
-- ============================================
CREATE OR REPLACE VIEW public.vw_movimentacoes_detalhadas AS
SELECT 
  m.id,
  m.user_id,
  m.data,
  m.horario,
  m.valor,
  m.tipo_movimentacao,
  m.observacao,
  m.created_at,
  co.id as conta_origem_id,
  co.nome as conta_origem_nome,
  co.tipo as conta_origem_tipo,
  cd.id as conta_destino_id,
  cd.nome as conta_destino_nome,
  cd.tipo as conta_destino_tipo
FROM public.movimentacoes m
INNER JOIN public.contas co ON m.conta_origem_id = co.id
INNER JOIN public.contas cd ON m.conta_destino_id = cd.id;

COMMENT ON VIEW public.vw_movimentacoes_detalhadas IS 'View com detalhes completos das movimentações incluindo nomes das contas';

-- Grants para a view
GRANT SELECT ON public.vw_movimentacoes_detalhadas TO authenticated;

-- ============================================
-- 0.7 FUNÇÃO: atualizar_saldos_movimentacao
-- Atualiza saldos das contas após movimentação
-- ============================================
CREATE OR REPLACE FUNCTION public.atualizar_saldos_movimentacao()
RETURNS TRIGGER AS $$
BEGIN
  -- Diminui saldo da conta de origem
  UPDATE public.contas
  SET saldo_atual = saldo_atual - NEW.valor
  WHERE id = NEW.conta_origem_id;
  
  -- Aumenta saldo da conta de destino
  UPDATE public.contas
  SET saldo_atual = saldo_atual + NEW.valor
  WHERE id = NEW.conta_destino_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.atualizar_saldos_movimentacao IS 'Atualiza saldos das contas após movimentação';

-- Trigger
DROP TRIGGER IF EXISTS trigger_atualizar_saldos_movimentacao ON public.movimentacoes;
CREATE TRIGGER trigger_atualizar_saldos_movimentacao
  AFTER INSERT ON public.movimentacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.atualizar_saldos_movimentacao();

COMMENT ON TRIGGER trigger_atualizar_saldos_movimentacao ON public.movimentacoes IS 'Atualiza saldos automaticamente após inserir movimentação';

-- ============================================
-- 1. TABELA: saques
-- Registra todas as movimentações entre contas
-- ============================================
CREATE TABLE IF NOT EXISTS public.saques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  valor DECIMAL(15, 2) NOT NULL CHECK (valor > 0),
  origem TEXT NOT NULL, -- 'pix_in', 'pix_out', 'conta_empresa'
  destino TEXT NOT NULL, -- 'pix_in', 'pix_out', 'conta_empresa'
  tipo_operacao TEXT NOT NULL, -- 'lucro', 'transferencia', 'garantia_saldo'
  adquirente_origem_id UUID REFERENCES public.adquirentes(id) ON DELETE SET NULL,
  adquirente_destino_id UUID REFERENCES public.adquirentes(id) ON DELETE SET NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT origem_destino_diferentes CHECK (
    origem != destino OR 
    adquirente_origem_id IS DISTINCT FROM adquirente_destino_id
  ),
  CONSTRAINT tipo_operacao_valido CHECK (
    tipo_operacao IN ('lucro', 'transferencia', 'garantia_saldo')
  ),
  CONSTRAINT origem_valida CHECK (
    origem IN ('pix_in', 'pix_out', 'conta_empresa')
  ),
  CONSTRAINT destino_valido CHECK (
    destino IN ('pix_in', 'pix_out', 'conta_empresa')
  )
);

-- Comentários
COMMENT ON TABLE public.saques IS 'Registra todas as movimentações de saque entre contas';
COMMENT ON COLUMN public.saques.origem IS 'Tipo de conta de origem: pix_in, pix_out, conta_empresa';
COMMENT ON COLUMN public.saques.destino IS 'Tipo de conta de destino: pix_in, pix_out, conta_empresa';
COMMENT ON COLUMN public.saques.tipo_operacao IS 'lucro: saque para empresa | transferencia: entre contas | garantia_saldo: empresa para pix_out';
COMMENT ON COLUMN public.saques.adquirente_origem_id IS 'ID da adquirente de origem (se aplicável)';
COMMENT ON COLUMN public.saques.adquirente_destino_id IS 'ID da adquirente de destino (se aplicável)';

-- ============================================
-- 2. TABELA: saldo_pix_out
-- Gerencia o saldo da conta Pix Out
-- ============================================
CREATE TABLE IF NOT EXISTS public.saldo_pix_out (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  saldo_total DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (saldo_total >= 0),
  saldo_sellers DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (saldo_sellers >= 0),
  saldo_disponivel DECIMAL(15, 2) GENERATED ALWAYS AS (saldo_total - saldo_sellers) STORED,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: saldo_sellers não pode ser maior que saldo_total
  CONSTRAINT saldo_sellers_valido CHECK (saldo_sellers <= saldo_total),
  
  -- Constraint: apenas um registro por usuário
  CONSTRAINT unique_user_saldo UNIQUE (user_id)
);

-- Comentários
COMMENT ON TABLE public.saldo_pix_out IS 'Gerencia o saldo da conta Pix Out para saques de sellers';
COMMENT ON COLUMN public.saldo_pix_out.saldo_total IS 'Saldo total na conta Pix Out';
COMMENT ON COLUMN public.saldo_pix_out.saldo_sellers IS 'Saldo comprometido com sellers';
COMMENT ON COLUMN public.saldo_pix_out.saldo_disponivel IS 'Saldo disponível (total - sellers) - CALCULADO AUTOMATICAMENTE';

-- ============================================
-- 3. ÍNDICES para Performance
-- ============================================

-- Índices para tabela saques
CREATE INDEX IF NOT EXISTS idx_saques_user_id ON public.saques(user_id);
CREATE INDEX IF NOT EXISTS idx_saques_created_at ON public.saques(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saques_user_created ON public.saques(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saques_tipo_operacao ON public.saques(tipo_operacao);
CREATE INDEX IF NOT EXISTS idx_saques_user_tipo ON public.saques(user_id, tipo_operacao);
CREATE INDEX IF NOT EXISTS idx_saques_origem_destino ON public.saques(origem, destino);

-- Índice para tabela saldo_pix_out
CREATE INDEX IF NOT EXISTS idx_saldo_pix_out_user_id ON public.saldo_pix_out(user_id);

-- ============================================
-- 4. VIEW: lucro_por_horario
-- Agrega lucro por horário para gráficos
-- ============================================
CREATE OR REPLACE VIEW public.lucro_por_horario AS
SELECT 
  s.user_id,
  DATE_TRUNC('hour', s.created_at) as horario,
  DATE(s.created_at) as dia,
  EXTRACT(HOUR FROM s.created_at) as hora,
  SUM(CASE 
    WHEN s.tipo_operacao = 'lucro' AND s.destino = 'conta_empresa' 
    THEN s.valor 
    ELSE 0 
  END) as lucro_horario,
  COUNT(CASE 
    WHEN s.tipo_operacao = 'lucro' 
    THEN 1 
  END) as num_saques_lucro,
  COUNT(*) as num_operacoes_total
FROM public.saques s
GROUP BY s.user_id, DATE_TRUNC('hour', s.created_at), DATE(s.created_at), EXTRACT(HOUR FROM s.created_at)
ORDER BY horario DESC;

COMMENT ON VIEW public.lucro_por_horario IS 'Agrega lucro e operações por horário para visualização';

-- ============================================
-- 5. VIEW: lucro_por_dia
-- Agrega lucro por dia para visão mensal
-- ============================================
CREATE OR REPLACE VIEW public.lucro_por_dia AS
SELECT 
  s.user_id,
  DATE(s.created_at) as dia,
  SUM(CASE 
    WHEN s.tipo_operacao = 'lucro' AND s.destino = 'conta_empresa' 
    THEN s.valor 
    ELSE 0 
  END) as lucro_dia,
  COUNT(CASE 
    WHEN s.tipo_operacao = 'lucro' 
    THEN 1 
  END) as num_saques_lucro,
  COUNT(*) as num_operacoes_total,
  MIN(s.created_at) as primeira_operacao,
  MAX(s.created_at) as ultima_operacao
FROM public.saques s
GROUP BY s.user_id, DATE(s.created_at)
ORDER BY dia DESC;

COMMENT ON VIEW public.lucro_por_dia IS 'Agrega lucro e operações por dia para visão mensal';

-- ============================================
-- 6. VIEW: resumo_saques
-- Resumo geral de saques para dashboard
-- ============================================
CREATE OR REPLACE VIEW public.resumo_saques AS
SELECT 
  s.user_id,
  -- Total sacado (todos os tipos)
  SUM(s.valor) as total_sacado,
  -- Lucro sacado (apenas tipo 'lucro')
  SUM(CASE WHEN s.tipo_operacao = 'lucro' THEN s.valor ELSE 0 END) as total_lucro,
  -- Transferências
  SUM(CASE WHEN s.tipo_operacao = 'transferencia' THEN s.valor ELSE 0 END) as total_transferencias,
  -- Garantias de saldo
  SUM(CASE WHEN s.tipo_operacao = 'garantia_saldo' THEN s.valor ELSE 0 END) as total_garantias,
  -- Contadores
  COUNT(*) as total_operacoes,
  COUNT(CASE WHEN s.tipo_operacao = 'lucro' THEN 1 END) as num_saques_lucro,
  -- Datas
  MIN(s.created_at) as primeira_operacao,
  MAX(s.created_at) as ultima_operacao
FROM public.saques s
GROUP BY s.user_id;

COMMENT ON VIEW public.resumo_saques IS 'Resumo geral de todas as operações de saque';

-- ============================================
-- 6.5 VIEW: vw_saldos_consolidados
-- Consolida saldos por tipo de conta
-- ============================================
CREATE OR REPLACE VIEW public.vw_saldos_consolidados AS
SELECT 
  user_id,
  tipo,
  SUM(saldo_atual) as saldo_total,
  COUNT(*) as num_contas
FROM public.contas
WHERE ativo = true
GROUP BY user_id, tipo;

COMMENT ON VIEW public.vw_saldos_consolidados IS 'Consolida saldos por tipo de conta';

-- Grants para a view
GRANT SELECT ON public.vw_saldos_consolidados TO authenticated;

-- ============================================
-- 7. FUNÇÃO: atualizar_saldo_pix_out
-- Atualiza saldo da Pix Out após cada saque
-- ============================================
CREATE OR REPLACE FUNCTION public.atualizar_saldo_pix_out()
RETURNS TRIGGER AS $$
BEGIN
  -- Se destino é pix_out, aumenta saldo_total
  IF NEW.destino = 'pix_out' THEN
    INSERT INTO public.saldo_pix_out (user_id, saldo_total)
    VALUES (NEW.user_id, NEW.valor)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      saldo_total = public.saldo_pix_out.saldo_total + NEW.valor,
      updated_at = NOW();
  END IF;
  
  -- Se origem é pix_out, diminui saldo_total
  IF NEW.origem = 'pix_out' THEN
    INSERT INTO public.saldo_pix_out (user_id, saldo_total)
    VALUES (NEW.user_id, -NEW.valor)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      saldo_total = public.saldo_pix_out.saldo_total - NEW.valor,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.atualizar_saldo_pix_out IS 'Trigger function para atualizar saldo da Pix Out automaticamente';

-- ============================================
-- 8. TRIGGER: trigger_atualizar_saldo_pix_out
-- ============================================
DROP TRIGGER IF EXISTS trigger_atualizar_saldo_pix_out ON public.saques;

CREATE TRIGGER trigger_atualizar_saldo_pix_out
  AFTER INSERT ON public.saques
  FOR EACH ROW
  EXECUTE FUNCTION public.atualizar_saldo_pix_out();

COMMENT ON TRIGGER trigger_atualizar_saldo_pix_out ON public.saques IS 'Atualiza saldo da Pix Out após cada operação';

-- ============================================
-- 9. FUNÇÃO: trigger_updated_at
-- Atualiza campo updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION public.trigger_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para tabela saques
DROP TRIGGER IF EXISTS trigger_saques_updated_at ON public.saques;
CREATE TRIGGER trigger_saques_updated_at
  BEFORE UPDATE ON public.saques
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_updated_at();

-- Trigger para tabela saldo_pix_out
DROP TRIGGER IF EXISTS trigger_saldo_pix_out_updated_at ON public.saldo_pix_out;
CREATE TRIGGER trigger_saldo_pix_out_updated_at
  BEFORE UPDATE ON public.saldo_pix_out
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_updated_at();

-- ============================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE public.saques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saldo_pix_out ENABLE ROW LEVEL SECURITY;

-- Políticas para tabela saques
DROP POLICY IF EXISTS "Usuários podem ver seus próprios saques" ON public.saques;
CREATE POLICY "Usuários podem ver seus próprios saques"
  ON public.saques
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir seus próprios saques" ON public.saques;
CREATE POLICY "Usuários podem inserir seus próprios saques"
  ON public.saques
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios saques" ON public.saques;
CREATE POLICY "Usuários podem atualizar seus próprios saques"
  ON public.saques
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar seus próprios saques" ON public.saques;
CREATE POLICY "Usuários podem deletar seus próprios saques"
  ON public.saques
  FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para tabela saldo_pix_out
DROP POLICY IF EXISTS "Usuários podem ver seu próprio saldo" ON public.saldo_pix_out;
CREATE POLICY "Usuários podem ver seu próprio saldo"
  ON public.saldo_pix_out
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir seu próprio saldo" ON public.saldo_pix_out;
CREATE POLICY "Usuários podem inserir seu próprio saldo"
  ON public.saldo_pix_out
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio saldo" ON public.saldo_pix_out;
CREATE POLICY "Usuários podem atualizar seu próprio saldo"
  ON public.saldo_pix_out
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 11. DADOS INICIAIS (opcional)
-- Cria registro inicial de saldo_pix_out para usuários existentes
-- ============================================

-- Insere saldo inicial zerado para todos os usuários que ainda não têm
INSERT INTO public.saldo_pix_out (user_id, saldo_total, saldo_sellers)
SELECT 
  u.id,
  0,
  0
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.saldo_pix_out s WHERE s.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

-- Criar contas básicas para usuários existentes (se não existirem)
-- Conta Empresa
INSERT INTO public.contas (user_id, nome, tipo, saldo_atual, ativo)
SELECT 
  u.id,
  'Conta Empresa',
  'empresa',
  0,
  true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.contas c WHERE c.user_id = u.id AND c.tipo = 'empresa'
);

-- Conta Pix Out
INSERT INTO public.contas (user_id, nome, tipo, saldo_atual, ativo)
SELECT 
  u.id,
  'Conta Pix Out',
  'pix_out',
  0,
  true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.contas c WHERE c.user_id = u.id AND c.tipo = 'pix_out'
);

-- ============================================
-- 12. FUNÇÕES AUXILIARES: incrementar/decrementar saldo
-- ============================================

-- Função para incrementar saldo de adquirente
CREATE OR REPLACE FUNCTION public.incrementar_saldo(
  adquirente_id UUID,
  valor DECIMAL(15, 2)
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.adquirentes
  SET saldo_atual = saldo_atual + valor
  WHERE id = adquirente_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.incrementar_saldo IS 'Incrementa o saldo de uma adquirente';

-- Função para decrementar saldo de adquirente
CREATE OR REPLACE FUNCTION public.decrementar_saldo(
  adquirente_id UUID,
  valor DECIMAL(15, 2)
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.adquirentes
  SET saldo_atual = saldo_atual - valor
  WHERE id = adquirente_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.decrementar_saldo IS 'Decrementa o saldo de uma adquirente';

-- ============================================
-- 13. GRANTS (Permissões)
-- ============================================

-- Garantir que authenticated users possam acessar as tabelas
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saques TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.saldo_pix_out TO authenticated;

-- Garantir que authenticated users possam acessar as views
GRANT SELECT ON public.lucro_por_horario TO authenticated;
GRANT SELECT ON public.lucro_por_dia TO authenticated;
GRANT SELECT ON public.resumo_saques TO authenticated;

-- Garantir que authenticated users possam usar sequences (para IDs)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- FIM DO SETUP
-- ============================================

-- Verificar se tudo foi criado corretamente
DO $$
BEGIN
  RAISE NOTICE '✅ Setup de Saques e Lucro concluído com sucesso!';
  RAISE NOTICE '📊 Tabelas criadas: saques, saldo_pix_out';
  RAISE NOTICE '📈 Views criadas: lucro_por_horario, lucro_por_dia, resumo_saques';
  RAISE NOTICE '🔒 RLS ativado e políticas configuradas';
  RAISE NOTICE '⚡ Triggers e funções configurados';
END $$;

