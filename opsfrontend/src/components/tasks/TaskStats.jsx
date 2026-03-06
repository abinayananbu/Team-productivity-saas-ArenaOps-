export default function TaskStats({ tasks }) {
  return (
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
  );
}
