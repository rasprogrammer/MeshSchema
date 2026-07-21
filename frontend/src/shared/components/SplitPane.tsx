"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultSplit?: number; // percentage for the left pane, 0-100
  minSplit?: number;
  maxSplit?: number;
}

/** A simple horizontally-draggable two-pane layout (editor | diagram). */
export function SplitPane({ left, right, defaultSplit = 45, minSplit = 25, maxSplit = 75 }: Props) {
  const [split, setSplit] = useState(defaultSplit);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplit(Math.min(maxSplit, Math.max(minSplit, pct)));
    },
    [minSplit, maxSplit]
  );

  const stopDragging = useCallback(() => {
    draggingRef.current = false;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", stopDragging);
  }, [onPointerMove]);

  const startDragging = useCallback(() => {
    draggingRef.current = true;
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopDragging);
  }, [onPointerMove, stopDragging]);

  return (
    <div ref={containerRef} className="flex h-full w-full overflow-hidden">
      <div style={{ width: `${split}%` }} className="h-full min-w-0">
        {left}
      </div>
      <div
        onPointerDown={startDragging}
        className={cn(
          "group relative z-10 w-1 shrink-0 cursor-col-resize bg-border transition-colors hover:bg-primary"
        )}
      >
        <div className="absolute inset-y-0 -left-1 -right-1" />
      </div>
      <div style={{ width: `${100 - split}%` }} className="h-full min-w-0">
        {right}
      </div>
    </div>
  );
}
