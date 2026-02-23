import { Plus, Folder } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import WorkspaceLayout from "../layouts/WorkspaceLayout";
import { createProjectApi, showProjectApi } from "../services/api";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch projects properly
  const fetchProjects = async () => {
    try {
      const res = await showProjectApi();
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // ✅ Create project properly
  const createProject = async (e) => {
    e.preventDefault();

    if (!name.trim()) return;

    try {
      setLoading(true);

      await createProjectApi({
        name,
        description: desc,
      });

      await fetchProjects(); // refresh list

      setName("");
      setDesc("");
      setOpen(false);

    } catch (err) {
      console.error("Project failed:", err);
    } finally {
      setLoading(false);
    }
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

        {/* SEARCH + BUTTON */}
        <div className="flex gap-3">
          <input
            placeholder="Search Project"
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-[#2c2d30] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition"
          >
            <Plus size={16} />
            New Project
          </button>
        </div>

        {/* MODAL */}
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <form
              onSubmit={createProject}
              className="bg-white dark:bg-[#1e1f21] w-full max-w-md rounded-xl p-6 space-y-4 shadow-xl"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Create Project
              </h2>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-[#2c2d30] border border-gray-200 dark:border-gray-700"
              />

              <input
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Enter project description"
                className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-[#2c2d30] border border-gray-200 dark:border-gray-700"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PROJECT LIST */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 text-gray-500 dark:text-gray-400">
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
                className="cursor-pointer bg-white dark:bg-[#1e1f21] border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-md hover:border-indigo-500 transition"
              >
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {p.name}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {p.tasks?.length || 0} tasks • {p.members?.length || 0} members
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}