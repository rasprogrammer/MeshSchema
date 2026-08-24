import { WebSocket } from "ws";
import { broadcastToRoom } from "./utils/roomManager";

export const handleDiagramEvent = (payload: any, ws: WebSocket) => {
    switch(payload.type) {
        case "diagram:update" : 
            console.log('Diagram updated');
            broadcastToRoom(payload.roomId, payload, ws);
            break;
        case "diagram:save" : 
            console.log('Diagram saved');
            break;

        case "diagram:add-node" : 
            console.log('Diagram node added');
            break;

        case "diagram:remove-node" : 
            console.log('Diagram node removed');
            break;

        case "diagram:add-edge" : 
            console.log('Diagram edge added');
            break;

        case "diagram:remove-edge" : 
            console.log('Diagram edge removed');
            break;

        default:
            console.log('Unknown diagram event type', payload.type);
            break;
    }
}   