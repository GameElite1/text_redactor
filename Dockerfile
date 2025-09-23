FROM node:18-alpine

WORKDIR /app

# Копируем все файлы
COPY . .

# Устанавливаем зависимости
RUN npm install --legacy-peer-deps

# Собираем приложение
RUN npm run build

# Устанавливаем serve для раздачи статики
RUN npm install -g serve

EXPOSE 3000

# Запускаем сервер
CMD ["serve", "-s", "dist", "-l", "3000"]