"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LayoutGrid, Sparkles, Undo2, Redo2, Wifi, WifiOff } from "lucide-react";
import { RequireAuth } from "@/shared/components/RequireAuth";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { SplitPane } from "@/shared/components/SplitPane";
import { useProject } from "@/features/projects/hooks/useProjects";
import { useSchema } from "@/features/editor/hooks/useSchema";
import { useAutosave } from "@/features/editor/hooks/useAutosave";
import { MonacoDbmlEditor, MonacoDbmlEditorHandle } from "@/features/editor/components/MonacoDbmlEditor";
import { SaveStatusIndicator } from "@/features/editor/components/SaveStatusIndicator";
import { DiagramCanvas, DiagramCanvasHandle } from "@/features/diagram/components/DiagramCanvas";
import { AiPanel } from "@/features/ai/components/AiPanel";
import { useCollabSession } from "@/features/collab/hooks/useCollabSession";
import { LiveCursors } from "@/features/collab/components/LiveCursors";
import { PresenceStack } from "@/features/collab/components/PresenceStack";

export default function CollabWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = use(params);

  const [dbml, setDbml] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);

  const [sessionClosed, setSessionClosed] = useState(false);
  const editorRef = useRef<MonacoDbmlEditorHandle>(null);
  const diagramRef = useRef<DiagramCanvasHandle>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const isApplyingRemoteUpdateRef = useRef(false);

  // --- Live collaboration: presence + cursors + remote schema edits ---
  // A guest visiting this page is always joining the collab session
  const { peers, connected, broadcastCursor, broadcastSchemaEdit, broadcastDiagramMove, onRemoteSchemaEdit, onRemoteDiagramMove, onSessionClosed } = useCollabSession(sessionId, true);

  useEffect(() => {
    return onRemoteSchemaEdit((remoteDbml) => {
      // A peer edited the schema — reflect it locally without re-broadcasting.
      isApplyingRemoteUpdateRef.current = true;
      editorRef.current?.applyText(remoteDbml);
      setDbml(remoteDbml);
    });
  }, [onRemoteSchemaEdit]);

  useEffect(() => {
    return onRemoteDiagramMove((changes: any[]) => {
      diagramRef.current?.applyRemoteNodeChanges(changes);
    });
  }, [onRemoteDiagramMove]);

  useEffect(() => {
    return onSessionClosed(() => {
      setSessionClosed(true);
    });
  }, [onSessionClosed]);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const rect = canvasWrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    broadcastCursor(x, y);
  }

  function handleEditorChange(value: string) {
    if (isApplyingRemoteUpdateRef.current) {
        isApplyingRemoteUpdateRef.current = false;
        return; // Don't broadcast back remote updates to prevent loops
    }
    setDbml(value);
    broadcastSchemaEdit(value);
  }

  function handleDiagramMove(changes: any[]) {
    broadcastDiagramMove(changes);
  }

  function handleApplyAiDbml(newDbml: string) {
    editorRef.current?.applyText(newDbml);
    setDbml(newDbml);
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
              <p className="text-sm font-medium leading-tight">Collab Session</p>
            </div>
            {/* WS Connection Indicator */}
            <div title={connected ? "Connected to Collaboration Session" : "Connecting..."} className="flex items-center">
                {connected ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                    <WifiOff className="h-4 w-4 text-gray-400" />
                )}
            </div>
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
            <Button variant="ai" size="sm" onClick={() => setAiOpen((v) => !v)}>
              <Sparkles className="h-4 w-4" /> AI Assistant
            </Button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div ref={canvasWrapperRef} onPointerMove={handlePointerMove} className="relative flex-1 overflow-hidden">
            <LiveCursors peers={peers} />
            {!isReady ? (
              <div className="flex h-full flex-col items-center justify-center text-gray-500 gap-4">
                 <Skeleton className="h-2/3 w-2/3" />
                 <p>Waiting for host to sync DBML...</p>
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

        {/* Session Closed Modal */}
        {sessionClosed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-xl bg-card p-8 shadow-2xl text-center border">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <WifiOff className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Session Ended</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  The host has ended this collaboration session. You can no longer view or edit this project.
                </p>
              </div>
              <Link href="/dashboard" className="w-full mt-4">
                <Button className="w-full">Return to Dashboard</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
