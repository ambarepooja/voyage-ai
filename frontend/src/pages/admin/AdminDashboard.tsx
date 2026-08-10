import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { 
  Users, 
  Map, 
  CreditCard, 
  Hotel, 
  ShieldCheck, 
  Activity, 
  ArrowUpRight, 
  ChevronRight, 
  UserCheck, 
  Plane, 
  Download
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    activeUsers: 0,
    trips: 0,
    expenses: 0,
    totalExpensesAmount: 0,
    hotelBookings: 0,
    flightBookings: 0,
    totalRevenue: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, tripsRes, expensesRes, hotelsRes, flightsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/trips'),
          api.get('/admin/expenses'),
          api.get('/admin/hotel-bookings').catch(() => ({ data: [] })),
          api.get('/admin/flight-bookings').catch(() => ({ data: [] }))
        ]);

        const expensesList = expensesRes.data || [];
        const hotelsList = hotelsRes.data || [];
        const flightsList = flightsRes.data || [];

        const activeCount = usersRes.data.filter((u: any) => u.is_active).length;
        const totalAmount = expensesList.reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);
        const confirmedHotels = hotelsList.filter((h: any) => h.status === 'confirmed');
        const confirmedFlights = flightsList.filter((f: any) => f.status === 'confirmed');
        const hotelsTotal = confirmedHotels.reduce((sum: number, h: any) => sum + Number(h.total_price || 0), 0);
        const flightsTotal = confirmedFlights.reduce((sum: number, f: any) => sum + Number(f.ticket_price || 0), 0);

        setStats({
          users: usersRes.data.length,
          activeUsers: activeCount,
          trips: tripsRes.data.length,
          expenses: expensesList.length,
          totalExpensesAmount: totalAmount,
          hotelBookings: confirmedHotels.length,
          flightBookings: confirmedFlights.length,
          totalRevenue: hotelsTotal + flightsTotal
        });
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleExportCSV = () => {
    const csvRows = [
      ['Metric', 'Value'],
      ['Total Users', stats.users],
      ['Active Accounts', stats.activeUsers],
      ['Total Trips Planned', stats.trips],
      ['Total Recorded Expenses', stats.totalExpensesAmount],
      ['Hotel Reservations', stats.hotelBookings],
      ['Flight Bookings', stats.flightBookings],
      ['Total Platform Booking Volume', stats.totalRevenue]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `voyage_admin_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statCards = [
    { 
      title: 'Total Registered Users', 
      value: stats.users, 
      subtitle: `${stats.activeUsers} Active Accounts`,
      icon: Users, 
      color: 'from-blue-600/20 to-cyan-500/10 dark:from-blue-600/30 dark:to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      iconBg: 'bg-blue-500/20 text-blue-500 dark:text-blue-400',
      link: '/admin/users'
    },
    { 
      title: 'Planned Journeys', 
      value: stats.trips, 
      subtitle: 'Across all travelers',
      icon: Map, 
      color: 'from-purple-600/20 to-pink-500/10 dark:from-purple-600/30 dark:to-pink-500/20',
      borderColor: 'border-purple-500/30',
      iconBg: 'bg-purple-500/20 text-purple-500 dark:text-purple-400',
      link: '/admin/trips'
    },
    { 
      title: 'Flight Bookings', 
      value: stats.flightBookings, 
      subtitle: `${stats.flightBookings} Boarding Passes Issued`,
      icon: Plane, 
      color: 'from-sky-600/20 to-indigo-500/10 dark:from-sky-600/30 dark:to-indigo-500/20',
      borderColor: 'border-sky-500/30',
      iconBg: 'bg-sky-500/20 text-sky-500 dark:text-sky-400',
      link: '/admin/flights'
    },
    { 
      title: 'Hotel Reservations', 
      value: stats.hotelBookings, 
      subtitle: `${stats.hotelBookings} Confirmed Stays`,
      icon: Hotel, 
      color: 'from-amber-600/20 to-orange-500/10 dark:from-amber-600/30 dark:to-orange-500/20',
      borderColor: 'border-amber-500/30',
      iconBg: 'bg-amber-500/20 text-amber-500 dark:text-amber-400',
      link: '/admin/hotels'
    },
  ];

  const quickNavs = [
    { title: 'Manage Users & Permissions', desc: 'Activate, suspend, promote or delete user accounts.', icon: Users, path: '/admin/users', color: 'text-blue-500 dark:text-blue-400' },
    { title: 'User Trips & Itineraries', desc: 'Create, modify and audit journeys for separate users.', icon: Map, path: '/admin/trips', color: 'text-purple-500 dark:text-purple-400' },
    { title: 'Commercial Flight Tickets', desc: 'Audit airline tickets, boarding passes, and routes.', icon: Plane, path: '/admin/flights', color: 'text-sky-500 dark:text-sky-400' },
    { title: 'Hotel Stays & Reservations', desc: 'Review confirmed accommodations and guest reservations.', icon: Hotel, path: '/admin/hotels', color: 'text-amber-500 dark:text-amber-400' },
    { title: 'User Expenses & Budgets', desc: 'Track spending breakdown and log expenses per user.', icon: CreditCard, path: '/admin/expenses', color: 'text-emerald-500 dark:text-emerald-400' },
    { title: 'User Contact Profiles', desc: 'Inspect names, emails, and contact details.', icon: UserCheck, path: '/admin/profiles', color: 'text-pink-500 dark:text-pink-400' },
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/15 text-red-500 dark:text-red-400 rounded-2xl border border-red-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">System Control Center</h1>
          </div>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Live analytics, verified platform transactions, booking volume, and governance.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={handleExportCSV}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white border border-slate-200 dark:border-white/15 rounded-2xl px-4 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Export CSV Report
          </Button>

          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-full text-xs font-bold text-green-600 dark:text-green-300">
            <Activity className="w-4 h-4 animate-pulse text-green-500 dark:text-green-400" /> Real-time Telemetry • Active
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            onClick={() => navigate(stat.link)}
            className={`bg-gradient-to-br ${stat.color} bg-white dark:bg-transparent border ${stat.borderColor} p-6 rounded-3xl backdrop-blur-xl shadow-lg shadow-slate-200/50 dark:shadow-none hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.iconBg} border border-slate-200/40 dark:border-white/10 shadow-sm`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
            </div>
            
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-300">{stat.title}</p>
            <p className="text-4xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{isLoading ? '...' : stat.value}</p>
            <p className="text-xs text-slate-500 dark:text-gray-300 mt-2 font-medium">{stat.subtitle}</p>
          </motion.div>
        ))}
      </div>

      {/* Management Modules Grid */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Management Modules</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickNavs.map((nav, idx) => (
            <motion.div
              key={nav.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.06 }}
              onClick={() => navigate(nav.path)}
              className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 p-6 rounded-3xl backdrop-blur-md cursor-pointer group flex justify-between items-center transition-all hover:bg-slate-50 dark:hover:bg-white/10 shadow-lg shadow-slate-200/40 dark:shadow-none"
            >
              <div className="flex items-start gap-4">
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 group-hover:border-primary/40 transition-colors">
                  <nav.icon className={`w-6 h-6 ${nav.color}`} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{nav.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 max-w-[200px]">{nav.desc}</p>
                </div>
              </div>

              <div className="p-2 rounded-full bg-slate-100 dark:bg-white/5 group-hover:bg-primary group-hover:text-white transition-colors text-slate-400 dark:text-gray-400">
                <ChevronRight className="w-5 h-5" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
