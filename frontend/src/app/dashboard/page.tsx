import { ProjectList } from "@/features/projects/components/ProjectList";
import { CreateProjectDialog } from "@/features/projects/components/dialogs/CreateProjectDialog";
import { RequireAuth } from "@/shared/components/RequireAuth";
import { Topbar } from "@/shared/components/Topbar";
import StarterTemplateList from "@/features/starter-templates/components/StarterTemplateList";

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

          <div className="mt-16"></div>

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Choose Your Template</h1>
            </div>
          </div>
          <StarterTemplateList />
        </main>
      </div>
    </RequireAuth>
  );
}
