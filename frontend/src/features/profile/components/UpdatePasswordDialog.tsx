import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";

import { PasswordInput } from "./PasswordInput";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdatePasswordDialog({
  open,
  onOpenChange,
}: Props) {
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

        <form className="space-y-5">
          <div className="space-y-2">
            <Label>Current Password</Label>

            <PasswordInput />
          </div>

          <div className="space-y-2">
            <Label>New Password</Label>

            <PasswordInput />
          </div>

          <div className="space-y-2">
            <Label>Confirm Password</Label>

            <PasswordInput />
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