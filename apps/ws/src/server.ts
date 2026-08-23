
import { WebSocketServer } from "ws";
import { UserManager } from "./UserManager";

const server = new WebSocketServer({ port: 3002 });

server.on('connection', (ws) => {
    ws.send('hello from websocket server');
    UserManager.getInstance().addUser(ws);
    
});

