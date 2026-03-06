import { Plus } from "lucide-react";
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
import TaskStats from "../components/tasks/TaskStats";
import TaskList from "../components/tasks/TaskList";
import CreateTaskModal from "../components/tasks/CreateTaskModal";
import TaskDetailModal from "../components/tasks/TaskDetailModal";

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

      loadData();

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
          <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-indigo-500"></div>
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
        <TaskStats tasks={tasks} />

        {/* TASK LIST */}
        <TaskList tasks={tasks} onTaskClick={showTaskDetail} />

        {/* CREATE TASK MODAL */}
        {openTask && (
          <CreateTaskModal
            newTask={newTask}
            setNewTask={setNewTask}
            onClose={() => setOpenTask(false)}
            onSubmit={createTask}
            creatingTask={creatingTask}
            members={members}
          />
        )}

        {/* TASK DETAIL MODAL */}
        {openTaskDetail && taskDetail && (
          <TaskDetailModal
            taskDetail={taskDetail}
            setTaskDetail={setTaskDetail}
            onClose={() => setOpenTaskDetail(false)}
            onUpdate={updateTask}
            onDelete={deleteTask}
            updatingTask={updatingTask}
            deletingTask={deletingTask}
            members={members}
          />
        )}
      </div>
    </WorkspaceLayout>
  );
}
