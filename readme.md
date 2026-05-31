# Remote-Code-Executor-Realtime

Collaborative online code editor with real-time sync (Socket.IO) and C++ execution in an isolated **Docker** sandbox (or local `g++` for development).

## Prerequisites

| Tool | Purpose |
|------|---------|
| **Node.js 18+** | Run client & server |
| **g++** (MinGW on Windows) | Local code execution when `USE_DOCKER=false` |
| **Docker Desktop** | Docker sandbox + full stack via Compose |

## Quick start (local — recommended on Windows)

### 1. Install dependencies

```powershell
cd Remote-Code-Executer-Realtime-main
npm run install:all
```

### 2. Start both apps

**Option A — one command (from project root):**

```powershell
npm run dev
```

**Option B — two terminals:**

```powershell
# Terminal 1 — server
cd server
npm install
npm run dev

# Terminal 2 — client
cd client
npm install
npm start
```

### 3. Open the app

- Frontend: **http://localhost:3000**
- API / Socket.IO: **http://localhost:4000**
- Health check: **http://localhost:4000/health**

Enter a name and room ID, then click **Run code** (C++ only; Python/JS are UI placeholders).

### Local code execution (default)

`server/.env` sets `USE_DOCKER=false` so the server uses **g++ on your machine**. Ensure `g++` is on your PATH:

```powershell
g++ --version
```

---

## Docker — C++ sandbox image only

Build the image used to run submitted code in isolation:

```powershell
npm run docker:sandbox
# or
docker build -f Docker/cpp -t rce-cpp-sandbox .
```

Enable Docker execution in `server/.env`:

```env
USE_DOCKER=true
DOCKER_IMAGE=rce-cpp-sandbox
```

Restart the server. Each run uses:

```text
docker run --rm ... rce-cpp-sandbox
```

---

## Docker — full stack (server + client + sandbox)

Runs everything in containers. The server container talks to the host Docker daemon to spawn sandbox containers.

**Requirements:** Docker Desktop running.

```powershell
# Build all images (first time or after changes)
npm run docker:build

# Start
npm run docker:up
```

Then open **http://localhost:3000**.

Stop:

```powershell
npm run docker:down
```

> The browser still uses `http://localhost:4000` for the API (set via `VITE_SERVER_URL` in Compose).

---

## Configuration

### Server (`server/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | HTTP port |
| `USE_DOCKER` | `false` | `true` = run code in Docker |
| `DOCKER_IMAGE` | `rce-cpp-sandbox` | Image name for sandbox |

### Client (`client/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_SERVER_URL` | `http://localhost:4000` | Backend URL |

---

## Project structure

```text
client/          React + Vite frontend (port 3000)
server/          Express + Socket.IO API (port 4000)
Docker/cpp       Dockerfile for C++ sandbox image
docker-compose.yml   Full stack orchestration
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Client won’t start | Use Node 18+; run `npm install` in `client/` |
| Run fails / compilation error | Install g++ or set `USE_DOCKER=true` and build `rce-cpp-sandbox` |
| Docker run fails on Windows | Start Docker Desktop; build sandbox: `npm run docker:sandbox` |
| Socket/API errors | Start server first; check `VITE_SERVER_URL` in `client/.env` |
