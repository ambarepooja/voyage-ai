import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Backpack, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Sparkles, 
  FileText, 
  Smartphone, 
  Shirt, 
  HeartPulse, 
  Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '../services/api';

interface PackingItem {
  id: string;
  category: string;
  name: string;
  isPacked: boolean;
}

const DEFAULT_PACKING_ITEMS: PackingItem[] = [
  // Documents
  { id: '1', category: 'Documents & Money', name: 'Passport / National ID & 2 photocopies', isPacked: true },
  { id: '2', category: 'Documents & Money', name: 'Flight tickets & Hotel confirmation vouchers', isPacked: true },
  { id: '3', category: 'Documents & Money', name: 'Forex card / Credit card & Local cash (INR)', isPacked: false },
  { id: '4', category: 'Documents & Money', name: 'Travel health insurance policy copy', isPacked: false },

  // Electronics
  { id: '5', category: 'Electronics & Tech', name: 'Universal travel plug adapter & extension cord', isPacked: true },
  { id: '6', category: 'Electronics & Tech', name: '20,000 mAh High-speed Power Bank', isPacked: false },
  { id: '7', category: 'Electronics & Tech', name: 'Noise-canceling headphones / earbuds', isPacked: false },
  { id: '8', category: 'Electronics & Tech', name: 'Camera, memory cards & charging cables', isPacked: false },

  // Apparel & Footwear
  { id: '9', category: 'Apparel & Footwear', name: 'Weather-adaptive jackets & windbreakers', isPacked: false },
  { id: '10', category: 'Apparel & Footwear', name: 'Comfortable hiking shoes / walking sneakers', isPacked: true },
  { id: '11', category: 'Apparel & Footwear', name: 'Sunglasses with UV protection', isPacked: false },
  { id: '12', category: 'Apparel & Footwear', name: 'Quick-dry microfiber towel & swimwear', isPacked: false },

  // Health & Care
  { id: '13', category: 'Health & Toiletries', name: 'Personal first aid (Pain relief, Band-aids, Antacids)', isPacked: false },
  { id: '14', category: 'Health & Toiletries', name: 'SPF 50+ Sunscreen & Lip balm', isPacked: true },
  { id: '15', category: 'Health & Toiletries', name: 'Motion sickness pills & electrolytes (ORS)', isPacked: false },
  { id: '16', category: 'Health & Toiletries', name: 'Mosquito repellent spray & hand sanitizer', isPacked: false },
];

