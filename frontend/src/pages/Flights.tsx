import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plane, 
  Calendar, 
  MapPin, 
  Search, 
  QrCode, 
  Printer, 
  Luggage,
  Coffee,
  Wifi,
  Trash2,
  Filter,
  ArrowRight,
  Clock,
  Compass,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe,
  SlidersHorizontal,
  ChevronDown,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '../services/api';
import { getCurrencyForDestination, formatTripCurrency } from '../utils/currency';

interface FlightItem {
  id: number;
  airline_name: string;
  airline_code: string;
  flight_number: string;
  origin: string;
  origin_code: string;
  origin_country?: string;
  destination: string;
  destination_code: string;
  destination_country?: string;
  country?: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  price_economy: number;
  price_business: number;
  stops: string;
  transit_hub?: string | null;
  layover_duration?: string | null;
  aircraft: string;
}

const COUNTRY_FLAGS: Record<string, string> = {
  'India': '🇮🇳',
  'UAE': '🇦🇪',
  'United Arab Emirates': '🇦🇪',
  'Japan': '🇯🇵',
  'France': '🇫🇷',
  'Switzerland': '🇨🇭',
  'Greece': '🇬🇷',
  'Indonesia': '🇮🇩',
  'Maldives': '🇲🇻',
  'Thailand': '🇹🇭',
  'USA': '🇺🇸',
  'United States': '🇺🇸',
  'UK': '🇬🇧',
  'United Kingdom': '🇬🇧',
  'Germany': '🇩🇪',
  'Italy': '🇮🇹',
  'Spain': '🇪🇸',
  'Singapore': '🇸🇬',
  'Morocco': '🇲🇦',
  'Egypt': '🇪🇬',
  'Turkey': '🇹🇷',
  'Saudi Arabia': '🇸🇦',
  'Qatar': '🇶🇦',
  'Oman': '🇴🇲',
  'Kuwait': '🇰🇼',
  'Bahrain': '🇧🇭',
  'Jordan': '🇯🇴',
  'South Korea': '🇰🇷',
  'Vietnam': '🇻🇳',
  'Malaysia': '🇲🇾',
  'China': '🇨🇳',
  'Sri Lanka': '🇱🇰',
  'Nepal': '🇳🇵',
  'Netherlands': '🇳🇱',
  'Czech Republic': '🇨🇿',
  'Hungary': '🇭🇺',
  'Poland': '🇵🇱',
  'Norway': '🇳🇴',
  'Sweden': '🇸🇪',
  'Denmark': '🇩🇰',
  'Austria': '🇦🇹',
  'Portugal': '🇵🇹',
  'Ireland': '🇮🇪',
  'Iceland': '🇮🇸',
  'Belgium': '🇧🇪',
  'Finland': '🇫🇮',
  'Canada': '🇨🇦',
  'Mexico': '🇲🇽',
  'Brazil': '🇧🇷',
  'Australia': '🇦🇺',
  'New Zealand': '🇳🇿',
  'South Africa': '🇿🇦',
  'Kenya': '🇰🇪',
  'Tanzania': '🇹🇿',
  'Mauritius': '🇲🇺'
};

