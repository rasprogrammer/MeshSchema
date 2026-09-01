import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RequireAuth } from "@/shared/components/RequireAuth";
import { Topbar } from "@/shared/components/Topbar";
import { Button } from "@/shared/ui/button";
import { TrashList } from "@/features/projects/components/TrashList";

export default function TrashPage() {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <Topbar />
        <main className="mx-auto max-w-6xl px-6 py-10">
          <div className="mb-8 flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold">Trash</h1>
              <p className="text-sm text-muted-foreground">Restore a project or delete it permanently.</p>
            </div>
          </div>
          <TrashList />
        </main>
      </div>
    </RequireAuth>
  );
}
