"use client";

import { diffLines } from "diff";
import { Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  currentDbml: string;
  proposedDbml: string;
  onAccept: () => void;
  onReject: () => void;
}

/** Line-level diff view of the current schema vs. the AI's proposed rewrite. */
export function DiffPreviewDialog({ open, currentDbml, proposedDbml, onAccept, onReject }: Props) {
  const parts = diffLines(currentDbml, proposedDbml);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onReject()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Review AI changes</DialogTitle>
        </DialogHeader>

        <div className="max-h-[55vh] overflow-y-auto rounded-md border bg-secondary/30 font-mono text-xs leading-relaxed">
          {parts.map((part, i) => (
            <pre
              key={i}
              className={cn(
                "whitespace-pre-wrap px-3 py-0.5",
                part.added && "bg-emerald-500/15 text-emerald-300",
                part.removed && "bg-rose-500/15 text-rose-300 line-through decoration-rose-400/50"
              )}
            >
              {part.value}
            </pre>
          ))}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onReject}>
            <X className="h-4 w-4" /> Reject
          </Button>
          <Button variant="ai" onClick={onAccept}>
            <Check className="h-4 w-4" /> Accept changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
