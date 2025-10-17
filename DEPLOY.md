# 🚀 Guia de Deploy - BuckPay Sistema de Lucro

## 🎯 Opções de Deploy

### Recomendado: Vercel (Gratuito e Zero-Config)

A Vercel é a plataforma criada pelos criadores do Next.js. Deploy automático e gratuito.

---

## 📦 Deploy na Vercel

### 1️⃣ Preparar o Projeto

Certifique-se de que o projeto está em um repositório Git:

```bash
git init
git add .
git commit -m "Initial commit - BuckPay Sistema de Lucro"
```

### 2️⃣ Criar Repositório no GitHub

1. Acesse [github.com](https://github.com)
2. Crie um novo repositório (pode ser privado)
3. Siga as instruções para fazer push:

```bash
git remote add origin https://github.com/seu-usuario/buckpay-lucro.git
git branch -M main
git push -u origin main
```

### 3️⃣ Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em **New Project**
4. Selecione o repositório `buckpay-lucro`
5. Clique em **Import**

### 4️⃣ Configurar Variáveis de Ambiente

Na página de configuração do projeto:

1. Vá em **Environment Variables**
2. Adicione:

```
NEXT_PUBLIC_SUPABASE_URL = sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY = sua-chave-do-supabase
```

3. Clique em **Add** para cada variável

### 5️⃣ Deploy

1. Clique em **Deploy**
2. Aguarde ~2 minutos
3. ✅ Projeto deployado!

Sua URL será algo como: `https://buckpay-lucro.vercel.app`

### 6️⃣ Domínio Customizado (Opcional)

Se você tem um domínio:

1. Vá em **Settings > Domains**
2. Adicione seu domínio (ex: `lucro.buckpay.com`)
3. Configure DNS conforme instruções
4. SSL automático incluído

---

## 🔄 Atualizações Automáticas

Após o deploy inicial, toda vez que você fizer push para o GitHub:

```bash
git add .
git commit -m "Descrição da mudança"
git push
```

A Vercel automaticamente:
- Detecta o push
- Faz novo build
- Deploy em produção
- Atualiza o site

---

## 🌍 Deploy Alternativo: Netlify

### Passos

1. Acesse [netlify.com](https://netlify.com)
2. Conecte com GitHub
3. Selecione o repositório
4. Configure build:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `.next`
5. Adicione variáveis de ambiente
6. Deploy

---

## 🐳 Deploy com Docker (Avançado)

### Dockerfile

Crie um arquivo `Dockerfile` na raiz:

```dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

### Build e Run

```bash
docker build -t buckpay-lucro .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=sua-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave \
  buckpay-lucro
```

---

## ☁️ Deploy VPS (DigitalOcean, AWS, etc)

### Requisitos
- Node.js 18+
- PM2 para gerenciamento de processos

### Passos

1. **Clonar repositório no servidor:**
```bash
git clone https://github.com/seu-usuario/buckpay-lucro.git
cd buckpay-lucro
```

2. **Instalar dependências:**
```bash
npm install
```

3. **Criar .env.local:**
```bash
nano .env.local
# Adicionar variáveis
```

4. **Build:**
```bash
npm run build
```

5. **Instalar PM2:**
```bash
npm install -g pm2
```

6. **Iniciar aplicação:**
```bash
pm2 start npm --name "buckpay" -- start
pm2 save
pm2 startup
```

7. **Configurar Nginx (opcional):**
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔒 Checklist Pré-Deploy

Antes de fazer deploy, verifique:

- [ ] Build local funciona (`npm run build`)
- [ ] Variáveis de ambiente configuradas
- [ ] Script SQL executado no Supabase
- [ ] Usuário criado no Supabase Auth
- [ ] RLS habilitado e testado
- [ ] .env.local NÃO está no repositório
- [ ] Projeto commitado no Git

---

## 📊 Monitoramento Pós-Deploy

### Vercel Dashboard
- Logs de build
- Logs de runtime
- Analytics de visitantes
- Uso de bandwidth

### Supabase Dashboard
- Requisições API
- Uso de storage
- Usuários ativos
- Query performance

---

## 🆘 Troubleshooting

### Build falha na Vercel

**Erro:** "Module not found"
- ✅ Verificar que todas as dependências estão no `package.json`
- ✅ Fazer `npm install` local e commitar `package-lock.json`

**Erro:** "Environment variables not defined"
- ✅ Adicionar variáveis no painel da Vercel
- ✅ Fazer redeploy após adicionar

### App não carrega

**Erro 500:**
- ✅ Verificar logs na Vercel
- ✅ Confirmar variáveis de ambiente corretas

**Erro de autenticação:**
- ✅ Verificar URL do Supabase
- ✅ Confirmar que RLS está habilitado
- ✅ Testar credenciais localmente

### Performance lenta

- ✅ Habilitar Edge Functions na Vercel
- ✅ Verificar região do Supabase (deve ser perto dos usuários)
- ✅ Adicionar índices no banco de dados

---

## 🎯 Domínio Personalizado

### Opções Gratuitas
- **Vercel**: `seu-projeto.vercel.app`
- **Netlify**: `seu-projeto.netlify.app`

### Domínio Próprio
1. Comprar domínio (Registro.br, GoDaddy, Namecheap)
2. Adicionar no painel da Vercel/Netlify
3. Configurar DNS
4. SSL automático

---

## 📈 Escalabilidade

### Plano Gratuito Vercel
- ✅ 100 GB bandwidth/mês
- ✅ Deploy ilimitados
- ✅ SSL automático
- ✅ Suficiente para milhares de acessos/mês

### Quando Fazer Upgrade
- Mais de 100 GB bandwidth
- Mais de 1000 builds/mês
- Necessidade de analytics avançado

---

## ✅ Deploy Completo!

Após seguir este guia, seu sistema estará:

✅ Acessível publicamente via HTTPS  
✅ Com SSL automático  
✅ Deploy automático a cada push  
✅ Monitoramento integrado  
✅ Backups automáticos (Supabase)  
✅ Pronto para uso profissional  

**Acesse sua aplicação e comece a usar!** 🎉

---

**Custo Total: R$ 0,00** (usando planos gratuitos)





