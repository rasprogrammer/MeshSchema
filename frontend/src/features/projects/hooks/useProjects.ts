"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectApi } from "../services/project.service";
import { CreateProjectPayload, UpdateProjectPayload } from "../types";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/apiClient";

const PROJECTS_KEY = ["projects"] as const;

export function useProjectsList() {
  return useQuery({ queryKey: PROJECTS_KEY, queryFn: projectApi.list });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => projectApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => projectApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
      toast({ title: "Project created" });
    },
    onError: (error) => toast({ title: "Could not create project", description: getErrorMessage(error), variant: "destructive" }),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProjectPayload }) => projectApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
      toast({ title: "Project renamed" });
    },
    onError: (error) => toast({ title: "Could not rename project", description: getErrorMessage(error), variant: "destructive" }),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => projectApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
      toast({ title: "Project deleted" });
    },
    onError: (error) => toast({ title: "Could not delete project", description: getErrorMessage(error), variant: "destructive" }),
  });
}
