# Remote-Code-Executor-Realtime

Collaborative online code editor with real-time synchronization using **Socket.IO** and C++ code execution in an isolated **Docker** sandbox (or local `g++` for development).

---

## Prerequisites

| Tool                   | Purpose                  |
| ---------------------- | ------------------------ |
| Node.js 18+            | Run frontend and backend |
| g++ (MinGW on Windows) | Local C++ execution      |
| Docker Desktop         | Docker sandbox execution |

---

## Environment Setup

### Client (`client/.env`)

Create a `.env` file inside the `client` folder:

```env
VITE_SERVER_URL=
```

### Server (`server/.env`)

Create a `.env` file inside the `server` folder:

```env
PORT=
USE_DOCKER=
DOCKER_IMAGE=
```

---

## Installation

### 1. Install root dependencies

```bash
npm i
```

### 2. Install all frontend and backend dependencies

```bash
npm run install:all
```

### 3. Start the application

```bash
npm run dev
```

---

## Application URLs

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:4000
```

Health Check:

```text
http://localhost:4000/health
```

---

## Local C++ Execution

By default:

```env
USE_DOCKER=false
```

The server uses your local `g++` compiler.

Verify installation:

```bash
g++ --version
```

---

## Docker Sandbox Setup

Build the sandbox image:

```bash
npm run docker:sandbox
```

or

```bash
docker build -f Docker/cpp -t rce-cpp-sandbox .
```

Enable Docker execution in `server/.env`:

```env
USE_DOCKER=true
DOCKER_IMAGE=rce-cpp-sandbox
```

Restart the server after making changes.

---

## Full Docker Setup

Build all images:

```bash
npm run docker:build
```

Start all services:

```bash
npm run docker:up
```

Stop all services:

```bash
npm run docker:down
```

---

## Project Structure

```text
client/                 React + Vite Frontend
server/                 Express + Socket.IO Backend
Docker/cpp              Dockerfile for C++ Sandbox
docker-compose.yml      Full Stack Docker Setup
```

---

## Troubleshooting

| Problem             | Solution                                          |
| ------------------- | ------------------------------------------------- |
| Client won't start  | Install Node.js 18+ and run `npm run install:all` |
| C++ execution fails | Install g++ or enable Docker mode                 |
| Docker errors       | Start Docker Desktop and build sandbox image      |
| Socket/API issues   | Ensure backend is running on port 4000            |
