"use client";

import { useState } from "react";
import { Sparkles, Wand2, BookOpen, ShieldAlert, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { useGenerateSchema, useImproveSchema, useExplainSchema, useDetectIssues } from "../hooks/useAi";

interface Props {
  currentDbml: string;
  onClose: () => void;
  onApplyDbml: (dbml: string) => void;
}

export function AiPanel({ currentDbml, onClose, onApplyDbml }: Props) {
  const [prompt, setPrompt] = useState("");
  const [instructions, setInstructions] = useState("");

  const generate = useGenerateSchema();
  const improve = useImproveSchema();
  const explain = useExplainSchema();
  const detectIssues = useDetectIssues();

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
            Describe the app or domain. AI will draft a full DBML schema, replacing the current editor content.
          </p>
          <Textarea
            rows={5}
            placeholder="e.g. A multi-tenant SaaS project management tool with workspaces, projects, tasks, and comments"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Button
            variant="ai"
            disabled={generate.isPending || prompt.trim().length < 3}
            onClick={() => generate.mutate(prompt, { onSuccess: (res) => onApplyDbml(res.dbml) })}
          >
            <Wand2 className="h-4 w-4" />
            {generate.isPending ? "Generating…" : "Generate schema"}
          </Button>
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
            disabled={improve.isPending || currentDbml.trim().length === 0}
            onClick={() =>
              improve.mutate(
                { dbml: currentDbml, instructions: instructions || undefined },
                { onSuccess: (res) => onApplyDbml(res.dbml) }
              )
            }
          >
            <Wand2 className="h-4 w-4" />
            {improve.isPending ? "Improving…" : "Improve schema"}
          </Button>
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
    </div>
  );
}
