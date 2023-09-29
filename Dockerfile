FROM node:18.11 as builder

WORKDIR /mtg-horde

COPY package* .

RUN npm install 

COPY . .

RUN npm run build

FROM node:18.11

WORKDIR /mtg-horde

COPY --from=builder /mtg-horde/dist dist

CMD [ "npx", "--yes", "serve", "./dist" ] 