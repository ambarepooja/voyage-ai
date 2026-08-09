import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

export default function SavedPlacesList() {
  const [places, setPlaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await api.get('/admin/saved-places');
        setPlaces(res.data);
      } catch (err) {
        console.error("Failed to fetch saved places", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <MapPin className="mr-3 text-red-400" /> Saved Places
        </h1>
      </div>

      {isLoading ? (
        <div className="text-white">Loading...</div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-white/10 text-gray-300 text-sm">
                  <th className="p-4 font-semibold">ID</th>
                  <th className="p-4 font-semibold">User ID</th>
                  <th className="p-4 font-semibold">Place ID</th>
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Category</th>
                </tr>
              </thead>
              <tbody>
                {places.map((place, idx) => (
                  <motion.tr 
                    key={place.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors text-gray-300"
                  >
                    <td className="p-4">{place.id}</td>
                    <td className="p-4 text-blue-400">#{place.user_id}</td>
                    <td className="p-4 font-mono text-sm">{place.place_id}</td>
                    <td className="p-4 text-white font-medium">{place.name}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-300">
                        {place.category || 'uncategorized'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
                {places.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">No saved places found.</td>
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
