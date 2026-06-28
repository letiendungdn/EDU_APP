FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY services/signaling-service ./services/signaling-service
RUN npm ci --workspace=@edu/signaling-service --include-workspace-root
RUN npm run build -w @edu/signaling-service

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY services/signaling-service/package.json ./services/signaling-service/package.json
COPY --from=builder /app/services/signaling-service/dist ./services/signaling-service/dist
RUN npm ci --omit=dev --workspace=@edu/signaling-service --include-workspace-root
WORKDIR /app/services/signaling-service
USER node
EXPOSE 3002
CMD ["node", "dist/main.js"]
