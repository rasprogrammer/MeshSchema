"use client";

import { useState } from "react";
import { Download, FileCode2, FileImage, FileJson } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/apiClient";
import { schemaApi } from "@/features/editor/services/schema.service";
import { downloadTextFile } from "@/lib/utils";
import { exportDiagramAsPng, exportDiagramAsSvg } from "../lib/exportImage";

interface Props {
  projectId: string;
  projectName: string;
  getDiagramElement: () => HTMLElement | null;
}

export function ExportMenu({ projectId, projectName, getDiagramElement }: Props) {
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  async function run(action: () => Promise<void>, label: string) {
    setBusy(true);
    try {
      await action();
      toast({ title: `Exported ${label}` });
    } catch (error) {
      toast({ title: `Could not export ${label}`, description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  const slug = projectName.trim().toLowerCase().replace(/\s+/g, "-") || "schema";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={busy}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() =>
            run(async () => {
              const dbml = await schemaApi.exportDbml(projectId);
              downloadTextFile(`${slug}.dbml`, dbml);
            }, "DBML")
          }
        >
          <FileJson className="h-4 w-4" /> DBML
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            run(async () => {
              const sql = await schemaApi.exportSql(projectId);
              downloadTextFile(`${slug}.sql`, sql);
            }, "PostgreSQL SQL")
          }
        >
          <FileCode2 className="h-4 w-4" /> PostgreSQL SQL
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            run(async () => {
              const el = getDiagramElement();
              if (!el) throw new Error("Diagram not ready");
              await exportDiagramAsPng(el, `${slug}.png`);
            }, "PNG")
          }
        >
          <FileImage className="h-4 w-4" /> PNG image
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            run(async () => {
              const el = getDiagramElement();
              if (!el) throw new Error("Diagram not ready");
              await exportDiagramAsSvg(el, `${slug}.svg`);
            }, "SVG")
          }
        >
          <FileImage className="h-4 w-4" /> SVG image
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
