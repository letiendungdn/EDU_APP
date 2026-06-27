FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/vocab-images ./packages/vocab-images
COPY apps/english-web ./apps/english-web
RUN npm ci
WORKDIR /app/apps/english-web
ENV DATABASE_URL=postgresql://nihongo:nihongo@postgres:5432/english_learning
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app/apps/english-web
ENV NODE_ENV=production
ENV PORT=3001
COPY --from=builder /app/apps/english-web/package*.json ./
COPY --from=builder /app/apps/english-web/.next ./.next
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/english-web/public ./public
COPY --from=builder /app/packages /app/packages
EXPOSE 3001
CMD ["npm", "start"]
