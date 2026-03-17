import { useNavigate } from "react-router-dom";
import WorkspaceLayout from "../layouts/WorkspaceLayout";
import {
  ArrowLeft,
  EllipsisVertical,
  User,
  Shield,
  UserCheck,
  UserX,
  MessageCircle,
  ShieldUser,
  XCircle,
  ArrowDownUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { orgMembersApi, updateRoleApi, removeMemberApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";


export default function AllMembers() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUserRole, currentUserId, loading: authLoading } = useAuth();

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const [roleSortAsc, setRoleSortAsc] = useState(false);

  const onlineUserIds = [1, 2, 3];

  const rolePriority = {
    OWNER: 1,
    ADMIN: 2,
    MEMBER: 3,
  };

  const sortedMembers = [...members].sort((a, b) => {
    const priorityA = rolePriority[a.role?.toUpperCase()] ?? 99;
    const priorityB = rolePriority[b.role?.toUpperCase()] ?? 99;
    return roleSortAsc
      ?priorityB - priorityA
      :priorityA - priorityB;
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await orgMembersApi();
      setMembers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load Members data.", err);
      setError("Failed to load Members data. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateRole = async (id, role) => {
    try {
      await updateRoleApi(id, { role });
      loadData();
      toast.success("Role updated successfully!");
    } catch (err) {
      console.error("Failed to Update Role", err);
      if (err.response.data.detail == "You cannot assign the user to the same role.") {
        toast.error("You can't assign user to the same role");
      } else {
        toast.error("Failed to update role");
      }
    }
  };

  const removeMember = async (id) => {
    try {
      await removeMemberApi(id);
      loadData();
      toast.success("User Removed successfully!");
    } catch (err) {
      console.error("Failed to remove the user", err);
      toast.error("Failed to delete user");
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    }
    if (openMenuId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const toggleMenu = (memberId) => {
    setOpenMenuId((prev) => (prev === memberId ? null : memberId));
  };

  const roleOptions = [
    { value: "MEMBER", label: "Member", icon: User },
    { value: "ADMIN", label: "Admin", icon: Shield },
  ];

  if (error) {
    return (
      <WorkspaceLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
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

  if (loading || authLoading) {
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
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0b0d] text-gray-900 dark:text-gray-100 py-8 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-6"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  All Members
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage your organization members ({members.length})
                </p>
              </div>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white/80 dark:bg-[#1a1b1e]/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-800/50">
            <div className="overflow-visible rounded-2xl">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-900/50 dark:to-gray-800/50">
                  <tr>
                    <th className="flex items-center px-6 py-4 gap-1">
                      <div className="text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Member
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <div className="text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Role
                        </div>
                        {/* Sort Button */}
                        <button
                          onClick={() => setRoleSortAsc((prev) => !prev)}
                          title={roleSortAsc ? "Sorted: Owner first" : "Sorted: Member first"}
                        >
                          <ArrowDownUp
                            size={11}
                            className={roleSortAsc ? "text-indigo-500" : "text-gray-400"}
                          />
                        </button>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50 dark:divide-gray-800/50">
                  {sortedMembers.map((member) => (
                    <tr
                      key={member.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors"
                    >
                      {/* Avatar & Name */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">

                          {/* Avatar with pulse */}
                          <div className="relative inline-block">
                            <div className={`h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 
                              flex items-center justify-center text-white font-semibold text-sm shadow-lg 
                              overflow-hidden ${member.id === currentUserId ? "ring-2 ring-offset-2 ring-green-400 " : ""}`}>
                              {member.avatar ? (
                                <img
                                  src={member.avatar}
                                  alt={member.email}
                                  className="h-12 w-12 rounded-full object-cover"
                                />
                              ) : (
                                member.email?.charAt(0)?.toUpperCase() || "U"
                              )}
                            </div>

                            {/* Pulse dot*/}
                            {member.id === currentUserId && (
                              <span className="absolute bottom-0 right-0  flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex h-3 w-3 rounded-full bg-gradient-to-r from-white to-green-400 " />
                              </span>
                            )} 
                          </div>

                          {/* Name */}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                              {member.email ? member.email.split("@")[0] : "Unknown User"}
                            </div>
                            {onlineUserIds.includes(member.id) && (
                              <div className="text-xs text-green-400 font-medium">
                                {member.id === currentUserId ? "● You (Online)" : "● Online"}
                              </div>
                            )}
                          </div>

                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                          {member.email}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {member.role?.toUpperCase() === "ADMIN" && (
                            <Shield className="h-4 w-4 text-yellow-500 mr-1" />
                          )}
                          {member.role?.toUpperCase() === "OWNER" && (
                            <ShieldUser className="h-5 w-5 text-indigo-500 mr-1" />
                          )}
                          {member.role?.toUpperCase() === "MEMBER" && (
                            <User className="h-4 w-4 text-gray-200 mr-1" />
                          )}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              member.role?.toUpperCase() === "OWNER"
                                ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/90 dark:text-indigo-100"
                                : member.role?.toUpperCase() === "ADMIN"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200"
                                : member.role?.toUpperCase() === "MEMBER"
                                ? "bg-gray-100 text-gray-800 dark:bg-gray-500/50 dark:text-gray-200"
                                : null
                            }`}
                          >
                            {member.role?.charAt(0).toUpperCase() +
                              member.role?.slice(1).toLowerCase()}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div
                          className="relative inline-block"
                          ref={openMenuId === member.id ? menuRef : null}
                        >
                          {/* Trigger button */}
                          <button
                            onClick={() => toggleMenu(member.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              openMenuId === member.id
                                ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                          >
                            <EllipsisVertical size={16} />
                          </button>

                          {/* Dropdown */}
                          {openMenuId === member.id && (
                            <div
                              className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#1e1f21] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                              style={{ top: "100%" }}
                            >
                              {/* Send Message */}
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                              >
                                <MessageCircle size={15} className="text-gray-400" />
                                Send Message
                              </button>

                              {/* Change Role — only if viewer is OWNER and member is not OWNER */}
                              {currentUserRole?.toUpperCase() === "OWNER" &&
                                member.role?.toUpperCase() !== "OWNER" && (
                                  <>
                                    <div className="border-t border-gray-100 dark:border-gray-700" />
                                    <div className="px-3 pt-2 pb-1">
                                      <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">
                                        Change Role
                                      </span>
                                    </div>
                                    {roleOptions.map((roleOption) => (
                                      <button
                                        key={roleOption.value}
                                        onClick={() => {
                                          updateRole(member.id, roleOption.value);
                                          setOpenMenuId(null);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                                      >
                                        <roleOption.icon size={14} className="text-gray-400" />
                                        {roleOption.label}
                                      </button>
                                    ))}
                                  </>
                                )}

                              {/* Remove — only if viewer is OWNER and not self */}
                              {currentUserRole?.toUpperCase() === "OWNER" &&
                                member.id !== currentUserId && (
                                  <>
                                    <div className="border-t border-gray-100 dark:border-gray-700 mt-1" />
                                    <button
                                      onClick={() => {
                                        removeMember(member.id);
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                      <UserX size={15} />
                                      Remove Member
                                    </button>
                                  </>
                                )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {members.length === 0 && !loading && (
                <div className="text-center py-12">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No members found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Your organization doesn't have any members yet.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </WorkspaceLayout>
  );
}