"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { schemaApi } from "../services/schema.service";

export function useSchema(projectId: string) {
  return useQuery({
    queryKey: ["schema", projectId],
    queryFn: () => schemaApi.get(projectId),
    enabled: Boolean(projectId),
  });
}

export function useInvalidateSchema(projectId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["schema", projectId] });
}
