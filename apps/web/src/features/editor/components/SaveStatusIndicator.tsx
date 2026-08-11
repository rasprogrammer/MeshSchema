import { Check, Loader2, AlertCircle } from "lucide-react";
import { SaveStatus } from "../types";
import { cn } from "@/lib/utils";

export function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  const config = {
    idle: { icon: null, label: "Unsaved changes", className: "text-muted-foreground" },
    saving: { icon: Loader2, label: "Saving…", className: "text-muted-foreground" },
    saved: { icon: Check, label: "All changes saved", className: "text-primary" },
    error: { icon: AlertCircle, label: "Failed to save", className: "text-destructive" },
  }[status];

  const Icon = config.icon;

  return (
    <span className={cn("flex items-center gap-1.5 text-xs", config.className)}>
      {Icon && <Icon className={cn("h-3.5 w-3.5", status === "saving" && "animate-spin")} />}
      {config.label}
    </span>
  );
}
