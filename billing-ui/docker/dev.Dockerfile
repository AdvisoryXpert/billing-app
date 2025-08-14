FROM node:20-bullseye
ENV WATCHPACK_POLLING=true EXPO_NO_TELEMETRY=1 CI=false
WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .
EXPOSE 19000 19001 19002 19006 8081
CMD ["bash", "-lc", "npm run start:web || npx expo start --web"]
