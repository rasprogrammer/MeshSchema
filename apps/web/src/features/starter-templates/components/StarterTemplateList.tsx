"use client";

import { useState } from "react";
import { StarterTemplate } from "../types";
import StarterTemplateCard from "./StarterTemplateCard";
import CreateStarterProjectDialog from "./CreateStarterProjectDialog";
import { Skeleton } from "@/shared/ui/skeleton";
import { FolderKanban } from "lucide-react";
import { useStarterTemplateList } from "../hooks/useStarterTemplates";


export default function StarterTemplateList() {
  const [selectedTemplate, setSelectedTemplate] = useState<
    StarterTemplate | null
  >(null);

  const { data: templates, isLoading, isError } = useStarterTemplateList();

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

  if (!templates || templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-24 text-center">
        <FolderKanban className="h-10 w-10 text-muted-foreground" />
        <div>
          <p className="font-medium">No projects yet</p>
          <p className="text-sm text-muted-foreground">Create your first project to start designing a schema.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template, index) => (
          <StarterTemplateCard
            key={template.id || `${template.name}-${index}`} 
            template={template}
            onClick={() => setSelectedTemplate(template)}
          />
        ))}
      </div>

      <CreateStarterProjectDialog
        template={selectedTemplate}
        open={!!selectedTemplate}
        onOpenChange={(open: boolean) => {
          if (!open) setSelectedTemplate(null);
        }}
      />
    </>
  );
}