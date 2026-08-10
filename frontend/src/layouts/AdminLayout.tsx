import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Map, 
  LogOut, 
  CreditCard, 
  Contact2, 
  KeyRound, 
  Bell, 
  MapPin, 
  Hotel, 
  Plane,
  Menu,
  X,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar } from '../components/UserAvatar';
import { ThemeToggle } from '../components/ThemeToggle';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Users', icon: Users, path: '/admin/users' },
    { name: 'Profiles', icon: Contact2, path: '/admin/profiles' },
    { name: 'Trips', icon: Map, path: '/admin/trips' },
    { name: 'Flights', icon: Plane, path: '/admin/flights' },
    { name: 'Hotels', icon: Hotel, path: '/admin/hotels' },
    { name: 'Expenses', icon: CreditCard, path: '/admin/expenses' },
    { name: 'Saved Places', icon: MapPin, path: '/admin/saved-places' },
    { name: 'OTPs', icon: KeyRound, path: '/admin/otps' },
    { name: 'Notifications', icon: Bell, path: '/admin/notifications' },
  ];

  const displayName = () => {
    const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
    if (fullName) return fullName;
    return user?.email?.split('@')[0] || 'Admin';
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white/80 dark:bg-[#0e121a]/80 border-r border-slate-200/80 dark:border-white/10 p-5 h-screen relative z-20 backdrop-blur-xl shadow-xl shadow-slate-200/40 dark:shadow-none">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-500/20 p-2.5 rounded-2xl border border-red-500/30 shadow-lg shadow-red-500/15">
            <ShieldAlert className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
              Admin <span className="text-red-500">Portal</span>
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-gray-400 font-bold">System Control</p>
          </div>
        </div>

        {/* Back to App button */}
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 transition-all mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-primary" />
          <span>Back to App Dashboard</span>
        </NavLink>
        
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => 
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-semibold ${
                  isActive 
                    ? 'bg-red-500 text-white font-bold shadow-md shadow-red-500/30 dark:bg-red-500/25 dark:text-red-400 dark:border dark:border-red-500/40' 
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="pt-4 mt-auto border-t border-slate-200 dark:border-white/10 space-y-2">
          <NavLink
            to="/dashboard/profile"
            className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-100/70 dark:bg-white/5 hover:bg-slate-200/70 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all group"
            title="Edit My Profile"
          >
            <UserAvatar 
              avatarUrl={user?.avatar_url}
              name={displayName()}
              email={user?.email}
              size="sm"
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-red-500 transition-colors">
                {displayName()}
              </p>
              <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Super Admin</p>
            </div>
          </NavLink>

          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2 w-full rounded-xl text-red-500 hover:bg-red-500/10 transition-colors text-xs font-bold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 md:px-8 border-b border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#07090e]/80 backdrop-blur-xl z-30">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <h2 className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                Admin Console
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <NavLink
              to="/dashboard"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-gray-300 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-xl transition-all"
            >
              <ArrowLeft className="w-3 h-3 text-primary" />
              <span className="hidden sm:inline">Back to App</span>
            </NavLink>

            <UserAvatar 
              avatarUrl={user?.avatar_url}
              name={displayName()}
              email={user?.email}
              size="xs"
            />
          </div>
        </header>

        {/* Dynamic Outlet */}
        <main className="flex-1 overflow-y-auto relative p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 md:hidden flex"
          >
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
              className="w-72 max-w-[85vw] bg-white dark:bg-[#0e121a] border-r border-slate-200 dark:border-white/10 p-5 h-full flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="bg-red-500/20 p-2 rounded-xl border border-red-500/30">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Admin Portal</h2>
                    <p className="text-[10px] text-slate-400 dark:text-gray-400">Voyage AI Control</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-between mb-3 p-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <span className="text-xs font-bold text-slate-600 dark:text-gray-300">Theme</span>
                <ThemeToggle showLabel />
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    end={item.path === '/admin'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => 
                      `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-semibold ${
                        isActive 
                          ? 'bg-red-500 text-white font-bold shadow-md' 
                          : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </nav>

              {/* Profile & Logout */}
              <div className="pt-4 mt-auto border-t border-slate-200 dark:border-white/10 space-y-2">
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-3 py-2 w-full rounded-xl text-red-500 hover:bg-red-500/10 transition-colors text-xs font-bold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
