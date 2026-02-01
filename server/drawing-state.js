export const drawingState = {
    history:[],
    redoStack:[]
};
export function addStroke(stroke){
    drawingState.history.push(stroke);
    drawingState.redoStack = [];
};
export function undo(){
    if (drawingState.history.length === 0){
        return null;
    }
    const op = drawingState.history.pop();
    drawingState.redoStack.push(op);
    return drawingState.history;
};
export function redo(){
    if (drawingState.redoStack.length === 0){
        return null;
    }
    const op = drawingState.redoStack.pop();
    drawingState.history.push(op);
    return drawingState.history;
};