export default function PackingList() {
  const [items, setItems] = useState<PackingItem[]>(() => {
    const saved = localStorage.getItem('voyage_packing_list');
    return saved ? JSON.parse(saved) : DEFAULT_PACKING_ITEMS;
  });
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [newItemName, setNewItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Apparel & Footwear');
  const [isGenerating, setIsGenerating] = useState(false);
  const [destinationPrompt, setDestinationPrompt] = useState('Goa');

  useEffect(() => {
    localStorage.setItem('voyage_packing_list', JSON.stringify(items));
  }, [items]);

  const categories = [
    { name: 'All', icon: Compass },
    { name: 'Documents & Money', icon: FileText },
    { name: 'Electronics & Tech', icon: Smartphone },
    { name: 'Apparel & Footwear', icon: Shirt },
    { name: 'Health & Toiletries', icon: HeartPulse },
  ];

  const totalItems = items.length;
  const packedItemsCount = items.filter(i => i.isPacked).length;
  const progressPercent = totalItems > 0 ? Math.round((packedItemsCount / totalItems) * 100) : 0;

  const togglePacked = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, isPacked: !item.isPacked } : item));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: PackingItem = {
      id: Date.now().toString(),
      category: selectedCategory,
      name: newItemName.trim(),
      isPacked: false
    };

    setItems(prev => [newItem, ...prev]);
    setNewItemName('');
  };

  const handleAIGenerate = async () => {
    if (!destinationPrompt.trim()) return;
    setIsGenerating(true);

    try {
      const prompt = `Generate a 6-item essential packing list for a trip to ${destinationPrompt}. Format each item with category: [Category] Item Name. Categories should be one of: Documents & Money, Electronics & Tech, Apparel & Footwear, Health & Toiletries.`;
      const res = await api.post('/ai/chat', { message: prompt });
      
      const text = res.data.reply || '';
      const lines = text.split('\n');
      const newGenerated: PackingItem[] = [];

      lines.forEach((line: string) => {
        const clean = line.replace(/^[\*\-\d\.\s\[\]xX]+/, '').trim();
        if (clean && clean.length > 5) {
          let cat = 'Apparel & Footwear';
          if (clean.toLowerCase().includes('passport') || clean.toLowerCase().includes('card') || clean.toLowerCase().includes('cash') || clean.toLowerCase().includes('ticket')) {
            cat = 'Documents & Money';
          } else if (clean.toLowerCase().includes('charger') || clean.toLowerCase().includes('power') || clean.toLowerCase().includes('camera') || clean.toLowerCase().includes('adapter')) {
            cat = 'Electronics & Tech';
          } else if (clean.toLowerCase().includes('med') || clean.toLowerCase().includes('sunscreen') || clean.toLowerCase().includes('pill') || clean.toLowerCase().includes('first aid')) {
            cat = 'Health & Toiletries';
          }

          newGenerated.push({
            id: (Date.now() + Math.random() * 1000).toString(),
            category: cat,
            name: clean,
            isPacked: false
          });
        }
      });

      if (newGenerated.length > 0) {
        setItems(prev => [...newGenerated, ...prev]);
      }
    } catch (err) {
      console.error("AI Packing generation failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredItems = activeCategory === 'All' 
    ? items 
    : items.filter(i => i.category === activeCategory);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 rounded-2xl border border-purple-500/30 text-purple-400">
              <Backpack className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Smart Packing Assistant</h1>
          </div>
          <p className="text-gray-400 text-sm mt-1">Smart checklist organized by weather, activity, and travel duration.</p>
        </div>

        {/* Packing Progress Ring Card */}
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl backdrop-blur-md">
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Packing Progress</p>
            <p className="text-lg font-black text-white">{packedItemsCount} / {totalItems} Items ({progressPercent}%)</p>
          </div>

          <div className="w-12 h-12 rounded-full border-4 border-white/10 relative flex items-center justify-center">
            <div 
              className="absolute inset-0 rounded-full border-4 border-primary transition-all duration-500"
              style={{
                clipPath: `polygon(50% 50%, -50% -50%, ${progressPercent}% -50%, ${progressPercent}% ${progressPercent}%)`
              }}
            />
            <span className="text-[11px] font-bold text-white z-10">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* AI Destination Generator Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900/30 via-black to-primary/20 border border-white/15 p-6 rounded-3xl backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/20 rounded-2xl text-primary">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Generate Checklist by Destination</h3>
            <p className="text-xs text-gray-400">AI adapts the packing recommendations based on weather and terrain.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="e.g. Ladakh (Winter), Bali (Beach)"
            value={destinationPrompt}
            onChange={(e) => setDestinationPrompt(e.target.value)}
            className="bg-black/60 border border-white/15 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary w-full md:w-64"
          />
          <Button 
            onClick={handleAIGenerate}
            disabled={isGenerating}
            className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-5 text-xs font-bold shadow-lg shadow-primary/25 whitespace-nowrap"
          >
            {isGenerating ? 'AI Thinking...' : '✨ Generate'}
          </Button>
        </div>
      </motion.div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.name;
          const count = cat.name === 'All' 
            ? items.length 
            : items.filter(i => i.category === cat.name).length;

          return (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border ${
                isActive 
                  ? 'bg-primary text-white border-primary/40 shadow-lg shadow-primary/25' 
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-gray-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick Add Custom Item Form */}
      <form onSubmit={addItem} className="flex gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl">
        <input 
          type="text" 
          placeholder="Add custom packing item (e.g. Scuba diving goggles, Thermal socks)..."
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none flex-1 px-3"
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none cursor-pointer"
        >
          <option value="Documents & Money">Documents & Money</option>
          <option value="Electronics & Tech">Electronics & Tech</option>
          <option value="Apparel & Footwear">Apparel & Footwear</option>
          <option value="Health & Toiletries">Health & Toiletries</option>
        </select>

        <Button type="submit" className="bg-primary hover:bg-primary/90 text-white rounded-xl px-4 text-xs font-bold">
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </form>

      {/* Packing Checklist Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.02 }}
              onClick={() => togglePacked(item.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                item.isPacked 
                  ? 'bg-green-950/20 border-green-500/30 text-gray-400' 
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
              }`}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-2">
                <button className="text-primary group-hover:scale-110 transition-transform">
                  {item.isPacked ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 fill-green-500/20" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                <div className="min-w-0">
                  <p className={`text-sm font-medium leading-relaxed truncate ${item.isPacked ? 'line-through text-gray-500' : 'text-white'}`}>
                    {item.name}
                  </p>
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteItem(item.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Delete Item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
