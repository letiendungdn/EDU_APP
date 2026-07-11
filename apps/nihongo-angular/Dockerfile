FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/vocab-images ./packages/vocab-images
COPY apps/nihongo-web/public/media ./apps/nihongo-angular/public/media
COPY apps/nihongo-angular ./apps/nihongo-angular
RUN npm ci
WORKDIR /app/apps/nihongo-angular
RUN npm run build

FROM nginx:1.27-alpine AS runner
COPY apps/nihongo-angular/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/nihongo-angular/dist/nihongo-angular/browser /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ | grep -q '<app-root' || exit 1
