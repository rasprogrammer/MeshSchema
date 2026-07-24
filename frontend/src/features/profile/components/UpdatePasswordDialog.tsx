import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";

import { PasswordInput } from "./PasswordInput";
import { FormEvent, useState } from "react";
import { usePasswordUpdate } from "../hooks/useProfile";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdatePasswordDialog({ open, onOpenChange }: Props) {

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const updatePassword = usePasswordUpdate();

    const handleSubmit = (e: FormEvent) => {
      e.preventDefault();
      console.log({ currentPassword, newPassword, confirmPassword});
      updatePassword.mutate(
        { currentPassword, newPassword, confirmPassword },
        { onSuccess: () => onOpenChange(false)}
      );
    }

    return (
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Update Password
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Current Password</Label>

              <PasswordInput
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>New Password</Label>

              <PasswordInput 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Confirm Password</Label>

              <PasswordInput 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              <Button type="submit">
                Update Password
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
}