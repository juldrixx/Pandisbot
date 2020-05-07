# Dockerfile

FROM node:latest

ARG TOKEN_DISCORD

ENV TOKEN $TOKEN_DISCORD

WORKDIR /app

COPY . .

RUN npm install

ENTRYPOINT ["npm", "start"]