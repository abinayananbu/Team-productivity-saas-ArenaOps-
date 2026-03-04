import { Bell, Search, Sun, Moon, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { profileApi, logoutApi } from "../services/api";
import logo from "../assets/arenaOps.png"

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { dark, setDark } = useTheme();
  const [user, setUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const workspaceRef = useRef(null);
  const userRef = useRef(null);
  const notifyRef = useRef(null);
  const searchRef = useRef(null);

  // Fetch profile
  useEffect(() => {
    profileApi()
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => console.error("Failed to load profile"));
  }, []);

  const logOut = async() =>{
      try{
         await logoutApi()
         navigate("/login")
      }catch{
        console.error("Logout failed")
      }
    }

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (workspaceRef.current && !workspaceRef.current.contains(e.target)) setOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
      if (notifyRef.current && !notifyRef.current.contains(e.target)) setNotifyOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
      }, []);

      const [notifications, setNotifications] = useState([
      {
        id: 1,
        title: "Workspace Invite",
        message: "You were invited to ArenaOps workspace",
        read: false,
        time: "2m ago",
      },
      {
        id: 2,
        title: "Task Assigned",
        message: "You were assigned to 'Fix login bug'",
        read: false,
        time: "10m ago",
      },
      {
        id: 3,
        title: "Project Update",
        message: "Sprint report marked as done",
        read: true,
        time: "1h ago",
      },
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

  // Sync HTML class with theme
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  // Close search modal with ESC
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") setSearchOpen(false);
    }
    if (searchOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [searchOpen]);

  return (
    <header
      className="h-14 px-4 flex items-center justify-between
        bg-white dark:bg-[#1e1f21]
        border-b border-gray-200 dark:border-gray-800 relative z-50"
    >
      {/* Workspace */}
      <div className="relative mt-2" ref={workspaceRef}>
        <button
          onClick={() => {
            setOpen(!open);
            setUserOpen(false);
            setNotifyOpen(false);
          }}
          className="flex items-center gap-1 text-sm font-medium
            text-gray-700 dark:text-gray-200
            hover:bg-gray-100 dark:hover:bg-gray-800
            px-2 py-1 rounded"
        >
          <img
            src={logo}
            alt="ArenaOps Logo"
            className="h-10 w-auto"
          />
          <ChevronDown size={16} />
        </button>

        {open && (
          <div
            className="absolute top-full mt-2 w-56 z-50
              bg-white dark:bg-[#2c2d30]
              border border-gray-200 dark:border-gray-700
              rounded-lg shadow-lg"
          >
            <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
              Workspaces
            </div>
            <button onClick={()=>navigate("/")} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              ArenaOps
            </button>
            <button  className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              {user?.organization?.name || "Client"}'s Workspace
            </button>
            <div className="border-t my-1 border-gray-200 dark:border-gray-700" />
            <button className="w-full px-3 py-2 text-sm text-indigo-600 rounded hover:bg-indigo-50 dark:hover:bg-indigo-700/20">
              + Create workspace
            </button>
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Search button */}
        <button
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => setSearchOpen(!searchOpen)}
        >
          <Search size={18} className="text-gray-600 dark:text-gray-300" />
        </button>

        {/* Search Modal (only over dashboard content) */}
        {searchOpen && location.pathname === "/dashboard" && (
          <div
            className="fixed top-14 left-0 w-full h-[calc(100%-56px)] z-[999] flex items-center justify-center
              bg-black/40 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          >
            <div
              ref={searchRef}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl mx-4
                bg-white dark:bg-[#1e1f21]
                rounded-xl shadow-2xl p-6"
            >
              <input
                autoFocus
                type="text"
                placeholder="Search projects, tasks, docs..."
                className="w-full text-lg px-4 py-3 rounded-lg
                  bg-gray-100 dark:bg-[#2c2d30]
                  text-gray-900 dark:text-gray-100
                  outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <span className="block mt-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd> to close
              </span>
            </div>
          </div>
        )}

        {/* Notification */}
        <button
          onClick={() => {
            setNotifyOpen(!notifyOpen);
            setUserOpen(false);
            setOpen(false);
          }}
          className="relative p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          ref={notifyRef}
        >
          <Bell size={18} className="text-gray-600 dark:text-gray-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px]
              bg-red-600 text-white rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {notifyOpen && (
          <div
            className="absolute right-4 top-14 w-80 z-50
              bg-white dark:bg-[#2c2d30]
              border border-gray-200 dark:border-gray-700
              rounded-xl shadow-lg overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
              <h4 className="text-sm font-semibold">Notifications</h4>
              {unreadCount > 0 && (
                <button
                  onClick={() =>
                    setNotifications(notifications.map(n => ({ ...n, read: true })))
                  }
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-sm text-center text-gray-500">
                  No notifications
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() =>
                      setNotifications(notifications.map(x =>
                        x.id === n.id ? { ...x, read: true } : x
                      ))
                    }
                    className={`px-4 py-3 text-sm cursor-pointer
                      border-b last:border-none dark:border-gray-700
                      hover:bg-gray-100 dark:hover:bg-gray-800
                      ${!n.read ? "bg-indigo-50 dark:bg-indigo-900/20" : ""}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{n.title}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                          {n.message}
                        </p>
                      </div>
                      {!n.read && (
                        <span className="h-2 w-2 bg-indigo-600 rounded-full mt-1" />
                      )}
                    </div>

                    <p className="mt-1 text-xs text-gray-400">{n.time}</p>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <button
                onClick={() => setNotifications([])}
                className="w-full px-4 py-2 text-sm
                  text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* User menu */}
        <div className="relative" ref={userRef}>
          <img
            src={
              user
                ? user.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.name || user.email || "User"
                  )}`
                : "https://ui-avatars.com/api/?name=User"
            }
            alt="User avatar"
            onClick={() => {
              setUserOpen(!userOpen);
              setOpen(false);
              setNotifyOpen(false);
            }}
            className="h-9 w-9 rounded-full cursor-pointer border-3 border-gray-300 dark:border-gray-500 object-cover"
          />
          {userOpen && (
            <div className="absolute right-0 mt-2 w-40 z-50
                bg-white dark:bg-[#2c2d30]
                border border-gray-200 dark:border-gray-700
                rounded-lg shadow-lg"
          >
            <button
              onClick={() => navigate("/profile")}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Profile
            </button>
            <div className="border-t border-gray-200 dark:border-gray-700" />
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full text-left px-3 py-2 text-sm
                  text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Logout
            </button>
            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white dark:bg-[#1e1f21] rounded-xl shadow-lg w-full max-w-sm p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Confirm logout</h3>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Are you sure you want to log out from ArenaOps?
                  </p>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => {setShowLogoutConfirm(false);setUserOpen(false);}}
                      className="px-4 py-2 text-sm rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={() => {
                        setShowLogoutConfirm(false);
                        logOut();
                      }}
                      className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              </div>
            )}
                </div>
                )}
        </div>
      </div>
    </header>
  );
}
