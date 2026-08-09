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
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white/5 border-r border-white/10 p-5 h-screen relative z-20 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-500/20 p-2.5 rounded-xl border border-red-500/30">
            <ShieldAlert className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
              Admin Portal
            </h2>
            <p className="text-[10px] text-gray-400 font-medium">Voyage AI Control</p>
          </div>
        </div>

        {/* Back to App button */}
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to App Dashboard</span>
        </NavLink>
        
        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => 
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-semibold ${
                  isActive 
                    ? 'bg-gradient-to-r from-red-500/25 to-orange-500/25 text-white border border-red-500/40 shadow-lg shadow-red-500/10 font-bold' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="pt-4 mt-auto border-t border-white/10 space-y-2">
          <NavLink
            to="/dashboard/profile"
            className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
            title="Edit My Profile"
          >
            <UserAvatar 
              avatarUrl={user?.avatar_url}
              name={displayName()}
              email={user?.email}
              size="sm"
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-white truncate group-hover:text-red-400 transition-colors">
                {displayName()}
              </p>
              <p className="text-[10px] text-red-400 font-semibold uppercase tracking-wider">Super Administrator</p>
            </div>
          </NavLink>

          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2 w-full rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Topbar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/90 backdrop-blur-xl z-30">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <h2 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
                Admin Panel
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NavLink
              to="/dashboard"
              className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-300 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-xl hover:text-white"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>App</span>
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
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-black to-red-950/20 relative p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer (Slide-in Navigation) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 md:hidden flex"
          >
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
              className="w-72 max-w-[85vw] bg-gray-950 border-r border-white/10 p-5 h-full flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="bg-red-500/20 p-2 rounded-xl border border-red-500/30">
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
                      Admin Portal
                    </h2>
                    <p className="text-[10px] text-gray-400 font-medium">Voyage AI Control</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Back to App Dashboard */}
              <NavLink
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all mb-3"
              >
                <ArrowLeft className="w-4 h-4 text-primary" />
                <span>Back to App Dashboard</span>
              </NavLink>

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
                          ? 'bg-gradient-to-r from-red-500/25 to-orange-500/25 text-white border border-red-500/40 font-bold' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </nav>

              {/* Profile & Logout */}
              <div className="pt-4 mt-auto border-t border-white/10 space-y-2">
                <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
                  <UserAvatar 
                    avatarUrl={user?.avatar_url}
                    name={displayName()}
                    email={user?.email}
                    size="sm"
                  />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{displayName()}</p>
                    <p className="text-[10px] text-red-400 font-semibold uppercase">Administrator</p>
                  </div>
                </div>

                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-3 py-2 w-full rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-xs font-semibold"
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
