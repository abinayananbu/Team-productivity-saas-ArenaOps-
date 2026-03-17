import { useEffect, useRef, useState } from "react";
import {
  Sun,
  Moon,
  LogOut,
  Shield,
  User,
  ArrowLeft,
  Bell,
  Loader2,
} from "lucide-react";
import { useDarkMode } from "../hooks/useDarkMode";
import { useNavigate } from "react-router-dom";
import {
  logoutApi,
  profileApi,
  uploadAvatarApi,
  removeAvatarApi,
  setHasSession ,
} from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [dark, setDark] = useDarkMode();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const { setUser: setAuthUser, setIsAuthenticated } = useAuth();

  const avatarRef = useRef(null);
  const fileInputRef = useRef(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await profileApi();
      setUser(res.data);
    } catch (err) {
      console.error("failed to load user data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setShowAvatarMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logOut = async () => {
  try {
    await logoutApi();
  } catch {
    console.error("Logout failed");
  } finally {
    setAuthUser(null);
    setIsAuthenticated(false);
    setHasSession(false);
    window.location.href = "/";  // ✅ always redirects
  }
};

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Max file size is 2MB.");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await uploadAvatarApi(formData);
      const avatarUrl = res.data.avatar.startsWith("http")
        ? res.data.avatar
        : `${import.meta.env.VITE_API_URL}${res.data.avatar}`;

      setUser((prev) => ({
        ...prev,
        avatar: `${avatarUrl}?t=${Date.now()}`,
      }));
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed: " + (err.response?.data?.message || "Unknown error"));
      }
     finally {
      e.target.value = "";
      setShowAvatarMenu(false);
    }
  };

  const handleRemove = async () => {
    try {
      await removeAvatarApi();
      setUser((prev) => ({ ...prev, avatar: null }));
    } catch (err) {
      console.error("Remove failed:", err);
    } finally {
      setShowAvatarMenu(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#121212] text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#121212] text-gray-500">
        Failed to load profile.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#121212] text-gray-900 dark:text-gray-100 py-10 transition-colors">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="bg-white dark:bg-[#1e1f21] rounded-xl shadow border dark:border-gray-800">
          <div className="p-6 flex items-center gap-6 border-b dark:border-gray-800">
            {/* Avatar with menu */}
            <div
              className="relative w-24 h-24 shrink-0 group"
              ref={avatarRef}
            >
              <img
                src={
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.email || "User"
                  )}`
                }
                alt="Avatar"
                className="h-24 w-24 rounded-full border-2 border-gray-900 object-cover"
              />

              {/* Hover overlay — pencil icon */}
              <div
                onClick={() => setShowAvatarMenu((prev) => !prev)}
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
              >
                <span className="text-white text-lg">✏️</span>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />

              {/* Dropdown menu */}
              {showAvatarMenu && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-36 bg-white dark:bg-[#1e1f21] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden">
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    📷 Add Photo
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-700" />
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                  >
                    🗑️ Remove
                  </button>
                </div>
              )}
            </div>

            {/* Name / email / role */}
            <div>
              <h2 className="text-2xl font-semibold">
                {user.organization?.name || "Workspace"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                {user.role || "Member"}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <Section
              icon={<Sun size={18} />}
              title="Appearance"
              description="Control how ArenaOps looks on your device"
            >
              <button
                onClick={() => setDark(!dark)}
                className="flex items-center gap-2 px-4 py-2 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {dark ? <Sun size={16} /> : <Moon size={16} />}
                {dark ? "Light mode" : "Dark mode"}
              </button>
            </Section>

            <Section
              icon={<User size={18} />}
              title="Account"
              description="Your personal account details"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Email:
                <span className="ml-1 text-gray-800 dark:text-gray-200">
                  {user.email}
                </span>
              </p>
            </Section>

            <Section
              icon={<Bell size={18} />}
              title="Notifications"
              description="Manage your notification preferences"
            >
              <Toggle
                enabled={emailNotifications}
                onChange={setEmailNotifications}
              />
            </Section>

            <Section
              icon={<Shield size={18} />}
              title="Security"
              description="Manage sessions and access"
            >
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-2 text-red-600 hover:underline"
              >
                <LogOut size={16} />
                Log out
              </button>
            </Section>
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[#1e1f21] rounded-xl shadow-lg w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold">Confirm logout</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to log out from ArenaOps?
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
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
  );
}

function Section({ icon, title, description, children }) {
  return (
    <div className="flex justify-between items-start gap-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded bg-gray-100 dark:bg-gray-800">{icon}</div>
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
        enabled ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-700"
      }`}
    >
      <span
        className={`bg-white w-4 h-4 rounded-full shadow-md transition-transform ${
          enabled ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}
