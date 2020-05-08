# Dockerfile

FROM node:latest

ARG TOKEN_DISCORD

ENV TOKEN $TOKEN_DISCORD
ENV TZ Europe/Paris

WORKDIR /app

COPY . .

RUN npm install

ENTRYPOINT ["npm", "start"]