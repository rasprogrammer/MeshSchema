
import { WebSocketServer } from "ws";

const server = new WebSocketServer({ port: 3002 });

server.on('connection', (ws) => {
    ws.send('hello from websocket server');
    
    ws.on('message', (raw) => {
        
    })
})
