import { WebSocket } from "ws"

interface Rooms {
    [roomId: string] : Set<WebSocket>
}

export const rooms: Rooms = {};

export const addUserInRoom = (roomId: string, socket: WebSocket) => {
    if (!rooms[roomId]) {
        rooms[roomId] = new Set();
    }
    rooms[roomId].add(socket);
}

export const removeUser = (roomId: string, socket: WebSocket) => {
    if (rooms[roomId] && rooms[roomId].has(socket)) {
        rooms[roomId].delete(socket);

        if (rooms[roomId].size === 0) {
            delete rooms[roomId];
        }
    }
}

export const isUserInRoom = (roomId: string, socket: WebSocket) => {
    return rooms[roomId]?.has(socket) || false;
}

export const getUsersInRoom = (roomId: string) => {
    return rooms[roomId] ? Array.from(rooms[roomId]) : [];
}

export const broadcastToRoom = (roomId: string, payload: any, excludeSocket?: WebSocket) => {
    if (!rooms[roomId]) return;

    const data = JSON.stringify(payload);

    rooms[roomId].forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN && ws !== excludeSocket) {
            ws.send(data);
        }
    })
}