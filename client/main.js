const canvas = document.getElementById("canvas");
const usersDiv = document.getElementById("users");

const engine = new CanvasEngine(canvas);
const cursors = new Map();
let users = [];
let selfUser = null;

function renderUsers(list) {
  usersDiv.innerHTML =
    "Online Users: " +
    list.map(u =>
      `<span style="color:${u.color}">●</span> ${u.id.slice(0, 4)}`
    ).join(" | ");
}

const socket = initSocket({
  onInit: ({ history, users: serverUsers, self }) => {
    selfUser = self;
    users = serverUsers;
    engine.loadHistory(history);
    renderUsers(users);
  },

  onStrokeCommit: (stroke) => {
    engine.history.push(stroke);
    engine.drawStroke(stroke);
  },

  onStateUpdate: (history) => {
    engine.loadHistory(history);
  },

  onCursorUpdate: ({ userId, color, x, y }) => {
    if (userId === selfUser?.id) return;

    let cursor = cursors.get(userId);
    if (!cursor) {
      cursor = document.createElement("div");
      cursor.className = "cursor";
      cursor.style.background = color;
      document.body.appendChild(cursor);
      cursors.set(userId, cursor);
    }

    cursor.style.left = x + "px";
    cursor.style.top = y + "px";
  },

  onUserJoin: (user) => {
    users.push(user);
    renderUsers(users);
  },

  onUserLeft: (userId) => {
    users = users.filter(u => u.id !== userId);
    renderUsers(users);

    const cursor = cursors.get(userId);
    if (cursor) {
      cursor.remove();
      cursors.delete(userId);
    }
  }
});

/* Toolbar */
document.getElementById("colorPicker").onchange = e =>
  engine.setColor(e.target.value);

document.getElementById("sizePicker").onchange = e =>
  engine.setWidth(e.target.value);

document.getElementById("brushBtn").onclick = () =>
  engine.setMode("brush");

document.getElementById("eraserBtn").onclick = () =>
  engine.setMode("eraser");

document.getElementById("undoBtn").onclick = () =>
  socket.emit("undo");

document.getElementById("redoBtn").onclick = () =>
  socket.emit("redo");

/* Canvas events */
canvas.addEventListener("mousedown", e => {
  const r = canvas.getBoundingClientRect();
  engine.startDrawing(e.clientX - r.left, e.clientY - r.top);
});

canvas.addEventListener("mousemove", e => {
  const r = canvas.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;

  engine.draw(x, y);
  socket.emit("cursor:move", { x, y });
});

function finishStroke() {
  const stroke = engine.stopDrawing();
  if (stroke) socket.emit("stroke:end", stroke);
}

canvas.addEventListener("mouseup", finishStroke);
canvas.addEventListener("mouseleave", finishStroke);
