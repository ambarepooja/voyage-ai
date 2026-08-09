import { useEffect, useState, useMemo } from 'react';
import { api } from '../../services/api';
import { motion } from 'framer-motion';
import { Contact2, Search, Phone, Mail } from 'lucide-react';
import { UserAvatar } from '../../components/UserAvatar';

export default function ProfilesList() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await api.get('/admin/profiles');
        setProfiles(res.data);
      } catch (err) {
        console.error("Failed to fetch profiles", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      const name = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
      const email = (p.user_email || '').toLowerCase();
      const phone = (p.phone_number || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return name.includes(query) || email.includes(query) || phone.includes(query) || p.user_id.toString().includes(query);
    });
  }, [profiles, searchQuery]);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Contact2 className="text-pink-400 w-8 h-8" /> User Contact Profiles
          </h1>
          <p className="text-gray-400 text-sm mt-1">Directory of user personal information, phone numbers, and account associations.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-md">
        <div className="text-sm text-gray-400 font-medium">
          Showing <span className="text-white font-bold">{filteredProfiles.length}</span> Profile Records
        </div>

        <div className="w-full md:w-80 flex items-center bg-black/40 border border-white/10 px-3 py-2 rounded-xl text-sm">
          <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
          <input 
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white focus:outline-none w-full placeholder-gray-400"
          />
        </div>
      </div>

      {/* Profiles Directory Table */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Loading user profiles...</div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-white/10 text-gray-300 text-sm">
                  <th className="p-4 font-semibold">Profile ID</th>
                  <th className="p-4 font-semibold">User Account</th>
                  <th className="p-4 font-semibold">First Name</th>
                  <th className="p-4 font-semibold">Last Name</th>
                  <th className="p-4 font-semibold">Phone Contact</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map((profile, idx) => (
                  <motion.tr 
                    key={profile.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors text-gray-300"
                  >
                    <td className="p-4 font-mono font-bold text-gray-400">#{profile.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar 
                          avatarUrl={profile.avatar_url}
                          name={`${profile.first_name || ''} ${profile.last_name || ''}`.trim()}
                          email={profile.user_email}
                          size="md"
                        />
                        <div>
                          <p className="text-white font-bold text-sm flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400" /> {profile.user_email || 'Unknown Email'}
                          </p>
                          <p className="text-xs text-gray-400">User ID: #{profile.user_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-white">
                      {profile.first_name || <span className="text-gray-500 italic">Not set</span>}
                    </td>
                    <td className="p-4 font-semibold text-white">
                      {profile.last_name || <span className="text-gray-500 italic">Not set</span>}
                    </td>
                    <td className="p-4 font-mono text-sm text-gray-200">
                      {profile.phone_number ? (
                        <span className="flex items-center gap-1.5 text-green-300 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full text-xs font-semibold w-fit">
                          <Phone className="w-3 h-3 text-green-400" /> {profile.phone_number}
                        </span>
                      ) : (
                        <span className="text-gray-500 italic text-xs">No phone provided</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
                {filteredProfiles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-400">
                      No user profiles found matching your search.
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
