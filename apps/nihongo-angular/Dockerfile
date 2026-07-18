FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/vocab-images ./packages/vocab-images
COPY apps/nihongo-web/public/media ./apps/nihongo-angular/public/media
COPY apps/nihongo-angular ./apps/nihongo-angular
RUN npm ci
WORKDIR /app/apps/nihongo-angular
ARG GOOGLE_CLIENT_ID=
ARG STRIPE_PUBLISHABLE_KEY=
ARG KEYCLOAK_URL=http://auth.localhost:8080
ARG KEYCLOAK_REALM=edu-app
ARG KEYCLOAK_CLIENT_ID=nihongo-angular
RUN sed -i "s|name=\"google-signin-client_id\" content=\"\"|name=\"google-signin-client_id\" content=\"${GOOGLE_CLIENT_ID}\"|" src/index.html \
  && sed -i "s|name=\"stripe-publishable-key\" content=\"\"|name=\"stripe-publishable-key\" content=\"${STRIPE_PUBLISHABLE_KEY}\"|" src/index.html \
  && sed -i "s|name=\"keycloak-url\" content=\"http://auth.localhost:8080\"|name=\"keycloak-url\" content=\"${KEYCLOAK_URL}\"|" src/index.html \
  && sed -i "s|name=\"keycloak-realm\" content=\"edu-app\"|name=\"keycloak-realm\" content=\"${KEYCLOAK_REALM}\"|" src/index.html \
  && sed -i "s|name=\"keycloak-client-id\" content=\"nihongo-angular\"|name=\"keycloak-client-id\" content=\"${KEYCLOAK_CLIENT_ID}\"|" src/index.html
RUN npm run build

FROM nginx:1.27-alpine AS runner
COPY apps/nihongo-angular/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/nihongo-angular/dist/nihongo-angular/browser /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ | grep -q '<app-root' || exit 1
