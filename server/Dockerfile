FROM node:20-bullseye-slim

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "src/index.js"]