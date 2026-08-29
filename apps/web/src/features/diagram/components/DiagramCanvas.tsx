"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  applyNodeChanges,
  type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TableNode } from "./TableNode";
import { buildLayoutedGraph } from "../lib/layout";
import { parseDbml } from "../lib/parseDbml";
import { AlertTriangle } from "lucide-react";
import { useCallback } from "react";

const nodeTypes = { tableNode: TableNode };

export interface DiagramCanvasHandle {
  /** Recomputes dagre layout in place, useful after manual dragging. */
  autoLayout: () => void;
  /** DOM node to rasterize for PNG/SVG export. */
  getExportElement: () => HTMLDivElement | null;
  /** Apply remote node changes without triggering local change handlers. */
  applyRemoteNodeChanges: (changes: NodeChange[]) => void;
}

interface Props {
  dbml: string;
  onNodesChange?: (changes: NodeChange[]) => void;
}

function DiagramCanvasInner(
  { dbml, onNodesChange: onNodesChangeProp }: Props,
  ref: React.ForwardedRef<DiagramCanvasHandle>
) {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();
  const parseError = useRef<string | null>(null);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChangeInternal(changes);
      onNodesChangeProp?.(changes);
    },
    [onNodesChangeInternal, onNodesChangeProp]
  );

  useEffect(() => {
    const parsed = parseDbml(dbml);
    parseError.current = parsed.error;
    if (parsed.error) return;

    const { nodes: nextNodes, edges: nextEdges } = buildLayoutedGraph(parsed);
    setNodes(nextNodes);
    setEdges(nextEdges);
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbml]);

  useImperativeHandle(ref, () => ({
    autoLayout: () => {
      const parsed = parseDbml(dbml);
      if (parsed.error) return;
      const { nodes: nextNodes, edges: nextEdges } = buildLayoutedGraph(parsed);
      setNodes(nextNodes);
      setEdges(nextEdges);
      setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
    },
    getExportElement: () => wrapperRef.current,
    applyRemoteNodeChanges: (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
  }));

  const parsed = parseDbml(dbml);

  if (parsed.error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-background p-6 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="max-w-sm text-sm text-muted-foreground">{parsed.error}</p>
      </div>
    );
  }

  if (parsed.tables.length === 0) {
    return (
      <div className="blueprint-grid flex h-full items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">
          Start typing DBML in the editor — your ER diagram will appear here.
        </p>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        proOptions={{ hideAttribution: true }}
        minZoom={0.1}
        maxZoom={2}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={24} color="hsl(189 94% 55% / 0.15)" />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          maskColor="hsl(222 47% 6% / 0.7)"
          className="!bg-card"
          nodeColor="hsl(189 94% 55%)"
        />
      </ReactFlow>
    </div>
  );
}

const ForwardedDiagramCanvasInner = forwardRef(DiagramCanvasInner);

export const DiagramCanvas = forwardRef<DiagramCanvasHandle, Props>((props, ref) => (
  <ReactFlowProvider>
    <ForwardedDiagramCanvasInner {...props} ref={ref} />
  </ReactFlowProvider>
));
DiagramCanvas.displayName = "DiagramCanvas";
