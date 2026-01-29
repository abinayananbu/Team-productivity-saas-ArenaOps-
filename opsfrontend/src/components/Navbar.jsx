import { Bell, Search, Sun, Moon, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useDarkMode } from "../hooks/useDarkMode";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useDarkMode();
  const dropdownRef = useRef(null); // Ref for the dropdown container

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="h-14 px-4 flex items-center justify-between
      bg-white dark:bg-[#1e1f21]
      border-b dark:border-gray-800 relative">

      {/* Workspace */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 text-sm font-medium
          text-gray-700 dark:text-gray-200
          hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded"
        >
          ArenaOps
          <ChevronDown size={16} />
        </button>

        {open && (
          <div className="absolute top-full mt-2 w-56 bg-white dark:bg-[#2c2d30] border dark:border-gray-700 rounded-lg shadow-lg z-50">
            <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
              Workspaces
            </div>

            <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              ArenaOps
            </button>

            <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              Client Workspace
            </button>

            <div className="border-t my-1 border-gray-200 dark:border-gray-700" />

            <button className="w-full px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-700/20 rounded">
              + Create workspace
            </button>
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
          <Search size={18} className="text-gray-600 dark:text-gray-300" />
        </button>

        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
          <Bell size={18} className="text-gray-600 dark:text-gray-300" />
        </button>

        {/* Dark Toggle */}
        <button
          onClick={() => setDark(!dark)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded dark:text-white"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Avatar */}
        <img
          src="https://i.pravatar.cc/40"
          className="h-8 w-8 rounded-full"
        />
      </div>
    </header>
  );
}
