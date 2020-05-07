# Dockerfile

FROM node:latest

WORKDIR /app

COPY . .

ARG TOKEN

ENV TOKEN=$TOKEN

RUN npm install

ENTRYPOINT ["npm", "start"]