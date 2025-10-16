-- Migração para adicionar a categoria de operação às adquirentes
ALTER TABLE adquirentes
ADD COLUMN categoria_operacao VARCHAR(10) CHECK (categoria_operacao IN ('white', 'gray', 'black'));

-- Comentário para explicar o campo
COMMENT ON COLUMN adquirentes.categoria_operacao IS 'Categoria de operação: white (pouco med), gray (med controlado), black (mais med)';

-- Atualizar adquirentes existentes para um valor padrão (opcional)
-- UPDATE adquirentes SET categoria_operacao = 'white' WHERE categoria_operacao IS NULL;
