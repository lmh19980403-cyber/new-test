FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY data ./data
COPY public ./public
COPY src ./src

EXPOSE 3000
CMD ["node", "src/server.js"]
