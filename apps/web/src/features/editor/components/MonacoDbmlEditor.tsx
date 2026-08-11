"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import Editor, { Monaco, OnMount } from "@monaco-editor/react";
import type { editor as MonacoEditorNs } from "monaco-editor";
import { registerDbmlLanguage } from "../lib/dbmlLanguage";

export interface MonacoDbmlEditorHandle {
  /** Replaces the full document with `text` as a single, undoable edit. */
  applyText: (text: string) => void;
  undo: () => void;
  redo: () => void;
  getValue: () => string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export const MonacoDbmlEditor = forwardRef<MonacoDbmlEditorHandle, Props>(
  ({ value, onChange, readOnly }, ref) => {
    const editorRef = useRef<MonacoEditorNs.IStandaloneCodeEditor | null>(null);

    const handleMount: OnMount = (editorInstance, monaco: Monaco) => {
      registerDbmlLanguage(monaco);
      editorRef.current = editorInstance;
    };

    useImperativeHandle(ref, () => ({
      applyText: (text: string) => {
        const editorInstance = editorRef.current;
        if (!editorInstance) return;
        const model = editorInstance.getModel();
        if (!model) return;

        const fullRange = model.getFullModelRange();
        editorInstance.executeEdits("ai-apply", [{ range: fullRange, text }]);
        editorInstance.pushUndoStop();
      },
      undo: () => editorRef.current?.trigger("toolbar", "undo", null),
      redo: () => editorRef.current?.trigger("toolbar", "redo", null),
      getValue: () => editorRef.current?.getValue() ?? "",
    }));

    return (
      <Editor
        height="100%"
        defaultLanguage="dbml"
        language="dbml"
        theme="vs-dark"
        value={value}
        onChange={(v) => onChange(v ?? "")}
        onMount={handleMount}
        options={{
          readOnly,
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
        }}
      />
    );
  }
);

MonacoDbmlEditor.displayName = "MonacoDbmlEditor";
