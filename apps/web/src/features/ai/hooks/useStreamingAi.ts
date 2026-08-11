"use client";

import { useCallback, useState } from "react";
import { aiApi } from "../services/ai.service";
import { useToast } from "@/hooks/use-toast";

export type StreamKind = "generate" | "improve";

interface StreamState {
  kind: StreamKind | null;
  isStreaming: boolean;
  /** Live text as it streams in — shown to the user before validation completes. */
  liveText: string;
  /** Set once the stream finishes and validates — triggers the diff-preview dialog. */
  proposedDbml: string | null;
}

const initialState: StreamState = { kind: null, isStreaming: false, liveText: "", proposedDbml: null };

/**
 * Drives the "diff preview before applying AI changes" UX: streams the raw
 * DBML text live (so generation feels live, not a spinner), then — once the
 * backend has validated the final result — exposes it as `proposedDbml` so
 * the caller can show an accept/reject diff instead of instant-applying it.
 */
export function useStreamingAi() {
  const [state, setState] = useState<StreamState>(initialState);
  const { toast } = useToast();

  const generate = useCallback(
    async (prompt: string) => {
      setState({ kind: "generate", isStreaming: true, liveText: "", proposedDbml: null });
      try {
        const { dbml } = await aiApi.streamGenerate(prompt, (chunk) =>
          setState((s) => ({ ...s, liveText: s.liveText + chunk }))
        );
        setState((s) => ({ ...s, isStreaming: false, proposedDbml: dbml }));
      } catch (err) {
        setState(initialState);
        toast({ title: "Generation failed", description: (err as Error).message, variant: "destructive" });
      }
    },
    [toast]
  );

  const improve = useCallback(
    async (dbml: string, instructions?: string) => {
      setState({ kind: "improve", isStreaming: true, liveText: "", proposedDbml: null });
      try {
        const { dbml: improved } = await aiApi.streamImprove(dbml, instructions, (chunk) =>
          setState((s) => ({ ...s, liveText: s.liveText + chunk }))
        );
        setState((s) => ({ ...s, isStreaming: false, proposedDbml: improved }));
      } catch (err) {
        setState(initialState);
        toast({ title: "Improvement failed", description: (err as Error).message, variant: "destructive" });
      }
    },
    [toast]
  );

  const dismiss = useCallback(() => setState(initialState), []);

  return { ...state, generate, improve, dismiss };
}
