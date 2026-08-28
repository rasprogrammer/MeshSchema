import { ProjectJoinedMessage, ProjectLeftMessage } from "@repo/types";
import { WebSocket } from "ws";
import { AuthenticatedUser } from "../services/auth";

export const handleProjectJoin = (ws: WebSocket, projectId: string, user: AuthenticatedUser) => {
    console.log(`User ${user.id} joined project: ${projectId}`);
    // Here you can add logic to handle the user joining the project,

    return ws.send(JSON.stringify({
        type: "project:joined",
        self: {
            id: user.id,
            email: user.email,
            color: "#000000",
            name: user.email
        },
        peers: []
    } satisfies ProjectJoinedMessage)); 
    
} 

export const handleProjectLeave = (ws: WebSocket, projectId: string, user: AuthenticatedUser) => {
    console.log(`User ${user.id} left project: ${projectId}`);
    // Here you can add logic to handle the user leaving the project,

    return ws.send(JSON.stringify({
        type: "project:left",
    } satisfies ProjectLeftMessage));


}