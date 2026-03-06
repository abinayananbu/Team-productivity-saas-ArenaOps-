export default function PriorityBadge({ priority }) {
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
