FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/ecosystem.config.js ./
COPY --from=builder /app/docker-entrypoint.sh ./

RUN mkdir -p logs uploads \
    && chmod +x /app/docker-entrypoint.sh \
    && chown -R node:node /app

USER node

EXPOSE 5000

CMD ["./docker-entrypoint.sh"]
