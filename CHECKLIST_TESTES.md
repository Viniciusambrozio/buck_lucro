# ✅ Checklist de Testes - Sistema BuckPay

Use este checklist para validar todas as funcionalidades do sistema após configuração.

## 🔐 Autenticação

- [ ] Login com credenciais válidas redireciona para /dashboard
- [ ] Login com credenciais inválidas mostra mensagem de erro
- [ ] Tentativa de acessar /dashboard sem login redireciona para /login
- [ ] Botão de logout funciona e redireciona para /login
- [ ] Após logout, não é possível acessar /dashboard

## ⚙️ Configuração de Horários

- [ ] Horários padrão são exibidos (09:00, 13:00, 18:00, 22:00)
- [ ] Alterar horários e salvar funciona corretamente
- [ ] Mensagem de sucesso aparece após salvar
- [ ] Horários salvos persistem após reload da página
- [ ] Validação impede horários fora de ordem (ex: 13:00 antes de 09:00)
- [ ] Validação impede formato inválido

## 💰 Formulário de Cálculo

### Entrada de Dados
- [ ] Todos os campos aceitam valores numéricos
- [ ] Campos não aceitam valores negativos
- [ ] Campos aceitam valores decimais (ex: 1500.50)
- [ ] Campos vazios são tratados como 0

### Cálculo de Lucro
- [ ] Botão "Calcular Lucro" funciona
- [ ] Fórmula está correta: (Woovi White + Woovi Pix Out + NomadFy + Pluggou) - Sellers
- [ ] Resultado exibido em formato de moeda (R$)
- [ ] Valor calculado aparece antes de salvar

### Salvar Registro
- [ ] Botão "Salvar" só funciona após calcular
- [ ] Registro é salvo com data e hora atuais
- [ ] Formulário é resetado após salvar
- [ ] Mensagem de sucesso ou feedback visual aparece
- [ ] Histórico atualiza automaticamente após salvar

## 📊 Resumo Diário

- [ ] **Lucro Total do Dia** mostra soma correta de todos os registros
- [ ] **Média por Horário** calcula corretamente (total ÷ número de registros)
- [ ] **Registros Feitos** mostra contagem correta
- [ ] Cards atualizam após novo registro
- [ ] Valores exibidos em formato de moeda
- [ ] Se não há registros, mostra valores zerados

## 📋 Histórico de Cálculos

### Exibição
- [ ] Tabela mostra todos os registros do dia atual
- [ ] Colunas estão corretas: Data, Horário, contas, Lucro
- [ ] Registros mais recentes aparecem no topo
- [ ] Valores formatados como moeda (R$)
- [ ] Data formatada em PT-BR (dd/MM/yyyy)

### Dados
- [ ] Todos os valores salvos aparecem corretamente
- [ ] Emoji 💰 aparece na coluna de Lucro
- [ ] Tabela vazia mostra mensagem "Nenhum cálculo registrado hoje"

## 🎨 Design e Responsividade

### Desktop
- [ ] Layout centralizado (max-width: 1200px)
- [ ] Cards de resumo em 3 colunas
- [ ] Tabela de histórico legível
- [ ] Todos os elementos visíveis sem scroll horizontal

### Mobile
- [ ] Cards de resumo empilhados verticalmente
- [ ] Formulário adaptado para tela pequena
- [ ] Tabela com scroll horizontal funcional
- [ ] Botões e inputs com tamanho adequado

### Tema Minimalista
- [ ] Paleta preto e branco está aplicada
- [ ] Fonte Inter carregada corretamente
- [ ] Bordas finas e sutis
- [ ] Sem cores extras além de preto/branco/cinza

## 🔒 Segurança

- [ ] Cada usuário vê apenas seus próprios dados
- [ ] Não é possível acessar dados de outros usuários via URL
- [ ] Session token (JWT) válido após login
- [ ] Session expira corretamente

## ⚡ Performance

- [ ] Página carrega em < 2 segundos
- [ ] Não há erros no console do navegador
- [ ] Não há warnings no terminal (dev)
- [ ] Build produção (`npm run build`) executa sem erros

## 🧪 Casos de Teste Específicos

### Teste 1: Fluxo Completo Primeiro Uso
1. Login pela primeira vez
2. Configurar horários personalizados
3. Fazer primeiro cálculo do dia
4. Verificar se resumo mostra valores corretos
5. Verificar se histórico contém o registro

### Teste 2: Múltiplos Registros
1. Fazer 4 registros diferentes no mesmo dia
2. Verificar se todos aparecem no histórico
3. Verificar se resumo calcula média corretamente
4. Verificar ordenação (mais recente no topo)

### Teste 3: Cálculo com Lucro Negativo
1. Inserir valores onde Sellers > (soma das contas)
2. Calcular
3. Verificar se lucro negativo é exibido corretamente
4. Salvar e verificar no histórico

### Teste 4: Validações
1. Tentar salvar sem calcular → deve bloquear
2. Inserir horários fora de ordem → deve mostrar erro
3. Tentar valores negativos → deve bloquear/corrigir

### Teste 5: Persistência
1. Fazer um registro
2. Fazer logout
3. Fazer login novamente
4. Verificar se registro anterior ainda está lá

## 📝 Resultados

**Data do Teste:** ___/___/______

**Testado por:** _________________

**Ambiente:**
- [ ] Desenvolvimento (localhost)
- [ ] Produção

**Navegadores Testados:**
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile (Safari iOS)
- [ ] Mobile (Chrome Android)

**Problemas Encontrados:**

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

**Status Geral:**
- [ ] ✅ Todos os testes passaram
- [ ] ⚠️ Alguns problemas encontrados (listar acima)
- [ ] ❌ Problemas críticos impedem uso

---

**Notas Adicionais:**

_____________________________________________________
_____________________________________________________
_____________________________________________________





