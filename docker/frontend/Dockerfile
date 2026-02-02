FROM node:20.19.1-alpine AS base

WORKDIR /app

COPY ./frontend/package*.json .

RUN yarn install

FROM base AS prod

COPY ./frontend .

COPY ./.env .

RUN yarn run build

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]