FROM node:22-alpine AS build

WORKDIR /app
ENV HUSKY=0

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/server.mjs ./server.mjs

USER node
EXPOSE 8080

CMD ["node", "server.mjs"]
