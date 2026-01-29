import { useState } from "react";
import {
  Home,
  Layers,
  CheckSquare,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Home", icon: Home, path: "/dashboard" },
    { name: "Spaces", icon: Layers },
    { name: "Tasks", icon: CheckSquare },
    { name: "Docs", icon: FileText },
  ];

  return (
    <aside
      className={`
        h-[calc(100vh-56px)]
        ${collapsed ? "w-16" : "w-60"}
        transition-all duration-200 ease-in-out
        bg-gray-50 dark:bg-[#1a1b1e]
        border-r border-gray-200 dark:border-gray-800
        flex flex-col
      `}
    >
      {/* Collapse Toggle */}
      <div className="flex justify-end p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded
            hover:bg-gray-200 dark:hover:bg-gray-800
            text-gray-600 dark:text-gray-300"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-2 space-y-1">
        {menuItems.map((item) => {
          const active = item.path === location.pathname;

          return (
            <button
              key={item.name}
              onClick={() => item.path && navigate(item.path)}
              className={`
                w-full flex items-center
                ${collapsed ? "justify-center" : "gap-3 px-3"}
                py-2 rounded-md text-sm font-medium
                transition-colors
                ${
                  active
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                }
              `}
            >
              <item.icon size={18} />
              {!collapsed && <span>{item.name}</span>}
            </button>
          );
        })}
      </nav>

      {/* Spaces */}
      {!collapsed && (
        <div className="px-4 mt-6">
          <p className="text-xs text-gray-400 mb-2 tracking-wide">
            SPACES
          </p>

          <div className="space-y-1 text-sm">
            {["Product", "Marketing"].map((space) => (
              <div
                key={space}
                className="px-2 py-1 rounded cursor-pointer
                  text-gray-700 dark:text-gray-300
                  hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                📁 {space}
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
