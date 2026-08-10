import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Map, 
  Plane, 
  Hotel, 
  Wallet, 
  Bell, 
  LogOut,
  Menu,
  X,
  MessageSquare,
  ShieldAlert,
  Backpack,
  QrCode,
  UserCircle,
  Pencil,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar } from '../components/UserAvatar';
import { ThemeToggle } from '../components/ThemeToggle';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
    { icon: MessageSquare, label: 'AI Concierge', path: '/dashboard/chat' },
    { icon: Plane, label: 'Trips & Itinerary', path: '/dashboard/trips' },
    { icon: QrCode, label: 'Flights & Passes', path: '/dashboard/flights' },
    { icon: Hotel, label: 'Luxury Hotels', path: '/dashboard/hotels' },
    { icon: Backpack, label: 'Smart Packing', path: '/dashboard/packing' },
    { icon: Map, label: 'Map Explore', path: '/dashboard/map' },
    { icon: Wallet, label: 'Expenses Ledger', path: '/dashboard/expenses' },
    { icon: UserCircle, label: 'My Profile', path: '/dashboard/profile' },
  ];

  const displayName = () => {
    const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
    if (fullName) return fullName;
    return user?.email?.split('@')[0] || 'Voyager';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 flex overflow-hidden transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white/80 dark:bg-[#0e121a]/80 backdrop-blur-2xl border-r border-slate-200/80 dark:border-white/10 p-6 h-screen relative z-20 shadow-xl shadow-slate-200/40 dark:shadow-none">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary/20 dark:bg-primary/25 p-2.5 rounded-2xl border border-primary/30 shadow-lg shadow-primary/20">
            <Plane className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              Voyage <span className="text-primary font-black">AI</span>
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-gray-400">Intelligent Travel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 text-sm ${
                  isActive 
                    ? 'bg-primary text-white font-bold shadow-lg shadow-primary/30 dark:bg-primary/25 dark:text-primary dark:border dark:border-primary/40' 
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 font-medium'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
          
          {user?.is_superuser && (
            <NavLink
              to="/admin"
              className={({ isActive }) => 
                `flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 text-sm mt-3 ${
                  isActive 
                    ? 'bg-red-500 text-white font-bold shadow-lg shadow-red-500/30' 
                    : 'text-red-500 hover:bg-red-500/10 font-semibold'
                }`
              }
            >
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>Admin Panel</span>
            </NavLink>
          )}
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-white/10 space-y-2">
          {/* Interactive Clickable User Profile Card */}
          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) => 
              `group block p-3 rounded-2xl border transition-all ${
                isActive 
                  ? 'bg-primary/10 dark:bg-primary/20 border-primary shadow-md' 
                  : 'bg-slate-100/70 dark:bg-white/5 hover:bg-slate-200/70 dark:hover:bg-white/10 border-slate-200 dark:border-white/10'
              }`
            }
            title="Click to view & edit profile"
          >
            <div className="flex items-center gap-3">
              <UserAvatar 
                avatarUrl={user?.avatar_url}
                name={displayName()}
                email={user?.email}
                size="md"
              />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
                  {displayName()}
                </p>
                <p className="text-xs text-slate-500 dark:text-gray-400 truncate flex items-center gap-1">
                  <span>Pro Traveler</span>
                  <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 text-[10px] font-bold">
                    • Edit <Pencil className="w-2.5 h-2.5 inline" />
                  </span>
                </p>
              </div>
            </div>
          </NavLink>

          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all text-xs font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Topbar */}
        <header className="h-20 flex items-center justify-between px-6 lg:px-10 border-b border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#07090e]/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3 md:hidden">
            <button 
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-1">
              Voyage <span className="text-primary">AI</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI Itinerary Engine Connected</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Dark / Light Mode Switcher */}
            <ThemeToggle />

            {/* Quick Profile Nav Link in Header */}
            <NavLink
              to="/dashboard/profile"
              className="flex items-center gap-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 px-3.5 py-2 rounded-2xl transition-all text-xs text-slate-700 dark:text-gray-300 font-semibold"
            >
              <UserAvatar 
                avatarUrl={user?.avatar_url}
                name={displayName()}
                email={user?.email}
                size="xs"
              />
              <span className="hidden sm:inline">{displayName()}</span>
            </NavLink>
          </div>
        </header>

        {/* Dynamic Content Container */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 z-10 relative">
          <Outlet />
        </div>
      </main>

      {/* Mobile Menu */}
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
              className="w-72 bg-white dark:bg-[#0e121a] border-r border-slate-200 dark:border-white/10 p-6 h-full flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 p-2 rounded-2xl">
                    <Plane className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Voyage AI</h1>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-between mb-4 p-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <span className="text-xs font-bold text-slate-600 dark:text-gray-300">Theme Mode</span>
                <ThemeToggle showLabel />
              </div>

              <nav className="flex-1 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => 
                      `flex items-center gap-4 px-4 py-3 rounded-2xl transition-all text-sm ${
                        isActive 
                          ? 'bg-primary text-white font-bold shadow-md shadow-primary/30' 
                          : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
                
                {user?.is_superuser && (
                  <NavLink
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => 
                      `flex items-center gap-4 px-4 py-3 rounded-2xl transition-all text-sm ${
                        isActive 
                          ? 'bg-red-500 text-white font-bold shadow-md' 
                          : 'text-red-500 hover:bg-red-500/10 font-semibold'
                      }`
                    }
                  >
                    <ShieldAlert className="w-5 h-5" />
                    <span>Admin Panel</span>
                  </NavLink>
                )}
              </nav>

              {/* Mobile Profile Card */}
              <div className="mt-auto pt-4 border-t border-slate-200 dark:border-white/10 space-y-2">
                <NavLink
                  to="/dashboard/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block p-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar 
                      avatarUrl={user?.avatar_url}
                      name={displayName()}
                      email={user?.email}
                      size="sm"
                    />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{displayName()}</p>
                      <p className="text-xs text-primary flex items-center gap-1">Edit Profile <Pencil className="w-2.5 h-2.5" /></p>
                    </div>
                  </div>
                </NavLink>

                <button 
                  onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all text-xs font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)}></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
