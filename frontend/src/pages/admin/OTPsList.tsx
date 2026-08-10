import { useEffect, useState, useMemo } from 'react';
import { api } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Clock, CheckCircle2, Search, Filter, RefreshCw, Mail, Calendar, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { UserAvatar } from '../../components/UserAvatar';

export default function OTPsList() {
  const [otps, setOtps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [nowTime, setNowTime] = useState<number>(Date.now());
  const [isPurging, setIsPurging] = useState(false);

  const fetchOTPs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/otps');
      setOtps(res.data);
    } catch (err) {
      console.error("Failed to fetch OTP logs", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOTPs();
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);

    const interval = setInterval(() => {
      fetchOTPs();
    }, 20000);

    return () => {
      clearInterval(timer);
      clearInterval(interval);
    };
  }, []);

  const handleDeleteOtp = async (otpId: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this OTP log?")) return;
    try {
      await api.delete(`/admin/otps/${otpId}`);
      setOtps(prev => prev.filter(o => o.id !== otpId));
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete OTP log");
    }
  };

  const handlePurgeExpired = async () => {
    setIsPurging(true);
    try {
      await api.post('/admin/otps/cleanup-expired');
      await fetchOTPs();
    } catch (err: any) {
      alert("Failed to purge expired OTPs");
    } finally {
      setIsPurging(false);
    }
  };

  function isOtpExpired(otp: any): boolean {
    if (otp.is_expired) return true;
    if (!otp.expires_at) return false;
    const str = otp.expires_at.endsWith("Z") || otp.expires_at.includes("+") ? otp.expires_at : otp.expires_at + "Z";
    const expTime = new Date(str).getTime();
    return nowTime > expTime;
  }

  // Filter out expired OTPs automatically
  const filteredOtps = useMemo(() => {
    return otps
      .filter(o => !isOtpExpired(o) || o.is_used)
      .filter(o => {
        let matchStatus = true;
        if (statusFilter === 'active') matchStatus = !o.is_used;
        if (statusFilter === 'used') matchStatus = o.is_used;

        const matchSearch = o.code.includes(searchQuery) || 
                            (o.user_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (o.user_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            o.user_id.toString().includes(searchQuery);

        return matchStatus && matchSearch;
      });
  }, [otps, statusFilter, searchQuery, nowTime]);

  const formatISTDateTime = (isoString?: string | null) => {
    if (!isoString) return "-";
    const str = isoString.endsWith("Z") || isoString.includes("+") ? isoString : isoString + "Z";
    const dateObj = new Date(str);
    if (isNaN(dateObj.getTime())) return "-";

    const isToday = new Date().toDateString() === dateObj.toDateString();
    
    const timeStr = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(dateObj);

    if (isToday) {
      return `Today, ${timeStr} IST`;
    }

    const dateStr = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(dateObj);

    return `${dateStr} • ${timeStr} IST`;
  };

  const getTimeRemaining = (expiresAtStr?: string | null) => {
    if (!expiresAtStr) return null;
    const str = expiresAtStr.endsWith("Z") || expiresAtStr.includes("+") ? expiresAtStr : expiresAtStr + "Z";
    const expiresAt = new Date(str).getTime();
    const diff = expiresAt - nowTime;

    if (diff <= 0) return "Expiring & deleting...";
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s remaining`;
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <KeyRound className="text-yellow-500 w-8 h-8" /> OTP Security & Live Verification Logs
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Live audit log of active verification codes. Expired OTPs are automatically purged and deleted.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={handlePurgeExpired}
            disabled={isPurging}
            className="bg-red-500/15 hover:bg-red-500/25 text-red-600 dark:text-red-300 border border-red-500/30 rounded-2xl gap-2 text-xs font-bold"
          >
            <Trash2 className="w-4 h-4 text-red-500" /> {isPurging ? 'Purging...' : 'Purge Expired'}
          </Button>

          <Button 
            onClick={fetchOTPs}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white border border-slate-200 dark:border-white/15 rounded-2xl gap-2 text-xs font-bold"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Logs
          </Button>
        </div>
      </div>

      {/* Auto-Deletion Policy Banner */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-3xl flex items-start gap-3 backdrop-blur-md">
        <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-yellow-800 dark:text-yellow-200 leading-relaxed">
          <strong className="text-slate-900 dark:text-white font-semibold">Automatic 10-Minute Expiry & Deletion:</strong> Every verification code generated by Voyage AI is valid for exactly <strong>10 minutes</strong>. Once used, the code is archived as <span className="text-green-700 dark:text-green-300 font-bold">Used & Verified</span>. If unused, as soon as the 10-minute window elapses, the code is <strong className="text-red-600 dark:text-red-300 font-bold">automatically deleted and removed from the system</strong> for maximum security.
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-md shadow-lg shadow-slate-200/40 dark:shadow-none">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 px-3 py-2 rounded-xl text-sm">
            <Filter className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
            <span className="text-xs text-slate-500 dark:text-gray-400 font-semibold uppercase mr-2">Status:</span>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white focus:outline-none cursor-pointer font-medium"
            >
              <option value="all" className="bg-white dark:bg-gray-800 text-slate-900 dark:text-white">All Active & Verified ({filteredOtps.length})</option>
              <option value="active" className="bg-white dark:bg-gray-800 text-slate-900 dark:text-white">Active Only (Valid ≤ 10m)</option>
              <option value="used" className="bg-white dark:bg-gray-800 text-slate-900 dark:text-white">Used & Verified Only</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="w-full md:w-80 flex items-center bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 px-3 py-2 rounded-xl text-sm">
          <Search className="w-4 h-4 text-slate-400 dark:text-gray-400 mr-2 flex-shrink-0" />
          <input 
            type="text"
            placeholder="Search code, email, name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-slate-900 dark:text-white focus:outline-none w-full placeholder-slate-400 dark:placeholder-gray-400 font-mono text-xs"
          />
        </div>
      </div>

      {/* OTP Table */}
      {isLoading ? (
        <div className="text-center py-20 text-slate-400 dark:text-gray-400">Loading security logs...</div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-md"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-300 text-sm">
                  <th className="p-4 font-semibold">Log ID</th>
                  <th className="p-4 font-semibold">User Account</th>
                  <th className="p-4 font-semibold">OTP Code</th>
                  <th className="p-4 font-semibold">Lifecycle Status</th>
                  <th className="p-4 font-semibold">Generated At</th>
                  <th className="p-4 font-semibold">Validity / Expiry</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredOtps.map((otp, idx) => {
                    const timeRem = getTimeRemaining(otp.expires_at);

                    return (
                      <motion.tr 
                        key={otp.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-700 dark:text-gray-300"
                      >
                        <td className="p-4 font-mono font-bold text-slate-400 dark:text-gray-400">#{otp.id}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar 
                              avatarUrl={otp.user_avatar}
                              name={otp.user_name}
                              email={otp.user_email}
                              size="md"
                            />
                            <div>
                              <p className="text-slate-900 dark:text-white font-bold text-sm flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-gray-400" /> {otp.user_email || 'Unknown Email'}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-gray-400">
                                User ID: #{otp.user_id} {otp.user_name && otp.user_name !== 'No Name' ? `• ${otp.user_name}` : ''}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-mono font-extrabold text-lg text-slate-900 dark:text-white bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/15 px-3.5 py-1 rounded-xl tracking-[0.3em] inline-block shadow-inner">
                            {otp.code}
                          </span>
                        </td>
                        <td className="p-4">
                          {otp.is_used ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/15 text-green-700 dark:text-green-300 border border-green-500/30 inline-flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Used & Verified
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border border-yellow-500/30 inline-flex items-center gap-1.5 animate-pulse">
                              <Clock className="w-3.5 h-3.5 text-yellow-500" /> Active (Valid Code)
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-xs font-mono text-slate-500 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
                            <span>{formatISTDateTime(otp.created_at)}</span>
                          </div>
                        </td>
                        <td className="p-4 text-xs font-mono">
                          <div>
                            <p className="text-slate-600 dark:text-gray-300">
                              Expires: <span className="text-slate-900 dark:text-white font-semibold">{formatISTDateTime(otp.expires_at)}</span>
                            </p>
                            {!otp.is_used && timeRem && (
                              <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3 animate-spin" /> {timeRem}
                              </p>
                            )}
                            {otp.is_used && (
                              <p className="text-green-600 dark:text-green-400/80 font-medium mt-1">
                                Verified before expiration
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteOtp(otp.id)}
                            className="p-2 rounded-xl transition-colors text-slate-400 dark:text-gray-400 hover:text-red-500 hover:bg-red-500/15"
                            title="Delete OTP Log"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
                {filteredOtps.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400 dark:text-gray-400">
                      No active or verified security OTP records found. Expired OTPs are automatically deleted.
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
