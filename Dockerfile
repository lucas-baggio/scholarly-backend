# ============================================
# Estágio 1: Builder
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./

# Instalar todas as dependências (incluindo devDependencies para o build)
RUN npm ci

# Copiar código fonte e schema Prisma
COPY . .

# Gerar Prisma Client e compilar o projeto
RUN npx prisma generate && npm run build

# Instalar apenas dependências de produção para o estágio final
RUN npm prune --production

# ============================================
# Estágio 2: Runner (imagem final)
# ============================================
FROM node:20-alpine AS runner

# OpenSSL é necessário para o Prisma no Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Copiar dependências de produção do builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json* ./

# Copiar artefatos de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Usuário não-root (segurança)
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001 -G nodejs
USER nestjs

EXPOSE 3000

# Migrações + subir a API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
