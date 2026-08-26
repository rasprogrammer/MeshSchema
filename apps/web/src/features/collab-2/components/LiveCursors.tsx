"use client";

import { MousePointer2 } from "lucide-react";

interface PeerCursor {
  id: string;
  name?: string;
  email: string;
  color: string;
  position: { x: number; y: number } | null;
}

interface Props {
  peers: PeerCursor[];
}

/**
 * Renders remote collaborators' cursors as absolutely-positioned overlays.
 * Positions are percentages (0-100) of the shared canvas, so this scales
 * correctly regardless of each client's viewport/zoom.
 */
export function LiveCursors({ peers }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {peers.map((peer) =>
        peer.position ? (
          <div
            key={peer.id}
            className="absolute -translate-x-0.5 -translate-y-0.5 transition-[left,top] duration-75 ease-linear"
            style={{ left: `${peer.position.x}%`, top: `${peer.position.y}%` }}
          >
            <MousePointer2 className="h-4 w-4 drop-shadow" style={{ color: peer.color, fill: peer.color }} />
            <span
              className="ml-4 -mt-1 inline-block whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-medium text-white shadow"
              style={{ backgroundColor: peer.color }}
            >
              {peer.name || peer.email}
            </span>
          </div>
        ) : null
      )}
    </div>
  );
}
