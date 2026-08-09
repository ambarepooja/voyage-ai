import { useEffect, useState, useMemo } from 'react';
import { api } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Trash2, Edit, X, Search, Filter, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { UserAvatar } from '../../components/UserAvatar';

export default function ExpensesList() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [editingExpense, setEditingExpense] = useState<any | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const [editForm, setEditForm] = useState({
    title: '',
    amount: '',
    category: 'Food',
    date: today
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [expensesRes, usersRes] = await Promise.all([
        api.get('/admin/expenses'),
        api.get('/admin/users')
      ]);
      setExpenses(expensesRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error("Failed to fetch admin expense data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExpenses = async (userId: string) => {
    try {
      const url = userId !== 'all' ? `/admin/expenses?user_id=${userId}` : '/admin/expenses';
      const res = await api.get(url);
      setExpenses(res.data);
    } catch (err) {
      console.error("Failed to fetch admin expenses", err);
    }
  };

  const handleUserFilterChange = (userId: string) => {
    setSelectedUserId(userId);
    fetchExpenses(userId);
  };

  const handleOpenEditModal = (expense: any) => {
    setEditingExpense(expense);
    setEditForm({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category || 'Food',
      date: expense.date ? expense.date.split('T')[0] : today
    });
  };

  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    try {
      await api.put(`/admin/expenses/${editingExpense.id}`, {
        title: editForm.title,
        amount: parseFloat(editForm.amount),
        category: editForm.category,
        date: editForm.date
      });
      setEditingExpense(null);
      fetchExpenses(selectedUserId);
    } catch (err: any) {
      console.error("Failed to update expense", err);
      alert("Failed to update expense");
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this expense record?")) return;
    try {
      await api.delete(`/admin/expenses/${id}`);
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (err) {
      console.error("Failed to delete expense", err);
      alert("Failed to delete expense");
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchCategory = selectedCategory === 'All Categories' || e.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch = e.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.trip_title?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [expenses, selectedCategory, searchQuery]);

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <CreditCard className="text-red-400 w-8 h-8" /> User Expenses Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">Audit, monitor, and manage recorded travel expenses across all platform accounts.</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* User Filter */}
          <div className="flex items-center bg-black/40 border border-white/10 px-3 py-2 rounded-xl text-sm">
            <Filter className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
            <span className="text-xs text-gray-400 font-semibold uppercase mr-2">User:</span>
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

          {/* Category Filter */}
          <div className="flex items-center bg-black/40 border border-white/10 px-3 py-2 rounded-xl text-sm">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer font-medium"
            >
              <option value="All Categories" className="bg-gray-800">All Categories</option>
              <option value="Food" className="bg-gray-800">Food</option>
              <option value="Accommodation" className="bg-gray-800">Accommodation</option>
              <option value="Transport" className="bg-gray-800">Transport</option>
              <option value="Activities" className="bg-gray-800">Activities</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="w-full md:w-72 flex items-center bg-black/40 border border-white/10 px-3 py-2 rounded-xl text-sm">
          <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
          <input 
            type="text" 
            placeholder="Search description, email, trip..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white focus:outline-none w-full placeholder-gray-400"
          />
        </div>
      </div>

      {/* Expenses Table */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Loading user expense records...</div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-white/10 text-gray-300 text-sm">
                  <th className="p-4 font-semibold">Expense ID</th>
                  <th className="p-4 font-semibold">User Account</th>
                  <th className="p-4 font-semibold">Trip Journey</th>
                  <th className="p-4 font-semibold">Description</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense, idx) => (
                  <motion.tr 
                    key={expense.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors text-gray-300"
                  >
                    <td className="p-4 font-mono font-bold text-gray-400">#{expense.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <UserAvatar 
                          avatarUrl={expense.user_avatar}
                          name={expense.user_name}
                          email={expense.user_email}
                          size="sm"
                        />
                        <div>
                          <p className="text-white font-medium text-sm">{expense.user_email}</p>
                          <p className="text-xs text-gray-400">User ID: #{expense.user_id} • {expense.user_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <span className="text-indigo-300 font-semibold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> #{expense.trip_id} - {expense.trip_title}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-white">{expense.title}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-gray-200 border border-white/10">
                        {expense.category}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-red-400 text-base">
                      -{formatINR(Number(expense.amount))}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(expense)}
                          title="Edit Expense"
                          className="p-2 text-indigo-300 hover:bg-indigo-500/20 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteExpense(expense.id)}
                          title="Delete Expense"
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-gray-400">
                      No expense records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Edit Expense Modal */}
      <AnimatePresence>
        {editingExpense && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setEditingExpense(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-bold text-white mb-1">Edit User Expense #{editingExpense.id}</h3>
              <p className="text-xs text-gray-400 mb-6">User: {editingExpense.user_email}</p>

              <form onSubmit={handleUpdateExpense} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Description / Title</label>
                  <input 
                    type="text" 
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Amount (₹)</label>
                    <input 
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={editForm.amount}
                      onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Category</label>
                    <select 
                      value={editForm.category}
                      onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                    >
                      <option className="bg-gray-800">Food</option>
                      <option className="bg-gray-800">Accommodation</option>
                      <option className="bg-gray-800">Transport</option>
                      <option className="bg-gray-800">Activities</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Expense Date</label>
                  <input 
                    type="date"
                    required
                    value={editForm.date}
                    onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                  />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-6 mt-2 font-semibold">
                  Update Expense Details
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
