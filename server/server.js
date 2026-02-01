import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { drawingState, addStroke, undo, redo } from "./drawing-state.js";
import { addUser, removeUser, getUsers, getUser } from "./rooms.js";

const app = express();

/* ✅ Allow Vercel frontend */
app.use(cors({
  origin: "https://canvas-assign-izqm.vercel.app",
  methods: ["GET", "POST"]
}));

/* ✅ Health check (IMPORTANT for Render) */
app.get("/", (req, res) => {
  res.send("Socket.IO server running");
});

const server = http.createServer(app);

/* ✅ Socket.IO config for HTTPS */
const io = new Server(server, {
  cors: {
    origin: "https://canvas-assign-izqm.vercel.app",
    methods: ["GET", "POST"]
  },
  transports: ["websocket"]
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const user = addUser(socket.id);

  socket.emit("init", {
    history: drawingState.history,
    users: getUsers(),
    self: user
  });

  socket.broadcast.emit("user:join", user);

  socket.on("stroke:end", (stroke) => {
    stroke.userId = socket.id;
    addStroke(stroke);
    io.emit("stroke:commit", stroke);
  });

  socket.on("undo", () => {
    const state = undo();
    if (state) io.emit("state:update", state);
  });

  socket.on("redo", () => {
    const state = redo();
    if (state) io.emit("state:update", state);
  });

  socket.on("cursor:move", (pos) => {
    const user = getUser(socket.id);
    if (user) {
      socket.broadcast.emit("cursor:update", {
        userId: socket.id,
        color: user.color,
        x: pos.x,
        y: pos.y
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    removeUser(socket.id);
    socket.broadcast.emit("user:left", socket.id);
  });
});

/* ✅ REQUIRED for Render */
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
