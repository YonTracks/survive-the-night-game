FROM node:20-alpine

ARG VITE_WSS_URL
ENV VITE_WSS_URL=$VITE_WSS_URL

WORKDIR /app
COPY package*.json ./
COPY packages/website/package*.json ./packages/website/
COPY packages/game-client/package*.json ./packages/game-client/
COPY packages/game-shared/package*.json ./packages/game-shared/
RUN npm ci
COPY . .
RUN npm run build -w packages/website && \
    npm ci --omit=dev -w packages/website
WORKDIR /app/packages/website
CMD ["npm", "run", "start"]