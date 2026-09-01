"use client";

import { FormEvent, useState } from "react";
import { Copy, Trash2, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCreateInvite, useInvites, useRevokeInvite } from "../../hooks/useInvites";

interface Props {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteDialog({ projectId, open, onOpenChange }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"EDITOR" | "VIEWER">("VIEWER");

  const { data: invites, isLoading } = useInvites(projectId);
  const createInvite = useCreateInvite(projectId);
  const revokeInvite = useRevokeInvite(projectId);
  const { toast } = useToast();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createInvite.mutate({ email, role }, { onSuccess: () => setEmail("") });
  }

  function copyLink(token: string) {
    const link = `${window.location.origin}/invites/accept/${token}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Invite link copied" });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite collaborators</DialogTitle>
          <DialogDescription>Share view or edit access to this project by email.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1 space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@company.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value as "EDITOR" | "VIEWER")}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="VIEWER">Viewer</option>
              <option value="EDITOR">Editor</option>
            </select>
          </div>
          <Button type="submit" size="icon" disabled={createInvite.isPending} aria-label="Send invite">
            <UserPlus className="h-4 w-4" />
          </Button>
        </form>

        <div className="space-y-2">
          <p className="text-sm font-medium">Pending invites</p>
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!isLoading && (invites?.length ?? 0) === 0 && (
            <p className="text-sm text-muted-foreground">No pending invites.</p>
          )}
          {invites?.map((invite) => (
            <div key={invite.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              <div>
                <p>{invite.email}</p>
                <p className="text-xs text-muted-foreground">{invite.role.toLowerCase()}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyLink(invite.token)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => revokeInvite.mutate(invite.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
