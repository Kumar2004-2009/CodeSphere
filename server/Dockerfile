FROM node:20-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends g++ docker.io \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
RUN mkdir -p temp

ENV PORT=4000
ENV USE_DOCKER=true
ENV DOCKER_IMAGE=rce-cpp-sandbox

EXPOSE 4000
CMD ["node", "index.js"]
