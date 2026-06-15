FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build && ls dist/src/main.js
EXPOSE 3001
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/src/main"]
