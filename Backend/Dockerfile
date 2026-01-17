FROM node:20-alpine

# Install necessary libraries for Prisma & OpenSSL
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Re-generate the client specifically for the Linux environment
RUN npx prisma generate

COPY . .

EXPOSE 5000

# Run migrations and start
CMD ["sh", "-c", "npx prisma db push && npm start"]