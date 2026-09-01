"use client";

import { useState } from "react";
import { FolderKanban } from "lucide-react";
import { useProjectsList } from "../hooks/useProjects";
import { ProjectCard } from "./ProjectCard";
import { ProjectsToolbar } from "./ProjectsToolbar";
import { Skeleton } from "@/shared/ui/skeleton";
import { CreateProjectDialog } from "./dialogs/CreateProjectDialog";
import { ProjectListOptions } from "../types";

export function ProjectList() {
  const [options, setOptions] = useState<ProjectListOptions>({});
  const { data: projects, isLoading, isError } = useProjectsList(options);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-destructive">Could not load projects. Please refresh.</p>;
  }

  return (
    <>
      <ProjectsToolbar options={options} onChange={setOptions} />

      {!projects || projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-24 text-center">
          <FolderKanban className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="font-medium">No projects yet</p>
            <p className="text-sm text-muted-foreground">Create your first project to start designing a schema.</p>
          </div>
          <CreateProjectDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </>
  );
}

