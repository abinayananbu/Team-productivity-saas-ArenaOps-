import { useEffect, useState, useRef } from "react";
import WorkspaceLayout from "../layouts/WorkspaceLayout";
import { CheckCircle, Folder, Users, Clock } from "lucide-react";
import { orgMembersApi, showAuditApi, showProjectApi } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DashBoardPage() {
  const [project, setProject] = useState([]);
  const [member, setMember] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auditlog, setAuditlog] = useState([]);
  const navigate = useNavigate();

  const intervalRef = useRef(null);
  const pollingInterval = 20000;

  const { user } = useAuth();
  const currentEmail = user?.email;

  const loadData = async () => {
    
    try {
      const [projectRes, membersRes, auditRes] = await Promise.all([
        showProjectApi(), 
        orgMembersApi(), 
        showAuditApi(),   
      ]);

      setProject(Array.isArray(projectRes.data) ? projectRes.data : []);
      setMember(Array.isArray(membersRes.data) ? membersRes.data : []);
      setAuditlog(Array.isArray(auditRes.data) ? auditRes.data : []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load dashboard data. Please refresh.");
    }
  };


  useEffect(() => {
    
    const loadInitial = async () => {
      setLoading(true);
      try {
        const [projectRes, membersRes, auditRes] = await Promise.all([
          showProjectApi(), 
          orgMembersApi(), 
          showAuditApi(),   
        ]);
        setProject(Array.isArray(projectRes.data) ? projectRes.data : []);
        setMember(Array.isArray(membersRes.data) ? membersRes.data : []);
        setAuditlog(Array.isArray(auditRes.data) ? auditRes.data : []);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load dashboard data. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    loadInitial();

    // Set up polling
    const intervalId = setInterval(() => {
      loadData();
    }, pollingInterval);

    intervalRef.current = intervalId;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);



  const totalTasks = project.reduce((sum, p) => sum + (p.task_count || 0), 0);
  
  const dueToday = project.reduce((sum, p) => {
    return sum + (p.tasks?.filter(t => 
      new Date(t.due_date).toDateString() === new Date().toDateString()
    )?.length || 0);
  }, 0);

  if (error) {
    return (
      <WorkspaceLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{error}</h3>
            <button 
              onClick={loadData}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </WorkspaceLayout>
    );
  }

  if (loading) {
    return (
      <WorkspaceLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
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
          <StatCard title="Team Members" value={member.length} icon={Users} navigate={navigate} path="/members"/>
          <StatCard title="Due Today" value={dueToday} icon={Clock} />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tasks */}         
          <div className="lg:col-span-2 bg-white dark:bg-[#1e1f21] border border-gray-200 dark:border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
              Recent Tasks
            </h2>

            {project.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No projects yet. 
                <button 
                  onClick={() => navigate('/projects/new')} 
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium ml-1"
                >
                  Create one
                </button>
              </div>
            ) : (
              <ul className="space-y-3 max-h-80 overflow-y-auto">
                {(() => {
                  const recentTasks = project
                    .flatMap((proj, projIndex) => 
                      (proj.recent_tasks || proj.tasks || [])
                        .slice(0, 2)
                        .map((task, taskIndex) => ({
                          ...task,
                          uniqueKey: task.id || `proj${projIndex}-task${taskIndex}`
                        }))
                    )
                    .slice(0, 4);

                  if (recentTasks.length === 0) {
                    return (
                      <li className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm col-span-full">
                        No recent tasks found
                      </li>
                    );
                  }

                  return recentTasks.map((task) => (
                    <li
                      key={task.uniqueKey} 
                      className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {task.title || task.name || task.description || "Untitled Task"}
                      </span>
                    </li>
                  ));
                })()}
              </ul>
            )}
          </div>

          {/* Activity */}
          <div className="bg-white dark:bg-[#1e1f21] border border-gray-200 dark:border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
              Activity
            </h2>

            {auditlog.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                No recent activity
              </div>
            ) : (
              <ul className="space-y-3 text-sm max-h-80 overflow-y-auto">
                {auditlog
                  .slice(0, 8)
                  .filter((a) => {
                    const d = new Date(a.created_at);
                    if (isNaN(d.getTime())) {
                      console.warn("Invalid date in audit log:", a.created_at);
                      return false;
                    }
                    return Date.now() - d.getTime() >= 0;
                  })
                  .map((a) => {
                    const logDateObj = new Date(a.created_at);
                    const logDateStr = logDateObj.toISOString().split('T')[0];
                    const todayStr = new Date().toISOString().split('T')[0];
                    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

                    let dateDisplay = "";

                    if (logDateStr === todayStr) {
                      const diffMs = Date.now() - logDateObj.getTime();
                      const seconds = Math.floor(diffMs / 1000);
                      const minutes = Math.floor(diffMs / 60000);
                      const hours = Math.floor(diffMs / 3600000);

                      if (seconds < 60) {
                        dateDisplay = "Just now";
                      } else if (minutes < 60) {
                        dateDisplay = `${minutes} mins ago`;
                      } else if (hours < 24) {
                        dateDisplay = `${hours} hours ago`;
                      } else {
                        dateDisplay = logDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                      }
                    } else if (logDateStr === yesterdayStr) {
                      dateDisplay = "Yesterday";
                    } else {
                      dateDisplay = logDateObj.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      });
                    }

                    return (
                      <li key={a.id ?? a.created_at} className="flex items-center justify-between px-2 py-2 text-gray-600 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <span className="truncate">
                          {a.action} by {" "}
                          <span className="capitalize font-medium">{(currentEmail === a.user_email) ? "You" : a.user_display}</span>
                        </span>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {dateDisplay}
                        </span>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}

/* Reusable StatCard */
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
          {value ?? 0}
        </p>
      </div>
    </div>
  );
}