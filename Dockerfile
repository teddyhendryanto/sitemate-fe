# Build BASE
FROM node:20-alpine as BASE

WORKDIR /app

COPY package.json package-lock.json ./
RUN apk add --no-cache git \
    && npm ci \
    && npm cache clean --force

# Build Image
FROM node:20-alpine AS BUILD

WORKDIR /app

COPY --from=BASE /app/node_modules ./node_modules
COPY . .

# Set NODE_ENV environment variable
ENV NODE_ENV production

RUN NODE_ENV=${NODE_ENV} npm run generate

RUN apk add --no-cache git curl \
    && npm run build \
    && cd .next/standalone 

RUN wget https://gobinaries.com/tj/node-prune --output-document - | /bin/sh && node-prune

# Build production
FROM node:20-alpine AS PRODUCTION

WORKDIR /app

COPY --from=BUILD /app/package-lock.json ./
COPY --from=BUILD /app/public ./public
COPY --from=BUILD /app/next.config.js ./

# Set mode "standalone" in file "next.config.js"
COPY --from=BUILD /app/.next/standalone ./
COPY --from=BUILD /app/.next/static ./.next/static

CMD ["node", "server.js"]
