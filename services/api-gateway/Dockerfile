FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages ./packages
COPY services ./services
RUN npm ci
RUN npm run build -w @edu/vocab-images
WORKDIR /app/services
RUN npm run prisma:generate -w @edu/nihongo-services
RUN npm run build:all -w @edu/nihongo-services

FROM node:22-alpine AS runner
WORKDIR /app/services
ENV NODE_ENV=production
COPY --from=builder /app/services/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
RUN mkdir -p node_modules/@prisma \
    && ln -sf ../../packages/prisma-nihongo/generated/client node_modules/@prisma/client \
    && ln -sf ../../../../packages/prisma-english dist/apps/api-gateway/packages/prisma-english \
    && ln -sf ../../../../../packages/nest-contracts/proto dist/apps/api-gateway/packages/nest-contracts/proto
USER node
CMD ["node", "dist/apps/api-gateway/services/api-gateway/src/main.js"]
