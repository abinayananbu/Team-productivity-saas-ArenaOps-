import { Plus, Folder, Trash2, Search,CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import WorkspaceLayout from "../layouts/WorkspaceLayout";
import { createProjectApi, showProjectApi, deleteProjectApi } from "../services/api";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null)
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Fetch projects properly
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await showProjectApi();
      setProjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch projects", err);
      setError("Failed to load project data. Please refresh.")
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Create project 
  const createProject = async (e) => {
    e.preventDefault();

    if (!name.trim()) return;

    try {
      setLoading(true);
      await createProjectApi({
        name: name.trim(),
        description: desc.trim(),
      });

      await fetchProjects(); // refresh list
      setName("");
      setDesc("");
      setOpen(false);
    } catch (err) {
      console.error("Project creation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id) => {
    try {
      setDeletingId(id);
      await deleteProjectApi(id);
      await fetchProjects();
    } catch (err) {
      console.error("Failed to delete project:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <WorkspaceLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{error}</h3>
            <button 
              onClick={fetchProjects}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </WorkspaceLayout>
    );
  }

  if (loading ) {
    return (
      <WorkspaceLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout>
      <div className="p-6 space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Projects
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create and manage your workspace projects ({filteredProjects.length})
          </p>
        </div>

        {/* SEARCH + BUTTON */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-gray-50 dark:bg-[#2c2d30] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => setOpen(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm rounded-lg transition"
          >
            <Plus size={16} />
            New Project
          </button>
        </div>

        {/* MODAL */}
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
            <form
              onSubmit={createProject}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#1e1f21] w-full max-w-md rounded-xl p-6 space-y-4 shadow-2xl mx-4"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Create New Project
              </h2>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Project name"
                className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-[#2c2d30] border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />

              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Project description (optional)"
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-[#2c2d30] border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-vertical"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                >
                  {loading ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PROJECT LIST */}
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 text-gray-500 dark:text-gray-400">
            <Folder size={40} className="mb-4 opacity-60" />
            <p className="text-sm mb-2">
              {searchTerm ? "No projects match your search." : "No projects yet."}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition"
              >
                <Plus size={16} />
                Create your first project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/projectdetail/${p.id}`, { state: p })}
                className="group flex cursor-pointer bg-white dark:bg-[#1e1f21] border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-200 hover:-translate-y-1 overflow-hidden"
              >
                {/* Left Content */}
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-semibold text-lg text-gray-500 dark:text-indigo-400 truncate group-hover:text-indigo-600  transition-colors mb-2">
                    {p.name}
                  </h3>
                  
                  {p.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 capitalize">
                      {p.description}
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-4">
                    <span>{p.task_count || 0} tasks</span>
                    <span>•</span>
                    <span>{p.task_assigned_member_count || 0} members</span>
                  </p>
                </div>

                {/* Delete Button */}
                <div className="flex items-center justify-end ml-4 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); 
                      setShowDeleteConfirm(true)
                      setProjectToDelete(p.id)
                    }}
                    disabled={deletingId === p.id}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-all duration-200 opacity-0 group-hover:opacity-100"
                    title="Delete project"
                  >
                    {deletingId === p.id ? (
                      <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {showDeleteConfirm && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white dark:bg-[#1e1f21] rounded-xl shadow-lg w-full max-w-sm p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Confirm Delete</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                   Are you sure you want to delete this task? 
                  </p>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 text-sm rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { setShowDeleteConfirm(false); deleteProject(projectToDelete); }}
                      className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
      </div>
    </WorkspaceLayout>
  );
}
