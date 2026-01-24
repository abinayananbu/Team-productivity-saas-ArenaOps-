import { useState } from "react";
import { ChevronDown, Bell, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="h-14 bg-white border-b flex items-center px-4 justify-between">
      
      {/* LEFT */}
      <div className="flex items-center gap-4">

        {/* Workspace Switcher */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 text-sm font-medium hover:bg-gray-100 px-2 py-1 rounded"
          >
            ArenaOps Workspace
            <ChevronDown size={16} />
          </button>

          {open && (
            <div className="absolute mt-2 w-48 bg-white shadow-lg rounded-md border">
              <div className="px-3 py-2 text-xs text-gray-500">
                Workspaces
              </div>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-100">
                ArenaOps
              </button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-100">
                Client Workspace
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CENTER */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
        <button onClick={() => navigate("/dashboard")} className="hover:text-indigo-600">
          Dashboard
        </button>
        <button className="hover:text-indigo-600">Projects</button>
        <button className="hover:text-indigo-600">Tasks</button>
        <button className="hover:text-indigo-600">Docs</button>
      </nav>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        
        {/* Search */}
        <button className="p-2 hover:bg-gray-100 rounded">
          <Search size={18} />
        </button>

        {/* Notifications */}
        <button className="p-2 hover:bg-gray-100 rounded">
          <Bell size={18} />
        </button>

        {/* User Avatar */}
        <img
          src="https://i.pravatar.cc/40"
          className="h-8 w-8 rounded-full cursor-pointer"
        />
      </div>
    </header>
  );
}
