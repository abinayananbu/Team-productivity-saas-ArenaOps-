import { useState } from "react";
import {
  Home,
  Layers,
  FileText,
  SquarePen,
  ChevronLeft,
  ChevronRight,
  MessagesSquare,
  Plus,
  Send,
  Ban,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {api} from "../services/api";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openInvite, setOpenInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Home", icon: Home, path: "/dashboard" },
    { name: "Spaces", icon: Layers, path: "/spaces" },
    { name: "Projects", icon: SquarePen, path: "/projects" },
    { name: "Docs", icon: FileText, path: "/docs" },
    { name: "Chats", icon: MessagesSquare, path: "/chats" },
  ];

  const sendInvite = async () => {
    if (!email) return;

    try {
      setLoading(true);
      await api.post("auth/invite/", { email });
      setMessage("Invitation sent successfully");
      setEmail("");
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to send invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <aside
        className={`h-[calc(100vh-56px)] ${
          collapsed ? "w-16" : "w-60"
        } transition-all duration-200 ease-in-out
        bg-gray-50 dark:bg-[#1a1b1e]
        border-r border-gray-200 dark:border-gray-800
        flex flex-col`}
      >
        {/* Top Section */}
        <div>
          {/* Collapse Button */}
          <div className="flex justify-end p-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
            >
              {collapsed ? (
                <ChevronRight size={18} />
              ) : (
                <ChevronLeft size={18} />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="px-2 space-y-1">
            {menuItems.map((item) => {
              const active = item.path === location.pathname;

              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center ${
                    collapsed ? "justify-center" : "gap-3 px-3"
                  } py-2 rounded-md text-sm font-medium transition-all duration-200 active:scale-[0.98]
                  ${
                    active
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                  }`}
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
                    hover:bg-gray-200 dark:hover:bg-gray-800 transition"
                  >
                    📁 {space}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        {!collapsed && (
          <div className="mt-auto px-4 pb-4">
            <div
              onClick={() => setOpenInvite(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
              text-gray-700 dark:text-gray-300 font-medium
              hover:bg-gray-200 dark:hover:bg-gray-800 transition"
            >
              <Plus size={14} />
              Invite
            </div>
          </div>
        )}
      </aside>

      {/* Invite Modal */}
      {openInvite && (
        <div
          onClick={() => setOpenInvite(false)}
          className="fixed inset-0 z-[999] flex items-center justify-center
          bg-black/40 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-[#1e1f21]
            rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Invite team member
            </h1>

            <div className="mt-6 space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@email.com"
                className="w-full px-4 py-2 rounded-lg border
                bg-gray-100 dark:bg-[#2c2d30]
                border-gray-300 dark:border-gray-600
                outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {message && (
                <p className="text-sm text-gray-500">{message}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setOpenInvite(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg
                  bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  <Ban size={14} />
                  Cancel
                </button>

                <button
                  onClick={sendInvite}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg
                  bg-indigo-600 text-white hover:bg-indigo-700
                  disabled:opacity-60"
                >
                  <Send size={14} />
                  Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}