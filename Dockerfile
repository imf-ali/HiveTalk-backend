FROM node:16

WORKDIR /app


COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . .

RUN yarn build
RUN yarn prisma generate

EXPOSE 4000
CMD [ "yarn", "start" ]