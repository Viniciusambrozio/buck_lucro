-- ============================================
-- SCRIPT SQL - SISTEMA DE FLUXO DE CAIXA
-- BuckPay - Gestão de Movimentações e Saques
-- ============================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse o painel do Supabase (https://app.supabase.com)
-- 2. Vá em SQL Editor
-- 3. Cole e execute este script completo
-- ============================================

-- ============================================
-- TABELA: contas
-- Representa todas as contas do sistema
-- (Conta Empresa, Adquirentes Pix In, Conta Pix Out)
-- ============================================
CREATE TABLE IF NOT EXISTS contas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('empresa', 'pix_in', 'pix_out')),
  adquirente_id UUID REFERENCES adquirentes(id) ON DELETE SET NULL,
  saldo_atual DECIMAL(12,2) DEFAULT 0.00,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_contas_user_tipo ON contas(user_id, tipo);
CREATE INDEX IF NOT EXISTS idx_contas_ativo ON contas(ativo) WHERE ativo = true;

-- ============================================
-- TABELA: movimentacoes
-- Registra todas as transferências entre contas
-- ============================================
CREATE TABLE IF NOT EXISTS movimentacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL,
  horario TIME NOT NULL,
  conta_origem_id UUID REFERENCES contas(id) ON DELETE RESTRICT NOT NULL,
  conta_destino_id UUID REFERENCES contas(id) ON DELETE RESTRICT NOT NULL,
  valor DECIMAL(12,2) NOT NULL CHECK (valor > 0),
  tipo_movimentacao VARCHAR(30) NOT NULL CHECK (tipo_movimentacao IN ('empresa_para_pixout', 'pixin_para_pixout', 'pixin_para_empresa')),
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_movimentacoes_user_data ON movimentacoes(user_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_origem ON movimentacoes(conta_origem_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_destino ON movimentacoes(conta_destino_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_tipo ON movimentacoes(tipo_movimentacao);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_created_at ON movimentacoes(created_at DESC);

-- ============================================
-- TABELA: snapshots_saldo
-- Armazena snapshots de saldo para histórico
-- ============================================
CREATE TABLE IF NOT EXISTS snapshots_saldo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conta_id UUID REFERENCES contas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL,
  horario TIME NOT NULL,
  saldo DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_snapshots_conta_data ON snapshots_saldo(conta_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_user_data ON snapshots_saldo(user_id, data DESC);

-- ============================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ============================================

-- Habilitar RLS nas tabelas
ALTER TABLE contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshots_saldo ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela contas
CREATE POLICY "Usuários podem ver suas próprias contas"
  ON contas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias contas"
  ON contas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias contas"
  ON contas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias contas"
  ON contas FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para a tabela movimentacoes
CREATE POLICY "Usuários podem ver suas próprias movimentações"
  ON movimentacoes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias movimentações"
  ON movimentacoes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias movimentações"
  ON movimentacoes FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para a tabela snapshots_saldo
CREATE POLICY "Usuários podem ver seus próprios snapshots"
  ON snapshots_saldo FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios snapshots"
  ON snapshots_saldo FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_contas()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at na tabela contas
CREATE TRIGGER update_contas_updated_at
  BEFORE UPDATE ON contas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_contas();

-- Função para atualizar saldo das contas após movimentação
CREATE OR REPLACE FUNCTION atualizar_saldos_apos_movimentacao()
RETURNS TRIGGER AS $$
BEGIN
  -- Debita da conta origem
  UPDATE contas 
  SET saldo_atual = saldo_atual - NEW.valor
  WHERE id = NEW.conta_origem_id;
  
  -- Credita na conta destino
  UPDATE contas 
  SET saldo_atual = saldo_atual + NEW.valor
  WHERE id = NEW.conta_destino_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar saldos automaticamente
CREATE TRIGGER trigger_atualizar_saldos
  AFTER INSERT ON movimentacoes
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_saldos_apos_movimentacao();

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View para visualizar movimentações com nomes das contas
CREATE OR REPLACE VIEW vw_movimentacoes_detalhadas AS
SELECT 
  m.id,
  m.user_id,
  m.data,
  m.horario,
  m.valor,
  m.tipo_movimentacao,
  m.observacao,
  co.nome AS origem_nome,
  co.tipo AS origem_tipo,
  cd.nome AS destino_nome,
  cd.tipo AS destino_tipo,
  m.created_at
FROM movimentacoes m
JOIN contas co ON m.conta_origem_id = co.id
JOIN contas cd ON m.conta_destino_id = cd.id;

-- View para resumo diário de movimentações
CREATE OR REPLACE VIEW vw_resumo_movimentacoes_diario AS
SELECT 
  user_id,
  data,
  tipo_movimentacao,
  COUNT(*) AS quantidade,
  SUM(valor) AS total_movimentado
FROM movimentacoes
GROUP BY user_id, data, tipo_movimentacao;

-- View para saldos atuais consolidados
CREATE OR REPLACE VIEW vw_saldos_consolidados AS
SELECT 
  user_id,
  tipo,
  COUNT(*) AS quantidade_contas,
  SUM(saldo_atual) AS saldo_total
FROM contas
WHERE ativo = true
GROUP BY user_id, tipo;

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON TABLE contas IS 'Armazena todas as contas do sistema (Empresa, Pix In, Pix Out)';
COMMENT ON TABLE movimentacoes IS 'Registra todas as transferências/saques entre contas';
COMMENT ON TABLE snapshots_saldo IS 'Armazena histórico de saldos para análise temporal';

COMMENT ON COLUMN movimentacoes.tipo_movimentacao IS 'Tipos: empresa_para_pixout, pixin_para_pixout, pixin_para_empresa';
COMMENT ON COLUMN contas.tipo IS 'Tipos: empresa (conta da empresa), pix_in (adquirente entrada), pix_out (conta sellers)';

-- ============================================
-- DADOS INICIAIS (OPCIONAL)
-- ============================================

-- Exemplo de como criar a conta empresa inicial
-- NOTA: Substitua 'SEU_USER_ID_AQUI' pelo ID real do usuário
-- 
-- INSERT INTO contas (user_id, nome, tipo, saldo_atual)
-- VALUES ('SEU_USER_ID_AQUI', 'Conta Empresa BuckPay', 'empresa', 0.00);
-- 
-- INSERT INTO contas (user_id, nome, tipo, saldo_atual)
-- VALUES ('SEU_USER_ID_AQUI', 'Conta Pix Out - Sellers', 'pix_out', 0.00);



