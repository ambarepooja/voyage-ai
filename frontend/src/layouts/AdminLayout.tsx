import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Map, LogOut, CreditCard, Contact2, KeyRound, Bell, MapPin, Hotel, Plane } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserAvatar } from '../components/UserAvatar';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-64 bg-white/5 border-r border-white/10 flex flex-col"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
            Admin Panel
          </h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-white border border-red-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-white/10 space-y-3">
          <Link
            to="/dashboard/profile"
            className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
            title="Edit My Profile"
          >
            <UserAvatar 
              avatarUrl={user?.avatar_url}
              name={`${user?.first_name || ''} ${user?.last_name || ''}`.trim()}
              email={user?.email}
              size="sm"
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-white truncate group-hover:text-red-400 transition-colors">
                {user?.first_name || user?.last_name ? `${user?.first_name || ''} ${user?.last_name || ''}`.trim() : user?.email?.split('@')[0]}
              </p>
              <p className="text-[10px] text-red-400 font-semibold uppercase tracking-wider">Administrator</p>
            </div>
          </Link>

          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-2.5 w-full rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-black to-red-900/20 relative">
        <div className="p-8 z-10 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
