-- ============================================
-- SCRIPT SQL PARA ADIÇÃO DA TABELA DE ADQUIRENTES
-- Sistema de Cálculo de Lucro BuckPay
-- ============================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse o painel do Supabase (https://app.supabase.com)
-- 2. Vá em SQL Editor
-- 3. Cole e execute este script completo
-- ============================================

-- Tabela de adquirentes
CREATE TABLE IF NOT EXISTS adquirentes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome VARCHAR(100) NOT NULL,
  tipo_pix VARCHAR(20) NOT NULL CHECK (tipo_pix IN ('pix_in', 'pix_out')),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_adquirentes_user_id ON adquirentes(user_id);
CREATE INDEX IF NOT EXISTS idx_adquirentes_ativo ON adquirentes(ativo);

-- ============================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ============================================

-- Habilitar RLS na tabela
ALTER TABLE adquirentes ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela adquirentes
CREATE POLICY "Usuários podem ver suas próprias adquirentes"
  ON adquirentes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias adquirentes"
  ON adquirentes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias adquirentes"
  ON adquirentes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias adquirentes"
  ON adquirentes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER PARA ATUALIZAÇÃO DE TIMESTAMP
-- ============================================

-- Aplicar o trigger já existente para atualizar o campo updated_at automaticamente
CREATE TRIGGER update_adquirentes_updated_at
  BEFORE UPDATE ON adquirentes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================

COMMENT ON TABLE adquirentes IS 'Armazena as adquirentes cadastradas pelos usuários com configurações de tipo de pix e status';
COMMENT ON COLUMN adquirentes.nome IS 'Nome da adquirente';
COMMENT ON COLUMN adquirentes.tipo_pix IS 'Tipo do Pix: pix_in ou pix_out';
COMMENT ON COLUMN adquirentes.ativo IS 'Status de ativação da adquirente para cálculos';

