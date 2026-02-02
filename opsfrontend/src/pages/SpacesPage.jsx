import WorkspaceLayout from "../layouts/WorkspaceLayout";
import { Plus, Users, Folder } from "lucide-react";

export default function SpacesPage() {
  return (
    <WorkspaceLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Spaces
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Organize your projects into spaces
            </p>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 text-sm
            bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
            <Plus size={16} />
            Create Space
          </button>
        </div>

        {/* Spaces Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <SpaceCard
            name="Product"
            projects={5}
            members={4}
          />
          <SpaceCard
            name="Engineering"
            projects={8}
            members={6}
          />
          <SpaceCard
            name="Marketing"
            projects={3}
            members={3}
          />
        </div>
      </div>
    </WorkspaceLayout>
  );
}

/* Reusable Space Card */
function SpaceCard({ name, projects, members }) {
  return (
    <div className="bg-white dark:bg-[#1e1f21]
      border border-gray-200 dark:border-gray-800
      rounded-xl p-5 hover:shadow-md transition">

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {name}
        </h3>
        <Folder className="text-indigo-500" size={20} />
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Folder size={16} />
          {projects} Projects
        </div>

        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Users size={16} />
          {members} Members
        </div>
      </div>
    </div>
  );
}
