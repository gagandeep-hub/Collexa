FROM node:20-alpine

WORKDIR /app

# pehle package files copy karo (cache optimization)
COPY package*.json ./

# devDependencies bhi chahiye (prisma CLI ke liye)
RUN npm install --include=dev

# baaki saari files copy karo
COPY . .

# Prisma client generate karo
RUN npx prisma generate

EXPOSE 5000

# Migrations deploy karo aur phir server start karo
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]