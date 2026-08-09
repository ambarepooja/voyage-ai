import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, PieChart, Utensils, Hotel, Train, Plus, X, Trash2, MapPin, Filter, Globe, AlertTriangle, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { api } from '../services/api';
import { useSearchParams } from 'react-router-dom';
import { getCurrencyForDestination, formatTripCurrency, DEFAULT_INR, type CurrencyInfo } from '../utils/currency';

export default function Expenses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTripId = searchParams.get('trip_id') || 'all';

  const [expenses, setExpenses] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string>(initialTripId);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [currencyView, setCurrencyView] = useState<'inr' | 'local' | 'dual'>('inr');
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', category: 'Food', trip_id: '' });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const urlTripId = searchParams.get('trip_id');
    if (urlTripId) {
      setSelectedTripId(urlTripId);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const [expRes, tripRes] = await Promise.all([
        api.get('/expenses/'),
        api.get('/trips/')
      ]);
      setExpenses(expRes.data);
      setTrips(tripRes.data);
      if (tripRes.data.length > 0 && initialTripId !== 'all') {
        setSelectedTripId(initialTripId);
      }
    } catch (err) {
      console.error("Failed to fetch expenses", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTripFilterChange = (tripId: string) => {
    setSelectedTripId(tripId);
    if (tripId === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ trip_id: tripId });
    }
  };

  const handleOpenModal = () => {
    const defaultTripId = selectedTripId !== 'all' ? selectedTripId : (trips.length > 0 ? trips[0].id.toString() : '');
    setNewExpense({ title: '', amount: '', category: 'Food', trip_id: defaultTripId });
    setIsModalOpen(true);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/expenses/', {
        trip_id: parseInt(newExpense.trip_id),
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        title: newExpense.title,
        date: new Date().toISOString().split('T')[0]
      });
      setIsModalOpen(false);
      setNewExpense({ title: '', amount: '', category: 'Food', trip_id: '' });
      fetchData();
    } catch (err) {
      console.error("Failed to add expense", err);
      alert("Failed to add expense. Please make sure a trip is selected.");
    }
  };

  const handleDeleteExpense = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    } catch (err) {
      console.error("Failed to delete expense", err);
      alert("Failed to delete expense");
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'Food': return <Utensils className="w-5 h-5 text-orange-400" />;
      case 'Accommodation': return <Hotel className="w-5 h-5 text-blue-400" />;
      case 'Transport':
      case 'Transportation': return <Train className="w-5 h-5 text-green-400" />;
      default: return <PieChart className="w-5 h-5 text-purple-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'Food': return 'bg-orange-500/20';
      case 'Accommodation': return 'bg-blue-500/20';
      case 'Transport':
      case 'Transportation': return 'bg-green-500/20';
      default: return 'bg-purple-500/20';
    }
  };

  const tripExpenses = useMemo(() => {
    if (selectedTripId === 'all') return expenses;
    return expenses.filter((exp) => exp.trip_id === parseInt(selectedTripId));
  }, [expenses, selectedTripId]);

  const filteredExpenses = useMemo(() => {
    if (selectedCategory === 'All Categories') return tripExpenses;
    return tripExpenses.filter((exp) => exp.category?.toLowerCase() === selectedCategory.toLowerCase());
  }, [tripExpenses, selectedCategory]);

  const activeTrip = useMemo(() => {
    if (selectedTripId === 'all') return null;
    return trips.find(t => t.id === parseInt(selectedTripId)) || null;
  }, [trips, selectedTripId]);

  const activeCurrency: CurrencyInfo = useMemo(() => {
    if (activeTrip) {
      return getCurrencyForDestination(activeTrip.destination, activeTrip.title);
    }
    return DEFAULT_INR;
  }, [activeTrip]);

  const totalSpent = useMemo(() => {
    return tripExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  }, [tripExpenses]);

  const totalBudget = useMemo(() => {
    if (activeTrip) return Number(activeTrip.budget) || 50000;
    return trips.reduce((acc, curr) => acc + Number(curr.budget), 0) || 50000;
  }, [trips, activeTrip]);

  const percentageSpent = Math.min((totalSpent / (totalBudget || 1)) * 100, 100);

  /**
   * Robust multi-currency amount formatter.
   * Resolves both primary and secondary currency text clearly based on the selected mode.
   */
  const formatAmountDetails = (amountInINR: number, currency: CurrencyInfo) => {
    const inrFormatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amountInINR);

    if (!currency || currency.code === 'INR') {
      return {
        primary: inrFormatted,
        secondary: 'Domestic (INR)',
        isDomestic: true
      };
    }

    const localFormatted = formatTripCurrency(amountInINR, currency, { showINRSubtext: false }).localFormatted;

    if (currencyView === 'local') {
      return {
        primary: localFormatted,
        secondary: `Base: ${inrFormatted}`,
        isDomestic: false
      };
    } else if (currencyView === 'dual') {
      return {
        primary: inrFormatted,
        secondary: `≈ ${localFormatted}`,
        isDomestic: false
      };
    } else {
      // Default: 'inr' mode
      return {
        primary: inrFormatted,
        secondary: `≈ ${localFormatted}`,
        isDomestic: false
      };
    }
  };

  const renderAmount = (amountInINR: number, currency: CurrencyInfo = activeCurrency) => {
    const details = formatAmountDetails(amountInINR, currency);
    return details.primary;
  };

  return (
    <div className="space-y-8 relative pb-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">Expense Tracker</h2>
            <span className="text-xl">{activeTrip ? activeCurrency.flag : '🌍'}</span>
          </div>
          <p className="text-gray-400 text-xs mt-1">
            {activeTrip 
              ? `Multi-currency tracking synced for "${activeTrip.title}" in ${activeTrip.destination} (${activeCurrency.name})`
              : `Managing ${trips.length} active global journeys with country-specific foreign currency conversions.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Trip Selector Dropdown */}
          <div className="flex items-center bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm backdrop-blur-md">
            <MapPin className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
            <select
              value={selectedTripId}
              onChange={(e) => handleTripFilterChange(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer font-medium"
            >
              <option value="all" className="bg-gray-800">🌍 All Journeys / Trips ({trips.length})</option>
              {trips.map(trip => {
                const tripCurr = getCurrencyForDestination(trip.destination, trip.title);
                return (
                  <option key={trip.id} value={trip.id} className="bg-gray-800">
                    {tripCurr.flag} {trip.title} ({trip.destination} • {tripCurr.code})
                  </option>
                );
              })}
            </select>
          </div>

          <Button 
            onClick={handleOpenModal}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-[0_0_15px_rgba(var(--primary),0.3)] gap-2"
          >
            <Plus className="w-5 h-5" /> Add Expense
          </Button>
        </div>
      </div>

      {/* Currency HUD Bar */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-black to-purple-950/30 border border-indigo-500/20 p-4 sm:p-5 rounded-3xl backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl text-indigo-300">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            {activeTrip ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{activeCurrency.flag}</span>
                  <p className="text-sm font-bold text-white">
                    Destination Currency: <span className="text-indigo-300 font-mono">{activeCurrency.name} ({activeCurrency.code})</span>
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5 font-mono">
                  <span>Live Market Rate:</span>
                  <strong className="text-emerald-400">
                    {activeCurrency.code === 'INR' 
                      ? '1.00 INR (Domestic)' 
                      : `1 ${activeCurrency.code} ≈ ₹${(1 / activeCurrency.rateFromINR).toFixed(2)} INR (1 INR = ${activeCurrency.rateFromINR.toFixed(4)} ${activeCurrency.code})`}
                  </strong>
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌍</span>
                  <p className="text-sm font-bold text-white">
                    Global Multi-Journey Overview <span className="text-indigo-300 font-mono">({trips.length} Destinations Planned)</span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {trips.map(t => {
                    const c = getCurrencyForDestination(t.destination, t.title);
                    const formatted = formatTripCurrency(t.budget, c);
                    return (
                      <button
                        key={t.id}
                        onClick={() => handleTripFilterChange(t.id.toString())}
                        className="text-[11px] bg-white/10 hover:bg-white/20 border border-white/10 px-2.5 py-0.5 rounded-full text-gray-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer font-mono"
                      >
                        <span>{c.flag}</span>
                        <span className="font-semibold text-white">{t.title}:</span>
                        <span className="text-emerald-400">
                          {currencyView === 'local' ? formatted.localFormatted : `₹${Number(t.budget).toLocaleString('en-IN')}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Currency View Mode Switcher */}
        <div className="flex items-center gap-1 bg-black/60 border border-white/10 p-1 rounded-2xl self-stretch sm:self-auto justify-center">
          <button
            type="button"
            onClick={() => setCurrencyView('inr')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              currencyView === 'inr' 
                ? 'bg-primary text-white shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>🇮🇳</span>
            <span>₹ INR (Base)</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrencyView('local')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              currencyView === 'local' 
                ? 'bg-primary text-white shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>{activeTrip ? activeCurrency.flag : '🌐'}</span>
            <span>{activeTrip ? `${activeCurrency.code} (${activeCurrency.symbol})` : 'Foreign Currencies'}</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrencyView('dual')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              currencyView === 'dual' 
                ? 'bg-primary text-white shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>✨</span>
            <span>Dual View</span>
          </button>
        </div>
      </div>

      {/* Interactive Over-Budget Warning Banner */}
      {totalSpent > totalBudget && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-gradient-to-r from-red-950/70 via-red-900/40 to-black border-2 border-red-500/80 p-4 sm:p-5 rounded-3xl backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_40px_rgba(239,68,68,0.35)]"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-red-500/25 border border-red-500/50 rounded-2xl text-red-400 animate-pulse">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow">
                  🚨 Budget Exceeded
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  {activeTrip ? `Budget Overrun Warning for "${activeTrip.title}"` : 'Global Budget Limit Exceeded across All Journeys'}
                </h4>
              </div>
              <p className="text-xs text-red-200 mt-1 font-mono">
                Total spending has exceeded the allocated budget by <strong className="text-red-400 font-extrabold text-sm">{renderAmount(totalSpent - totalBudget)}</strong> ({((totalSpent / (totalBudget || 1)) * 100).toFixed(1)}% of budget utilized).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center font-mono">
            <span className="text-xs bg-red-500/20 border border-red-500/40 px-3 py-1 rounded-xl text-red-300 font-bold">
              +{renderAmount(totalSpent - totalBudget)} Over Limit
            </span>
          </div>
        </motion.div>
      )}

      {/* Main Budget Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Combined Budget & Journey Breakdown */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border ${
            totalSpent > totalBudget 
              ? 'border-red-500/70 shadow-[0_0_35px_rgba(239,68,68,0.25)] bg-gradient-to-b from-red-950/30 via-black to-red-950/15' 
              : 'bg-white/5 border-white/10'
          } p-6 rounded-3xl backdrop-blur-md flex flex-col justify-between transition-all`}
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${totalSpent > totalBudget ? 'bg-red-500/20 text-red-400' : 'bg-primary/20 text-primary'}`}>
                  {totalSpent > totalBudget ? <AlertCircle className="w-6 h-6 animate-pulse" /> : <Wallet className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {activeTrip ? activeTrip.title : 'Global Combined Budget'}
                  </h3>
                  {activeTrip ? (
                    <p className="text-xs text-indigo-300 font-semibold flex items-center gap-1">
                      <span>{activeCurrency.flag}</span>
                      <span>{activeTrip.destination}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400">Total Across All {trips.length} Journeys</p>
                  )}
                </div>
              </div>

              {totalSpent > totalBudget && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-500/30 border border-red-500/60 text-red-300">
                  Over Limit
                </span>
              )}
            </div>
            
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-xs text-gray-400 font-medium">
                  {activeTrip ? `Spent on Trip (${activeCurrency.code})` : 'Total Spent (All Trips)'}
                </p>
                <p className={`text-2xl sm:text-3xl font-black mt-1 ${totalSpent > totalBudget ? 'text-red-400 animate-pulse' : 'text-red-400'}`}>
                  {renderAmount(totalSpent)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-medium">
                  {totalSpent > totalBudget ? 'Allocated Limit' : 'Allocated Budget'}
                </p>
                <p className="text-base sm:text-lg font-bold text-green-400">
                  {renderAmount(totalBudget)}
                </p>
              </div>
            </div>
            
            <div className="w-full bg-black/40 rounded-full h-3.5 mt-6 overflow-hidden border border-white/10 p-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  totalSpent > totalBudget 
                    ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.9)] animate-pulse' 
                    : percentageSpent > 80 
                    ? 'bg-amber-400' 
                    : 'bg-primary'
                }`} 
                style={{ width: `${Math.min(percentageSpent, 100)}%` }}
              ></div>
            </div>

            {/* In All Journeys View: Show breakdown per trip with country flags & converted local values */}
            {!activeTrip && trips.length > 0 && (
              <div className="mt-5 pt-4 border-t border-white/10 space-y-2.5">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Per-Journey Breakdown</p>
                {trips.map(trip => {
                  const tripCurr = getCurrencyForDestination(trip.destination, trip.title);
                  const tripSpent = expenses.filter(e => e.trip_id === trip.id).reduce((sum, e) => sum + Number(e.amount), 0);
                  const isTripOver = tripSpent > trip.budget;
                  const budgetDetails = formatAmountDetails(trip.budget, tripCurr);
                  const spentDetails = formatAmountDetails(tripSpent, tripCurr);

                  return (
                    <div 
                      key={trip.id} 
                      onClick={() => handleTripFilterChange(trip.id.toString())}
                      className={`p-2.5 border rounded-xl flex items-center justify-between text-xs cursor-pointer transition-all ${
                        isTripOver 
                          ? 'bg-red-950/30 border-red-500/50 hover:bg-red-950/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
                          : 'bg-black/40 hover:bg-white/5 border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{tripCurr.flag}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-white">{trip.title}</p>
                            {isTripOver && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-500/30 text-red-300 border border-red-500/40">
                                🚨 Over Limit
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400">{trip.destination} • {tripCurr.code}</p>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <p className="text-emerald-400 font-bold">{budgetDetails.primary}</p>
                        <p className={`text-[10px] ${isTripOver ? 'text-red-400 font-bold' : 'text-gray-400'}`}>
                          Spent: {spentDetails.primary}
                        </p>
                        {!budgetDetails.isDomestic && (
                          <p className="text-[9px] text-gray-500">
                            {budgetDetails.secondary}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className={`mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs ${
            totalSpent > totalBudget ? 'text-red-400 font-bold' : 'text-gray-400'
          }`}>
            <span>{tripExpenses.length} Expense Item{tripExpenses.length !== 1 ? 's' : ''}</span>
            <span className="flex items-center gap-1 font-mono">
              {totalSpent > totalBudget && <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-bounce" />}
              {totalBudget - totalSpent >= 0 
                ? `${renderAmount(totalBudget - totalSpent)} remaining` 
                : `${renderAmount(totalSpent - totalBudget)} over budget!`}
            </span>
          </div>
        </motion.div>

        {/* Right Panel: Recent Expenses List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md overflow-hidden flex flex-col h-[500px]"
        >
          <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5">
            <div>
              <h3 className="text-xl font-bold">Recent Expenses</h3>
              {activeTrip && (
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <span>Filtered for {activeTrip.title}</span>
                  <span>({activeCurrency.flag} {activeCurrency.code})</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              >
                <option value="All Categories" className="bg-gray-800">All Categories</option>
                <option value="Food" className="bg-gray-800">Food</option>
                <option value="Accommodation" className="bg-gray-800">Accommodation</option>
                <option value="Transport" className="bg-gray-800">Transportation</option>
                <option value="Activities" className="bg-gray-800">Activities</option>
              </select>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center p-8 text-gray-400">Loading expenses...</div>
              ) : filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => {
                  const expenseTrip = trips.find(t => t.id === expense.trip_id);
                  const expCurrency = getCurrencyForDestination(expenseTrip?.destination, expense.title);
                  const amountDetails = formatAmountDetails(Number(expense.amount), expCurrency);

                  return (
                    <div key={expense.id} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors group cursor-pointer border border-transparent hover:border-white/5">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${getCategoryColor(expense.category)}`}>
                          {getCategoryIcon(expense.category)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white group-hover:text-primary transition-colors flex items-center gap-2">
                            <span>{expense.title}</span>
                            {expenseTrip && (
                              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-indigo-300 font-mono flex items-center gap-1">
                                <span>{expCurrency.flag}</span>
                                <span>{expenseTrip.destination}</span>
                              </span>
                            )}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">{expense.category}</span>
                            <span className="text-xs text-gray-600">•</span>
                            <span className="text-xs text-gray-400">{expense.date || 'Recent'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right font-mono">
                          <p className="font-bold text-white text-sm sm:text-base">
                            {amountDetails.primary}
                          </p>
                          <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                            {amountDetails.secondary}
                          </p>
                        </div>

                        <button 
                          onClick={(e) => handleDeleteExpense(expense.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 text-red-400 rounded-xl transition-all"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-base font-semibold text-gray-300">No expenses recorded for this trip yet.</p>
                  <p className="text-xs text-gray-500 mt-1">Click "Add Expense" above to record spending.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="text-2xl font-bold text-white mb-6">Add Expense</h3>
              
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Trip / Journey Destination</label>
                  <select 
                    required
                    value={newExpense.trip_id}
                    onChange={e => setNewExpense({...newExpense, trip_id: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                  >
                    <option value="" disabled className="bg-gray-800">Select a trip</option>
                    {trips.map(trip => {
                      const tripCurr = getCurrencyForDestination(trip.destination, trip.title);
                      return (
                        <option key={trip.id} value={trip.id.toString()} className="bg-gray-800">
                          {tripCurr.flag} {trip.title} ({trip.destination} • {tripCurr.code})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Dinner at Taj, Taxi fare, Louvre Tickets"
                    value={newExpense.title}
                    onChange={e => setNewExpense({...newExpense, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Amount (₹ INR)</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      step="0.01"
                      placeholder="5000"
                      value={newExpense.amount}
                      onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                    <select 
                      value={newExpense.category}
                      onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                    >
                      <option className="bg-gray-800">Food</option>
                      <option className="bg-gray-800">Accommodation</option>
                      <option className="bg-gray-800">Transport</option>
                      <option className="bg-gray-800">Activities</option>
                    </select>
                  </div>
                </div>

                {/* Live Over-Budget Modal Warning */}
                {(() => {
                  const targetTrip = trips.find(t => t.id.toString() === newExpense.trip_id);
                  const targetAmount = Number(newExpense.amount) || 0;
                  if (!targetTrip || targetAmount <= 0) return null;
                  const targetSpent = expenses.filter(e => e.trip_id === targetTrip.id).reduce((sum, e) => sum + Number(e.amount), 0);
                  const willExceed = targetSpent + targetAmount > targetTrip.budget;
                  if (!willExceed) return null;
                  const overBy = (targetSpent + targetAmount) - targetTrip.budget;
                  const tripCurr = getCurrencyForDestination(targetTrip.destination, targetTrip.title);
                  const formattedOver = formatTripCurrency(overBy, tripCurr);
                  return (
                    <div className="p-3.5 bg-red-500/20 border border-red-500/50 rounded-2xl flex items-center gap-3 text-xs text-red-300 animate-pulse">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-red-300 flex items-center gap-1.5">
                          <span>🚨 Budget Overrun Warning</span>
                          <span className="text-[10px] bg-red-500/40 px-2 py-0.5 rounded-full font-mono">Exceeds Budget</span>
                        </p>
                        <p className="text-[11px] text-red-200 mt-0.5 font-mono">
                          This expense will exceed <strong>{targetTrip.title}</strong> budget by {formattedOver.localFormatted} (≈ ₹{overBy.toLocaleString('en-IN')})!
                        </p>
                      </div>
                    </div>
                  );
                })()}

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-6 mt-4 font-bold shadow-lg shadow-primary/25">
                  Save Expense
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
