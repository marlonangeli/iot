ARG NODE_VERSION=22.6.0

FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app
ENV NODE_ENV=production
ENV DOCKER=true

FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev && npm cache clean --force

FROM base AS builder
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm install -g esbuild \
        && esbuild src/server.js --bundle --minify --platform=node --outfile=dist/server.js

FROM base
COPY --from=builder /app/dist /app
RUN chown -R node:node /app && chmod -R 755 /app
USER node

EXPOSE 3000
CMD ["node", "server.js"]
