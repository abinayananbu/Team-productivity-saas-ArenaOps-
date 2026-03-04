import { useState } from "react";
import { Sun, Moon, LogOut, Shield, User, ArrowLeft, Bell } from "lucide-react";
import { useDarkMode } from "../hooks/useDarkMode";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logoutApi } from "../services/api";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [dark, setDark] = useDarkMode();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const {user,loading} = useAuth();

  const logOut = async() =>{
    try{
       await logoutApi()
    }catch{
      console.error("Logout failed")
    }
  }

  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#121212] text-gray-500">
        Loading profile...
      </div>
    );
  }

  // ✅ Guard against null user after loading
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
            <img
              src={user.avatar || "https://ui-avatars.com/api/?name=" + user.email}
              alt="Avatar"
              className="h-24 w-24 shrink-0 rounded-full border-2 border-gray-900 object-cover"
            />
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
            <Section icon={<Sun size={18} />} title="Appearance" description="Control how ArenaOps looks on your device">
              <button
                onClick={() => setDark(!dark)}
                className="flex items-center gap-2 px-4 py-2 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {dark ? <Sun size={16} /> : <Moon size={16} />}
                {dark ? "Light mode" : "Dark mode"}
              </button>
            </Section>

            <Section icon={<User size={18} />} title="Account" description="Your personal account details">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Email:
                <span className="ml-1 text-gray-800 dark:text-gray-200">{user.email}</span>
              </p>
            </Section>

            <Section icon={<Bell size={18} />} title="Notifications" description="Manage your notification preferences">
              <Toggle enabled={emailNotifications} onChange={setEmailNotifications} />
            </Section>

            <Section icon={<Shield size={18} />} title="Security" description="Manage sessions and access">
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
                onClick={() => { setShowLogoutConfirm(false); logOut(); }}
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
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
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
      <span className={`bg-white w-4 h-4 rounded-full shadow-md transition-transform ${enabled ? "translate-x-6" : "translate-x-0"}`} />
    </button>
  );
}