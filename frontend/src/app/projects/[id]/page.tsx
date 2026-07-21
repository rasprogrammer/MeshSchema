"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LayoutGrid, Sparkles, Undo2, Redo2 } from "lucide-react";
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
import { ExportMenu } from "@/features/export/components/ExportMenu";

export default function ProjectWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);

  const { data: project } = useProject(projectId);
  const { data: schema, isLoading: schemaLoading } = useSchema(projectId);
  const { status, notifyChange, saveNow } = useAutosave(projectId);

  const [dbml, setDbml] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);

  const editorRef = useRef<MonacoDbmlEditorHandle>(null);
  const diagramRef = useRef<DiagramCanvasHandle>(null);

  // Seed local editor state once the schema loads (only once, to avoid
  // clobbering in-progress edits on background refetches).
  useEffect(() => {
    if (schema && dbml === null) {
      setDbml(schema.dbml);
    }
  }, [schema, dbml]);

  function handleEditorChange(value: string) {
    setDbml(value);
    notifyChange(value);
  }

  function handleApplyAiDbml(newDbml: string) {
    editorRef.current?.applyText(newDbml);
    setDbml(newDbml);
    void saveNow(newDbml, { createVersion: true, versionLabel: "AI update" });
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
          </div>

          <div className="flex items-center gap-2">
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
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            {!isReady || schemaLoading ? (
              <div className="flex h-full items-center justify-center">
                <Skeleton className="h-2/3 w-2/3" />
              </div>
            ) : (
              <SplitPane
                left={
                  <MonacoDbmlEditor ref={editorRef} value={dbml ?? ""} onChange={handleEditorChange} />
                }
                right={<DiagramCanvas ref={diagramRef} dbml={dbml ?? ""} />}
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
