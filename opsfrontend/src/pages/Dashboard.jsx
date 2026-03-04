import { useEffect, useState } from "react";
import WorkspaceLayout from "../layouts/WorkspaceLayout";
import { CheckCircle, Folder, Users, Clock } from "lucide-react";
import { orgMembersApi, showProjectApi } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function DashBoardPage() {
  const [project, setProject] = useState([]);
  const [member, setMember] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectRes, membersRes] = await Promise.all([
        showProjectApi(), 
        orgMembersApi(),    
      ]);

      setProject(Array.isArray(projectRes.data) ? projectRes.data : []);
      setMember(Array.isArray(membersRes.data) ? membersRes.data : []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalTasks = project.reduce(
    (sum, p) => sum + (p.task_count || 0),
    0
  );

  if (loading) {
    return (
      <WorkspaceLayout>
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Projects" 
            value={project.length} 
            icon={Folder} 
            navigate={navigate}
            path="/projects" 
          />
          <StatCard title="Tasks" value={totalTasks} icon={CheckCircle} />
          <StatCard title="Team Members" value={member.length} icon={Users} />
          <StatCard title="Due Today" value="5" icon={Clock} />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tasks */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1e1f21] border border-gray-200 dark:border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
              Recent Tasks
            </h2>

            <ul className="space-y-3">
              {[
                "Design dashboard UI",
                "Fix login API issue",
                "Prepare sprint report",
                "Client feedback review",
              ].map((task, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {task}
                  </span>
                  <span className="text-xs text-gray-400">Today</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Activity */}
          <div className="bg-white dark:bg-[#1e1f21] border border-gray-200 dark:border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
              Activity
            </h2>

            <ul className="space-y-3 text-sm">
              <li className="text-gray-600 dark:text-gray-400">
                ✅ Task completed by John
              </li>
              <li className="text-gray-600 dark:text-gray-400">
                📁 New project created
              </li>
              <li className="text-gray-600 dark:text-gray-400">
                👤 New member joined
              </li>
            </ul>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}

/* Reusable StatCard - Fixed navigation */
function StatCard({ title, value, icon: Icon, navigate, path }) {
  const handleClick = () => {
    if (path && navigate) {
      navigate(path);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="group cursor-pointer bg-white dark:bg-[#1e1f21] border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
    >
      <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
        <Icon size={20} className="text-indigo-600 dark:text-indigo-400" />
      </div>

      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {value}
        </p>
      </div>
    </div>
  );
}
