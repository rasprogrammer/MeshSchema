import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { KeyRound, Asterisk } from "lucide-react";
import { TableNodeData } from "../types";

function TableNodeComponent({ data }: NodeProps) {
  const table = data as unknown as TableNodeData;

  return (
    <div className="min-w-[240px] overflow-hidden rounded-md border border-primary/30 bg-card shadow-md">
      <div className="border-b border-primary/30 bg-secondary px-3 py-2">
        <p className="font-mono text-sm font-semibold text-foreground">{table.name}</p>
        {table.note && <p className="truncate text-xs text-muted-foreground">{table.note}</p>}
      </div>
      <div>
        {table.fields.map((field) => (
          <div
            key={field.name}
            className="relative flex items-center justify-between gap-3 border-b border-border/60 px-3 py-1.5 text-xs last:border-b-0"
          >
            <Handle
              type="target"
              position={Position.Left}
              id={`${table.name}.${field.name}.target`}
              className="!h-2 !w-2 !bg-primary"
            />
            <span className="flex items-center gap-1.5 font-mono">
              {field.pk && <KeyRound className="h-3 w-3 shrink-0 text-accent" />}
              {!field.pk && field.notNull && <Asterisk className="h-3 w-3 shrink-0 text-muted-foreground" />}
              {field.name}
            </span>
            <span className="font-mono text-muted-foreground">{field.type}</span>
            <Handle
              type="source"
              position={Position.Right}
              id={`${table.name}.${field.name}.source`}
              className="!h-2 !w-2 !bg-primary"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export const TableNode = memo(TableNodeComponent);
