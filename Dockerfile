FROM node:22-alpine as api
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn --frozen-lockfile && yarn cache clean
