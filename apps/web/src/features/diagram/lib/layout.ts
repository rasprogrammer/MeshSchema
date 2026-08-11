import dagre from "dagre";
import { Edge, Node } from "@xyflow/react";
import { ParseResult } from "../types";

const NODE_WIDTH = 260;
const HEADER_HEIGHT = 40;
const FIELD_HEIGHT = 26;

function estimateNodeHeight(fieldCount: number): number {
  return HEADER_HEIGHT + Math.max(fieldCount, 1) * FIELD_HEIGHT + 12;
}

/**
 * Converts a parsed DBML structure into XYFlow nodes/edges and lays them
 * out automatically with dagre (left-to-right, ranked by FK direction).
 */
export function buildLayoutedGraph(parsed: ParseResult): { nodes: Node[]; edges: Edge[] } {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: "LR", nodesep: 60, ranksep: 110 });

  for (const table of parsed.tables) {
    graph.setNode(table.name, {
      width: NODE_WIDTH,
      height: estimateNodeHeight(table.fields.length),
    });
  }

  for (const ref of parsed.refs) {
    if (graph.hasNode(ref.sourceTable) && graph.hasNode(ref.targetTable)) {
      graph.setEdge(ref.sourceTable, ref.targetTable);
    }
  }

  dagre.layout(graph);

  const nodes: Node[] = parsed.tables.map((table) => {
    const pos = graph.node(table.name);
    return {
      id: table.name,
      type: "tableNode",
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - pos.height / 2 },
      data: table,
      draggable: true,
    };
  });

  const edges: Edge[] = parsed.refs.map((ref) => ({
    id: ref.id,
    source: ref.sourceTable,
    target: ref.targetTable,
    sourceHandle: `${ref.sourceTable}.${ref.sourceField}.source`,
    targetHandle: `${ref.targetTable}.${ref.targetField}.target`,
    type: "smoothstep",
    animated: false,
    style: { stroke: "hsl(189 94% 55%)", strokeWidth: 1.5 },
  }));

  return { nodes, edges };
}
