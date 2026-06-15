FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build && ls dist/src/main.js
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate resolve --rolled-back 20260605194205_init 2>/dev/null; npx prisma migrate deploy && node dist/src/main"]
