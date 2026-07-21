"use client";

import { X, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToastList, useToastDismiss } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const toasts = useToastList();
  const dismiss = useToastDismiss();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-start gap-3 rounded-lg border bg-card p-4 shadow-lg animate-in fade-in slide-in-from-bottom-2",
            t.variant === "destructive" && "border-destructive/50"
          )}
        >
          {t.variant === "destructive" ? (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium">{t.title}</p>
            {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
          </div>
          <button onClick={() => dismiss(t.id)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
