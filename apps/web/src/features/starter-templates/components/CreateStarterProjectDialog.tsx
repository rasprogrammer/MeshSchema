"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/shared/ui/dialog";
import { StarterTemplate } from "../types";
import TemplateImage from "./TemplateImage";
import { useCreateStarterTemplate } from "../hooks/useStarterTemplates";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Project } from "@/features/projects/types";


interface CreateStarterProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: StarterTemplate | null;
}

export default function CreateStarterProjectDialog({
  open,
  onOpenChange,
  template,
}: CreateStarterProjectDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createProject = useCreateStarterTemplate();
  
  const { toast } = useToast();
  const router = useRouter();

  
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!template || !template?.id) {
      toast({ title: "Please select valid template", variant: "destructive"});
      return;
    }
    createProject.mutate(
      {templateId: template.id, name, description: description || undefined },
      {
        onSuccess: (data: Project) => {
            router.push(`/projects/${data.id}`);
        }
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start With {template?.name} Template</DialogTitle>
          <DialogDescription>Give your schema a name. You can rename it later.</DialogDescription>
          {template && <TemplateImage template={template} />}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Name</Label>
            <Input id="project-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="E-commerce platform" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">Description (optional)</Label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this schema for?"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending ? "Creating…" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
