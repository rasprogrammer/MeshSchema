"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectApi } from "../services/project.service";
import { CreateProjectPayload, ProjectListOptions, UpdateProjectPayload } from "../types";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/apiClient";

export const PROJECTS_KEY = ["projects"] as const;
export const TRASH_KEY = ["projects", "trash"] as const;

export function useProjectsList(options: ProjectListOptions = {}) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, options],
    queryFn: () => projectApi.list(options),
  });
}

export function useTrash() {
  return useQuery({ queryKey: TRASH_KEY, queryFn: projectApi.trash });
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
      toast({ title: "Moved to trash" });
    },
    onError: (error) => toast({ title: "Could not delete project", description: getErrorMessage(error), variant: "destructive" }),
  });
}

export function useRestoreProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => projectApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
      queryClient.invalidateQueries({ queryKey: TRASH_KEY });
      toast({ title: "Project restored" });
    },
    onError: (error) => toast({ title: "Could not restore project", description: getErrorMessage(error), variant: "destructive" }),
  });
}

export function usePurgeProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => projectApi.purge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRASH_KEY });
      toast({ title: "Project permanently deleted" });
    },
    onError: (error) => toast({ title: "Could not delete project", description: getErrorMessage(error), variant: "destructive" }),
  });
}

export function useDuplicateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => projectApi.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
      toast({ title: "Project duplicated" });
    },
    onError: (error) => toast({ title: "Could not duplicate project", description: getErrorMessage(error), variant: "destructive" }),
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => projectApi.toggleFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
    onError: (error) => toast({ title: "Could not update favorite", description: getErrorMessage(error), variant: "destructive" }),
  });
}

