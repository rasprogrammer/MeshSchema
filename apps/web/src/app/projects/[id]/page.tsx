"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LayoutGrid, Sparkles, Undo2, Redo2, Wifi, WifiOff, UserPlus } from "lucide-react";
import { RequireAuth } from "@/shared/components/RequireAuth";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { SplitPane } from "@/shared/components/SplitPane";
import { useProject, useUpdateProject } from "@/features/projects/hooks/useProjects";
import { InviteDialog } from "@/features/projects/components/dialogs/InviteDialog";
import { useSchema } from "@/features/editor/hooks/useSchema";
import { useAutosave } from "@/features/editor/hooks/useAutosave";
import { MonacoDbmlEditor, MonacoDbmlEditorHandle } from "@/features/editor/components/MonacoDbmlEditor";
import { SaveStatusIndicator } from "@/features/editor/components/SaveStatusIndicator";
import { DiagramCanvas, DiagramCanvasHandle } from "@/features/diagram/components/DiagramCanvas";
import { AiPanel } from "@/features/ai/components/AiPanel";
import { ExportMenu } from "@/features/export/components/ExportMenu";
import { useCollabSession } from "@/features/collab/hooks/useCollabSession";
import { LiveCursors } from "@/features/collab/components/LiveCursors";
import { PresenceStack } from "@/features/collab/components/PresenceStack";
import { Share } from "@/features/collab/components/Share";

