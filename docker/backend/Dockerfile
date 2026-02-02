FROM node:20.19.1-alpine AS base

WORKDIR /app

COPY ./backend/package*.json .

RUN yarn install

FROM base AS prod

COPY ./backend .

COPY ./.env .

# Generate Prisma Client before build
RUN npx prisma generate

RUN yarn run build

EXPOSE 3000

CMD ["node", "dist/src/main.js"]