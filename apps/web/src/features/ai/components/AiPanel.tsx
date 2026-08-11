"use client";

import { useState } from "react";
import { Sparkles, Wand2, BookOpen, ShieldAlert, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { useExplainSchema, useDetectIssues } from "../hooks/useAi";
import { useStreamingAi } from "../hooks/useStreamingAi";
import { DiffPreviewDialog } from "./DiffPreviewDialog";

interface Props {
  currentDbml: string;
  onClose: () => void;
  onApplyDbml: (dbml: string) => void;
}

export function AiPanel({ currentDbml, onClose, onApplyDbml }: Props) {
  const [prompt, setPrompt] = useState("");
  const [instructions, setInstructions] = useState("");

  const streaming = useStreamingAi();
  const explain = useExplainSchema();
  const detectIssues = useDetectIssues();

  function handleAccept() {
    if (streaming.proposedDbml) onApplyDbml(streaming.proposedDbml);
    streaming.dismiss();
  }

  return (
    <div className="flex h-full w-full flex-col border-l bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2 font-medium">
          <Sparkles className="h-4 w-4 text-accent" /> AI Assistant
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="generate" className="flex flex-1 flex-col overflow-hidden px-4 py-3">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="improve">Improve</TabsTrigger>
          <TabsTrigger value="explain">Explain</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="flex flex-1 flex-col gap-3 overflow-y-auto">
          <p className="text-xs text-muted-foreground">
            Describe the app or domain. AI streams a full DBML schema live, then shows a diff to review before
            replacing the editor content.
          </p>
          <Textarea
            rows={5}
            placeholder="e.g. A multi-tenant SaaS project management tool with workspaces, projects, tasks, and comments"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Button
            variant="ai"
            disabled={streaming.isStreaming || prompt.trim().length < 3}
            onClick={() => streaming.generate(prompt)}
          >
            <Wand2 className="h-4 w-4" />
            {streaming.isStreaming && streaming.kind === "generate" ? "Generating…" : "Generate schema"}
          </Button>
          {streaming.isStreaming && streaming.kind === "generate" && (
            <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-md border bg-secondary/40 p-3 font-mono text-xs leading-relaxed">
              {streaming.liveText}
              <span className="animate-pulse">▍</span>
            </pre>
          )}
        </TabsContent>

        <TabsContent value="improve" className="flex flex-1 flex-col gap-3 overflow-y-auto">
          <p className="text-xs text-muted-foreground">
            AI reviews the current schema and proposes improvements (naming, constraints, indexes, relationships).
          </p>
          <Textarea
            rows={3}
            placeholder="Optional instructions, e.g. 'Add soft deletes' or 'Normalize the address fields'"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
          <Button
            variant="ai"
            disabled={streaming.isStreaming || currentDbml.trim().length === 0}
            onClick={() => streaming.improve(currentDbml, instructions || undefined)}
          >
            <Wand2 className="h-4 w-4" />
            {streaming.isStreaming && streaming.kind === "improve" ? "Improving…" : "Improve schema"}
          </Button>
          {streaming.isStreaming && streaming.kind === "improve" && (
            <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-md border bg-secondary/40 p-3 font-mono text-xs leading-relaxed">
              {streaming.liveText}
              <span className="animate-pulse">▍</span>
            </pre>
          )}
        </TabsContent>

        <TabsContent value="explain" className="flex flex-1 flex-col gap-3 overflow-y-auto">
          <Button
            variant="secondary"
            disabled={explain.isPending || currentDbml.trim().length === 0}
            onClick={() => explain.mutate(currentDbml)}
          >
            <BookOpen className="h-4 w-4" />
            {explain.isPending ? "Explaining…" : "Explain this schema"}
          </Button>
          {explain.data && (
            <div className="whitespace-pre-wrap rounded-md border bg-secondary/40 p-3 text-sm leading-relaxed">
              {explain.data.explanation}
            </div>
          )}
        </TabsContent>

        <TabsContent value="issues" className="flex flex-1 flex-col gap-3 overflow-y-auto">
          <Button
            variant="secondary"
            disabled={detectIssues.isPending || currentDbml.trim().length === 0}
            onClick={() => detectIssues.mutate(currentDbml)}
          >
            <ShieldAlert className="h-4 w-4" />
            {detectIssues.isPending ? "Reviewing…" : "Detect design issues"}
          </Button>
          {detectIssues.data && (
            <div className="whitespace-pre-wrap rounded-md border bg-secondary/40 p-3 text-sm leading-relaxed">
              {detectIssues.data.report}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {streaming.proposedDbml && (
        <DiffPreviewDialog
          open
          currentDbml={currentDbml}
          proposedDbml={streaming.proposedDbml}
          onAccept={handleAccept}
          onReject={streaming.dismiss}
        />
      )}
    </div>
  );
}
