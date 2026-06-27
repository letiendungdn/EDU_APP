FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/vocab-images ./packages/vocab-images
COPY apps/nihongo-web ./apps/nihongo-web
RUN npm ci
WORKDIR /app/apps/nihongo-web
ENV API_URL=http://api-gateway:3000
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app/apps/nihongo-web
ENV NODE_ENV=production
ENV PORT=5173
ENV API_URL=http://api-gateway:3000
COPY --from=builder /app/apps/nihongo-web/package*.json ./
COPY --from=builder /app/apps/nihongo-web/.next ./.next
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/nihongo-web/public ./public
COPY --from=builder /app/packages /app/packages
EXPOSE 5173
CMD ["npm", "start"]
