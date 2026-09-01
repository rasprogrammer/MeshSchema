"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inviteApi } from "../services/invite.service";
import { CreateInvitePayload } from "../types";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/apiClient";

export function useInvites(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId, "invites"],
    queryFn: () => inviteApi.list(projectId),
    enabled: Boolean(projectId),
  });
}

export function useCreateInvite(projectId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateInvitePayload) => inviteApi.create(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "invites"] });
      toast({ title: "Invite created" });
    },
    onError: (error) => toast({ title: "Could not create invite", description: getErrorMessage(error), variant: "destructive" }),
  });
}

export function useRevokeInvite(projectId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (inviteId: string) => inviteApi.revoke(projectId, inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "invites"] });
      toast({ title: "Invite revoked" });
    },
    onError: (error) => toast({ title: "Could not revoke invite", description: getErrorMessage(error), variant: "destructive" }),
  });
}
