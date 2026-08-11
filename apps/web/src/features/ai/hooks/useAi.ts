"use client";

import { useMutation } from "@tanstack/react-query";
import { aiApi } from "../services/ai.service";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/apiClient";

export function useGenerateSchema() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: (prompt: string) => aiApi.generate(prompt),
    onError: (error) => toast({ title: "Generation failed", description: getErrorMessage(error), variant: "destructive" }),
  });
}

export function useImproveSchema() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ dbml, instructions }: { dbml: string; instructions?: string }) => aiApi.improve(dbml, instructions),
    onError: (error) => toast({ title: "Improvement failed", description: getErrorMessage(error), variant: "destructive" }),
  });
}

export function useExplainSchema() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: (dbml: string) => aiApi.explain(dbml),
    onError: (error) => toast({ title: "Explanation failed", description: getErrorMessage(error), variant: "destructive" }),
  });
}

export function useDetectIssues() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: (dbml: string) => aiApi.detectIssues(dbml),
    onError: (error) => toast({ title: "Issue detection failed", description: getErrorMessage(error), variant: "destructive" }),
  });
}
