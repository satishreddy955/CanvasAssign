import { v4 as uuidv4 } from "https://cdn.skypack.dev/uuid";

export class CanvasEngine{
    constructor(canvas){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.isDrawing= false;
        this.currentStroke = null;
        this.history= [];
        this.color= 'black';
        this.width= 4;
        this.mode = "brush";
    }
    setColor(c){
        this.color= c;
    }
    setWidth(w){
        this.width=w;
    }
    setMode(m){
        this.mode=m;
    }
    startDrawing(x,y){
        this.isDrawing= true;
        this.currentStroke={
            id: uuidv4(),
            color:this.mode == "eraser"?"#ffffff":this.color,
            width:this.width,
            points: [{x,y}]
        };
    }
    draw(x,y){
        if(!this.isDrawing) return;
        const pts = this.currentStroke.points;
        const last = pts[pts.length - 1];
        pts.push({x,y});
        this.ctx.strokeStyle = this.currentStroke.color;
        this.ctx.lineWidth = this.currentStroke.width;
        this.ctx.lineCap= "round";
        this.ctx.beginPath();
        this.ctx.moveTo(last.x, last.y);
        this.ctx.lineTo(x,y);
        this.ctx.stroke();
    }
    stopDrawing(){
        if(!this.isDrawing){
            return null;
        }
        this.isDrawing = false;
        const stroke = this.currentStroke;
        this.currentStroke= null;
        return stroke;
    }
    loadHistory(history){
        this.history = history;
        this.redraw();
    }
    redraw(){
        this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
        for(const stroke of this.history){
            this.drawStroke(stroke);
        }
    }
    drawStroke(stroke){
        const ctx = this.ctx;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i=1; i<stroke.points.length;i++){
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
    }
}