export default function Flights() {
  const [activeTab, setActiveTab] = useState<'search' | 'bookings'>('search');
  const [flights, setFlights] = useState<FlightItem[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [countriesList, setCountriesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState<FlightItem | null>(null);
  const [viewingPass, setViewingPass] = useState<any | null>(null);

  // Search & Filter state
  const [searchOrigin, setSearchOrigin] = useState('');
  const [searchDest, setSearchDest] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [transitFilter, setTransitFilter] = useState<'all' | 'direct' | 'transit'>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price_low' | 'price_high' | 'duration'>('recommended');
  const [cabinClass, setCabinClass] = useState<'Economy' | 'Business'>('Economy');
  const [departureDate, setDepartureDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });

  // Booking modal form state
  const [formData, setFormData] = useState({
    passenger_name: '',
    passenger_email: '',
    passenger_phone: '',
    seat_number: '14A',
    cabin_class: 'Economy',
    trip_id: null as number | null
  });
  const [userTrips, setUserTrips] = useState<any[]>([]);
  const [isBooking, setIsBooking] = useState(false);

  const fetchInitialData = async () => {
    try {
      const [flightsRes, bookingsRes, tripsRes, countriesRes] = await Promise.all([
        api.get('/flights/search'),
        api.get('/flights/my-bookings').catch(() => ({ data: [] })),
        api.get('/trips/').catch(() => ({ data: [] })),
        api.get('/flights/countries').catch(() => ({ data: [] }))
      ]);
      setFlights(flightsRes.data);
      setMyBookings(bookingsRes.data);
      setUserTrips(tripsRes.data);
      if (countriesRes.data && Array.isArray(countriesRes.data)) {
        setCountriesList(countriesRes.data);
      }
    } catch (err) {
      console.error("Failed to load flight data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSearch = async (e?: React.FormEvent, overrideCountry?: string, overrideTransit?: string) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    const targetCountry = overrideCountry !== undefined ? overrideCountry : selectedCountry;
    const targetTransit = overrideTransit !== undefined ? overrideTransit : transitFilter;

    let stopsParam: string | undefined = undefined;
    if (targetTransit === 'direct') stopsParam = 'non-stop';
    else if (targetTransit === 'transit') stopsParam = 'transit';

    try {
      const res = await api.get('/flights/search', {
        params: {
          origin: searchOrigin || undefined,
          destination: searchDest || undefined,
          country: targetCountry !== 'All' ? targetCountry : undefined,
          stops: stopsParam,
          cabin_class: cabinClass
        }
      });
      setFlights(res.data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountrySelect = (countryName: string) => {
    setSelectedCountry(countryName);
    if (countryName !== 'All') {
      setSearchDest(countryName);
    } else {
      setSearchDest('');
    }
    handleSearch(undefined, countryName);
  };

  const handleTransitSelect = (transitType: 'all' | 'direct' | 'transit') => {
    setTransitFilter(transitType);
    handleSearch(undefined, selectedCountry, transitType);
  };

  const filteredAndSortedFlights = useMemo(() => {
    let result = [...flights];

    if (sortBy === 'price_low') {
      result.sort((a, b) => {
        const pA = cabinClass === 'Business' ? a.price_business : a.price_economy;
        const pB = cabinClass === 'Business' ? b.price_business : b.price_economy;
        return pA - pB;
      });
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => {
        const pA = cabinClass === 'Business' ? a.price_business : a.price_economy;
        const pB = cabinClass === 'Business' ? b.price_business : b.price_economy;
        return pB - pA;
      });
    } else if (sortBy === 'duration') {
      // Rough parse of hours from duration string (e.g. "8h 45m" -> 8.75)
      const parseHours = (dur: string) => {
        const hMatch = dur.match(/(\d+)h/);
        const mMatch = dur.match(/(\d+)m/);
        const h = hMatch ? parseInt(hMatch[1]) : 0;
        const m = mMatch ? parseInt(mMatch[1]) : 0;
        return h + m / 60;
      };
      result.sort((a, b) => parseHours(a.duration) - parseHours(b.duration));
    }

    return result;
  }, [flights, sortBy, cabinClass]);

  const handleOpenBooking = (flight: FlightItem) => {
    setSelectedFlight(flight);
    // Smart match: look for a trip that actually matches this flight's destination
    const matchingTrip = userTrips.find(t => 
      t.destination?.toLowerCase().includes(flight.destination?.toLowerCase()) ||
      flight.destination?.toLowerCase().includes(t.destination?.toLowerCase()) ||
      t.title?.toLowerCase().includes(flight.destination?.toLowerCase())
    );
    setFormData(prev => ({
      ...prev,
      cabin_class: cabinClass,
      trip_id: matchingTrip ? matchingTrip.id : null
    }));
  };

  const calculatePrice = () => {
    if (!selectedFlight) return 0;
    return formData.cabin_class === 'Business' 
      ? selectedFlight.price_business 
      : selectedFlight.price_economy;
  };

  const handleBookFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlight) return;
    if (!formData.passenger_name || !formData.passenger_email) {
      alert("Please fill in passenger name and email.");
      return;
    }

    setIsBooking(true);
    const finalPrice = calculatePrice();

    const payload = {
      trip_id: formData.trip_id,
      airline_name: selectedFlight.airline_name,
      airline_code: selectedFlight.airline_code,
      flight_number: selectedFlight.flight_number,
      origin: selectedFlight.origin,
      origin_code: selectedFlight.origin_code,
      destination: selectedFlight.destination,
      destination_code: selectedFlight.destination_code,
      departure_date: departureDate,
      departure_time: selectedFlight.departure_time,
      arrival_time: selectedFlight.arrival_time,
      duration: selectedFlight.duration,
      passenger_name: formData.passenger_name,
      passenger_email: formData.passenger_email,
      seat_number: formData.seat_number,
      cabin_class: formData.cabin_class,
      ticket_price: finalPrice
    };

    try {
      const res = await api.post('/flights/book', payload);
      setMyBookings(prev => [res.data, ...prev]);
      setSelectedFlight(null);
      setViewingPass(res.data); // Show boarding pass immediately!
      setActiveTab('bookings');
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to book flight. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelBooking = async (id: number) => {
    if (!window.confirm("Cancel this flight booking? A refund note will be logged in expenses.")) return;
    try {
      await api.delete(`/flights/my-bookings/${id}`);
      setMyBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      alert("Failed to cancel booking.");
    }
  };

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getCountryFlag = (countryName?: string) => {
    if (!countryName) return '✈️';
    for (const [key, flag] of Object.entries(COUNTRY_FLAGS)) {
      if (countryName.toLowerCase().includes(key.toLowerCase())) return flag;
    }
    return '🌍';
  };

  // Popular Quick Origins
  const quickOrigins = [
    { name: 'Mumbai', code: 'BOM' },
    { name: 'Delhi', code: 'DEL' },
    { name: 'Bengaluru', code: 'BLR' },
    { name: 'Dubai', code: 'DXB' },
    { name: 'London', code: 'LHR' },
    { name: 'Singapore', code: 'SIN' }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header & HUD Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-white/10 via-white/5 to-transparent p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/20 rounded-2xl border border-primary/30 text-primary">
              <Plane className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Global Flights & Transit Radar</h1>
              <p className="text-gray-400 text-xs mt-0.5">Explore direct and transit flights across 50+ countries with instant boarding passes and automatic expense tracking.</p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-white/5 border border-white/10 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'search' 
                ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" /> Search Flights & Routes
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'bookings' 
                ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" /> My Boarding Passes ({myBookings.filter(b => b.status === 'confirmed').length})
          </button>
        </div>
      </div>

      {activeTab === 'search' && (
        <>
          {/* Main Search Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl shadow-2xl space-y-6"
          >
            {/* Quick Origin Hub Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-400 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-primary" /> Popular Departure Hubs:
              </span>
              {quickOrigins.map((hub) => (
                <button
                  key={hub.code}
                  type="button"
                  onClick={() => {
                    setSearchOrigin(`${hub.name} (${hub.code})`);
                  }}
                  className={`px-3 py-1 rounded-xl border text-[11px] font-medium transition-all ${
                    searchOrigin.includes(hub.code)
                      ? 'bg-primary/20 border-primary text-primary font-bold'
                      : 'bg-black/30 border-white/10 text-gray-300 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {hub.name} <span className="text-gray-500 font-mono text-[10px]">({hub.code})</span>
                </button>
              ))}
            </div>

            {/* Input Fields Grid */}
            <form onSubmit={(e) => handleSearch(e)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">From (Origin)</label>
                <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus-within:border-primary">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <input 
                    type="text"
                    placeholder="e.g. Mumbai, Delhi, BOM, LHR..."
                    value={searchOrigin}
                    onChange={(e) => setSearchOrigin(e.target.value)}
                    className="bg-transparent focus:outline-none w-full placeholder-gray-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">To (Destination / Country)</label>
                <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus-within:border-primary">
                  <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  <input 
                    type="text"
                    placeholder="e.g. Tokyo, Paris, Zurich, Bali, USA..."
                    value={searchDest}
                    onChange={(e) => {
                      setSearchDest(e.target.value);
                      if (selectedCountry !== 'All' && !e.target.value) {
                        setSelectedCountry('All');
                      }
                    }}
                    className="bg-transparent focus:outline-none w-full placeholder-gray-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Departure Date</label>
                <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white">
                  <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <input 
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="bg-transparent focus:outline-none w-full text-white cursor-pointer text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Cabin Class & Search</label>
                <div className="flex gap-2">
                  <select
                    value={cabinClass}
                    onChange={(e) => setCabinClass(e.target.value as 'Economy' | 'Business')}
                    className="bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none w-full cursor-pointer"
                  >
                    <option value="Economy" className="bg-gray-900">Economy Class</option>
                    <option value="Business" className="bg-gray-900">Business Class</option>
                  </select>
                  <Button type="submit" className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white rounded-2xl px-6 flex-shrink-0 font-bold shadow-lg shadow-primary/20">
                    <Search className="w-4 h-4 mr-1.5" /> Find
                  </Button>
                </div>
              </div>
            </form>

            {/* Country Selector Chips Ribbon */}
            <div className="border-t border-white/10 pt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" /> Filter by Country ({countriesList.length || 52} Destinations):
                </span>
                {selectedCountry !== 'All' && (
                  <button 
                    onClick={() => handleCountrySelect('All')}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    Reset Country Filter
                  </button>
                )}
              </div>

              {/* Scrollable Horizontal Countries Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
                <button
                  type="button"
                  onClick={() => handleCountrySelect('All')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 ${
                    selectedCountry === 'All'
                      ? 'bg-primary text-white shadow-md shadow-primary/30 border border-primary'
                      : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  🌍 All Countries
                </button>

                {countriesList.map((c) => (
                  <button
                    key={c.country}
                    type="button"
                    onClick={() => handleCountrySelect(c.country)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 ${
                      selectedCountry.toLowerCase() === c.country.toLowerCase() || (c.short_country && selectedCountry.toLowerCase() === c.short_country.toLowerCase())
                        ? 'bg-primary/20 border-primary text-primary font-bold shadow-md shadow-primary/20 border'
                        : 'bg-white/5 border border-white/10 text-gray-300 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    <span>{c.flag || getCountryFlag(c.country)}</span>
                    <span>{c.country}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-gray-400 font-mono">
                      {c.hub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Transit & Stops Filter Bar */}
            <div className="border-t border-white/10 pt-4 flex flex-wrap items-center justify-between gap-4">
              {/* Transit Filter Switch */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-primary" /> Route Type:
                </span>
                <div className="flex items-center bg-black/40 border border-white/10 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleTransitSelect('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      transitFilter === 'all'
                        ? 'bg-white/20 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    All Routes ({flights.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTransitSelect('direct')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      transitFilter === 'direct'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    🚀 Direct Only
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTransitSelect('transit')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      transitFilter === 'transit'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    🔄 Transit & Layovers
                  </button>
                </div>
              </div>

              {/* Sorting Switch */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="recommended" className="bg-gray-900">Recommended</option>
                  <option value="price_low" className="bg-gray-900">Price: Low to High</option>
                  <option value="price_high" className="bg-gray-900">Price: High to Low</option>
                  <option value="duration" className="bg-gray-900">Shortest Duration</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Flight Results Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Available Flights & Connections</span>
                <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-2.5 py-0.5 rounded-full font-bold">
                  {filteredAndSortedFlights.length} Routes
                </span>
                {selectedCountry !== 'All' && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    {getCountryFlag(selectedCountry)} {selectedCountry}
                  </span>
                )}
              </h2>

              <p className="text-xs text-gray-400">
                Prices shown in <span className="text-emerald-400 font-semibold">Local Destination Currency + INR</span>
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
                <Plane className="w-10 h-10 mx-auto text-primary animate-bounce mb-3" />
                <p className="text-base font-bold text-white">Scanning Global Flight Schedules & Radar...</p>
                <p className="text-xs text-gray-400 mt-1">Connecting to airlines across {countriesList.length || 52} countries</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedFlights.map((flight, idx) => {
                  const targetCountry = flight.destination_country || flight.country || flight.destination.split(',').pop()?.trim();
                  const destCurrency = getCurrencyForDestination(flight.destination);
                  const priceToDisplay = cabinClass === 'Business' ? flight.price_business : flight.price_economy;
                  const formattedFare = formatTripCurrency(priceToDisplay, destCurrency);
                  const isTransit = flight.stops.toLowerCase().includes('stop') || !!flight.transit_hub;

                  return (
                    <motion.div
                      key={flight.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.04, 0.5) }}
                      className="bg-white/5 border border-white/10 hover:border-primary/40 rounded-3xl p-6 backdrop-blur-xl transition-all shadow-xl hover:bg-white/[0.07] group relative overflow-hidden"
                    >
                      {/* Top ribbon: Country Badge & Route Type */}
                      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2.5 py-1 rounded-xl bg-white/10 text-white font-semibold flex items-center gap-1">
                            <span>{getCountryFlag(targetCountry)}</span>
                            <span>{targetCountry}</span>
                          </span>
                          <span className="text-[11px] font-mono text-gray-400">
                            {flight.aircraft}
                          </span>
                        </div>

                        <div>
                          {isTransit ? (
                            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                              {flight.layover_duration || `1 Stop via ${flight.transit_hub || 'Hub'}`}
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              🚀 Non-stop Direct
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Airline Brand */}
                        <div className="flex items-center gap-4 min-w-[210px]">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-white/10 to-white/5 border border-white/15 flex items-center justify-center font-black text-primary text-base shadow-inner">
                            {flight.airline_code}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base group-hover:text-primary transition-colors">
                              {flight.airline_name}
                            </h3>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">
                              {flight.flight_number}
                            </p>
                          </div>
                        </div>

                        {/* Timeline Route & Transit Details */}
                        <div className="flex-1 flex items-center justify-between max-w-xl">
                          {/* Origin */}
                          <div className="text-left">
                            <p className="text-2xl font-black text-white">{flight.departure_time}</p>
                            <p className="text-xs font-extrabold text-primary">{flight.origin_code}</p>
                            <p className="text-[11px] text-gray-400 truncate max-w-[120px]">
                              {flight.origin.split(',')[0]}
                            </p>
                          </div>

                          {/* Center Vector */}
                          <div className="flex-1 px-6 flex flex-col items-center">
                            <p className="text-[11px] text-gray-300 font-semibold mb-1 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-primary" /> {flight.duration}
                            </p>
                            
                            <div className="w-full flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/20"></div>
                              <div className="flex-1 border-t-2 border-dashed border-white/30 relative">
                                <Plane className="w-4 h-4 text-primary absolute left-1/2 -top-2 -translate-x-1/2 transform rotate-90" />
                                {isTransit && (
                                  <div className="absolute left-1/2 -bottom-5 -translate-x-1/2 text-[9px] font-bold text-purple-300 bg-purple-900/60 px-1.5 py-0.5 rounded border border-purple-500/30 whitespace-nowrap">
                                    Transit: {flight.transit_hub?.split(' ')[0] || 'Hub'}
                                  </div>
                                )}
                              </div>
                              <div className="w-2.5 h-2.5 rounded-full bg-orange-400 ring-4 ring-orange-400/20"></div>
                            </div>

                            <div className="flex gap-2 mt-4 text-[10px] text-gray-400">
                              <span className="flex items-center gap-1"><Wifi className="w-3 h-3 text-gray-500" /> WiFi</span>
                              <span className="flex items-center gap-1"><Coffee className="w-3 h-3 text-gray-500" /> Meals</span>
                              <span className="flex items-center gap-1"><Luggage className="w-3 h-3 text-gray-500" /> Baggage</span>
                            </div>
                          </div>

                          {/* Destination */}
                          <div className="text-right">
                            <p className="text-2xl font-black text-white">{flight.arrival_time}</p>
                            <p className="text-xs font-extrabold text-orange-400">{flight.destination_code}</p>
                            <p className="text-[11px] text-gray-400 truncate max-w-[120px]">
                              {flight.destination.split(',')[0]}
                            </p>
                          </div>
                        </div>

                        {/* Price & Book CTA */}
                        <div className="flex items-center justify-between lg:flex-col lg:items-end gap-3 min-w-[200px] border-t lg:border-t-0 border-white/10 pt-4 lg:pt-0">
                          <div className="lg:text-right">
                            <p className="text-2xl font-black text-emerald-400">
                              {formattedFare.localFormatted}
                            </p>
                            {destCurrency.code !== 'INR' && (
                              <p className="text-[11px] text-gray-400 font-mono">
                                ≈ {formattedFare.inrFormatted}
                              </p>
                            )}
                            <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">{cabinClass} / person</p>
                          </div>

                          <Button
                            onClick={() => handleOpenBooking(flight)}
                            className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white rounded-2xl px-6 font-bold shadow-lg shadow-primary/20"
                          >
                            Select Seat & Book
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {filteredAndSortedFlights.length === 0 && (
                  <div className="p-16 text-center text-gray-400 bg-white/5 rounded-3xl border border-white/10">
                    <Plane className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                    <p className="text-lg font-bold text-white">No flights found matching your search</p>
                    <p className="text-xs text-gray-400 mt-1">Try resetting the country filter or search by city name (e.g. Zurich, Tokyo, Paris, Bali, New York, Cairo).</p>
                    <Button 
                      onClick={() => {
                        setSelectedCountry('All');
                        setSearchDest('');
                        setSearchOrigin('');
                        setTransitFilter('all');
                        handleSearch(undefined, 'All', 'all');
                      }}
                      className="mt-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs"
                    >
                      Reset All Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* My Bookings & Boarding Passes Tab */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Your Confirmed Boarding Passes</h2>
            <Button
              onClick={() => setActiveTab('search')}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold"
            >
              + Book Another Flight
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {myBookings.map((b) => {
              const destCurrency = getCurrencyForDestination(b.destination);
              const formattedFare = formatTripCurrency(b.ticket_price, destCurrency);
              const destCountry = b.destination.split(',').pop()?.trim();

              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`border rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden shadow-2xl transition-all ${
                    b.status === 'cancelled' 
                      ? 'bg-red-950/10 border-red-500/20 opacity-75' 
                      : 'bg-gradient-to-br from-white/10 to-white/5 border-white/15 hover:border-primary/40'
                  }`}
                >
                  {/* Status & Reference Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-3 py-1 rounded-xl bg-primary/20 text-primary border border-primary/30 font-bold">
                        {b.booking_reference}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                        b.status === 'confirmed' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingPass(b)}
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-primary text-white transition-all flex items-center gap-1.5 text-xs font-bold"
                        title="View Digital Boarding Pass"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Boarding Pass</span>
                      </button>
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold"
                        title="Delete / Cancel Flight Booking"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Route Header */}
                  <div className="flex justify-between items-center my-4">
                    <div>
                      <p className="text-3xl font-black text-white">{b.origin_code}</p>
                      <p className="text-xs text-gray-400">{b.origin}</p>
                    </div>

                    <div className="flex flex-col items-center px-4">
                      <p className="text-xs text-primary font-semibold">{b.duration || '1h 30m'}</p>
                      <div className="w-24 border-t-2 border-dashed border-primary/60 my-1 relative">
                        <Plane className="w-3.5 h-3.5 text-primary absolute left-1/2 -top-2 -translate-x-1/2 transform rotate-90" />
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono">{b.flight_number}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-3xl font-black text-white flex items-center justify-end gap-1">
                        <span>{b.destination_code}</span>
                        <span className="text-base">{getCountryFlag(destCountry)}</span>
                      </p>
                      <p className="text-xs text-gray-400">{b.destination}</p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-4 gap-3 bg-black/40 border border-white/5 rounded-2xl p-4 text-center my-4">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">Date</p>
                      <p className="text-xs font-bold text-white mt-0.5">{b.departure_date}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">Time</p>
                      <p className="text-xs font-bold text-white mt-0.5">{b.departure_time}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">Seat</p>
                      <p className="text-xs font-bold text-primary mt-0.5">{b.seat_number}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">Class</p>
                      <p className="text-xs font-bold text-amber-400 mt-0.5">{b.cabin_class}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 text-xs text-gray-400">
                    <span>Passenger: <strong className="text-white">{b.passenger_name}</strong></span>
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold text-sm block">
                        {formattedFare.localFormatted}
                      </span>
                      {destCurrency.code !== 'INR' && (
                        <span className="text-[10px] text-gray-400 font-mono block">
                          ≈ {formattedFare.inrFormatted}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {myBookings.length === 0 && (
              <div className="col-span-full text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
                <QrCode className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                <p className="text-lg font-bold text-white">No flight bookings found</p>
                <p className="text-xs text-gray-400 mt-1">Book your first flight in the Search tab to generate your digital boarding pass.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Flight Booking Modal */}
      <AnimatePresence>
        {selectedFlight && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-white/20 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black text-white">Confirm Flight Booking</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{selectedFlight.airline_name} • {selectedFlight.flight_number} • {selectedFlight.aircraft}</p>
                </div>
                <button 
                  onClick={() => setSelectedFlight(null)}
                  className="text-gray-400 hover:text-white p-2 rounded-full bg-white/5"
                >
                  ✕
                </button>
              </div>

              {/* Route Summary */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center mb-6">
                <div>
                  <p className="text-lg font-bold text-white">{selectedFlight.origin_code}</p>
                  <p className="text-xs text-gray-400">{selectedFlight.departure_time}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-primary font-bold">{selectedFlight.duration}</p>
                  <Plane className="w-4 h-4 text-primary mx-auto my-0.5" />
                  <p className="text-[10px] text-gray-400">{departureDate}</p>
                  {selectedFlight.transit_hub && (
                    <span className="text-[9px] font-bold text-purple-300 bg-purple-900/60 px-1.5 py-0.5 rounded border border-purple-500/30">
                      Via {selectedFlight.transit_hub}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{selectedFlight.destination_code}</p>
                  <p className="text-xs text-gray-400">{selectedFlight.arrival_time}</p>
                </div>
              </div>

              <form onSubmit={handleBookFlight} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Passenger Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pooja Ambare"
                    value={formData.passenger_name}
                    onChange={(e) => setFormData({ ...formData, passenger_name: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. user@gmail.com"
                      value={formData.passenger_email}
                      onChange={(e) => setFormData({ ...formData, passenger_email: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Seat Preference</label>
                    <select
                      value={formData.seat_number}
                      onChange={(e) => setFormData({ ...formData, seat_number: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="12A (Window)" className="bg-gray-900">12A (Window)</option>
                      <option value="12B (Middle)" className="bg-gray-900">12B (Middle)</option>
                      <option value="12C (Aisle)" className="bg-gray-900">12C (Aisle)</option>
                      <option value="04F (Extra Legroom)" className="bg-gray-900">04F (Extra Legroom)</option>
                      <option value="01A (Business Suite)" className="bg-gray-900">01A (Business Suite)</option>
                    </select>
                  </div>
                </div>

                {/* Associate Journey Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-indigo-300 mb-1">Associate Trip / Journey Destination</label>
                  <select
                    value={formData.trip_id || ''}
                    onChange={(e) => setFormData({ ...formData, trip_id: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                  >
                    <option value="" className="bg-gray-900">✨ Auto-create dedicated trip for {selectedFlight.destination}</option>
                    {userTrips.map(t => (
                      <option key={t.id} value={t.id} className="bg-gray-900">
                        {t.title} ({t.destination})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Cabin Class</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, cabin_class: 'Economy' })}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        formData.cabin_class === 'Economy'
                          ? 'border-primary bg-primary/20 text-white'
                          : 'border-white/10 bg-white/5 text-gray-400'
                      }`}
                    >
                      Economy ({formatINR(selectedFlight.price_economy)})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, cabin_class: 'Business' })}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        formData.cabin_class === 'Business'
                          ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                          : 'border-white/10 bg-white/5 text-gray-400'
                      }`}
                    >
                      Business ({formatINR(selectedFlight.price_business)})
                    </button>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400">Total Fare</p>
                    <p className="text-2xl font-black text-emerald-400">{formatINR(calculatePrice())}</p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isBooking}
                    className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-6 py-3 font-bold shadow-lg shadow-primary/25"
                  >
                    {isBooking ? 'Generating Ticket...' : 'Confirm & Generate Pass'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* High-Fidelity Printable Boarding Pass Modal */}
      <AnimatePresence>
        {viewingPass && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative"
            >
              <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2 text-primary font-extrabold tracking-wider text-sm uppercase">
                  <Plane className="w-5 h-5" /> Digital Boarding Pass
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                  <button 
                    onClick={() => setViewingPass(null)}
                    className="text-gray-400 hover:text-white p-1.5 rounded-full bg-white/5"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Boarding Pass Ticket UI */}
              <div className="bg-gradient-to-r from-purple-900/30 via-black to-blue-900/30 border border-white/15 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-white">{viewingPass.airline_name}</h2>
                    <p className="text-xs text-primary font-mono font-bold mt-0.5">Flight {viewingPass.flight_number}</p>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs font-bold px-3 py-1 rounded-xl bg-white/10 text-white border border-white/20">
                      {viewingPass.booking_reference}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center my-6">
                  <div>
                    <p className="text-4xl font-black text-white tracking-tight">{viewingPass.origin_code}</p>
                    <p className="text-xs text-gray-300 mt-1">{viewingPass.origin}</p>
                  </div>

                  <div className="flex flex-col items-center px-4">
                    <p className="text-xs text-primary font-bold">{viewingPass.duration || '1h 30m'}</p>
                    <div className="w-28 sm:w-36 border-t-2 border-dashed border-primary/60 my-1 relative">
                      <Plane className="w-4 h-4 text-primary absolute left-1/2 -top-2.5 -translate-x-1/2 transform rotate-90" />
                    </div>
                    <span className="text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full mt-1">ON TIME</span>
                  </div>

                  <div className="text-right">
                    <p className="text-4xl font-black text-white tracking-tight">{viewingPass.destination_code}</p>
                    <p className="text-xs text-gray-300 mt-1">{viewingPass.destination}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 my-6 text-center">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Passenger</p>
                    <p className="text-xs font-bold text-white mt-1 truncate">{viewingPass.passenger_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Seat</p>
                    <p className="text-sm font-black text-primary mt-0.5">{viewingPass.seat_number}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Terminal / Gate</p>
                    <p className="text-xs font-bold text-amber-400 mt-1">{viewingPass.terminal || 'T2'} / {viewingPass.gate || 'G4'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Boarding Time</p>
                    <p className="text-xs font-bold text-white mt-1">{viewingPass.departure_time}</p>
                  </div>
                </div>

                {/* Barcode / QR Section */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-dashed border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white rounded-xl">
                      <QrCode className="w-10 h-10 text-black" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white uppercase tracking-wider">Electronic Security Pass</p>
                      <p className="text-[10px] text-gray-400 font-mono">Scan at TSA / Airport E-Gates</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleCancelBooking(viewingPass.id)}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-red-500/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Booking</span>
                    </button>
                    <div className="text-right font-mono text-xs text-gray-400 tracking-widest hidden sm:block">
                      ||| | |||| || | ||| |||| | ||
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
