import {
  Clock,
  User,
  ClipboardList,
  Trash2,
  Save,
  SaveOff,
  X,
  Plus,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import WorkspaceLayout from "../layouts/WorkspaceLayout";
import {
  getProjectByIdApi,
  getTasksApi,
  createTaskApi,
  updateTaskApi,
  deleteTaskApi,
  getTaskByIdApi,
  orgMembersApi,
} from "../services/api";

export default function ProjectDetailsPage() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskDetail, setTaskDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openTaskDetail, setOpenTaskDetail] = useState(false);
  const [openTask, setOpenTask] = useState(false);
  const [members, setMembers] = useState([]);
  const [creatingTask, setCreatingTask] = useState(false);
  const [updatingTask, setUpdatingTask] = useState(false);
  const [deletingTask, setDeletingTask] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    status: "TODO",
    priority: "MEDIUM",
    description: "",
    deadline: "",
    assigned_to: "",
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectRes, taskRes, membersRes] = await Promise.all([
        getProjectByIdApi(id),
        getTasksApi(id),
        orgMembersApi(),
      ]);
      setProject(projectRes.data);
      setTasks(Array.isArray(taskRes.data) ? taskRes.data : []);
      setMembers(Array.isArray(membersRes.data) ? membersRes.data : []);
    } catch (err) {
      console.error("Load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      setCreatingTask(true);
      const payload = {
        ...newTask,
        project: id,
        title: newTask.title.trim(),
        assigned_to: newTask.assigned_to || null,
      };

      const res = await createTaskApi(payload);

      // Optimistic update
      setTasks((prev) => [res.data, ...prev]);

      setOpenTask(false);
      setNewTask({
        title: "",
        status: "TODO",
        priority: "MEDIUM",
        description: "",
        deadline: "",
        assigned_to: "",
      });
    } catch (err) {
      console.error("Cannot create task:", err);
    } finally {
      setCreatingTask(false);
    }
  };

  const showTaskDetail = async (taskId) => {
    try {
      const res = await getTaskByIdApi(taskId);
      setTaskDetail(res.data);
      setOpenTaskDetail(true);
    } catch (err) {
      console.error("Task detail fetch failed:", err);
    }
  };

  const updateTask = async () => {
    if (!taskDetail?.title.trim()) return;

    try {
      setUpdatingTask(true);
      const payload = {
        title: taskDetail.title.trim(),
        status: taskDetail.status,
        priority: taskDetail.priority,
        description: taskDetail.description || "",
        deadline: taskDetail.deadline || null,
        assigned_to: taskDetail.assigned_to || null,
      };

      await updateTaskApi(taskDetail.id, payload);

      setTasks((prev) =>
        prev.map((t) => (t.id === taskDetail.id ? { ...t, ...payload } : t))
      );

      setOpenTaskDetail(false);
      loadData();
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setUpdatingTask(false);
    }
  };

  const deleteTask = async () => {
    if (!confirm("Are you sure you want to delete this task? This action cannot be undone.")) return;

    try {
      setDeletingTask(true);
      await deleteTaskApi(taskDetail.id);

      setTasks((prev) => prev.filter((t) => t.id !== taskDetail.id));
      setOpenTaskDetail(false);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingTask(false);
    }
  };

  if (loading) {
    return (
      <WorkspaceLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </WorkspaceLayout>
    );
  }

  if (!project) {
    return (
      <WorkspaceLayout>
        <div className="p-6 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl py-8">
          Project not found
        </div>
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout>
      <div className="p-6 space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex gap-3 items-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {project.name}
              </h1>
              {project.description && (
                <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                  {project.description}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {tasks.length} tasks • Manage your project workflow
            </p>
          </div>
          <button
            onClick={() => setOpenTask(true)}
            disabled={creatingTask}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
          >
            <Plus size={18} />
            Add Task
          </button>
        </div>

        {/* TASK STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#1e1f21] p-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="text-2xl font-bold text-indigo-600">{tasks.filter(t => t.status === 'TODO').length}</div>
            <div className="text-sm text-gray-500">To Do</div>
          </div>
          <div className="bg-white dark:bg-[#1e1f21] p-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="text-2xl font-bold text-yellow-600">{tasks.filter(t => t.status === 'IN_PROGRESS').length}</div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
          <div className="bg-white dark:bg-[#1e1f21] p-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="text-2xl font-bold text-green-600">{tasks.filter(t => t.status === 'DONE').length}</div>
            <div className="text-sm text-gray-500">Done</div>
          </div>
        </div>

        {/* TASK LIST */}
        <div className="bg-white dark:bg-[#1e1f21] rounded-xl border dark:border-gray-800 overflow-hidden shadow-sm">
          {tasks.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center gap-4">
              <ClipboardList size={48} className="opacity-40" />
              <div>
                <p className="text-lg font-medium">No tasks yet</p>
                <p className="text-sm mt-1">Get started by creating your first task</p>
              </div>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => showTaskDetail(task.id)}
                className="cursor-pointer flex justify-between items-center px-6 py-5 border-b last:border-b-0 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#2a2b2e] transition-all duration-200 group"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate pr-4 group-hover:text-indigo-600 transition-colors">
                    {task.title || "Untitled Task"}
                  </p>
                  {task.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                      {task.description}
                    </p>
                  )}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm ml-4 flex-shrink-0">
                  <div className="flex items-center gap-1 text-gray-500">
                    <User size={14} />
                    <span className="truncate max-w-[120px]">
                      {task.assigned_to_email?.split('@')[0] || "Unassigned"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock size={14} />
                    <span>{task.deadline ? new Date(task.deadline).toLocaleDateString() : "No due date"}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Task MODAL */}
        {openTask && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpenTask(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="bg-white dark:bg-[#1e1f21] w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-6 animate-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Task</h2>
                
                <div className="space-y-4">
                  <input
                    placeholder="Task title *"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    disabled={creatingTask}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={newTask.status}
                      onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                      className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500"
                      disabled={creatingTask}
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500"
                      disabled={creatingTask}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>

                  <select
                    value={newTask.assigned_to}
                    onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500"
                    disabled={creatingTask}
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.email}
                      </option>
                    ))}
                  </select>

                  <input
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500"
                    disabled={creatingTask}
                  />

                  <textarea
                    placeholder="Description (optional)"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500 resize-vertical"
                    disabled={creatingTask}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpenTask(false)}
                    disabled={creatingTask}
                    className="px-6 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={createTask}
                    disabled={!newTask.title.trim() || creatingTask}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {creatingTask ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      "Create Task"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TASK DETAIL MODAL */}
        {openTaskDetail && taskDetail && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
              aria-hidden="true"
              onClick={() => setOpenTaskDetail(false)}
            />
           
            {/* Modal */}
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 animate-in slide-in-from-bottom-4 duration-300 fade-in zoom-in"
              role="dialog"
              aria-modal="true"
              aria-labelledby="task-title"
            >
              <div
                className="bg-white dark:bg-[#1e1f21] w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-[#1e1f21]/80 backdrop-blur-sm z-10">
                  <div className="flex items-center justify-between mb-2">
                    <h2 id="task-title" className="text-2xl font-bold text-gray-900 dark:text-white">
                      Task Details
                    </h2>
                    <button
                      onClick={() => setOpenTaskDetail(false)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      aria-label="Close modal"
                    >
                      <X size={20} className="text-gray-500" />
                    </button>
                  </div>
                 
                  {/* Task Title */}
                  <input
                    value={taskDetail.title}
                    onChange={(e) => setTaskDetail({ ...taskDetail, title: e.target.value })}
                    className="w-full text-2xl font-semibold bg-transparent outline-none text-gray-900 dark:text-white border-none focus:ring-2 focus:ring-indigo-500 rounded-lg px-2 py-1"
                    placeholder="Enter task title"
                    autoFocus
                  />
                </div>


                {/* Form Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                  {/* Grid Layout for Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   
                    {/* Status & Priority */}
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </label>
                      <select
                        value={taskDetail.status}
                        onChange={(e) => setTaskDetail({ ...taskDetail, status: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:shadow-sm"
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    </div>


                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Priority
                      </label>
                      <select
                        value={taskDetail.priority}
                        onChange={(e) => setTaskDetail({ ...taskDetail, priority: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:shadow-sm"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>
                  </div>


                  {/* Assignee */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Assignee
                    </label>
                    <select
                      value={
                        typeof taskDetail.assigned_to === "object"
                          ? taskDetail.assigned_to?.id
                          : taskDetail.assigned_to || ""
                      }
                      onChange={(e) => setTaskDetail({ ...taskDetail, assigned_to: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:shadow-sm"
                    >
                      <option value="">Unassigned</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.email}
                        </option>
                      ))}
                    </select>
                  </div>


                  {/* Deadline */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={taskDetail.deadline || ""}
                      onChange={(e) => setTaskDetail({ ...taskDetail, deadline: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:shadow-sm"
                    />
                  </div>


                  {/* Description */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <textarea
                      value={taskDetail.description || ""}
                      onChange={(e) => setTaskDetail({ ...taskDetail, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:shadow-sm resize-vertical min-h-[100px]"
                      placeholder="Add detailed description..."
                    />
                  </div>
                </div>


                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-800 gap-3 bg-white/80 dark:bg-[#1e1f21]/80 backdrop-blur-sm sticky bottom-0">
                  <button
                    onClick={deleteTask}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 font-medium rounded-xl hover:bg-red-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>


                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setOpenTaskDetail(false)}
                      className="px-6 py-2.5 flex gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
                    >
                     <SaveOff size={15} /> Cancel
                    </button>
                    <button
                      onClick={updateTask}
                      className="px-6 py-2.5 flex gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
                    >
                     <Save size={15} /> Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </WorkspaceLayout>
  );
}

// StatusBadge and PriorityBadge components remain the same
function StatusBadge({ status }) {
  const styles = {
    TODO: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    IN_PROGRESS: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    DONE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  };

  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${styles[status]}`}>
      {status?.replace("_", " ")}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const styles = {
    LOW: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    MEDIUM: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    HIGH: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${styles[priority]}`}>
      {priority}
    </span>
  );
}
