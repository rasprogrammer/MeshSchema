import { ServerMessage } from "@repo/types";
import { useCallback, useEffect, useRef } from "react";

let globalSocket: WebSocket | null = null;
let activeRoomId: string | null = null;
let activeConnections = 0;

interface useCollabSessionProps {
    projectId: string;
    roomId: string;
    token: string;
    onMessage?: (message: ServerMessage) => void;
    onOpen?: () => void;
    onClose?: () => void;
}


export function useCollabSession({projectId, roomId, token, onMessage, onOpen, onClose}: useCollabSessionProps) {

    const socketRef = useRef<WebSocket | null>(null);
    const connectingRef = useRef<boolean>(false);
    const retryCountRef = useRef<number>(0);
    const MAX_RETRIES = 5;
    
    // store callbacks in refs to avoid re-creating them on every render
    const onMessageRef = useRef(onMessage);
    const onOpenRef = useRef(onOpen);
    const onCloseRef = useRef(onClose);

    // Update refs when props change
    useEffect(() => {
        onMessageRef.current = onMessage;
        onOpenRef.current = onOpen;
        onCloseRef.current = onClose;
    }, [onMessage, onOpen, onClose]);

    const sendMessage = (message: any) => {
        const socket = socketRef.current;
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        }
    };

    const connectWebSocket = useCallback(() => {
        if (!token || connectingRef.current || retryCountRef.current >= MAX_RETRIES) {
            return;
        }
        
        // If we have an existing socket and it's open, we don't need to create a new one
        if (globalSocket && globalSocket.readyState === WebSocket.OPEN) {
            socketRef.current = globalSocket;
            activeConnections++;
            
            onOpenRef.current?.();
            return;
        }

        connectingRef.current = true;
        
        try {
            const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4001"}/collab?projectId=${projectId}&roomId=${roomId}&token=${token}`;
            const socket = new WebSocket(wsUrl);
            
            socketRef.current = socket;
            globalSocket = socket;
            activeConnections++;

            socket.onopen = () => {
                connectingRef.current = false;
                retryCountRef.current = 0;
                activeRoomId = roomId;
                onOpenRef.current?.();
            }

            socket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                onMessageRef.current?.(message);
            };

            socket.onclose = () => {
                connectingRef.current = false;
                activeConnections--;
                if (activeRoomId === roomId) {
                    activeRoomId = null;
                }
                onCloseRef.current?.();
                if (retryCountRef.current < MAX_RETRIES) {
                    retryCountRef.current++;
                    setTimeout(connectWebSocket, 1000 * retryCountRef.current); // Exponential backoff
                }
            };

            socket.onerror = (error) => {
                console.error("WebSocket error:", error);
                socket.close();
            }

        } catch (error) {
            console.error("Error creating or joining room:", error);
            connectingRef.current = false;
            retryCountRef.current++;
            setTimeout(connectWebSocket, 1000 * retryCountRef.current); // Exponential backoff
        }

    }, [projectId, roomId, token]);

    useEffect(() => {
        connectWebSocket();

        return () => {
            const socket = socketRef.current;
            if (socket) {
                activeConnections--;
                if (activeConnections <= 0) {
                    socket.close();
                    globalSocket = null;
                    activeRoomId = null;
                }
            }
        };
    }, [connectWebSocket, token, projectId, roomId]);


    return {
        sendMessage,
        isConnected: socketRef.current?.readyState === WebSocket.OPEN,
    };

}

