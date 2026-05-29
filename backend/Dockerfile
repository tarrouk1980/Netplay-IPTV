FROM node:20-alpine
WORKDIR /app
RUN addgroup -S easyway && adduser -S easyway -G easyway
COPY package*.json ./
RUN npm ci --only=production
COPY prisma ./prisma/
RUN npx prisma generate
COPY src ./src/
USER easyway
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "src/server.js"]
