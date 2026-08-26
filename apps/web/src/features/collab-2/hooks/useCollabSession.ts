"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CollabUser, ServerMessage } from "@repo/types";
import { getCollabSocket } from "../lib/socket";

interface PeerState extends CollabUser {
  position: { x: number; y: number } | null;
}

interface UseCollabSessionResult {
  peers: PeerState[];
  connected: boolean;
  /** Call on pointer move within the shared canvas (percentage-based coords, 0-100). */
  broadcastCursor: (x: number, y: number) => void;
  /** Call to broadcast a live DBML edit to peers so their diagram stays in sync. */
  broadcastSchemaEdit: (dbml: string) => void;
  /** Subscribe to remote DBML edits (returns an unsubscribe fn). */
  onRemoteSchemaEdit: (cb: (dbml: string) => void) => () => void;
}

const CURSOR_THROTTLE_MS = 40;

export function useCollabSession(projectId: string | null): UseCollabSessionResult {
  const [peers, setPeers] = useState<Record<string, PeerState>>({});
  const [connected, setConnected] = useState(false);
  const lastSentRef = useRef(0);
  const remoteEditListeners = useRef(new Set<(dbml: string) => void>());
  const projectIdRef = useRef(projectId);
  projectIdRef.current = projectId;

  useEffect(() => {
    if (!projectId) return;
    const socket = getCollabSocket();

    function joinProject() {
      socket.send({ type: "project:join", projectId: projectId! });
    }

    function handleMessage(message: ServerMessage) {
      switch (message.type) {
        case "project:joined": {
          const next: Record<string, PeerState> = {};
          for (const peer of message.peers) next[peer.id] = { ...peer, position: null };
          setPeers(next);
          setConnected(true);
          break;
        }
        case "project:join_error": {
          setConnected(false);
          break;
        }
        case "presence:join": {
          setPeers((prev) => ({ ...prev, [message.user.id]: { ...message.user, position: null } }));
          break;
        }
        case "presence:leave": {
          setPeers((prev) => {
            const next = { ...prev };
            delete next[message.userId];
            return next;
          });
          break;
        }
        case "cursor:move": {
          setPeers((prev) => ({
            ...prev,
            [message.user.id]: { ...message.user, position: message.position },
          }));
          break;
        }
        case "schema:edit": {
          remoteEditListeners.current.forEach((cb) => cb(message.dbml));
          break;
        }
      }
    }

    const unsubscribeMessage = socket.onMessage(handleMessage);
    const unsubscribeConnection = socket.onConnectionChange((isConnected) => {
      if (isConnected) joinProject();
      else setConnected(false);
    });

    socket.connect();
    if (socket.connected) joinProject();

    return () => {
      socket.send({ type: "project:leave", projectId: projectId! });
      unsubscribeMessage();
      unsubscribeConnection();
      setPeers({});
      setConnected(false);
    };
  }, [projectId]);

  const broadcastCursor = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - lastSentRef.current < CURSOR_THROTTLE_MS) return;
    lastSentRef.current = now;
    getCollabSocket().send({ type: "cursor:move", position: { x, y } });
  }, []);

  const broadcastSchemaEdit = useCallback((dbml: string) => {
    getCollabSocket().send({ type: "schema:edit", dbml });
  }, []);

  const onRemoteSchemaEdit = useCallback((cb: (dbml: string) => void) => {
    remoteEditListeners.current.add(cb);
    return () => remoteEditListeners.current.delete(cb);
  }, []);

  return { peers: Object.values(peers), connected, broadcastCursor, broadcastSchemaEdit, onRemoteSchemaEdit };
}
