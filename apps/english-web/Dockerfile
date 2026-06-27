FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/vocab-images ./packages/vocab-images
COPY apps/english-web ./apps/english-web
RUN npm ci
WORKDIR /app/apps/english-web
ENV API_URL=http://api-gateway:3000
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app/apps/english-web
ENV NODE_ENV=production
ENV PORT=3001
ENV API_URL=http://api-gateway:3000
COPY --from=builder /app/apps/english-web/package*.json ./
COPY --from=builder /app/apps/english-web/.next ./.next
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/english-web/public ./public
COPY --from=builder /app/packages /app/packages
EXPOSE 3001
CMD ["npm", "start"]
