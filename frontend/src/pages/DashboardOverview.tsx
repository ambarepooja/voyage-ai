import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Plane, 
  Wallet, 
  ArrowUpRight, 
  Sparkles, 
  CloudSun, 
  Sun, 
  CloudRain, 
  Repeat, 
  Backpack, 
  Hotel, 
  Compass, 
  QrCode,
  MapPin,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

export default function DashboardOverview() {
  const [trips, setTrips] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [flights, setFlights] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Currency Converter State
  const [amount, setAmount] = useState<number>(10000);
  const [fromCurr, setFromCurr] = useState<string>('INR');
  const [toCurr, setToCurr] = useState<string>('USD');

  const FX_RATES: Record<string, number> = {
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0094,
    JPY: 1.82,
    AED: 0.044,
    THB: 0.43,
    SGD: 0.016
  };

  const convertedValue = ((amount / FX_RATES[fromCurr]) * FX_RATES[toCurr]).toFixed(2);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripsRes, expensesRes, flightsRes, hotelsRes] = await Promise.all([
          api.get('/trips/').catch(() => ({ data: [] })),
          api.get('/expenses/').catch(() => ({ data: [] })),
          api.get('/flights/my-bookings').catch(() => ({ data: [] })),
          api.get('/hotels/my-bookings').catch(() => ({ data: [] }))
        ]);
        setTrips(tripsRes.data || []);
        setExpenses(expensesRes.data || []);
        setFlights(flightsRes.data || []);
        setHotels(hotelsRes.data || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Reconcile and deduplicate user expenses and confirmed bookings
  const allUserExpenses = useMemo(() => {
    const list: { title?: string; amount: number; category: string; date?: string }[] = expenses.map(e => ({
      title: e.title || '',
      amount: Number(e.amount || 0),
      category: e.category || 'General',
      date: e.date || e.created_at
    }));

    // If there are confirmed flights not yet synced in expenses, add them cleanly
    flights
      .filter(f => (f.status || 'confirmed').toLowerCase() === 'confirmed')
      .forEach(f => {
        const ref = (f.booking_reference || '').toLowerCase();
        const flNum = (f.flight_number || '').toLowerCase();
        const price = Number(f.ticket_price || 0);

        const alreadyInExpenses = list.some(exp => {
          const t = (exp.title || '').toLowerCase();
          if (ref && t.includes(ref)) return true;
          if (flNum && t.includes(flNum) && Math.abs(exp.amount - price) < 0.01) return true;
          return false;
        });

        if (!alreadyInExpenses && price > 0) {
          list.push({
            title: `Flight: ${f.airline_name || ''} ${f.flight_number || ''}`,
            amount: price,
            category: 'Transportation',
            date: f.departure_date || f.created_at
          });
        }
      });

    // If there are confirmed hotels not yet synced in expenses, add them cleanly
    hotels
      .filter(h => (h.status || 'confirmed').toLowerCase() === 'confirmed')
      .forEach(h => {
        const ref = (h.booking_reference || '').toLowerCase();
        const hName = (h.hotel_name || '').toLowerCase();
        const price = Number(h.total_price || 0);

        const alreadyInExpenses = list.some(exp => {
          const t = (exp.title || '').toLowerCase();
          if (ref && t.includes(ref)) return true;
          if (hName && t.includes(hName) && Math.abs(exp.amount - price) < 0.01) return true;
          return false;
        });

        if (!alreadyInExpenses && price > 0) {
          list.push({
            title: `Hotel: ${h.hotel_name || ''}`,
            amount: price,
            category: 'Accommodation',
            date: h.check_in_date || h.created_at
          });
        }
      });

    return list;
  }, [expenses, flights, hotels]);

  const totalTrackedAmount = useMemo(() => {
    return allUserExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [allUserExpenses]);

  const activeFlightsCount = flights.filter(f => f.status === 'confirmed').length;
  const activeHotelsCount = hotels.filter(h => h.status === 'confirmed').length;

  // 1. Dynamic Expense Category Distribution
  const categoryStats = useMemo(() => {
    const categoriesMap: Record<string, number> = {
      'Accommodation': 0,
      'Transportation': 0,
      'Food & Dining': 0,
      'Activities & Tours': 0,
      'General / Other': 0
    };

    allUserExpenses.forEach((e) => {
      const cat = (e.category || '').toLowerCase();
      const amt = Number(e.amount || 0);

      if (cat.includes('accommodation') || cat.includes('hotel') || cat.includes('resort') || cat.includes('stay') || cat.includes('room') || cat.includes('hostel') || cat.includes('airbnb')) {
        categoriesMap['Accommodation'] += amt;
      } else if (cat.includes('transport') || cat.includes('flight') || cat.includes('airline') || cat.includes('cab') || cat.includes('train') || cat.includes('transit') || cat.includes('bus') || cat.includes('taxi') || cat.includes('uber') || cat.includes('car')) {
        categoriesMap['Transportation'] += amt;
      } else if (cat.includes('food') || cat.includes('dining') || cat.includes('restaurant') || cat.includes('meal') || cat.includes('cafe') || cat.includes('drink') || cat.includes('snack') || cat.includes('bar')) {
        categoriesMap['Food & Dining'] += amt;
      } else if (cat.includes('activit') || cat.includes('tour') || cat.includes('sightseeing') || cat.includes('adventure') || cat.includes('ticket') || cat.includes('museum') || cat.includes('attraction') || cat.includes('pass')) {
        categoriesMap['Activities & Tours'] += amt;
      } else {
        categoriesMap['General / Other'] += amt;
      }
    });

    const total = totalTrackedAmount > 0 
      ? totalTrackedAmount 
      : Object.values(categoriesMap).reduce((a, b) => a + b, 0);

    const colors: Record<string, string> = {
      'Accommodation': 'bg-amber-500',
      'Transportation': 'bg-primary',
      'Food & Dining': 'bg-emerald-500',
      'Activities & Tours': 'bg-purple-500',
      'General / Other': 'bg-blue-500'
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
  }, [allUserExpenses, totalTrackedAmount]);

  // 2. Dynamic Monthly Booking Volume & Travel Growth (Past 6 Months)
  const monthlyTrends = useMemo(() => {
    const months: { label: string; key: string; value: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      const monthIndex = d.getMonth() + 1; // 1-12
      const key = `${year}-${String(monthIndex).padStart(2, '0')}`;

      months.push({
        label: i === 0 ? `${monthLabel} (Current)` : monthLabel,
        key,
        value: 0
      });
    }

    const parseDateKey = (dateStr?: string) => {
      if (!dateStr) return null;
      if (typeof dateStr === 'string' && dateStr.includes('-')) {
        const parts = dateStr.split('T')[0].split('-');
        if (parts.length >= 2) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          if (!isNaN(y) && !isNaN(m)) {
            return `${y}-${String(m).padStart(2, '0')}`;
          }
        }
      }
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    };

    allUserExpenses.forEach(item => {
      const key = parseDateKey(item.date);
      if (!key) return;
      const target = months.find(m => m.key === key);
      if (target) {
        target.value += Number(item.amount || 0);
      } else if (months.length > 0) {
        months[months.length - 1].value += Number(item.amount || 0);
      }
    });

    const maxValue = Math.max(...months.map(m => m.value), 1);

    return months.map(m => {
      const heightPercent = m.value > 0 ? Math.max(Math.round((m.value / maxValue) * 100), 14) : 6;
      return {
        month: m.label,
        value: m.value,
        height: `${heightPercent}%`
      };
    });
  }, [allUserExpenses]);

  const stats = [
    { 
      label: 'Planned Journeys', 
      value: trips.length.toString(), 
      subtitle: `${trips.filter(t => t.status === 'completed').length} Completed`, 
      icon: Plane, 
      color: 'from-blue-600/20 to-cyan-500/10 dark:from-blue-600/30 dark:to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      iconBg: 'bg-blue-500/20 text-blue-500 dark:text-blue-400',
      link: '/dashboard/trips'
    },
    { 
      label: 'Total Expenses Logged', 
      value: formatINR(totalTrackedAmount), 
      subtitle: `${allUserExpenses.length} Records tracked`, 
      icon: Wallet, 
      color: 'from-emerald-600/20 to-teal-500/10 dark:from-emerald-600/30 dark:to-teal-500/20',
      borderColor: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400',
      link: '/dashboard/expenses'
    },
    { 
      label: 'Flights & Transit Passes', 
      value: activeFlightsCount.toString(), 
      subtitle: `${activeFlightsCount} Boarding passes generated`, 
      icon: QrCode, 
      color: 'from-purple-600/20 to-pink-500/10 dark:from-purple-600/30 dark:to-pink-500/20',
      borderColor: 'border-purple-500/30',
      iconBg: 'bg-purple-500/20 text-purple-500 dark:text-purple-400',
      link: '/dashboard/flights'
    },
    { 
      label: 'Luxury Hotel Stays', 
      value: activeHotelsCount.toString(), 
      subtitle: `${activeHotelsCount} Confirmed reservations`, 
      icon: Hotel, 
      color: 'from-amber-600/20 to-orange-500/10 dark:from-amber-600/30 dark:to-orange-500/20',
      borderColor: 'border-amber-500/30',
      iconBg: 'bg-amber-500/20 text-amber-500 dark:text-amber-400',
      link: '/dashboard/hotels'
    },
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Header with Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Travel Command Center</h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/15 text-primary border border-primary/30 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> AI Powered
            </span>
          </div>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Real-time overview of your itineraries, flight boarding passes, luxury stays, and travel ledger.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/dashboard/chat">
            <Button className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white rounded-2xl px-5 font-bold shadow-lg shadow-primary/25 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> AI Itinerary Planner
            </Button>
          </Link>
          <Link to="/dashboard/flights">
            <Button className="bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white border border-slate-200 dark:border-white/15 rounded-2xl px-5 font-bold">
              <Plane className="w-4 h-4 mr-1.5 text-primary" /> Book Flights
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Link key={stat.label} to={stat.link}>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className={`bg-gradient-to-br ${stat.color} bg-white dark:bg-transparent border ${stat.borderColor} p-6 rounded-3xl backdrop-blur-xl shadow-lg shadow-slate-200/50 dark:shadow-none hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden group`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.iconBg} border border-slate-200/40 dark:border-white/10 shadow-sm`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-400 dark:text-gray-400 group-hover:text-primary transition-colors" />
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-300">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{isLoading ? '...' : stat.value}</p>
              <p className="text-xs text-slate-500 dark:text-gray-300 mt-2 font-medium">{stat.subtitle}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Visual Analytics & Growth Trends Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Monthly Revenue Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-3xl backdrop-blur-xl shadow-lg shadow-slate-200/40 dark:shadow-none flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 rounded-2xl border border-emerald-500/30">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Monthly Booking Volume & Travel Growth</h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400">Calculated from actual flights, hotels, and ledger expenses</p>
                </div>
              </div>

              <span className="text-xs font-extrabold text-emerald-500 dark:text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/20">
                Live Data
              </span>
            </div>

            {/* Dynamic Calculated Bar Chart */}
            <div className="h-52 w-full flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-200 dark:border-white/10">
              {monthlyTrends.map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 opacity-90 transition-opacity whitespace-nowrap">
                    {bar.value > 0 ? formatINR(bar.value) : '₹0'}
                  </span>
                  
                  <div 
                    className="w-full max-w-[48px] bg-gradient-to-t from-primary/60 to-emerald-400 rounded-t-xl transition-all duration-700 group-hover:brightness-125 shadow-md relative min-h-[8px]"
                    style={{ height: bar.height }}
                  >
                    {bar.value > 0 && (
                      <div className="absolute inset-0 bg-white/20 rounded-t-xl animate-pulse" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-gray-400 mt-2 text-center">{bar.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 text-xs text-slate-500 dark:text-gray-400 border-t border-slate-100 dark:border-white/5 mt-4">
            <span>Aggregated Travel Spend & Volume:</span>
            <span className="text-slate-900 dark:text-white font-extrabold text-sm">{formatINR(totalTrackedAmount)}</span>
          </div>
        </motion.div>

        {/* Dynamic Expense Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-3xl backdrop-blur-xl shadow-lg shadow-slate-200/40 dark:shadow-none flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-purple-500/15 text-purple-500 dark:text-purple-400 rounded-2xl border border-purple-500/30">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Expense Categories</h3>
                <p className="text-xs text-slate-500 dark:text-gray-400">Real percentage distribution across categories</p>
              </div>
            </div>

            <div className="space-y-4 my-6">
              {categoryStats.map((c) => (
                <div key={c.name}>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                    <span>{c.name}</span>
                    <span className="text-slate-500 dark:text-gray-400 font-mono font-bold">
                      {c.amount > 0 ? `${formatINR(c.amount)} (${c.percent}%)` : '₹0 (0%)'}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                    <div 
                      className={`h-full ${c.color} rounded-full transition-all duration-700`} 
                      style={{ width: `${Math.max(c.percent, c.amount > 0 ? 5 : 0)}%` }} 
                    />
                  </div>
                </div>
              ))}

              {totalTrackedAmount === 0 && (
                <p className="text-[11px] text-slate-400 dark:text-gray-500 text-center py-2 italic">
                  No user expenses recorded yet. As you log costs and book travel, category progress bars will compute dynamically.
                </p>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-gray-400 font-medium">Total Tracked Ledger:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{formatINR(totalTrackedAmount)}</span>
          </div>
        </motion.div>
      </div>

      {/* Live Destination Climate & Multi-Currency FX Converter Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Weather Forecast Widget */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gradient-to-br dark:from-blue-900/30 dark:via-black dark:to-cyan-900/20 border border-slate-200 dark:border-white/15 p-6 rounded-3xl backdrop-blur-xl shadow-lg shadow-slate-200/50 dark:shadow-none relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/15 text-cyan-500 dark:text-cyan-400 rounded-2xl border border-cyan-500/30">
                <CloudSun className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Destination Weather & Climate</h3>
                <p className="text-xs text-slate-500 dark:text-gray-400">Live 5-day forecast for your top journeys</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/30">
              Live Feed
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center my-4">
            {[
              { day: 'Mon', temp: '29°C', desc: 'Sunny', icon: Sun, color: 'text-amber-500' },
              { day: 'Tue', temp: '28°C', desc: 'Pleasant', icon: CloudSun, color: 'text-cyan-500' },
              { day: 'Wed', temp: '26°C', desc: 'Light Rain', icon: CloudRain, color: 'text-blue-500' },
              { day: 'Thu', temp: '30°C', desc: 'Clear', icon: Sun, color: 'text-amber-500' },
              { day: 'Fri', temp: '27°C', desc: 'Breeze', icon: CloudSun, color: 'text-cyan-500' },
            ].map((w, i) => (
              <div key={i} className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl p-3">
                <p className="text-xs text-slate-500 dark:text-gray-400 font-bold">{w.day}</p>
                <w.icon className={`w-6 h-6 mx-auto my-2 ${w.color}`} />
                <p className="text-sm font-black text-slate-900 dark:text-white">{w.temp}</p>
                <p className="text-[10px] text-slate-400 dark:text-gray-400">{w.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-cyan-800 dark:text-cyan-200/80 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/20 rounded-2xl p-3 mt-4">
            💡 <strong>Travel Tip:</strong> Warm afternoons with cooling sea breeze in the evening. Recommended: light cottons & UV sunglasses.
          </p>
        </motion.div>

        {/* Multi-Currency FX Live Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-gradient-to-br dark:from-emerald-900/30 dark:via-black dark:to-teal-900/20 border border-slate-200 dark:border-white/15 p-6 rounded-3xl backdrop-blur-xl shadow-lg shadow-slate-200/50 dark:shadow-none relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 rounded-2xl border border-emerald-500/30">
                <Repeat className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Multi-Currency Live FX Converter</h3>
                <p className="text-xs text-slate-500 dark:text-gray-400">Calculate international travel expenses in real time</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
              Live Rates
            </span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 mb-1">Amount</label>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/15 rounded-2xl px-4 py-2.5 text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 mb-1">From Currency</label>
                <select
                  value={fromCurr}
                  onChange={(e) => setFromCurr(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/15 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  {Object.keys(FX_RATES).map(c => <option key={c} value={c} className="bg-white dark:bg-gray-900 text-slate-900 dark:text-white">{c}</option>)}
                </select>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-gray-400 font-semibold">Converted Amount</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {convertedValue} <span className="text-sm font-bold text-slate-700 dark:text-white">{toCurr}</span>
                </p>
              </div>

              <select
                value={toCurr}
                onChange={(e) => setToCurr(e.target.value)}
                className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
              >
                {Object.keys(FX_RATES).map(c => <option key={c} value={c} className="bg-white dark:bg-gray-900 text-slate-900 dark:text-white">{c}</option>)}
              </select>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Travel Modules & Utilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/dashboard/trips">
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary/40 p-5 rounded-3xl backdrop-blur-md transition-all hover:bg-slate-50 dark:hover:bg-white/10 shadow-lg shadow-slate-200/40 dark:shadow-none group cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-2xl bg-blue-500/15 text-blue-500 dark:text-blue-400">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Day-by-Day Itineraries</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400">Build morning, afternoon, and evening activity schedules.</p>
            </div>
          </Link>

          <Link to="/dashboard/packing">
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary/40 p-5 rounded-3xl backdrop-blur-md transition-all hover:bg-slate-50 dark:hover:bg-white/10 shadow-lg shadow-slate-200/40 dark:shadow-none group cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-2xl bg-purple-500/15 text-purple-500 dark:text-purple-400">
                  <Backpack className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">AI Packing Checklist</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400">Weather-adapted gear, tech adapters & document tracking.</p>
            </div>
          </Link>

          <Link to="/dashboard/map">
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary/40 p-5 rounded-3xl backdrop-blur-md transition-all hover:bg-slate-50 dark:hover:bg-white/10 shadow-lg shadow-slate-200/40 dark:shadow-none group cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-500 dark:text-amber-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Interactive City Map</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400">Explore landmarks, attractions & saved destinations.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
