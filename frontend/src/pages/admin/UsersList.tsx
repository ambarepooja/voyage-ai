import { useEffect, useState, useMemo } from 'react';
import { api } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trash2, Shield, ShieldOff, Power, PowerOff, Search, Filter, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../../components/UserAvatar';

export default function UsersList() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId: number) => {
    if (userId === currentUser?.id) {
      alert("You cannot delete your own account.");
      return;
    }
    if (window.confirm("Are you sure you want to completely delete this user and all their data? This action cannot be undone.")) {
      try {
        await api.delete(`/admin/users/${userId}`);
        setUsers(users.filter(u => u.id !== userId));
      } catch (err: any) {
        alert(err.response?.data?.detail || "Failed to delete user");
      }
    }
  };

  const toggleStatus = async (userId: number, currentStatus: boolean) => {
    if (userId === currentUser?.id) {
      alert("You cannot change your own status.");
      return;
    }
    try {
      const res = await api.patch(`/admin/users/${userId}/status`, { is_active: !currentStatus });
      setUsers(users.map(u => u.id === userId ? res.data : u));
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update status");
    }
  };

  const toggleRole = async (userId: number, currentRole: boolean) => {
    if (userId === currentUser?.id) {
      alert("You cannot change your own role.");
      return;
    }
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { is_superuser: !currentRole });
      setUsers(users.map(u => u.id === userId ? res.data : u));
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update role");
    }
  };

  const formatLoginTime = (dateStr?: string) => {
    if (!dateStr) return { primary: 'Never Logged In', relative: 'No session yet', isRecent: false };
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return { primary: 'Never Logged In', relative: 'No session yet', isRecent: false };

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let relative = '';
    const isRecent = diffMins >= 0 && diffMins < 60;

    if (diffMins < 1) {
      relative = 'Just now';
    } else if (diffMins < 60) {
      relative = `${diffMins}m ago`;
    } else if (diffHours < 24) {
      relative = `${diffHours}h ago`;
    } else if (diffDays === 1) {
      relative = 'Yesterday';
    } else if (diffDays < 30) {
      relative = `${diffDays}d ago`;
    } else {
      relative = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    const primary = date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return { primary, relative, isRecent };
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchRole = roleFilter === 'all' || (roleFilter === 'admin' ? u.is_superuser : !u.is_superuser);
      const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? u.is_active : !u.is_active);
      const matchSearch = u.email.toLowerCase().includes(searchQuery.toLowerCase()) || u.id.toString().includes(searchQuery);
      return matchRole && matchStatus && matchSearch;
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="text-blue-400 w-8 h-8" /> User Accounts & Access Control
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage platform credentials, roles, login history, and suspension states.</p>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center bg-black/40 border border-white/10 px-3 py-2 rounded-xl text-sm">
            <Filter className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
            <span className="text-xs text-gray-400 font-semibold uppercase mr-2">Role:</span>
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer font-medium"
            >
              <option value="all" className="bg-gray-800">All Roles</option>
              <option value="admin" className="bg-gray-800">Admins Only</option>
              <option value="user" className="bg-gray-800">Standard Users</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-black/40 border border-white/10 px-3 py-2 rounded-xl text-sm">
            <span className="text-xs text-gray-400 font-semibold uppercase mr-2">Status:</span>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer font-medium"
            >
              <option value="all" className="bg-gray-800">All Statuses</option>
              <option value="active" className="bg-gray-800">Active Only</option>
              <option value="suspended" className="bg-gray-800">Suspended Only</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-72 flex items-center bg-black/40 border border-white/10 px-3 py-2 rounded-xl text-sm">
          <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
          <input 
            type="text"
            placeholder="Search email or user ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white focus:outline-none w-full placeholder-gray-400"
          />
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Loading user directory...</div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-white/10 text-gray-300 text-sm">
                  <th className="p-4 font-semibold">User ID</th>
                  <th className="p-4 font-semibold">Email & Profile</th>
                  <th className="p-4 font-semibold">Last Logged In</th>
                  <th className="p-4 font-semibold">Account Status</th>
                  <th className="p-4 font-semibold">Access Level</th>
                  <th className="p-4 font-semibold text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredUsers.map((user, idx) => {
                    const isSelf = user.id === currentUser?.id;
                    const loginInfo = formatLoginTime(user.last_login);
                    return (
                      <motion.tr 
                        key={user.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors text-gray-300"
                      >
                        <td className="p-4 font-mono font-bold text-gray-400">#{user.id}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar 
                              avatarUrl={user.avatar_url}
                              name={`${user.first_name || ''} ${user.last_name || ''}`.trim()}
                              email={user.email}
                              size="md"
                            />
                            <div>
                              <p className="text-white font-bold text-sm flex items-center gap-2">
                                {user.first_name || user.last_name ? (
                                  <span>{user.first_name || ''} {user.last_name || ''} <span className="text-gray-400 font-normal text-xs">({user.email})</span></span>
                                ) : (
                                  <span>{user.email}</span>
                                )}
                                {isSelf && (
                                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] rounded-full border border-indigo-500/30 uppercase tracking-wider font-semibold">
                                    You
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Last Logged In Timestamp Column */}
                        <td className="p-4">
                          {user.last_login ? (
                            <div>
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                                <Clock className={`w-3.5 h-3.5 ${loginInfo.isRecent ? 'text-emerald-400 animate-pulse' : 'text-blue-400'}`} />
                                <span>{loginInfo.primary}</span>
                              </div>
                              <span className={`text-[11px] font-medium ${loginInfo.isRecent ? 'text-emerald-400 font-bold' : 'text-gray-400'}`}>
                                {loginInfo.relative} {loginInfo.isRecent && '• Active'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 italic">
                              <Clock className="w-3.5 h-3.5 text-gray-600" />
                              <span>Never logged in</span>
                            </div>
                          )}
                        </td>

                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                            user.is_active 
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                              : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
                            {user.is_active ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="p-4">
                          {user.is_superuser ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30 inline-flex items-center gap-1">
                              <Shield className="w-3.5 h-3.5" /> Administrator
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-gray-300 border border-white/10">
                              Standard User
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end items-center gap-2">
                            <button
                              onClick={() => toggleStatus(user.id, user.is_active)}
                              disabled={isSelf}
                              className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold ${
                                isSelf ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10 text-gray-400 hover:text-white'
                              }`}
                              title={user.is_active ? "Suspend User Account" : "Activate User Account"}
                            >
                              {user.is_active ? <PowerOff className="w-4 h-4 text-yellow-400" /> : <Power className="w-4 h-4 text-green-400" />}
                            </button>
                            
                            <button
                              onClick={() => toggleRole(user.id, user.is_superuser)}
                              disabled={isSelf}
                              className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold ${
                                isSelf ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10 text-gray-400 hover:text-white'
                              }`}
                              title={user.is_superuser ? "Revoke Admin Privilege" : "Grant Admin Privilege"}
                            >
                              {user.is_superuser ? <ShieldOff className="w-4 h-4 text-orange-400" /> : <Shield className="w-4 h-4 text-purple-400" />}
                            </button>

                            <button
                              onClick={() => handleDelete(user.id)}
                              disabled={isSelf}
                              className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold ${
                                isSelf ? 'opacity-20 cursor-not-allowed' : 'hover:bg-red-500/20 text-gray-400 hover:text-red-400'
                              }`}
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-400">
                      No user accounts found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
