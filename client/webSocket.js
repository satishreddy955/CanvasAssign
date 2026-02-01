export function initSocket(handlers){
    const socket = io("https://canvasassign.onrender.com");
    socket.on("init",handlers.onInit);
    socket.on("stroke:commit",handlers.onStrokeCommit);
    socket.on("state:update",handlers.onCursorUpdate);
    socket.on("user:join",handlers.onUserJoin);
    socket.on("user:left", handlers.onUserLeft);
    return socket;
}
