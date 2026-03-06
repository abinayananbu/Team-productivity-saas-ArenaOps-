import { Trash2, Save, SaveOff, X } from "lucide-react";
import { useState } from "react";

export default function TaskDetailModal({ taskDetail, setTaskDetail, onClose, onUpdate, onDelete, updatingTask, deletingTask, members }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        aria-hidden="true"
        onClick={onClose}
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
                onClick={onClose}
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

              {/* Status */}
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

              {/* Priority */}
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
              onClick={()=>setShowDeleteConfirm(true)}
              disabled={deletingTask}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 font-medium rounded-xl hover:bg-red-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={18} />
              Delete
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={updatingTask}
                className="px-6 py-2.5 flex gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
              >
                <SaveOff size={15} /> Cancel
              </button>
              <button
                onClick={onUpdate}
                disabled={updatingTask}
                className="px-6 py-2.5 flex gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
              >
                <Save size={15} /> Save
              </button>
            </div>
          </div>
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
                      onClick={() => { setShowDeleteConfirm(false); onDelete(); }}
                      className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </>
  );
}
