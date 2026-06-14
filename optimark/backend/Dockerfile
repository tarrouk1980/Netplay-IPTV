FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build && ls dist/main.js
EXPOSE 3001
CMD ["npm", "run", "start:prod"]
