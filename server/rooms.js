const users = new Map();
export function getRandomColor(){
    const colors =[
        "red","green","blue",
        "yellow","violet","brown"
    ];
    return colors[Math.floor(Math.random()* colors.length)];
};
export function addUser(socketId){
    const user = {
        id:socketId,
        color:getRandomColor()
    };
    users.set(socketId,user);
    return user;
};
export function removeUser(socketId){
    users.delete(socketId);
};
export function getUsers(){
    return Array.from(users.values());
};
export function getUser(socketId){
    return users.get(socketId);
};