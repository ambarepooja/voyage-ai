import { useEffect, useState, useMemo } from 'react';
import { api } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Hotel, Trash2, Search, Filter, Calendar, MapPin, User, Check, X, Building2 } from 'lucide-react';
import { UserAvatar } from '../../components/UserAvatar';

export default function HotelBookingsList() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBookings = async () => {
    try {
      const res = await api.get('/admin/hotel-bookings');
      setBookings(res.data);
    } catch (err) {
      console.error("Failed to fetch hotel bookings", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this hotel reservation?")) return;
    try {
      await api.delete(`/admin/hotel-bookings/${id}`);
      setBookings(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      alert("Failed to delete booking.");
    }
  };

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredBookings = bookings.filter(b => 
    b.hotel_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.booking_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 rounded-xl border border-amber-500/30 text-amber-400">
              <Hotel className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Hotel Reservations</h1>
          </div>
          <p className="text-gray-400 text-sm mt-1">Audit, monitor, and manage confirmed hotel bookings across all platform users.</p>
        </div>

        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search hotel, guest, ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Loading hotel reservations...</div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-white/10 text-gray-300 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold">Booking Ref</th>
                  <th className="p-4 font-bold">Hotel & Location</th>
                  <th className="p-4 font-bold">User / Guest</th>
                  <th className="p-4 font-bold">Stay Dates</th>
                  <th className="p-4 font-bold">Room & Guests</th>
                  <th className="p-4 font-bold">Total Amount</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBookings.map((b, idx) => (
                  <motion.tr 
                    key={b.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="hover:bg-white/5 transition-colors text-gray-300 text-sm"
                  >
                    <td className="p-4">
                      <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                        {b.booking_reference}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white text-base">{b.hotel_name}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <MapPin className="w-3 h-3 text-red-400" /> {b.location}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar 
                          avatarUrl={b.user_avatar}
                          name={b.guest_name || b.user_name}
                          email={b.user_email || b.guest_email}
                          size="sm"
                        />
                        <div>
                          <div className="text-white font-medium">{b.guest_name || b.user_name}</div>
                          <div className="text-xs text-gray-400">{b.user_email || b.guest_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-xs text-gray-300 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-purple-400" />
                        <span>{b.check_in_date} &rarr; {b.check_out_date}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-white font-medium">{b.room_type}</div>
                      <div className="text-xs text-gray-400">{b.guests_count} Guest{b.guests_count > 1 ? 's' : ''}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-emerald-400 font-extrabold text-base">
                        {formatINR(b.total_price)}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {formatINR(b.price_per_night)}/night
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30 capitalize">
                        {b.status || 'Confirmed'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(b.id)}
                        className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                        title="Delete Booking"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}

                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-500">
                          <Hotel className="w-8 h-8" />
                        </div>
                        <p className="text-base font-medium text-gray-300">No hotel reservations found.</p>
                        <p className="text-xs text-gray-500">When users book hotels, they will appear in this registry.</p>
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
