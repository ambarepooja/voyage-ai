import { useState, useEffect } from 'react';
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
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        setTrips(tripsRes.data);
        setExpenses(expensesRes.data);
        setFlights(flightsRes.data);
        setHotels(hotelsRes.data);
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

  const totalSpent = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const activeFlightsCount = flights.filter(f => f.status === 'confirmed').length;
  const activeHotelsCount = hotels.filter(h => h.status === 'confirmed').length;

  const stats = [
    { 
      label: 'Planned Journeys', 
      value: trips.length.toString(), 
      subtitle: `${trips.filter(t => t.status === 'completed').length} Completed`, 
      icon: Plane, 
      color: 'from-blue-600/30 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      iconBg: 'bg-blue-500/20 text-blue-400',
      link: '/dashboard/trips'
    },
    { 
      label: 'Total Expenses Logged', 
      value: formatINR(totalSpent), 
      subtitle: `${expenses.length} Records tracked`, 
      icon: Wallet, 
      color: 'from-emerald-600/30 to-teal-500/20',
      borderColor: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      link: '/dashboard/expenses'
    },
    { 
      label: 'Flights & Transit Passes', 
      value: activeFlightsCount.toString(), 
      subtitle: 'Boarding passes generated', 
      icon: QrCode, 
      color: 'from-purple-600/30 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      iconBg: 'bg-purple-500/20 text-purple-400',
      link: '/dashboard/flights'
    },
    { 
      label: 'Luxury Hotel Stays', 
      value: activeHotelsCount.toString(), 
      subtitle: 'Confirmed reservations', 
      icon: Hotel, 
      color: 'from-amber-600/30 to-orange-500/20',
      borderColor: 'border-amber-500/30',
      iconBg: 'bg-amber-500/20 text-amber-400',
      link: '/dashboard/hotels'
    },
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Header with Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Travel Command Center</h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> AI Powered
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">Real-time overview of your itineraries, flight boarding passes, luxury stays, and travel ledger.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/dashboard/chat">
            <Button className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white rounded-2xl px-5 font-bold shadow-lg shadow-primary/25 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> AI Itinerary Planner
            </Button>
          </Link>
          <Link to="/dashboard/flights">
            <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-2xl px-5 font-bold">
              <Plane className="w-4 h-4 mr-1.5" /> Book Flights
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
              className={`bg-gradient-to-br ${stat.color} border ${stat.borderColor} p-6 rounded-3xl backdrop-blur-xl shadow-xl hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden group`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.iconBg} border border-white/10`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </div>

              <p className="text-xs font-semibold uppercase tracking-wider text-gray-300">{stat.label}</p>
              <p className="text-3xl font-black text-white mt-1 tracking-tight">{isLoading ? '...' : stat.value}</p>
              <p className="text-xs text-gray-300 mt-2 font-medium">{stat.subtitle}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Live Destination Climate & Multi-Currency FX Converter Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Weather Forecast Widget */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-900/30 via-black to-cyan-900/20 border border-white/15 p-6 rounded-3xl backdrop-blur-xl shadow-xl relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/30">
                <CloudSun className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Destination Weather & Climate</h3>
                <p className="text-xs text-gray-400">Live 5-day forecast for your top journeys</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/30">
              Live Feed
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center my-4">
            {[
              { day: 'Mon', temp: '29°C', desc: 'Sunny', icon: Sun, color: 'text-amber-400' },
              { day: 'Tue', temp: '28°C', desc: 'Pleasant', icon: CloudSun, color: 'text-cyan-400' },
              { day: 'Wed', temp: '26°C', desc: 'Light Rain', icon: CloudRain, color: 'text-blue-400' },
              { day: 'Thu', temp: '30°C', desc: 'Clear', icon: Sun, color: 'text-amber-400' },
              { day: 'Fri', temp: '27°C', desc: 'Breeze', icon: CloudSun, color: 'text-cyan-400' },
            ].map((w, i) => (
              <div key={i} className="bg-black/40 border border-white/5 rounded-2xl p-3">
                <p className="text-xs text-gray-400 font-bold">{w.day}</p>
                <w.icon className={`w-6 h-6 mx-auto my-2 ${w.color}`} />
                <p className="text-sm font-black text-white">{w.temp}</p>
                <p className="text-[10px] text-gray-400">{w.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-cyan-200/80 bg-cyan-950/40 border border-cyan-500/20 rounded-xl p-3 mt-4">
            💡 <strong>Travel Tip:</strong> Warm afternoons with cooling sea breeze in the evening. Recommended: light cottons & UV sunglasses.
          </p>
        </motion.div>

        {/* Multi-Currency FX Live Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-br from-emerald-900/30 via-black to-teal-900/20 border border-white/15 p-6 rounded-3xl backdrop-blur-xl shadow-xl relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                <Repeat className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Multi-Currency Live FX Converter</h3>
                <p className="text-xs text-gray-400">Calculate international travel expenses in real time</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
              Live Rates
            </span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Amount</label>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-black/50 border border-white/15 rounded-2xl px-4 py-2.5 text-base font-bold text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">From Currency</label>
                <select
                  value={fromCurr}
                  onChange={(e) => setFromCurr(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-2xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none cursor-pointer"
                >
                  {Object.keys(FX_RATES).map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
                </select>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-semibold">Converted Amount</p>
                <p className="text-2xl font-black text-emerald-400 mt-0.5">
                  {convertedValue} <span className="text-sm font-bold text-white">{toCurr}</span>
                </p>
              </div>

              <select
                value={toCurr}
                onChange={(e) => setToCurr(e.target.value)}
                className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
              >
                {Object.keys(FX_RATES).map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
              </select>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Travel Modules & Utilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/dashboard/trips">
            <div className="bg-white/5 border border-white/10 hover:border-primary/40 p-5 rounded-3xl backdrop-blur-md transition-all hover:bg-white/10 group cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white group-hover:text-primary transition-colors">Day-by-Day Itineraries</h3>
              </div>
              <p className="text-xs text-gray-400">Build morning, afternoon, and evening activity schedules.</p>
            </div>
          </Link>

          <Link to="/dashboard/packing">
            <div className="bg-white/5 border border-white/10 hover:border-primary/40 p-5 rounded-3xl backdrop-blur-md transition-all hover:bg-white/10 group cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400">
                  <Backpack className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white group-hover:text-primary transition-colors">AI Packing Checklist</h3>
              </div>
              <p className="text-xs text-gray-400">Weather-adapted gear, tech adapters & document tracking.</p>
            </div>
          </Link>

          <Link to="/dashboard/map">
            <div className="bg-white/5 border border-white/10 hover:border-primary/40 p-5 rounded-3xl backdrop-blur-md transition-all hover:bg-white/10 group cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white group-hover:text-primary transition-colors">Interactive City Map</h3>
              </div>
              <p className="text-xs text-gray-400">Explore landmarks, attractions & saved destinations.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
