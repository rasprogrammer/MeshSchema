"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { schemaApi } from "../services/schema.service";
import { SaveStatus } from "../types";

const AUTOSAVE_DELAY_MS = 1200;

/**
 * Debounced autosave for the DBML editor. Call `notifyChange(dbml)` on every
 * edit; a save request fires after the user pauses typing. Exposes the
 * current save status for a "Saved" / "Saving…" indicator in the UI.
 */
export function useAutosave(projectId: string) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestDbmlRef = useRef<string | null>(null);
  const savingRef = useRef(false);

  const flush = useCallback(async () => {
    if (latestDbmlRef.current === null || savingRef.current) return;
    const dbml = latestDbmlRef.current;
    savingRef.current = true;
    setStatus("saving");
    try {
      await schemaApi.update(projectId, dbml);
      setStatus("saved");
    } catch {
      setStatus("error");
    } finally {
      savingRef.current = false;
    }
  }, [projectId]);

  const notifyChange = useCallback(
    (dbml: string) => {
      latestDbmlRef.current = dbml;
      setStatus("idle");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        void flush();
      }, AUTOSAVE_DELAY_MS);
    },
    [flush]
  );

  const saveNow = useCallback(
    async (dbml: string, options?: { createVersion?: boolean; versionLabel?: string }) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      savingRef.current = true;
      setStatus("saving");
      try {
        await schemaApi.update(projectId, dbml, options);
        setStatus("saved");
      } catch {
        setStatus("error");
        throw new Error("Failed to save schema");
      } finally {
        savingRef.current = false;
      }
    },
    [projectId]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { status, notifyChange, saveNow };
}
