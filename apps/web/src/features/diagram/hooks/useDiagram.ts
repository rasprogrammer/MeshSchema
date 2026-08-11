"use client";

import { useMemo } from "react";
import { parseDbml } from "../lib/parseDbml";
import { buildLayoutedGraph } from "../lib/layout";

export function useDiagram(dbml: string) {
  return useMemo(() => {
    const parsed = parseDbml(dbml);
    if (parsed.error) {
      return { nodes: [], edges: [], error: parsed.error, tableCount: 0 };
    }
    const { nodes, edges } = buildLayoutedGraph(parsed);
    return { nodes, edges, error: null, tableCount: parsed.tables.length };
  }, [dbml]);
}