export default function ProjectWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);

  const { data: project } = useProject(projectId);
  const { mutate: updateProject } = useUpdateProject();
  const { data: schema, isLoading: schemaLoading } = useSchema(projectId);
  const { status, notifyChange, saveNow } = useAutosave(projectId);

  const [dbml, setDbml] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [collabEnabled, setCollabEnabled] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const editorRef = useRef<MonacoDbmlEditorHandle>(null);
  const diagramRef = useRef<DiagramCanvasHandle>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const isApplyingRemoteUpdateRef = useRef(false);

  // --- Live collaboration: presence + cursors + remote schema edits ---
  const { peers, connected, broadcastCursor, broadcastSchemaEdit, broadcastDiagramMove, broadcastSessionClosed, onRemoteSchemaEdit, onRemoteDiagramMove, onPeerJoin } = useCollabSession(sessionId, collabEnabled, projectId);

  useEffect(() => {
    return onRemoteSchemaEdit((remoteDbml) => {
      // A peer edited the schema — reflect it locally without re-broadcasting.
      isApplyingRemoteUpdateRef.current = true;
      editorRef.current?.applyText(remoteDbml);
      setDbml(remoteDbml);
      notifyChange(remoteDbml);
    });
  }, [onRemoteSchemaEdit, notifyChange]);

  useEffect(() => {
    return onRemoteDiagramMove((changes: any[]) => {
      diagramRef.current?.applyRemoteNodeChanges(changes);
    });
  }, [onRemoteDiagramMove]);

  useEffect(() => {
    return onPeerJoin((peer) => {
      console.log("CollabSession: Peer joined event received on host side:", peer.email, "Current DBML length:", dbml?.length);
      // When a new guest joins, broadcast the current dbml to initialize their editor
      if (dbml) {
        console.log("CollabSession: Broadcasting DBML to sync guest...");
        broadcastSchemaEdit(dbml);
      } else {
        console.warn("CollabSession: Cannot broadcast DBML because it is null.");
      }
    });
  }, [onPeerJoin, dbml, broadcastSchemaEdit]);

  // If the host joins a session and guests are already waiting, sync them!
  const hasSyncedInitialRef = useRef(false);
  useEffect(() => {
    if (connected && dbml && peers.length > 0 && !hasSyncedInitialRef.current) {
      console.log("CollabSession: Connected to active session with existing peers, broadcasting DBML...");
      broadcastSchemaEdit(dbml);
      hasSyncedInitialRef.current = true;
    }
  }, [connected, dbml, peers.length, broadcastSchemaEdit]);

  useEffect(() => {
    if (!connected) {
      hasSyncedInitialRef.current = false;
    }
  }, [connected]);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const rect = canvasWrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    broadcastCursor(x, y);
  }

  function handleDiagramMove(changes: any[]) {
    if (collabEnabled) broadcastDiagramMove(changes);
  }

  // Seed local editor state once the schema loads (only once, to avoid
  // clobbering in-progress edits on background refetches).
  useEffect(() => {
    if (schema && dbml === null) {
      setDbml(schema.dbml);
    }
  }, [schema, dbml]);

  function handleEditorChange(value: string) {
    if (isApplyingRemoteUpdateRef.current) {
        isApplyingRemoteUpdateRef.current = false;
        return; // Don't broadcast back remote updates to prevent loops
    }
    setDbml(value);
    notifyChange(value);
    broadcastSchemaEdit(value);
  }

  function handleApplyAiDbml(newDbml: string) {
    editorRef.current?.applyText(newDbml);
    setDbml(newDbml);
    void saveNow(newDbml, { createVersion: true, versionLabel: "AI update" });
    broadcastSchemaEdit(newDbml);
  }

  const isReady = dbml !== null;

  return (
    <RequireAuth>
      <div className="flex h-screen flex-col bg-background">
        <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <p className="text-sm font-medium leading-tight">{project?.name ?? "Loading…"}</p>
              <SaveStatusIndicator status={status} />
            </div>
            {/* WS Connection Indicator */}
            {collabEnabled && (
                <div title={connected ? "Connected to Collaboration Session" : "Connecting..."} className="flex items-center">
                    {connected ? (
                        <Wifi className="h-4 w-4 text-green-500" />
                    ) : (
                        <WifiOff className="h-4 w-4 text-gray-400" />
                    )}
                </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <PresenceStack peers={peers} />
            <Button variant="outline" size="sm" onClick={() => editorRef.current?.undo()}>
              <Undo2 className="h-4 w-4" /> Undo
            </Button>
            <Button variant="outline" size="sm" onClick={() => editorRef.current?.redo()}>
              <Redo2 className="h-4 w-4" /> Redo
            </Button>
            <Button variant="outline" size="sm" onClick={() => diagramRef.current?.autoLayout()}>
              <LayoutGrid className="h-4 w-4" /> Auto layout
            </Button>
            <ExportMenu
              projectId={projectId}
              projectName={project?.name ?? "schema"}
              getDiagramElement={() => diagramRef.current?.getExportElement() ?? null}
            />
            <Button variant="ai" size="sm" onClick={() => setAiOpen((v) => !v)}>
              <Sparkles className="h-4 w-4" /> AI Assistant
            </Button>

            <Button variant="outline" size="sm" onClick={() => setInviteOpen(true)}>
              <UserPlus className="h-4 w-4" /> Invite
            </Button>

            <Share 
                projectId={projectId}
                collabEnabled={collabEnabled} 
                sessionId={sessionId}
                onStartSession={() => {
                  setSessionId(crypto.randomUUID());
                  setCollabEnabled(true);
                }} 
                onStopSession={() => {
                  broadcastSessionClosed();
                  // Short delay to allow WS message to flush before disconnecting
                  setTimeout(() => {
                    setCollabEnabled(false);
                    setSessionId(null);
                  }, 100);
                }} 
            />
          </div>
        </header>

        <InviteDialog projectId={projectId} open={inviteOpen} onOpenChange={setInviteOpen} />

        <div className="flex flex-1 overflow-hidden">
          <div ref={canvasWrapperRef} onPointerMove={handlePointerMove} className="relative flex-1 overflow-hidden">
            <LiveCursors peers={peers} />
            {!isReady || schemaLoading ? (
              <div className="flex h-full items-center justify-center">
                <Skeleton className="h-2/3 w-2/3" />
              </div>
            ) : (
              <SplitPane
                left={
                  <MonacoDbmlEditor ref={editorRef} value={dbml ?? ""} onChange={handleEditorChange} />
                }
                right={<DiagramCanvas ref={diagramRef} dbml={dbml ?? ""} onNodesChange={handleDiagramMove} />}
              />
            )}
          </div>

          {aiOpen && isReady && (
            <div className="w-[380px] shrink-0">
              <AiPanel currentDbml={dbml ?? ""} onClose={() => setAiOpen(false)} onApplyDbml={handleApplyAiDbml} />
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
