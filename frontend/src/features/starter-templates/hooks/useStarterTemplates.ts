import { CreateProjectPayload, Project } from "@/features/projects/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { StarterTemplateApi } from "../services/starterTemplate.service";
import { useToast } from "@/hooks/use-toast";
import { PROJECTS_KEY } from "@/features/projects/hooks/useProjects";

const STARTER_TEMPLATE_KEY = ["starter_templates"] as const;

export function useStarterTemplateList() {
  return useQuery({ queryKey: STARTER_TEMPLATE_KEY, queryFn: StarterTemplateApi.list });
}


export const useCreateStarterTemplate = (options?: { onSuccess?: (data: Project) => void }) => {

    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (payload: CreateProjectPayload) => StarterTemplateApi.create(payload),
        onSuccess: (data) => {
            options?.onSuccess?.(data);
            toast({ title : "Create project created with starter template"})
            queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
        }, 
        onError: (error) => {

        }
    });
}