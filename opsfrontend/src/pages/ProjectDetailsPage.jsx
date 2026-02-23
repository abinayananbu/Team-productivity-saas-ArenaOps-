import {
  Plus,
  Clock,
  User,
  ClipboardList,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import WorkspaceLayout from "../layouts/WorkspaceLayout";
import {
  getProjectByIdApi,
  getTasksApi,
  createTaskApi,
} from "../services/api";

export default function ProjectDetailsPage() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");
  const [status, setStatus] = useState("TODO");
  const [priority, setPriority] = useState("MEDIUM");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [openTask, setOpenTask] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectRes, taskRes] = await Promise.all([
        getProjectByIdApi(id),
        getTasksApi(id),
      ]);
      setProject(projectRes.data);
      setTasks(taskRes.data);
    } catch (err) {
      console.error("Load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!title.trim()) return;

    try {
      setCreating(true);

      await createTaskApi({
        title,
        project: id,
        assigned_to: assignee || null,
        status,
        priority,
        deadline: deadline || null,
        description,
      });

      resetForm();
      loadData();
    } catch (err) {
      console.error("Task creation failed:", err);
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setOpenTask(false);
    setTitle("");
    setAssignee("");
    setStatus("TODO");
    setPriority("MEDIUM");
    setDeadline("");
    setDescription("");
  };

  if (loading) {
    return (
      <WorkspaceLayout>
        <div className="p-6">Loading project...</div>
      </WorkspaceLayout>
    );
  }

  if (!project) {
    return (
      <WorkspaceLayout>
        <div className="p-6 text-red-500">Project not found</div>
      </WorkspaceLayout>
    );
  }

  const members = project.members || [];

  return (
    <WorkspaceLayout>
      <div className="p-6 space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex gap-3 items-center">
              <h1 className="text-2xl font-semibold">
                {project.name}
              </h1>
              <span className="text-sm text-gray-400">
                {project.description?.toUpperCase() || "NO DESCRIPTION"}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Manage tasks & assignments
            </p>
          </div>

          <button
            onClick={() => setOpenTask(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            Add Task
          </button>
        </div>

        {/* MODAL */}
        {openTask && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={resetForm}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#1e1f21] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col"
            >
              {/* TITLE */}
              <div className="p-6 border-b dark:border-gray-800">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full text-2xl font-semibold bg-transparent outline placeholder-gray-400"
                />
              </div>

              {/* BODY */}
              <div className="p-6 space-y-6">

                {/* STATUS + ASSIGNEE */}
                <div className="grid md:grid-cols-2 gap-6">

                  {/* STATUS */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-500">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="px-3 py-2 rounded-lg border dark:bg-[#2c2d30]"
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>

                  {/* ASSIGNEE */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-500">Assignee</label>
                    <select
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                      className="px-3 py-2 rounded-lg border dark:bg-[#2c2d30]"
                    >
                      <option value="">Unassigned</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* PRIORITY PILLS */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-500">Priority</label>
                  <div className="flex gap-2">
                    {["LOW", "MEDIUM", "HIGH"].map((level) => {
                      const styles = {
                        LOW: "bg-blue-100 text-blue-700 border-blue-300",
                        MEDIUM: "bg-purple-100 text-purple-700 border-purple-300",
                        HIGH: "bg-red-100 text-red-700 border-red-300",
                      };

                      const active =
                        priority === level
                          ? `${styles[level]} border`
                          : "bg-gray-100 dark:bg-[#2c2d30] text-gray-600";

                      return (
                        <button
                          type="button"
                          key={level}
                          onClick={() => setPriority(level)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition ${active}`}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* DUE DATE */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-500">Due Date</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="px-3 py-2 rounded-lg border dark:bg-[#2c2d30]"
                  />
                </div>

                {/* DESCRIPTION */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-500">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Add description..."
                    className="px-3 py-2 rounded-lg border dark:bg-[#2c2d30]"
                  />
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-3 p-4 border-t dark:border-gray-800 bg-gray-50 dark:bg-[#18191c] rounded-b-2xl">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700"
                >
                  Cancel
                </button>

                <button
                  disabled={creating}
                  onClick={addTask}
                  className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg"
                >
                  {creating ? "Creating..." : "Create Task"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TASK LIST */}
        <div className="bg-white dark:bg-[#1e1f21] rounded-xl border dark:border-gray-800 overflow-hidden">
          {tasks.length === 0 ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-3">
              <ClipboardList size={28} />
              No tasks yet. Add your first task 🚀
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="group flex justify-between items-center px-6 py-4 border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#2a2b2e] transition"
              >
                <div className="space-y-2">
                  <p className="font-medium group-hover:text-indigo-600 transition">
                    {task.title}
                  </p>

                  <div className="flex gap-2">
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                  </div>
                </div>

                <div className="flex gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    {task.assigned_to?.email || "Unassigned"}
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {task.deadline || "No due date"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </WorkspaceLayout>
  );
}

function StatusBadge({ status }) {
  const styles = {
    TODO: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
    IN_PROGRESS: "bg-yellow-200 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300",
    DONE: "bg-green-200 text-green-800 dark:bg-green-800/30 dark:text-green-300",
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${styles[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const styles = {
    LOW: "bg-blue-200 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300",
    MEDIUM: "bg-purple-200 text-purple-800 dark:bg-purple-800/30 dark:text-purple-300",
    HIGH: "bg-red-200 text-red-800 dark:bg-red-800/30 dark:text-red-300",
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${styles[priority]}`}>
      {priority}
    </span>
  );
}