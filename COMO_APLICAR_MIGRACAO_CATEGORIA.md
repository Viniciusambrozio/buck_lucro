# Como Aplicar a Migração da Categoria de Operação

## Passo a Passo

### 1. Acesse o Supabase Dashboard
- Vá para: https://supabase.com/dashboard
- Faça login na sua conta
- Selecione o projeto **BuckPay** (ou o projeto que está usando)

### 2. Abra o SQL Editor
- No menu lateral esquerdo, clique em **SQL Editor** (ícone de banco de dados com `</>`)
- Ou acesse diretamente: `https://supabase.com/dashboard/project/SEU_PROJETO_ID/sql`

### 3. Execute a Migração
- Clique em **+ New query** (Nova consulta)
- Cole o seguinte código SQL:

```sql
-- Migração para adicionar a categoria de operação às adquirentes
ALTER TABLE adquirentes
ADD COLUMN categoria_operacao VARCHAR(10) CHECK (categoria_operacao IN ('white', 'gray', 'black'));

-- Comentário para explicar o campo
COMMENT ON COLUMN adquirentes.categoria_operacao IS 'Categoria de operação: white (pouco med), gray (med controlado), black (mais med)';

-- Atualizar adquirentes existentes para 'white' (valor padrão)
UPDATE adquirentes SET categoria_operacao = 'white' WHERE categoria_operacao IS NULL;
```

- Clique em **Run** (ou pressione `Ctrl/Cmd + Enter`)

### 4. Verifique se a Migração foi Aplicada
- Vá para **Table Editor** no menu lateral
- Selecione a tabela `adquirentes`
- Verifique se a coluna `categoria_operacao` aparece
- Todas as adquirentes existentes devem ter o valor `white` por padrão

### 5. Teste a Funcionalidade
- Volte para a aplicação
- Tente criar uma nova adquirente com categoria `gray` ou `black`
- Verifique se a categoria está sendo salva corretamente
- Verifique se as badges aparecem no dashboard

## O que foi Alterado no Código

1. **Tipos TypeScript** (`types/index.ts`):
   - Adicionado tipo `CategoriaOperacao = 'white' | 'gray' | 'black'`
   - Adicionado campo `categoria_operacao` nas interfaces de `Adquirente`

2. **Validação** (`app/actions/adquirentes.ts`):
   - Schema Zod atualizado para validar `categoria_operacao`
   - Funções `adicionarAdquirente` e `atualizarAdquirente` agora incluem o campo

3. **Interface** (componentes):
   - Formulário de cadastro com opções de seleção
   - Badges visuais no dashboard, listagem e histórico

## Possíveis Erros

### Erro: "column already exists"
Se você ver esse erro, a coluna já existe. Execute apenas:
```sql
UPDATE adquirentes SET categoria_operacao = 'white' WHERE categoria_operacao IS NULL;
```

### Erro: "permission denied"
Verifique se você está logado com a conta correta do Supabase e tem permissões de administrador.

## Suporte
Se encontrar problemas, verifique:
- O console do navegador para erros JavaScript
- Os logs do Supabase para erros de banco de dados
- Se todos os arquivos foram salvos corretamente

