"use client";

import { useState, FormEvent } from "react";
import { Eye, EyeOff, Plus, SwitchCamera, ToggleLeft } from "lucide-react";
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
import { useCreateProject } from "../../hooks/useProjects";
import { Switch } from "@/shared/ui/switch";

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [checked, setChecked] = useState(false);
  const [isViewPassword, setIsViewPassword] = useState(false);
  const [password, setPassword] = useState("");
  const createProject = useCreateProject();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createProject.mutate(
      {
        name,
        description: description || undefined,
        isPrivate: checked,
        password: checked ? password : undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setName("");
          setDescription("");
          setChecked(false);
          setPassword("");
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new project</DialogTitle>
          <DialogDescription>Give your schema a name. You can rename it later.</DialogDescription>
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
          {/* add here private switch toggle if private show input for password, use shadcn for component switch toggle */}
          <div className="space-y-2">
            <Label htmlFor="project-private">Visibility</Label>
            <div className="flex items-center space-x-2">
              <Switch id="project-private" checked={checked} onCheckedChange={setChecked} />
              <span>{checked ? "Private" : "Public"}</span>
            </div>
          </div>
          {checked && (
            <div className="space-y-2">
              <Label htmlFor="project-password">Password</Label>
              <div className="relative">
              <Input
                id="project-password"
                type={isViewPassword ? "text" : "password"}
                required={checked}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a password"
              />
              {isViewPassword ? (
                  <Eye
                    className="absolute right-4 top-2 z-10 cursor-pointer text-gray-500"
                    onClick={() => {
                      setIsViewPassword(!isViewPassword), console.log(isViewPassword)
                    }}
                  />
                ) : (
                  <EyeOff
                    className="absolute right-4 top-2 z-10 cursor-pointer text-gray-500"
                    onClick={() => setIsViewPassword(!isViewPassword)}
                  />
                )}
              </div>
            </div>
          )}
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
