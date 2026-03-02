import {
  Clock,
  User,
  ClipboardList,
  Trash2,
  Save,
  SaveOff,
  X,
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
} from "../services/api";

export default function ProjectDetailsPage() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskDetail, setTaskDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openTaskDetail, setOpenTaskDetail] = useState(false);
  const [ openTask, setOpenTask] = useState(false);

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

  const createTask = async () => {
  try {
    const payload = {
      ...newTask,
      project: id,
      assigned_to: newTask.assigned_to || null,
    };

    const res = await createTaskApi(payload);

    // Add new task instantly
    setTasks((prev) => [...prev, res.data]);

    setOpenTask(false);

    loadData();

    // Reset form
    setNewTask({
      title: "",
      status: "TODO",
      priority: "MEDIUM",
      description: "",
      deadline: "",
      assigned_to: "",
    });
  } catch (err) {
    console.log("Cannot create task:", err);
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
    try {
      const payload = {
        title: taskDetail.title,
        status: taskDetail.status,
        priority: taskDetail.priority,
        description: taskDetail.description,
        deadline: taskDetail.deadline,
        assigned_to:
          typeof taskDetail.assigned_to === "object"
            ? taskDetail.assigned_to?.id
            : taskDetail.assigned_to,
      };

      await updateTaskApi(taskDetail.id, payload);

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskDetail.id ? { ...t, ...payload } : t
        )
      );

      setOpenTaskDetail(false);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const deleteTask = async () => {
    try {
      await deleteTaskApi(taskDetail.id);

      setTasks((prev) =>
        prev.filter((t) => t.id !== taskDetail.id)
      );

      setOpenTaskDetail(false);
    } catch (err) {
      console.error("Delete failed:", err);
    }
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
              {project.name?.toUpperCase()}
            </h1> 
            <span className="text-sm text-gray-400 capitalize"> 
              ( {project.description || "NO DESCRIPTION"} )
            </span> 
          </div>
            <p className="text-sm text-gray-500 mt-1"> 
              Manage tasks & assignments 
            </p>
        </div>
        <button onClick={() => setOpenTask(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg" >
            Add Task 
        </button> 
      </div>

        {/* TASK LIST */}
        <div className="bg-white dark:bg-[#1e1f21] rounded-xl border dark:border-gray-800 overflow-hidden">
          {tasks.length === 0 ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-3">
              <ClipboardList size={28} />
              No tasks yet.
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => showTaskDetail(task.id)}
                className="cursor-pointer flex justify-between items-center px-6 py-4 border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#2a2b2e] transition"
              >
                <div>
                  <p className="font-medium ">{task.title? task.title?.charAt(0).toUpperCase() + task.title.slice(1):""}</p>
                  <div className="flex gap-2 mt-1">
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

        {/* Create Task MODAL */}
        {openTask && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpenTask(false)}
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <div
                className="bg-white dark:bg-[#1e1f21] w-full max-w-xl rounded-2xl shadow-2xl p-6 space-y-5"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-semibold">Create New Task</h2>

                {/* Title */}
                <input
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border dark:bg-gray-800"
                />

                {/* Status */}
                <select
                  value={newTask.status}
                  onChange={(e) =>
                    setNewTask({ ...newTask, status: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border dark:bg-gray-800"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>

                {/* Priority */}
                <select
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({ ...newTask, priority: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border dark:bg-gray-800"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>

                {/* Assignee */}
                <select
                  value={newTask.assigned_to}
                  onChange={(e) =>
                    setNewTask({ ...newTask, assigned_to: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border dark:bg-gray-800"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.email}
                    </option>
                  ))}
                </select>

                {/* Deadline */}
                <input
                  type="date"
                  value={newTask.deadline}
                  onChange={(e) =>
                    setNewTask({ ...newTask, deadline: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border dark:bg-gray-800"
                />

                {/* Description */}
                <textarea
                  placeholder="Description..."
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border dark:bg-gray-800"
                />

                {/* Footer */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setOpenTask(false)}
                    className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createTask}
                    disabled={!newTask.title.trim()}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                  >
                    Create
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

function StatusBadge({ status }) {
  const styles = {
    TODO: "bg-gray-200 text-gray-700",
    IN_PROGRESS: "bg-yellow-200 text-yellow-800",
    DONE: "bg-green-200 text-green-800",
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${styles[status]}`}>
      {status?.replace("_", " ")}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const styles = {
    LOW: "bg-blue-200 text-blue-800",
    MEDIUM: "bg-purple-200 text-purple-800",
    HIGH: "bg-red-200 text-red-800",
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${styles[priority]}`}>
      {priority}
    </span>
  );
}