import { useEffect, useState, useMemo } from 'react';
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
  Download, 
  TrendingUp, 
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface RawExpense {
  id: number;
  amount: number;
  category: string;
  date?: string;
}

interface RawHotel {
  id: number;
  total_price: number;
  check_in_date?: string;
  created_at?: string;
}

interface RawFlight {
  id: number;
  ticket_price: number;
  departure_date?: string;
  created_at?: string;
}

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

  const [expensesData, setExpensesData] = useState<RawExpense[]>([]);
  const [hotelsData, setHotelsData] = useState<RawHotel[]>([]);
  const [flightsData, setFlightsData] = useState<RawFlight[]>([]);
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

        const expensesList: RawExpense[] = expensesRes.data || [];
        const hotelsList: RawHotel[] = hotelsRes.data || [];
        const flightsList: RawFlight[] = flightsRes.data || [];

        const activeCount = usersRes.data.filter((u: any) => u.is_active).length;
        const totalAmount = expensesList.reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);
        const confirmedHotels = hotelsList.filter((h: any) => h.status === 'confirmed');
        const confirmedFlights = flightsList.filter((f: any) => f.status === 'confirmed');
        const hotelsTotal = confirmedHotels.reduce((sum: number, h: any) => sum + Number(h.total_price || 0), 0);
        const flightsTotal = confirmedFlights.reduce((sum: number, f: any) => sum + Number(f.ticket_price || 0), 0);

        setExpensesData(expensesList);
        setHotelsData(hotelsList);
        setFlightsData(flightsList);

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

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // 1. Dynamic Expense Category Calculation from Real Database Records
  const categoryStats = useMemo(() => {
    const categoriesMap: Record<string, number> = {
      'Accommodation': 0,
      'Transportation': 0,
      'Food & Dining': 0,
      'Activities & Tours': 0,
      'General / Other': 0
    };

    expensesData.forEach((e) => {
      const cat = (e.category || '').toLowerCase();
      const amt = Number(e.amount || 0);

      if (cat.includes('accommodation') || cat.includes('hotel') || cat.includes('resort') || cat.includes('stay')) {
        categoriesMap['Accommodation'] += amt;
      } else if (cat.includes('transport') || cat.includes('flight') || cat.includes('airline') || cat.includes('cab') || cat.includes('train')) {
        categoriesMap['Transportation'] += amt;
      } else if (cat.includes('food') || cat.includes('dining') || cat.includes('restaurant') || cat.includes('meal') || cat.includes('cafe')) {
        categoriesMap['Food & Dining'] += amt;
      } else if (cat.includes('activit') || cat.includes('tour') || cat.includes('sightseeing') || cat.includes('adventure') || cat.includes('ticket')) {
        categoriesMap['Activities & Tours'] += amt;
      } else {
        categoriesMap['General / Other'] += amt;
      }
    });

    const total = stats.totalExpensesAmount > 0 
      ? stats.totalExpensesAmount 
      : Object.values(categoriesMap).reduce((a, b) => a + b, 0);

    const colors: Record<string, string> = {
      'Accommodation': 'bg-amber-400',
      'Transportation': 'bg-primary',
      'Food & Dining': 'bg-emerald-400',
      'Activities & Tours': 'bg-purple-400',
      'General / Other': 'bg-blue-400'
    };

    return Object.entries(categoriesMap).map(([name, amount]) => {
      const percent = total > 0 ? Math.round((amount / total) * 100) : 0;
      return {
        name,
        amount,
        percent,
        color: colors[name] || 'bg-gray-400'
      };
    });
  }, [expensesData, stats.totalExpensesAmount]);

  // 2. Dynamic Monthly Booking & Revenue Volume Calculation (Past 6 Months)
  const monthlyTrends = useMemo(() => {
    const months: { label: string; key: string; value: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      const monthIndex = d.getMonth(); // 0-11
      const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

      months.push({
        label: i === 0 ? `${monthLabel} (Current)` : monthLabel,
        key,
        value: 0
      });
    }

    // Helper to check which month a date string falls into
    const addToMonth = (dateStr?: string, amount = 0) => {
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const target = months.find(m => m.key === key);
      if (target) {
        target.value += amount;
      } else if (months.length > 0) {
        // If outside window or current month, add to the current active month
        months[months.length - 1].value += amount;
      }
    };

    hotelsData.filter(h => (h as any).status === 'confirmed').forEach(h => addToMonth(h.check_in_date || h.created_at, Number(h.total_price || 0)));
    flightsData.filter(f => (f as any).status === 'confirmed').forEach(f => addToMonth(f.departure_date || f.created_at, Number(f.ticket_price || 0)));
    expensesData.forEach(e => addToMonth(e.date, Number(e.amount || 0)));

    const maxValue = Math.max(...months.map(m => m.value), 1);

    return months.map(m => {
      const heightPercent = m.value > 0 ? Math.max(Math.round((m.value / maxValue) * 100), 12) : 6;
      return {
        month: m.label,
        value: m.value,
        height: `${heightPercent}%`
      };
    });
  }, [hotelsData, flightsData, expensesData]);

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
      color: 'from-blue-600/30 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      iconBg: 'bg-blue-500/20 text-blue-400',
      link: '/admin/users'
    },
    { 
      title: 'Planned Journeys', 
      value: stats.trips, 
      subtitle: 'Across all travelers',
      icon: Map, 
      color: 'from-purple-600/30 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      iconBg: 'bg-purple-500/20 text-purple-400',
      link: '/admin/trips'
    },
    { 
      title: 'Flight Bookings', 
      value: stats.flightBookings, 
      subtitle: `${stats.flightBookings} Boarding Passes Issued`,
      icon: Plane, 
      color: 'from-sky-600/30 to-indigo-500/20',
      borderColor: 'border-sky-500/30',
      iconBg: 'bg-sky-500/20 text-sky-400',
      link: '/admin/flights'
    },
    { 
      title: 'Hotel Reservations', 
      value: stats.hotelBookings, 
      subtitle: `${stats.hotelBookings} Confirmed Stays`,
      icon: Hotel, 
      color: 'from-amber-600/30 to-orange-500/20',
      borderColor: 'border-amber-500/30',
      iconBg: 'bg-amber-500/20 text-amber-400',
      link: '/admin/hotels'
    },
  ];

  const quickNavs = [
    { title: 'Manage Users & Permissions', desc: 'Activate, suspend, promote or delete user accounts.', icon: Users, path: '/admin/users', color: 'text-blue-400' },
    { title: 'User Trips & Itineraries', desc: 'Create, modify and audit journeys for separate users.', icon: Map, path: '/admin/trips', color: 'text-purple-400' },
    { title: 'Commercial Flight Tickets', desc: 'Audit airline tickets, boarding passes, and routes.', icon: Plane, path: '/admin/flights', color: 'text-sky-400' },
    { title: 'Hotel Stays & Reservations', desc: 'Review confirmed accommodations and guest reservations.', icon: Hotel, path: '/admin/hotels', color: 'text-amber-400' },
    { title: 'User Expenses & Budgets', desc: 'Track spending breakdown and log expenses per user.', icon: CreditCard, path: '/admin/expenses', color: 'text-emerald-400' },
    { title: 'User Contact Profiles', desc: 'Inspect names, emails, and contact details.', icon: UserCheck, path: '/admin/profiles', color: 'text-pink-400' },
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/20 rounded-xl border border-primary/30">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">System Control Center</h1>
          </div>
          <p className="text-gray-400 text-sm mt-1">Live analytics, verified platform transactions, booking volume, and governance.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={handleExportCSV}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-2xl px-4 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Export CSV Report
          </Button>

          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-full text-xs font-semibold text-green-300">
            <Activity className="w-4 h-4 animate-pulse text-green-400" /> Real-time Telemetry • Active
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
            className={`bg-gradient-to-br ${stat.color} border ${stat.borderColor} p-6 rounded-3xl backdrop-blur-xl shadow-xl hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.iconBg} border border-white/10`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </div>
            
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-300">{stat.title}</p>
            <p className="text-4xl font-extrabold text-white mt-1 tracking-tight">{isLoading ? '...' : stat.value}</p>
            <p className="text-xs text-gray-300 mt-2 font-medium">{stat.subtitle}</p>
          </motion.div>
        ))}
      </div>

      {/* Visual Analytics & Growth Trends Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Monthly Revenue Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl shadow-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Monthly Booking Volume & Travel Growth</h3>
                  <p className="text-xs text-gray-400">Calculated from actual flights, hotels, and ledger expenses</p>
                </div>
              </div>

              <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Live Data
              </span>
            </div>

            {/* Dynamic Calculated Bar Chart */}
            <div className="h-52 w-full flex items-end justify-between gap-3 pt-6 px-2 border-b border-white/10">
              {monthlyTrends.map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[11px] font-extrabold text-emerald-400 opacity-90 transition-opacity whitespace-nowrap">
                    {bar.value > 0 ? formatINR(bar.value) : '₹0'}
                  </span>
                  
                  <div 
                    className="w-full max-w-[48px] bg-gradient-to-t from-primary/60 to-emerald-400 rounded-t-xl transition-all duration-700 group-hover:brightness-125 shadow-lg relative min-h-[8px]"
                    style={{ height: bar.height }}
                  >
                    {bar.value > 0 && (
                      <div className="absolute inset-0 bg-white/20 rounded-t-xl animate-pulse" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-gray-400 mt-2 text-center">{bar.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 text-xs text-gray-400 border-t border-white/5 mt-4">
            <span>Aggregated Platform Gross Volume:</span>
            <span className="text-white font-extrabold text-sm">{formatINR(stats.totalRevenue + stats.totalExpensesAmount)}</span>
          </div>
        </motion.div>

        {/* Dynamic Expense Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl shadow-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Expense Categories</h3>
                <p className="text-xs text-gray-400">Real percentage distribution across categories</p>
              </div>
            </div>

            <div className="space-y-4 my-6">
              {categoryStats.map((c) => (
                <div key={c.name}>
                  <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1">
                    <span>{c.name}</span>
                    <span className="text-gray-400 font-mono">
                      {c.amount > 0 ? `${formatINR(c.amount)} (${c.percent}%)` : '₹0 (0%)'}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className={`h-full ${c.color} rounded-full transition-all duration-700`} 
                      style={{ width: `${Math.max(c.percent, c.amount > 0 ? 5 : 0)}%` }} 
                    />
                  </div>
                </div>
              ))}

              {stats.totalExpensesAmount === 0 && (
                <p className="text-[11px] text-gray-500 text-center py-2 italic">
                  No user expenses recorded yet. As travelers log costs, category progress bars will compute dynamically.
                </p>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
            <span className="text-gray-400">Total Tracked Ledger:</span>
            <span className="text-emerald-400 font-extrabold">{formatINR(stats.totalExpensesAmount)}</span>
          </div>
        </motion.div>
      </div>

      {/* Quick Navigation Cards */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6">Management Modules</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickNavs.map((nav, idx) => (
            <motion.div
              key={nav.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.06 }}
              onClick={() => navigate(nav.path)}
              className="bg-white/5 border border-white/10 hover:border-white/20 p-6 rounded-3xl backdrop-blur-md cursor-pointer group flex justify-between items-center transition-all hover:bg-white/10 shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 group-hover:border-primary/40 transition-colors">
                  <nav.icon className={`w-6 h-6 ${nav.color}`} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors">{nav.title}</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-[200px]">{nav.desc}</p>
                </div>
              </div>

              <div className="p-2 rounded-full bg-white/5 group-hover:bg-primary group-hover:text-white transition-colors text-gray-400">
                <ChevronRight className="w-5 h-5" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
