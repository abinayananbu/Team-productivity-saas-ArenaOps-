import { Plus, CheckCircle, Clock, User, ClipboardList } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import WorkspaceLayout from "../layouts/WorkspaceLayout";

export default function ProjectDetailsPage() {
  const { state: project } = useLocation();

  const [tasks, setTasks] = useState(project?.tasks || []);
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");

  const members = project?.members || [];

  const addTask = () => {
    if (!title.trim() || !assignee) return;

    setTasks([
      ...tasks,
      {
        id: Date.now(),
        title,
        status: "Todo",
        due: "—",
        assignee: members.find((m) => m.id === Number(assignee)),
      },
    ]);

    setTitle("");
    setAssignee("");
  };

  return (
    <WorkspaceLayout>
      <div className="p-6 space-y-6">

        {/* Project Header */}
        <div className="bg-white dark:bg-[#1e1f21] p-6 rounded-xl border">
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage tasks & assignments
          </p>
        </div>

        {/* Add Task */}
        <div className="bg-white dark:bg-[#1e1f21] p-4 rounded-xl border flex flex-col md:flex-row gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="flex-1 px-3 py-2 rounded border dark:bg-[#2c2d30]"
          />

          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="px-3 py-2 rounded border dark:bg-[#2c2d30]"
          >
            <option value="">Assign member</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <button
            onClick={addTask}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
          >
            <Plus size={16} />
            Add
          </button>
        </div>

        {/* Tasks */}
        <div className="bg-white dark:bg-[#1e1f21] rounded-xl border overflow-hidden">
          {tasks.length === 0 ? (
            <div className="p-6 text-center text-gray-500 flex flex-col items-center gap-2">
              <ClipboardList size={24} />
              No tasks yet. Add your first task 🚀
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between px-4 py-3 border-b last:border-b-0 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#2a2b2e] transition"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-gray-400" />
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {task.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    {task.assignee.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {task.due}
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
