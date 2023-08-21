FROM node:16

WORKDIR /app


COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . .
COPY .env .env

RUN yarn build
RUN yarn prisma generate

ENV NODE_ENV production

EXPOSE 4000
CMD [ "yarn", "start" ]