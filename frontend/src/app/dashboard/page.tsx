import { ProjectList } from "@/features/projects/components/ProjectList";
import { CreateProjectDialog } from "@/features/projects/components/CreateProjectDialog";
import { RequireAuth } from "@/shared/components/RequireAuth";
import { Topbar } from "@/shared/components/Topbar";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <Topbar />
        <main className="mx-auto max-w-6xl px-6 py-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Projects</h1>
              <p className="text-sm text-muted-foreground">Every schema you&apos;re designing, in one place.</p>
            </div>
            <CreateProjectDialog />
          </div>
          <ProjectList />
        </main>
      </div>
    </RequireAuth>
  );
}
