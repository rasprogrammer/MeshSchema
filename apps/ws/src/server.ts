
import { WebSocketServer } from "ws";
import { handleRoomEvent } from "./RoomHandler";
import { handleDiagramEvent } from "./DiagramHandler";
import { getToken } from "./services/getToken";
import { authenticateToken } from "./services/auth";

const server = new WebSocketServer({ port: 3002 });

server.on('connection', (ws, request) => {
    ws.send('hello from websocket server');

    // authentication logic can be added here if needed
    const url = request.url;
    if (!url) {
        console.log('No URL provided, closing connection');
        ws.close(1008, 'No URL provided');
        return;
    }
    
    const token = getToken(url);
    console.log('Token:', token);

    if (!token) {
        console.log('No token provided, closing connection');
        ws.close(1008, 'No token provided');
        return;
    }

    const isAuthenticated = authenticateToken(token);

    if (!isAuthenticated) {
        console.log('Authentication failed, closing connection');
        ws.close(1008, 'Authentication failed');
        return;
    }

    const userId = isAuthenticated.id;
    console.log(`User ${userId} connected`);

    // roomId 
    



    ws.on('message', (raw) => {
        try {
            const payload = JSON.parse(raw.toString());
            console.log('payload > ', payload);

            switch (payload.type) {
                case "room:join" : 
                case "room:leave" :
                    handleRoomEvent(payload, ws);
                    break;
                case "diagram:update" : 
                case "diagram:save" : 
                case "diagram:add-node" : 
                case "diagram:remove-node" : 
                case "diagram:add-edge" : 
                case "diagram:remove-edge" :
                    handleDiagramEvent(payload, ws);
                    break;
                default:
                    console.log('Unknown message type', payload.type);
            }
        } catch (error) {
            console.error('Failed to parse message', error);
        }
    })

    ws.on('close', () => {
        console.log('User disconnected'); 
    })
    
});

