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
    <div className="min-h-screen bg-black text-white flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white/5 backdrop-blur-2xl border-r border-white/10 p-6 h-screen relative z-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary/20 p-2 rounded-xl">
            <Plane className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Voyage AI</h1>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)] font-bold' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
          
          {user?.is_superuser && (
            <NavLink
              to="/admin"
              className={({ isActive }) => 
                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)] font-bold' 
                    : 'text-gray-400 hover:text-red-400 hover:bg-white/10'
                }`
              }
            >
              <ShieldAlert className="w-5 h-5" />
              <span className="font-medium">Admin Panel</span>
            </NavLink>
          )}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/10 space-y-2">
          {/* Interactive Clickable User Profile Card */}
          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) => 
              `group block p-3 rounded-2xl border transition-all ${
                isActive 
                  ? 'bg-primary/25 border-primary shadow-lg shadow-primary/20' 
                  : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
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
                <p className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
                  {displayName()}
                </p>
                <p className="text-xs text-gray-400 truncate flex items-center gap-1">
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
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Topbar */}
        <header className="h-20 flex items-center justify-between md:justify-end px-6 lg:px-10 border-b border-white/10 bg-black/90 z-10">
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-4">
            {/* Quick Profile Nav Link in Header */}
            <NavLink
              to="/dashboard/profile"
              className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-2xl transition-all text-xs text-gray-300 hover:text-white"
            >
              <UserAvatar 
                avatarUrl={user?.avatar_url}
                name={displayName()}
                email={user?.email}
                size="xs"
              />
              <span className="font-semibold hidden sm:inline">{displayName()}</span>
              <Pencil className="w-3 h-3 text-primary hidden sm:inline" />
            </NavLink>

            <button className="relative text-gray-300 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5">
              <Bell className="w-5 h-5" />
              <span className="absolute 1.5 1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-black"></span>
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden flex"
          >
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="w-72 bg-gray-900 border-r border-white/10 p-6 h-full flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 p-2 rounded-xl">
                    <Plane className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight">Voyage AI</h1>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <nav className="flex-1 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => 
                      `flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-primary/20 text-primary font-bold' 
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                ))}
                
                {user?.is_superuser && (
                  <NavLink
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => 
                      `flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-red-500/20 text-red-400 font-bold' 
                          : 'text-gray-400 hover:text-red-400 hover:bg-white/10'
                      }`
                    }
                  >
                    <ShieldAlert className="w-5 h-5" />
                    <span className="font-medium">Admin Panel</span>
                  </NavLink>
                )}
              </nav>

              {/* Mobile Profile Card */}
              <div className="mt-auto pt-4 border-t border-white/10 space-y-2">
                <NavLink
                  to="/dashboard/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block p-3 rounded-2xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar 
                      avatarUrl={user?.avatar_url}
                      name={displayName()}
                      email={user?.email}
                      size="sm"
                    />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-white truncate">{displayName()}</p>
                      <p className="text-xs text-primary flex items-center gap-1">Edit Profile <Pencil className="w-2.5 h-2.5" /></p>
                    </div>
                  </div>
                </NavLink>

                <button 
                  onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-xs font-semibold"
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
