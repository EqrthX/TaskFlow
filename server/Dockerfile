FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci && npm cache clean --force && npm install

COPY prisma ./prisma/
RUN npx prisma generate --schema prisma/schema.prisma

COPY . .
RUN npm run build

EXPOSE 3231

CMD [ "npm", "start" ]