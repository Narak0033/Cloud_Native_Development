FROM --platform=linux/amd64 node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 4000
USER node
CMD ["npm", "start"]