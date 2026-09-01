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
  /** Call to broadcast diagram movement changes. */
  broadcastDiagramMove: (changes: any[]) => void;
  /** Call to broadcast that the session has been closed. */
  broadcastSessionClosed: () => void;
  /** Subscribe to remote DBML edits (returns an unsubscribe fn). */
  onRemoteSchemaEdit: (cb: (dbml: string) => void) => () => void;
  /** Subscribe to remote diagram movement (returns an unsubscribe fn). */
  onRemoteDiagramMove: (cb: (changes: any[]) => void) => () => void;
  /** Subscribe to session closed events. */
  onSessionClosed: (cb: () => void) => () => void;
  /** Subscribe to peer join events. */
  onPeerJoin: (cb: (peer: PeerState) => void) => () => void;
  /** Subscribe to a server-side rejection of an edit you sent (permission downgrade, e.g.). */
  onSchemaEditRejected: (cb: (reason: string) => void) => () => void;
  /** Checkout a table before editing it; resolves once locked/unlocked/denied is known. */
  acquireTableLock: (tableName: string) => void;
  releaseTableLock: (tableName: string) => void;
  /** tableName -> userId holding the lock. */
  lockedTables: Record<string, string>;
  onTableLockDenied: (cb: (tableName: string, reason: string) => void) => () => void;
}

const CURSOR_THROTTLE_MS = 40;

export function useCollabSession(roomId: string | null, enabled: boolean = true, projectId?: string | null): UseCollabSessionResult {
  const [peers, setPeers] = useState<Record<string, PeerState>>({});
  const [connected, setConnected] = useState(false);
  const [lockedTables, setLockedTables] = useState<Record<string, string>>({});
  const lastSentRef = useRef(0);
  const remoteEditListeners = useRef(new Set<(dbml: string) => void>());
  const remoteDiagramListeners = useRef(new Set<(changes: any[]) => void>());
  const sessionClosedListeners = useRef(new Set<() => void>());
  const schemaEditRejectedListeners = useRef(new Set<(reason: string) => void>());
  const tableLockDeniedListeners = useRef(new Set<(tableName: string, reason: string) => void>());
  const peerJoinListeners = useRef(new Set<(peer: PeerState) => void>());
  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;

  const joinProject = useCallback(() => {
    if (!roomId) return;
    getCollabSocket().send({ type: "project:join", roomId, projectId: projectId ?? undefined });
  }, [roomId, projectId]);

  useEffect(() => {
    if (!enabled || !roomId) {
      if (connected) {
        getCollabSocket().send({ type: "project:leave", roomId: roomIdRef.current! });
        getCollabSocket().disconnect();
        setConnected(false);
        setPeers({});
      }
      return;
    }

    const socket = getCollabSocket();

    const handleMessage = (message: ServerMessage) => {
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
          const newPeer = { ...message.user, position: null };
          setPeers((prev) => ({ ...prev, [message.user.id]: newPeer }));
          peerJoinListeners.current.forEach((cb) => cb(newPeer));
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
        case "diagram:move": {
          remoteDiagramListeners.current.forEach((cb) => cb(message.changes));
          break;
        }
        case "session:closed": {
          sessionClosedListeners.current.forEach((cb) => cb());
          break;
        }
        case "schema:edit_rejected": {
          schemaEditRejectedListeners.current.forEach((cb) => cb(message.reason));
          break;
        }
        case "table:locked": {
          setLockedTables((prev) => ({ ...prev, [message.tableName]: message.userId }));
          break;
        }
        case "table:unlocked": {
          setLockedTables((prev) => {
            const next = { ...prev };
            delete next[message.tableName];
            return next;
          });
          break;
        }
        case "table:lock_denied": {
          tableLockDeniedListeners.current.forEach((cb) => cb(message.tableName, message.reason));
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
      if (roomIdRef.current) {
        socket.send({ type: "project:leave", roomId: roomIdRef.current });
      }
      unsubscribeMessage();
      unsubscribeConnection();
      setPeers({});
      setConnected(false);
      socket.disconnect(); // explicit disconnection when stopping session
    };
  }, [roomId]);

  const broadcastCursor = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - lastSentRef.current < CURSOR_THROTTLE_MS) return;
    lastSentRef.current = now;
    getCollabSocket().send({ type: "cursor:move", position: { x, y } });
  }, []);

  const broadcastSchemaEdit = useCallback((dbml: string) => {
    getCollabSocket().send({ type: "schema:edit", dbml });
  }, []);

  const broadcastDiagramMove = useCallback((changes: any[]) => {
    getCollabSocket().send({ type: "diagram:move", changes });
  }, []);

  const broadcastSessionClosed = useCallback(() => {
    getCollabSocket().send({ type: "session:closed" });
  }, []);

  const onRemoteSchemaEdit = useCallback((cb: (dbml: string) => void) => {
    remoteEditListeners.current.add(cb);
    return () => remoteEditListeners.current.delete(cb);
  }, []);

  const onRemoteDiagramMove = useCallback((cb: (changes: any[]) => void) => {
    remoteDiagramListeners.current.add(cb);
    return () => remoteDiagramListeners.current.delete(cb);
  }, []);

  const onSessionClosed = useCallback((cb: () => void) => {
    sessionClosedListeners.current.add(cb);
    return () => sessionClosedListeners.current.delete(cb);
  }, []);

  const onPeerJoin = useCallback((cb: (peer: PeerState) => void) => {
    peerJoinListeners.current.add(cb);
    return () => peerJoinListeners.current.delete(cb);
  }, []);

  const onSchemaEditRejected = useCallback((cb: (reason: string) => void) => {
    schemaEditRejectedListeners.current.add(cb);
    return () => schemaEditRejectedListeners.current.delete(cb);
  }, []);

  const onTableLockDenied = useCallback((cb: (tableName: string, reason: string) => void) => {
    tableLockDeniedListeners.current.add(cb);
    return () => tableLockDeniedListeners.current.delete(cb);
  }, []);

  const acquireTableLock = useCallback((tableName: string) => {
    getCollabSocket().send({ type: "table:lock", tableName });
  }, []);

  const releaseTableLock = useCallback((tableName: string) => {
    getCollabSocket().send({ type: "table:unlock", tableName });
  }, []);

  return { 
    peers: Object.values(peers), 
    connected, 
    broadcastCursor, 
    broadcastSchemaEdit, 
    broadcastDiagramMove,
    broadcastSessionClosed,
    onRemoteSchemaEdit, 
    onRemoteDiagramMove,
    onSessionClosed,
    onPeerJoin,
    onSchemaEditRejected,
    acquireTableLock,
    releaseTableLock,
    lockedTables,
    onTableLockDenied,
  };
}
