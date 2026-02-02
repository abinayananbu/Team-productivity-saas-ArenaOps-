import { Plus, Folder } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WorkspaceLayout from "../layouts/WorkspaceLayout";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");

  const createProject = () => {
    if (!name.trim()) return;

    const project = {
      id: Date.now(),
      name,
      members: [
        { id: 1, name: "Anbu" },
        { id: 2, name: "Teammate" },
      ],
      tasks: [],
    };

    setProjects((prev) => [...prev, project]);
    setName("");
  };

  return (
    <WorkspaceLayout>
      <div className="p-6 space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Projects
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create and manage your workspace projects
          </p>
        </div>

        {/* CREATE PROJECT */}
        <div className="bg-white dark:bg-[#1e1f21]
          border border-gray-200 dark:border-gray-800
          rounded-xl p-4 flex gap-3"
        >
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createProject()}
            placeholder="Enter project name"
            className="flex-1 px-3 py-2 text-sm rounded-lg
              bg-gray-50 dark:bg-[#2c2d30]
              border border-gray-200 dark:border-gray-700
              text-gray-800 dark:text-gray-200
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            onClick={createProject}
            className="flex items-center gap-2 px-4 py-2
              bg-indigo-600 hover:bg-indigo-700
              text-white text-sm rounded-lg transition"
          >
            <Plus size={16} />
            Create
          </button>
        </div>

        {/* PROJECT LIST */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center
            text-center py-16 text-gray-500 dark:text-gray-400"
          >
            <Folder size={40} className="mb-4 opacity-60" />
            <p className="text-sm">
              No projects yet. Create your first project to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <div
                key={p.id}
                onClick={() =>  
                  navigate(`/projectdetail/${p.id}`, { state: p })
                }
                className="cursor-pointer
                  bg-white dark:bg-[#1e1f21]
                  border border-gray-200 dark:border-gray-800
                  rounded-xl p-5
                  hover:shadow-md hover:border-indigo-500
                  transition"
              >
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {p.name}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {p.tasks.length} tasks • {p.members.length} members
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </WorkspaceLayout>
  );
}
