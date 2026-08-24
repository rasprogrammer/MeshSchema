import { addUserInRoom, broadcastToRoom, removeUser } from "./utils/roomManager"
import { WebSocket } from "ws";


export const handleRoomEvent = (payload: any, ws: WebSocket) => {
    switch(payload.type) {
        case "room:join" :
            console.log('room join event'); 
            addUserInRoom(payload.roomId, ws);
            const data = {
                type: "room:joined",
                payload: {
                    roomId: payload.roomId,
                }
            }
            broadcastToRoom(payload.roomId, data, ws);
            break;
        case "room:leave" : 
            removeUser(payload.roomId, ws);
            const leavedData = {
                type: "room:leaved",
                payload: {
                    roomId: payload.roomId,
                }
            }
            broadcastToRoom(payload.roomId, leavedData, ws);
            break;
    }
}   