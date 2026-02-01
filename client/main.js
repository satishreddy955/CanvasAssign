import { CanvasEngine } from "./canvas.js";
import { initSocket } from "./webSocket.js";

const canvas = document.getElementById("canvas");
const usersDiv = document.getElementById("users");
const engine = new CanvasEngine(canvas);
const cursors = new Map();
let selfUser = null;

function renderUsers(users){
    usersDiv.innerHtml = "Online Users: "+users.map(u=>
        `<span style="color:${u.color}">.</span>
        ${u.id.substring(0,4)}`
    ).join(" | ")
}
const socket = initSocket({
    onInit: ({ history, users, self}) => {
        selfUser = self;
        engine.loadHistory(history);
        renderUsers(users);
    },
    onStrokeCommit: (stroke) => engine.commitStroke(stroke),
    onStateUpdate: (history) => engine.loadHistory(history),
    onCursorUpdate: ({userId, color, x, y}) => {
        let cursor = cursors.get(userId);
        if(!cursor){
            cursor = document.createElement("div");
            cursor.className = "cursor";
            cursor.style.background = color;
            document.body.appendChild(cursor);
            cursors.set(userId,cursor);
        }
        cursor.style.left= x+"px";
        cursor.style.top= y+"px";
    },
    onUserJoin: (user) =>{
        renderUsers([...cursors.keys()].map(id =>({id})));
    },
    onUserLeft: (userId) =>{
        const cursor = cursors.get(userId);
        if(cursor){
            cursor.remove();
            cursors.delete(userId);
        }
    }
});
let colorPicker = document.getElementById("colorPicker");
colorPicker.onchange = (e)=>{
    engine.setColor(e.target.value);
};
let sizePicker = document.getElementById("sizePicker");
sizePicker.onchange = (e)=>{
    engine.setWidth(e.target.value);
};
let brushBtn = document.getElementById("brushBtn");
brushBtn.onclick = ()=>{
    engine.setMode("brush");
}
let eraserBtn = document.getElementById("eraserBtn");
eraserBtn.onclick= ()=>{
    engine.setMode("eraser");
};
let undoBtn = document.getElementById("undoBtn");
undoBtn.onclick=()=>{
    socket.emit("undo");
};
let redoBtn= document.getElementById("redoBtn");
redoBtn.onclick= ()=>{
    socket.emit("redo");
};

canvas.addEventListener("mousedown",e =>{
    const r = canvas.getBoundingClientRect();
    engine.startDrawing(e.clientX - r.left, e.clientY-r.top);
});
canvas.addEventListener("mousemove",e=>{
    const r= canvas.getBoundingClientRect();
    const x = e.clientX- r.left;
    const y = e.clientY - r.top;
    engine.draw(x,y);
    socket.emit("cursor:move",{x,y,color:engine.color});
});
canvas.addEventListener("mouseup",()=>{
    const stroke = engine.stopDrawing();
    if (stroke) {
        socket.emit("stroke:end", stroke);
    }
});
canvas.addEventListener("mouseleave",()=>{
    const stroke = engine.stopDrawing();
    if (stroke){
        socket.emit("stroke:end",stroke);
    }
});