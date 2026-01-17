FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Make sure this matches your 3001 requirement
EXPOSE 3001

CMD ["npm", "start", "--", "-p", "3001"]