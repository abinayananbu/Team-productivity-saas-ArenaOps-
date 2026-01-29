import WorkspaceLayout from "../layouts/WorkspaceLayout";

export default function DashBoardPage() {
  return (
    <WorkspaceLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Overview of your workspace
        </p>
      </div>
    </WorkspaceLayout>
  );
}
