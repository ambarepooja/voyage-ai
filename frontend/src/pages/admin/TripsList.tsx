import { useEffect, useState, useMemo } from 'react';
import { api } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Plus, Trash2, Edit, Edit2, Search, Filter, Calendar, DollarSign, X, Check } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { UserAvatar } from '../../components/UserAvatar';

export default function TripsList() {
  const [trips, setTrips] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [editingTrip, setEditingTrip] = useState<any | null>(null);

  const [editForm, setEditForm] = useState({
    title: '',
    destination: '',
    start_date: '',
    end_date: '',
    budget: '0'
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [tripsRes, usersRes] = await Promise.all([
        api.get('/admin/trips'),
        api.get('/admin/users')
      ]);
      setTrips(tripsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error("Failed to load admin trip data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrips = async (userId: string) => {
    try {
      const url = userId !== 'all' ? `/admin/trips?user_id=${userId}` : '/admin/trips';
      const res = await api.get(url);
      setTrips(res.data);
    } catch (err) {
      console.error("Failed to fetch admin trips", err);
    }
  };

  const handleUserFilterChange = (userId: string) => {
    setSelectedUserId(userId);
    fetchTrips(userId);
  };

  const handleOpenEditModal = (trip: any) => {
    setEditingTrip(trip);
    setEditForm({
      title: trip.title,
      destination: trip.destination,
      start_date: trip.start_date,
      end_date: trip.end_date,
      budget: trip.budget ? trip.budget.toString() : '0'
    });
  };

  const handleUpdateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrip) return;
    try {
      await api.put(`/admin/trips/${editingTrip.id}`, {
        title: editForm.title,
        destination: editForm.destination,
        start_date: editForm.start_date,
        end_date: editForm.end_date,
        budget: parseInt(editForm.budget || '0')
      });
      setEditingTrip(null);
      fetchTrips(selectedUserId);
    } catch (err: any) {
      console.error("Failed to update trip", err);
      alert("Failed to update trip details");
    }
  };

  const handleDeleteTrip = async (tripId: number) => {
    if (!window.confirm("Are you sure you want to delete this trip and all its associated expenses?")) return;
    try {
      await api.delete(`/admin/trips/${tripId}`);
      setTrips(prev => prev.filter(t => t.id !== tripId));
    } catch (err) {
      console.error("Failed to delete trip", err);
      alert("Failed to delete trip");
    }
  };

  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      const matchSearch = t.destination.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.user_email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [trips, searchQuery]);

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header & User Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Map className="text-orange-400 w-8 h-8" /> User Trips Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">Audit, inspect, and update journeys created by platform travelers.</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between backdrop-blur-md">
        <div className="w-full sm:w-auto flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-2 rounded-xl text-sm">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-xs text-gray-400 font-semibold uppercase">Filter by User:</span>
          <select 
            value={selectedUserId}
            onChange={(e) => handleUserFilterChange(e.target.value)}
            className="bg-transparent text-white focus:outline-none cursor-pointer font-medium"
          >
            <option value="all" className="bg-gray-800">All Registered Users ({users.length})</option>
            {users.map(u => (
              <option key={u.id} value={u.id.toString()} className="bg-gray-800">
                {u.email} (ID: #{u.id})
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-72 flex items-center bg-black/40 border border-white/10 px-3 py-2 rounded-xl text-sm">
          <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
          <input 
            type="text"
            placeholder="Search destination or user email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white focus:outline-none w-full placeholder-gray-400"
          />
        </div>
      </div>

      {/* Trips Table */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Loading trip records...</div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/10 text-gray-300 text-sm">
                  <th className="p-4 font-semibold">Trip ID</th>
                  <th className="p-4 font-semibold">User Account</th>
                  <th className="p-4 font-semibold">Title & Destination</th>
                  <th className="p-4 font-semibold">Dates</th>
                  <th className="p-4 font-semibold">Budget</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrips.map((trip, idx) => (
                  <motion.tr 
                    key={trip.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors text-gray-300"
                  >
                    <td className="p-4 font-mono font-bold text-gray-400">#{trip.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <UserAvatar 
                          avatarUrl={trip.user_avatar}
                          name={trip.user_name}
                          email={trip.user_email}
                          size="sm"
                        />
                        <div>
                          <p className="text-white font-medium text-sm">{trip.user_email}</p>
                          <p className="text-xs text-gray-400">User ID: #{trip.user_id} • {trip.user_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-white font-bold text-base">{trip.destination}</p>
                      <p className="text-xs text-gray-400">{trip.title}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-300">
                      {trip.start_date} → {trip.end_date}
                    </td>
                    <td className="p-4 font-bold text-green-400">
                      {formatINR(Number(trip.budget || 0))}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(trip)}
                          title="Edit Trip"
                          className="p-2 text-indigo-300 hover:bg-indigo-500/20 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTrip(trip.id)}
                          title="Delete Trip"
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredTrips.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-400">
                      No trips found for the selected user.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Edit Trip Modal */}
      <AnimatePresence>
        {editingTrip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setEditingTrip(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-bold text-white mb-1">Edit User Trip #{editingTrip.id}</h3>
              <p className="text-xs text-gray-400 mb-6">User: {editingTrip.user_email}</p>

              <form onSubmit={handleUpdateTrip} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Trip Title</label>
                  <input 
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Destination</label>
                  <input 
                    type="text"
                    required
                    value={editForm.destination}
                    onChange={(e) => setEditForm({...editForm, destination: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Start Date</label>
                    <input 
                      type="date"
                      required
                      value={editForm.start_date}
                      onChange={(e) => setEditForm({...editForm, start_date: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">End Date</label>
                    <input 
                      type="date"
                      required
                      value={editForm.end_date}
                      onChange={(e) => setEditForm({...editForm, end_date: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Budget (₹)</label>
                  <input 
                    type="number"
                    required
                    value={editForm.budget}
                    onChange={(e) => setEditForm({...editForm, budget: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                  />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-6 mt-2 font-semibold">
                  Update Trip Details
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
