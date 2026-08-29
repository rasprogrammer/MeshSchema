import http from "http";
import { WebSocketServer } from "ws";
import type { ClientMessage } from "@repo/types";
import { handleProjectJoin, handleProjectLeave } from "./handlers/projectHandler";
import { authenticateConnection } from "./services/auth";
import { getToken } from "./services/getToken";
import { env } from "./config/env";

const httpServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello from HTTP server\n');
});


const server = new WebSocketServer({ server: httpServer });

console.log(`WebSocket server is running on ws://localhost:${env.port}`);


server.on('connection', (ws, request) => {

    const url = request.url || '';
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const projectId = urlParams.get('projectId');



    if (!projectId) {
        console.log('Missing projectId in connection URL');
        ws.close(1008, 'Missing projectId');
        return;
    }

    const token = getToken(request);
    const user = authenticateConnection(token);
    if (!user) {
        console.log('Invalid or expired access token, rejecting connection');
        ws.close(4001, 'Unauthorized');
        return;
    }

    console.log('User connected ', user.id);

    ws.on('message', async (raw) => {
        try {

            const payload: ClientMessage = JSON.parse(raw.toString());

            
            switch (payload.type) {
                case "project:join":
                    return await handleProjectJoin(ws, payload.projectId, user);
                case "project:leave":
                    return await handleProjectLeave(ws, payload.projectId, user);
                default:
                    console.log('Unknown message type:', payload.type);
            }
            
            


        } catch (error: any) {
            console.error('Failed to parse message', error);
            ws.send(JSON.stringify({ 
                type: "error", 
                code: error?.code ?? "INTERNAL_ERROR",
                message: error.message
            }));
        }
    })

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
        console.log('User disconnected', user.id); 
    })
    
});


httpServer.listen(env.port, () => {
    console.log(`HTTP server is running on http://localhost:${env.port}`);
});