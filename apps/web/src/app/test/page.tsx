"use client";

import { useEffect, useState } from "react";
import { useProjectSocket } from "@/features/projects/hooks/useProjectSocket";
import { Input } from "@/shared/ui/input";
import { ClientMessage } from "@repo/types";
import { Button } from "@/shared/ui/button";

export default function TestPage() {

    const projectId = "d071316a-7d35-41aa-a078-950a31ceffa2";
    

    const { messages, sendMessage, isConnected } = useProjectSocket({ projectId });
    
    useEffect(() => {

    }, [messages]);
    

    const handleSendMessage = (message: any) => {
        const payload: ClientMessage = {
            type: "project:join",
            projectId: "projectId"
        };
        sendMessage(payload);
    }

    const handleJoinProject = () => {
        const payload: ClientMessage = {
            type: "project:join",
            projectId: projectId
        };
        sendMessage(payload);
    }

    const handleDisconnect = () => {
        // Implement disconnect logic here
        sendMessage({ type: "project:leave", projectId } as ClientMessage);
    }
    

    return (
        <div className="flex flex-col gap-4 p-4 bg-gray-100 min-h-screen text-black">
            <h2>Test some code</h2>

            <div className="flex flex-col gap-2">
                <h3>Received Messages:</h3>
                
                <Button onClick={handleJoinProject} disabled={isConnected}>
                    {isConnected ? "Connected" : "Join Project"}
                </Button>
                <Button onClick={handleDisconnect} disabled={!isConnected}>
                    Disconnect
                </Button>
                {messages.length === 0 ? (
                    <p>No messages received yet.</p>
                ) : (
                    <ul>
                        {messages.map((msg, index) => (
                            <li key={index}>{msg}</li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="flex flex-col gap-2">   
                <Input 
                    className="border p-2 rounded text-white"
                    placeholder="Type a message..." 
                    onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleSendMessage(e.currentTarget.value);
                        e.currentTarget.value = '';
                    }
                }} />
            </div>

        </div>
    )
}

