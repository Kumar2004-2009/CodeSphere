require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");
const { runCode, USE_DOCKER, DOCKER_IMAGE } = require("./utils/runCode");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "1mb" }));
app.use(express.text({ limit: "1mb" }));

const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: { origin: "*" },
});
const roomStates = new Map();

const DEFAULT_CPP_CODE = `#include <iostream>
using namespace std;
int main() {
    cout << "Hello world" << endl;
    return 0;
}`;

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("joinroom", ({ username, roomid }) => {
    console.log(`Socket ${socket.id} (username: ${username}) attempting to join room: ${roomid}`);
    const user = userJoin(socket.id, username, roomid);
    socket.join(user.room);
    console.log(`Socket ${socket.id} successfully joined room: ${user.room}`);

    // Get or initialize room state
    let state = roomStates.get(user.room);
    if (!state) {
      state = { code: DEFAULT_CPP_CODE, input: "", codeidx: 1 };
      roomStates.set(user.room, state);
      console.log(`Initialized new room state for room: ${user.room}`);
    } else {
      console.log(`Retrieved existing room state for room: ${user.room}`);
    }

    // Sync newly joined user with the room's current state
    socket.emit("recivecode", state.code);
    socket.emit("getInput", state.input);
    socket.emit("getLanguage", state.codeidx);

    socket.to(user.room).emit("joinedmssg", user.username);
  });

  socket.on("sendCode", (code) => {
    const user = getCurrentUser(socket.id);
    if (user) {
      console.log(`Received sendCode from ${user.username} in room ${user.room}`);
      const state = roomStates.get(user.room);
      if (state) {
        state.code = code;
      }
      socket.to(user.room).emit("recivecode", code);
    } else {
      console.log(`Received sendCode from untracked socket: ${socket.id}`);
    }
  });

  socket.on("sendInput", (input) => {
    const user = getCurrentUser(socket.id);
    if (user) {
      console.log(`Received sendInput from ${user.username} in room ${user.room}`);
      const state = roomStates.get(user.room);
      if (state) {
        state.input = input;
      }
      socket.to(user.room).emit("getInput", input);
    }
  });

  socket.on("sendLanguage", (codeidx) => {
    const user = getCurrentUser(socket.id);
    if (user) {
      console.log(`Received sendLanguage (${codeidx}) from ${user.username} in room ${user.room}`);
      const state = roomStates.get(user.room);
      if (state) {
        state.codeidx = codeidx;
      }
      socket.to(user.room).emit("getLanguage", codeidx);
    }
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      console.log(`Socket ${socket.id} (${user.username}) disconnected from room: ${user.room}`);
      io.to(user.room).emit("leavemssg", user.username);
      const roomUsers = getRoomUsers(user.room);
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: roomUsers,
      });

      // Cleanup room state if empty
      if (roomUsers.length === 0) {
        roomStates.delete(user.room);
        console.log(`Cleaned up empty room state for room: ${user.room}`);
      }
    } else {
      console.log(`Untracked socket disconnected: ${socket.id}`);
    }
  });
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    useDocker: USE_DOCKER,
    dockerImage: DOCKER_IMAGE,
  });
});

app.post("/", async (req, res) => {
  const { code, input } = req.body;
  if (!code) {
    return res.status(400).send("No code provided");
  }

  try {
    const result = await runCode(code, input || "");
    res.status(result.status).send(result.body);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while running code");
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Code execution: ${USE_DOCKER ? "Docker (" + DOCKER_IMAGE + ")" : "local g++"}`);
});
