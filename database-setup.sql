-- ============================================
-- SCRIPT SQL PARA CONFIGURAÇÃO DO BANCO DE DADOS
-- Sistema de Cálculo de Lucro BuckPay
-- ============================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse o painel do Supabase (https://app.supabase.com)
-- 2. Vá em SQL Editor
-- 3. Cole e execute este script completo
-- ============================================

-- Tabela de cálculos de lucro
CREATE TABLE IF NOT EXISTS calculos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL,
  horario TIME NOT NULL,
  woovi_white DECIMAL(12,2) NOT NULL,
  woovi_pixout DECIMAL(12,2) NOT NULL,
  nomadfy DECIMAL(12,2) NOT NULL,
  pluggou DECIMAL(12,2) NOT NULL,
  sellers DECIMAL(12,2) NOT NULL,
  lucro DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_calculos_user_data ON calculos(user_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_calculos_created_at ON calculos(created_at DESC);

-- Tabela de configuração de horários
CREATE TABLE IF NOT EXISTS horarios_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  horario_1 TIME NOT NULL DEFAULT '09:00',
  horario_2 TIME NOT NULL DEFAULT '13:00',
  horario_3 TIME NOT NULL DEFAULT '18:00',
  horario_4 TIME NOT NULL DEFAULT '22:00',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ============================================

-- Habilitar RLS nas tabelas
ALTER TABLE calculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios_config ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela calculos
CREATE POLICY "Usuários podem ver seus próprios cálculos"
  ON calculos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios cálculos"
  ON calculos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios cálculos"
  ON calculos FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para a tabela horarios_config
CREATE POLICY "Usuários podem ver sua própria configuração"
  ON horarios_config FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir sua própria configuração"
  ON horarios_config FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar sua própria configuração"
  ON horarios_config FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- FUNÇÃO PARA ATUALIZAR TIMESTAMP
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o campo updated_at automaticamente
CREATE TRIGGER update_horarios_config_updated_at
  BEFORE UPDATE ON horarios_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CONFIGURAÇÃO INICIAL
-- ============================================

COMMENT ON TABLE calculos IS 'Armazena os cálculos de lucro realizados 4 vezes ao dia';
COMMENT ON TABLE horarios_config IS 'Configuração dos horários personalizados para cada usuário';





