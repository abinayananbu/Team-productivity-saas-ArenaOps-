import { Clock, User, ClipboardList } from "lucide-react";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

export default function TaskList({ tasks, onTaskClick }) {
  return (
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
        <>
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => onTaskClick(task.id)}
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
        ))}</>
      )}
    </div>
  );
}
