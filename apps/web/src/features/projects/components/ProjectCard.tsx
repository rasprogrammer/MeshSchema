"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreVertical, Pencil, Trash2, ArrowUpRight, Star, Copy } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { formatDate, cn } from "@/lib/utils";
import { Project } from "../types";
import { useDuplicateProject, useToggleFavorite } from "../hooks/useProjects";
import { RenameProjectDialog } from "./dialogs/RenameProjectDialog";
import { DeleteProjectDialog } from "./dialogs/DeleteProjectDialog";

export function ProjectCard({ project }: { project: Project }) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const toggleFavorite = useToggleFavorite();
  const duplicateProject = useDuplicateProject();

  return (
    <>
      <Card className="group relative flex flex-col justify-between transition-colors hover:border-primary/50">
        <Link href={`/projects/${project.id}`} className="absolute inset-0 z-0" aria-label={`Open ${project.name}`} />
        <CardHeader className="relative z-10 pointer-events-none">
          <div className="flex items-start justify-between">
            <CardTitle className="pr-6">{project.name}</CardTitle>
            <div className="flex items-center gap-1 pointer-events-auto">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => toggleFavorite.mutate(project.id)}
                aria-label={project.isFavorite ? "Unfavorite" : "Favorite"}
              >
                <Star className={cn("h-4 w-4", project.isFavorite && "fill-yellow-400 text-yellow-400")} />
              </Button>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </div>
          <CardDescription className="line-clamp-2 min-h-[2.5rem]">
            {project.description || "No description"}
          </CardDescription>
        </CardHeader>
        <div className="relative z-10 flex items-center justify-between px-6 pb-4 text-xs text-muted-foreground">
          <span>Updated {formatDate(project.updatedAt)}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="pointer-events-auto h-7 w-7">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setRenameOpen(true)}>
                <Pencil className="h-4 w-4" /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => duplicateProject.mutate(project.id)}>
                <Copy className="h-4 w-4" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4" /> Move to trash
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
      <RenameProjectDialog project={project} open={renameOpen} onOpenChange={setRenameOpen} />
      <DeleteProjectDialog project={project} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  );
}

