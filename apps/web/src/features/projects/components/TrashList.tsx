"use client";

import { RotateCcw, Trash2, FolderX } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { useTrash, useRestoreProject, usePurgeProject } from "../hooks/useProjects";

export function TrashList() {
  const { data: projects, isLoading } = useTrash();
  const restore = useRestoreProject();
  const purge = usePurgeProject();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-24 text-center">
        <FolderX className="h-10 w-10 text-muted-foreground" />
        <p className="font-medium">Trash is empty</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <CardTitle>{project.name}</CardTitle>
            <CardDescription>
              Deleted {project.deletedAt ? formatDate(project.deletedAt) : ""}
            </CardDescription>
          </CardHeader>
          <div className="flex items-center justify-end gap-2 px-6 pb-4">
            <Button variant="outline" size="sm" onClick={() => restore.mutate(project.id)} disabled={restore.isPending}>
              <RotateCcw className="h-4 w-4" /> Restore
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm(`Permanently delete "${project.name}"? This cannot be undone.`)) {
                  purge.mutate(project.id);
                }
              }}
              disabled={purge.isPending}
            >
              <Trash2 className="h-4 w-4" /> Delete forever
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
