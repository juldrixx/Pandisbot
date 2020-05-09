# Dockerfile

FROM node:latest

ARG TOKEN_DISCORD
ARG API_KEY_RIOT

ENV TOKEN_DISCORD=$TOKEN_DISCORD
ENV API_KEY_RIOT=$API_KEY_RIOT
ENV TZ Europe/Paris

WORKDIR /app

COPY . .

RUN npm install

ENTRYPOINT ["node", "--icu-data-dir=node_modules\\full-icu", "index.js"]