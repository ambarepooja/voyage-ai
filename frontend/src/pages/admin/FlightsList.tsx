import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { motion } from 'framer-motion';
import { Plane, Trash2, Calendar, Search, User } from 'lucide-react';
import { UserAvatar } from '../../components/UserAvatar';

export default function FlightsList() {
  const [flights, setFlights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFlights = async () => {
    try {
      const res = await api.get('/admin/flight-bookings');
      setFlights(res.data);
    } catch (err) {
      console.error("Failed to fetch flight bookings", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this flight ticket record?")) return;
    try {
      await api.delete(`/admin/flight-bookings/${id}`);
      setFlights(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      alert("Failed to delete flight booking.");
    }
  };

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredFlights = flights.filter(f => 
    f.airline_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.passenger_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.booking_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.destination?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 rounded-xl border border-blue-500/30 text-blue-400">
              <Plane className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Commercial Flight Tickets</h1>
          </div>
          <p className="text-gray-400 text-sm mt-1">Audit, monitor, and manage confirmed airline reservations across all platform users.</p>
        </div>

        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search airline, passenger, ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Loading flight reservations...</div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-white/10 text-gray-300 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold">Booking Ref</th>
                  <th className="p-4 font-bold">Airline & Flight</th>
                  <th className="p-4 font-bold">Route & Times</th>
                  <th className="p-4 font-bold">Passenger</th>
                  <th className="p-4 font-bold">Seat & Class</th>
                  <th className="p-4 font-bold">Ticket Price</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredFlights.map((f, idx) => (
                  <motion.tr 
                    key={f.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="hover:bg-white/5 transition-colors text-gray-300 text-sm"
                  >
                    <td className="p-4">
                      <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                        {f.booking_reference}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white text-base">{f.airline_name}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">{f.flight_number}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-white font-bold">
                        <span>{f.origin_code}</span>
                        <span className="text-primary text-xs">&rarr;</span>
                        <span>{f.destination_code}</span>
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-purple-400" />
                        <span>{f.departure_date} ({f.departure_time})</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar 
                          avatarUrl={f.user_avatar}
                          name={f.passenger_name || f.user_name}
                          email={f.user_email || f.passenger_email}
                          size="sm"
                        />
                        <div>
                          <div className="text-white font-medium">{f.passenger_name || f.user_name}</div>
                          <div className="text-xs text-gray-400">{f.user_email || f.passenger_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-primary font-bold">{f.seat_number}</div>
                      <div className="text-xs text-amber-400 font-medium">{f.cabin_class}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-emerald-400 font-extrabold text-base">
                        {formatINR(f.ticket_price)}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30 capitalize">
                        {f.status || 'Confirmed'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(f.id)}
                        className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                        title="Delete Ticket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}

                {filteredFlights.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-500">
                          <Plane className="w-8 h-8" />
                        </div>
                        <p className="text-base font-medium text-gray-300">No flight reservations recorded.</p>
                        <p className="text-xs text-gray-500">When users book flights and boarding passes, they will appear in this registry.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
