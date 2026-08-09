import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';

export default function NotificationsList() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/admin/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <Bell className="mr-3 text-red-400" /> Notifications
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
                  <th className="p-4 font-semibold">Title</th>
                  <th className="p-4 font-semibold">Message</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notification, idx) => (
                  <motion.tr 
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors text-gray-300"
                  >
                    <td className="p-4">{notification.id}</td>
                    <td className="p-4 text-blue-400">#{notification.user_id}</td>
                    <td className="p-4 text-white font-bold">{notification.title}</td>
                    <td className="p-4 text-sm">{notification.message}</td>
                    <td className="p-4">
                      {notification.is_read ? (
                         <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400">Read</span>
                      ) : (
                         <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">Unread</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
                {notifications.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">No notifications found.</td>
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
