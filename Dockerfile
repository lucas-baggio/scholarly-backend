# ============================================
# Estágio 1: Builder
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Copiar apenas os arquivos de definição de dependências
COPY package.json package-lock.json* ./

# 2. COPIAR A PASTA PRISMA ANTES DO INSTALL (Crucial para o postinstall)
COPY prisma ./prisma/

# 3. Instalar dependências (npm ci agora encontrará o schema.prisma)
RUN npm ci

# 4. Copiar o restante do código fonte
COPY . .

# 5. Build do projeto (O prisma generate já rodou no postinstall, 
# mas rodar aqui novamente garante que os binários estejam certos para o Alpine)
RUN npx prisma generate && npm run build

# Limpar devDependencies para reduzir a imagem final
RUN npm prune --production

# ============================================
# Estágio 2: Runner (imagem final)
# ============================================
FROM node:20-alpine AS runner

# OpenSSL é necessário para o Prisma Client no Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Definir para produção
ENV NODE_ENV=production

# Copiar dependências de produção
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Copiar artefatos de build e schema para migrations
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Segurança: Usuário não-root
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001 -G nodejs
USER nestjs

EXPOSE 3000

# Executa migrações de produção e sobe a API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]