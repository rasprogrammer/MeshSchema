import { ClientMessage, ServerMessage } from "@repo/types";
import { useEffect, useRef, useState, useCallback } from "react";

interface UseProjectSocketProps {
  projectId: string;
}

export const useProjectSocket = ({ projectId }: UseProjectSocketProps) => {
    const [isConnected, setIsConnected] = useState(false);
    const socket = useRef<WebSocket | null>(null);
    const [messages, setMessages] = useState<string[]>([]);

    const initialized = useRef(false);

    const connectToWebSocket = useCallback(async () => {
        if (initialized.current) return;
        initialized.current = true;

        try {
            
            console.log("Got WS token, connecting to WebSocket...");

            // Connect to WebSocket with token
            const ws = new WebSocket(`ws://localhost:3002?projectId=${projectId}`);
            socket.current = ws;

            ws.onopen = () => {
                console.log("WebSocket connection established.");
                setIsConnected(true);
            };

            ws.onmessage = (event) => {
                const data: ServerMessage = JSON.parse(event.data);
                if (data.type === "project:joined") {
                    console.log("Joined project:", data.self);
                    setIsConnected(true);
                } else if (data.type === "project:left") {
                    console.log("Left project");
                    setIsConnected(false);
                }
                console.log("Received message:", data);
                setMessages((prev) => [...prev, event.data]);
            };

            ws.onclose = () => {
                console.log("WebSocket connection closed.");
                setIsConnected(false);
                initialized.current = false;
            };

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
            };

        } catch (error) {
            console.error("Failed to connect to WebSocket:", error);
            initialized.current = false;
        }
    }, [projectId]);

    console.log('mounting socket', socket.current);

    useEffect(() => {
        connectToWebSocket();

        return () => {
            if (socket.current?.readyState === WebSocket.OPEN) {
                socket.current.close();
            }
            socket.current = null;
            initialized.current = false;
        };
    }, [connectToWebSocket]);

    const sendMessage = (message: ClientMessage) => {
        if (socket.current && socket.current.readyState === WebSocket.OPEN) {
            socket.current.send(JSON.stringify(message));
        } else {
            console.error("WebSocket is not open. Unable to send message.");
        }
    };

    return { socket, messages, sendMessage, isConnected };
}