FROM node:18-alpine AS base
WORKDIR /app

# Копируем package.json
COPY package*.json ./
# Устанавливаем все зависимости, включая dev
RUN npm install

COPY tsconfig.json ./
COPY src ./src

# Компилируем TypeScript в JS
RUN npm run build

CMD ["node", "dist/index.js"]
