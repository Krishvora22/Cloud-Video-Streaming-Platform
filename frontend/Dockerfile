# Change from node:18-alpine to node:20-alpine
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build Next.js app
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]