"use client";

import { Search, Star } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { ProjectListOptions } from "../types";

interface Props {
  options: ProjectListOptions;
  onChange: (options: ProjectListOptions) => void;
}

export function ProjectsToolbar({ options, onChange }: Props) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={options.search ?? ""}
          onChange={(e) => onChange({ ...options, search: e.target.value || undefined })}
          placeholder="Search projects…"
          className="pl-9"
        />
      </div>

      <select
        value={`${options.sort ?? "updatedAt"}:${options.order ?? "desc"}`}
        onChange={(e) => {
          const [sort, order] = e.target.value.split(":") as [ProjectListOptions["sort"], ProjectListOptions["order"]];
          onChange({ ...options, sort, order });
        }}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
      >
        <option value="updatedAt:desc">Recently updated</option>
        <option value="createdAt:desc">Recently created</option>
        <option value="name:asc">Name (A-Z)</option>
        <option value="name:desc">Name (Z-A)</option>
      </select>

      <Button
        type="button"
        variant={options.favorite ? "default" : "outline"}
        size="sm"
        onClick={() => onChange({ ...options, favorite: !options.favorite })}
      >
        <Star className="h-4 w-4" />
        Favorites
      </Button>
    </div>
  );
}
