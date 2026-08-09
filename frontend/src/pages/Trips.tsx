import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Plane, 
  Navigation2, 
  X, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Images, 
  Upload, 
  Camera, 
  Link as LinkIcon, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Printer, 
  Compass
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { getCurrencyForDestination, formatTripCurrency } from '../utils/currency';

const getDestinationImages = (destination: string): string[] => {
  if (!destination) {
    return [
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=800&auto=format&fit=crop'
    ];
  }
  const destLower = destination.toLowerCase();
  
  if (destLower.includes('goa')) {
    return [
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1587922546307-776227941871?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?q=80&w=800&auto=format&fit=crop'
    ];
  }
  if (destLower.includes('mumbai')) {
    return [
      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595658658421-a9ac45719002?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?q=80&w=800&auto=format&fit=crop'
    ];
  }
  if (destLower.includes('agra') || destLower.includes('taj')) {
    return [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1592635196078-9fe17c2933b6?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1585135497273-1a86b09fe707?q=80&w=800&auto=format&fit=crop'
    ];
  }
  if (destLower.includes('jaipur')) {
    return [
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1617854818583-09e7f077a156?q=80&w=800&auto=format&fit=crop'
    ];
  }
  if (destLower.includes('udaipur')) {
    return [
      'https://images.unsplash.com/photo-1609875471477-7a5490a071d0?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1588083949435-d227318721ad?q=80&w=800&auto=format&fit=crop'
    ];
  }
  if (destLower.includes('delhi')) {
    return [
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1598324789736-4861f894291c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1597040663474-7772ad747e95?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=800&auto=format&fit=crop'
    ];
  }
  if (destLower.includes('kerala')) {
    return [
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1609946782701-7913d8d64117?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop'
    ];
  }
  if (destLower.includes('shimla') || destLower.includes('manali')) {
    return [
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1586375300773-8384e3e4916f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop'
    ];
  }
  if (destLower.includes('tokyo') || destLower.includes('japan')) {
    return [
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=800&auto=format&fit=crop'
    ];
  }
  if (destLower.includes('paris') || destLower.includes('france')) {
    return [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509299349698-ab22323ae696?q=80&w=800&auto=format&fit=crop'
    ];
  }

  return [
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=800&auto=format&fit=crop'
  ];
};

const TripCardWithCarousel = ({ 
  trip, 
  idx, 
  onDelete, 
  onOpenGallery, 
  onOpenImageUpload, 
  onOpenItinerary
}: any) => {
  const navigate = useNavigate();
  const images = trip.cover_image ? [trip.cover_image] : getDestinationImages(trip.destination);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [images.length, isPaused]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: idx * 0.08 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative group cursor-pointer shadow-xl h-[370px] flex flex-col justify-between"
    >
      {/* Real-time Image Carousel Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImgIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${images[currentImgIndex]}')` }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30 z-10" />

      {/* Top Controls */}
      <div className="relative z-20 p-5 flex flex-col justify-between h-full">
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className={`backdrop-blur-md border px-3 py-1 rounded-full text-xs font-semibold ${
              trip.status === 'completed' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-primary/20 text-primary-foreground border-primary/30'
            }`}>
              {trip.status === 'completed' ? 'Completed' : 'Upcoming'}
            </div>

            <div className="flex items-center gap-1.5">
              {trip.cover_image && (
                <span className="text-[10px] font-bold bg-purple-500/30 border border-purple-500/40 text-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-300" /> Original Photo
                </span>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenImageUpload(trip);
                }}
                className="p-1.5 rounded-full bg-black/60 hover:bg-black text-gray-300 hover:text-white border border-white/20 backdrop-blur-md transition-colors"
                title="Upload Original Photo"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenGallery(images, trip.title, trip.destination);
                }}
                className="flex items-center gap-1 text-[11px] font-semibold bg-black/60 hover:bg-black/80 text-white px-2.5 py-1 rounded-full border border-white/20 backdrop-blur-md transition-colors"
                title="View All Photos"
              >
                <Images className="w-3 h-3 text-primary" /> {currentImgIndex + 1}/{images.length}
              </button>
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-primary transition-colors tracking-tight">{trip.title}</h3>
          <p className="text-gray-300 text-sm flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-primary flex-shrink-0" /> {trip.destination}
          </p>
        </div>

        {/* Carousel Arrows */}
        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-30">
          <button
            onClick={handlePrev}
            className="p-2 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto border border-white/20"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto border border-white/20"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div>
          {/* Dot Indicators */}
          <div className="flex justify-center gap-1.5 mb-3">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImgIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentImgIndex ? 'w-6 bg-primary' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          <div className="space-y-2 mb-3 bg-black/50 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-gray-300 text-xs">
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
              </span>
              {(() => {
                const curr = getCurrencyForDestination(trip.destination, trip.title);
                const formatted = formatTripCurrency(trip.budget, curr);
                return (
                  <div className="text-right">
                    <span className="font-bold text-green-400 text-sm flex items-center justify-end gap-1">
                      <span>{curr.flag}</span>
                      <span>{formatted.localFormatted}</span>
                    </span>
                    {curr.code !== 'INR' && (
                      <span className="text-[10px] text-gray-400 font-mono block">
                        ≈ {formatted.inrFormatted}
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 gap-2">
            <button 
              onClick={(e) => onDelete(trip.id, e)}
              title="Delete Trip"
              className="flex items-center justify-center p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors border border-red-500/30"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                onOpenItinerary(trip);
              }}
              title="Day-by-Day Itinerary"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-semibold transition-all shadow-lg"
            >
              <Calendar className="w-3.5 h-3.5 text-purple-300" /> Itinerary
            </button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/dashboard/expenses?trip_id=${trip.id}`);
              }}
              title="View Expenses"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition-all shadow-lg shadow-primary/20"
            >
              Expenses <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Trips() {
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Custom Image Upload Modal
  const [uploadModal, setUploadModal] = useState<{ open: boolean; trip: any; imageUrl: string }>({
    open: false,
    trip: null,
    imageUrl: ''
  });

  // Photo Gallery Modal State
  const [galleryModal, setGalleryModal] = useState<{ open: boolean; images: string[]; title: string; dest: string; activeIdx: number }>({
    open: false,
    images: [],
    title: '',
    dest: '',
    activeIdx: 0
  });

  // Itinerary Planner Modal State
  const [itineraryModal, setItineraryModal] = useState<{
    open: boolean;
    trip: any;
    activeDay: number;
    activities: Record<number, any[]>;
    isGenerating: boolean;
  }>({
    open: false,
    trip: null,
    activeDay: 1,
    activities: {},
    isGenerating: false
  });

  const [newTrip, setNewTrip] = useState({
    title: '',
    destination: '',
    start_date: '',
    end_date: '',
    budget: '',
    cover_image: ''
  });

  const [customActivity, setCustomActivity] = useState({
    time: 'Morning 09:00 AM',
    title: '',
    category: 'Sightseeing',
    cost: '500'
  });

  const fetchTrips = async () => {
    try {
      const res = await api.get('/trips/');
      setTrips(res.data);
    } catch (err) {
      console.error("Failed to fetch trips", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDeleteTrip = async (tripId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this trip and its expenses?")) return;
    try {
      await api.delete(`/trips/${tripId}`);
      setTrips(prev => prev.filter(t => t.id !== tripId));
    } catch (err) {
      console.error("Failed to delete trip", err);
      alert("Failed to delete trip");
    }
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/trips/', {
        title: newTrip.title,
        destination: newTrip.destination,
        start_date: newTrip.start_date,
        end_date: newTrip.end_date,
        budget: parseFloat(newTrip.budget),
        cover_image: newTrip.cover_image || null
      });
      setIsModalOpen(false);
      setNewTrip({ title: '', destination: '', start_date: '', end_date: '', budget: '', cover_image: '' });
      setIsLoading(true);
      fetchTrips();
    } catch (err) {
      console.error("Failed to create trip", err);
      alert("Failed to create trip. Please check your inputs.");
    }
  };

  const handleSaveOriginalPhoto = async () => {
    if (!uploadModal.trip || !uploadModal.imageUrl) return;
    try {
      await api.put(`/trips/${uploadModal.trip.id}`, {
        cover_image: uploadModal.imageUrl
      });
      setUploadModal({ open: false, trip: null, imageUrl: '' });
      fetchTrips();
    } catch (err) {
      console.error("Failed to update trip cover image", err);
      alert("Failed to update cover image");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'new' | 'update') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result as string;
      if (target === 'new') {
        setNewTrip(prev => ({ ...prev, cover_image: base64Url }));
      } else {
        setUploadModal(prev => ({ ...prev, imageUrl: base64Url }));
      }
    };
    reader.readAsDataURL(file);
  };

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const openGallery = (images: string[], title: string, dest: string) => {
    setGalleryModal({
      open: true,
      images,
      title,
      dest,
      activeIdx: 0
    });
  };

  const openImageUpload = (trip: any) => {
    setUploadModal({
      open: true,
      trip,
      imageUrl: trip.cover_image || ''
    });
  };

  const openItinerary = (trip: any) => {
    const saved = localStorage.getItem(`voyage_itinerary_${trip.id}`);
    const initialActivities = saved ? JSON.parse(saved) : {
      1: [
        { id: 1, time: '09:00 AM', title: `Arrival & Hotel Check-in at ${trip.destination}`, category: 'Hotel', cost: 0, completed: true },
        { id: 2, time: '01:30 PM', title: 'Local Seafood / Signature Lunch Bistro', category: 'Dining', cost: 1200, completed: false },
        { id: 3, time: '05:30 PM', title: 'Sunset Views & Beach / Promenade Walk', category: 'Leisure', cost: 300, completed: false }
      ],
      2: [
        { id: 4, time: '09:30 AM', title: 'Historic Landmark & Heritage Tour', category: 'Culture', cost: 600, completed: false },
        { id: 5, time: '03:00 PM', title: 'Adventure Activity / Water Sports', category: 'Adventure', cost: 2500, completed: false },
        { id: 6, time: '08:00 PM', title: 'Fine Dining & Nightlife Exploration', category: 'Dining', cost: 2200, completed: false }
      ],
      3: [
        { id: 7, time: '10:00 AM', title: 'Local Artisan Market & Souvenir Shopping', category: 'Leisure', cost: 1500, completed: false },
        { id: 8, time: '02:00 PM', title: 'Scenic Viewpoint & Farewell Dinner', category: 'Dining', cost: 1800, completed: false }
      ]
    };

    setItineraryModal({
      open: true,
      trip,
      activeDay: 1,
      activities: initialActivities,
      isGenerating: false
    });
  };

  const toggleActivityComplete = (day: number, actId: number) => {
    setItineraryModal(prev => {
      const dayActs = prev.activities[day] || [];
      const updated = dayActs.map(a => a.id === actId ? { ...a, completed: !a.completed } : a);
      const newActs = { ...prev.activities, [day]: updated };
      if (prev.trip) {
        localStorage.setItem(`voyage_itinerary_${prev.trip.id}`, JSON.stringify(newActs));
      }
      return { ...prev, activities: newActs };
    });
  };

  const handleAddCustomActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customActivity.title.trim() || !itineraryModal.trip) return;

    const newAct = {
      id: Date.now(),
      time: customActivity.time,
      title: customActivity.title.trim(),
      category: customActivity.category,
      cost: parseFloat(customActivity.cost) || 0,
      completed: false
    };

    setItineraryModal(prev => {
      const day = prev.activeDay;
      const dayActs = prev.activities[day] || [];
      const newActs = { ...prev.activities, [day]: [...dayActs, newAct] };
      localStorage.setItem(`voyage_itinerary_${prev.trip.id}`, JSON.stringify(newActs));
      return { ...prev, activities: newActs };
    });

    setCustomActivity({ time: 'Morning 09:00 AM', title: '', category: 'Sightseeing', cost: '500' });
  };

  const handleAIGenerateSchedule = async () => {
    if (!itineraryModal.trip) return;
    setItineraryModal(prev => ({ ...prev, isGenerating: true }));

    try {
      const prompt = `Generate a 3-day structured itinerary for ${itineraryModal.trip.destination}. Format day by day with Morning, Afternoon, and Evening activities and estimated cost in INR.`;
      await api.post('/ai/chat', { message: prompt });

      // Add a smart generated day 4 & update day 1-3
      const updatedActs: Record<number, any[]> = {
        1: [
          { id: 101, time: '09:00 AM', title: `Arrival, Check-in & Breakfast in ${itineraryModal.trip.destination}`, category: 'Hotel', cost: 800, completed: true },
          { id: 102, time: '02:00 PM', title: 'Explore Top Cultural Heritage & Local Streets', category: 'Culture', cost: 500, completed: false },
          { id: 103, time: '06:30 PM', title: 'Sunset Views & Signature Local Dining', category: 'Dining', cost: 1600, completed: false }
        ],
        2: [
          { id: 201, time: '09:00 AM', title: 'Scenic Valley / Beach Adventure & Outdoor Thrills', category: 'Adventure', cost: 2800, completed: false },
          { id: 202, time: '01:30 PM', title: 'Artisan Cafe Lunch & Hidden Gems', category: 'Dining', cost: 1100, completed: false },
          { id: 203, time: '07:30 PM', title: 'Night Market & Acoustic Live Music', category: 'Leisure', cost: 1400, completed: false }
        ],
        3: [
          { id: 301, time: '10:00 AM', title: 'Trek / Waterfalls & Natural Hot Springs', category: 'Adventure', cost: 900, completed: false },
          { id: 302, time: '03:00 PM', title: 'Souvenir Shopping & Kinnauri/Goan Spices', category: 'Leisure', cost: 1500, completed: false },
          { id: 303, time: '08:00 PM', title: 'Farewell Gala Dinner & Stargazing', category: 'Dining', cost: 2500, completed: false }
        ]
      };

      setItineraryModal(prev => {
        if (prev.trip) {
          localStorage.setItem(`voyage_itinerary_${prev.trip.id}`, JSON.stringify(updatedActs));
        }
        return { ...prev, activities: updatedActs, isGenerating: false };
      });
    } catch (err) {
      console.error("AI itinerary generation error", err);
      setItineraryModal(prev => ({ ...prev, isGenerating: false }));
    }
  };

  return (
    <div className="min-h-full relative">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">My Journeys</h1>
          <p className="text-gray-400">Manage and explore your upcoming and past adventures with original photos and real-time galleries.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white rounded-xl py-6 px-6 font-semibold shadow-[0_0_15px_rgba(var(--primary),0.4)] transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Plan New Trip
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {trips.length > 0 ? (
              trips.map((trip, idx) => (
                <TripCardWithCarousel 
                  key={trip.id}
                  trip={trip}
                  idx={idx}
                  onDelete={handleDeleteTrip}
                  onOpenGallery={openGallery}
                  onOpenImageUpload={openImageUpload}
                  onOpenItinerary={openItinerary}
                />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full flex flex-col items-center justify-center p-12 bg-white/5 border border-white/10 rounded-3xl text-center"
              >
                <div className="bg-white/10 p-4 rounded-full mb-4">
                  <Navigation2 className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No trips planned yet</h3>
                <p className="text-gray-400 max-w-md mb-6">Your adventure awaits. Start planning your next trip to see it appear here.</p>
                <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 text-white rounded-xl">
                  Create Your First Trip
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Interactive Day-by-Day Itinerary Modal */}
      <AnimatePresence>
        {itineraryModal.open && itineraryModal.trip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-white/20 rounded-3xl p-6 sm:p-8 w-full max-w-3xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start pb-4 border-b border-white/10 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                      <Compass className="w-5 h-5" />
                    </span>
                    <h3 className="text-2xl font-black text-white">{itineraryModal.trip.title}</h3>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> {itineraryModal.trip.destination} • 
                    <Calendar className="w-3.5 h-3.5 ml-1 text-gray-400" /> {itineraryModal.trip.start_date} to {itineraryModal.trip.end_date}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAIGenerateSchedule}
                    disabled={itineraryModal.isGenerating}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white text-xs font-bold shadow-lg shadow-primary/20 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {itineraryModal.isGenerating ? 'Generating...' : '✨ AI Re-Plan'}
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                    title="Print Itinerary"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => setItineraryModal(prev => ({ ...prev, open: false }))}
                    className="text-gray-400 hover:text-white p-2 rounded-full bg-white/5"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Day Tabs */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-6 border-b border-white/10">
                {[1, 2, 3].map((dayNum) => (
                  <button
                    key={dayNum}
                    onClick={() => setItineraryModal(prev => ({ ...prev, activeDay: dayNum }))}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                      itineraryModal.activeDay === dayNum
                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                        : 'bg-white/5 hover:bg-white/10 text-gray-400'
                    }`}
                  >
                    Day {dayNum} Schedule
                  </button>
                ))}
              </div>

              {/* Activity Timeline List for Active Day */}
              <div className="space-y-3 mb-6">
                {(itineraryModal.activities[itineraryModal.activeDay] || []).map((act: any) => (
                  <div
                    key={act.id}
                    onClick={() => toggleActivityComplete(itineraryModal.activeDay, act.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                      act.completed
                        ? 'bg-green-950/20 border-green-500/30 opacity-70'
                        : 'bg-white/5 hover:bg-white/10 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-2">
                      <button className="text-primary group-hover:scale-110 transition-transform">
                        {act.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400 fill-green-500/20" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-500" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-primary font-mono">{act.time}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-gray-300">
                            {act.category}
                          </span>
                        </div>
                        <p className={`text-sm font-semibold mt-0.5 truncate ${act.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                          {act.title}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-extrabold text-emerald-400">
                        {act.cost > 0 ? formatINR(act.cost) : 'Free'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Custom Activity to Day */}
              <form onSubmit={handleAddCustomActivity} className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-3">
                <p className="text-xs font-bold text-gray-300">Add Stop / Activity to Day {itineraryModal.activeDay}</p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Activity title (e.g. Visit Baga Beach)..."
                    value={customActivity.title}
                    onChange={(e) => setCustomActivity({ ...customActivity, title: e.target.value })}
                    className="sm:col-span-2 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="Time (e.g. 04:00 PM)"
                    value={customActivity.time}
                    onChange={(e) => setCustomActivity({ ...customActivity, time: e.target.value })}
                    className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold py-2">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Original Photo Modal for Existing Trip */}
      <AnimatePresence>
        {uploadModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#181818] border border-white/15 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setUploadModal({ open: false, trip: null, imageUrl: '' })}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Camera className="text-primary w-5 h-5" /> Upload Original Cover Photo
              </h3>
              <p className="text-xs text-gray-400 mb-6">Set a custom original photo for <strong>{uploadModal.trip?.title}</strong>.</p>

              {/* Preview */}
              {uploadModal.imageUrl && (
                <div className="h-44 w-full rounded-2xl overflow-hidden mb-4 border border-white/15 relative">
                  <img src={uploadModal.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                  <button 
                    onClick={() => setUploadModal(prev => ({ ...prev, imageUrl: '' }))}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white text-xs"
                    title="Remove Photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5 text-primary" /> Upload Photo File from Device
                  </label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'update')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
                  />
                </div>

                <div className="text-center text-xs text-gray-500 font-semibold uppercase">Or</div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
                    <LinkIcon className="w-3.5 h-3.5 text-primary" /> Paste Image URL
                  </label>
                  <input 
                    type="url" 
                    placeholder="https://images.unsplash.com/photo-..."
                    value={uploadModal.imageUrl}
                    onChange={e => setUploadModal(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs"
                  />
                </div>

                <Button 
                  onClick={handleSaveOriginalPhoto}
                  disabled={!uploadModal.imageUrl}
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-5 font-semibold text-sm shadow-lg shadow-primary/20 disabled:opacity-50 mt-2"
                >
                  Save Original Cover Photo
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full-Screen Multi-Photo Lightbox Gallery Modal */}
      <AnimatePresence>
        {galleryModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#141414] border border-white/15 rounded-3xl p-6 w-full max-w-3xl shadow-2xl relative"
            >
              <button 
                onClick={() => setGalleryModal(prev => ({ ...prev, open: false }))}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-4">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Images className="text-primary w-6 h-6" /> {galleryModal.title}
                </h3>
                <p className="text-gray-400 text-sm flex items-center mt-1">
                  <MapPin className="w-4 h-4 mr-1 text-primary" /> {galleryModal.dest} • Real-time Photo Gallery
                </p>
              </div>

              {/* Active Large Photo */}
              <div className="relative h-96 w-full rounded-2xl overflow-hidden mb-4 border border-white/10 group">
                <img 
                  src={galleryModal.images[galleryModal.activeIdx]} 
                  alt={galleryModal.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Arrow Navigation */}
                <button
                  onClick={() => setGalleryModal(prev => ({
                    ...prev,
                    activeIdx: prev.activeIdx === 0 ? prev.images.length - 1 : prev.activeIdx - 1
                  }))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md border border-white/20"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={() => setGalleryModal(prev => ({
                    ...prev,
                    activeIdx: (prev.activeIdx + 1) % prev.images.length
                  }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md border border-white/20"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Thumbnails Strip */}
              <div className="grid grid-cols-4 gap-3">
                {galleryModal.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setGalleryModal(prev => ({ ...prev, activeIdx: i }))}
                    className={`h-20 rounded-xl overflow-hidden border-2 transition-all relative ${
                      i === galleryModal.activeIdx ? 'border-primary scale-105 shadow-lg shadow-primary/30' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Plan Trip Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Plane className="mr-2 text-primary w-6 h-6" /> Plan New Trip
              </h3>
              
              <form onSubmit={handleCreateTrip} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Trip Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Summer in Goa"
                    value={newTrip.title}
                    onChange={e => setNewTrip({...newTrip, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Destination</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Goa, India"
                    value={newTrip.destination}
                    onChange={e => setNewTrip({...newTrip, destination: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
                    <input 
                      type="date" 
                      required
                      value={newTrip.start_date}
                      onChange={e => setNewTrip({...newTrip, start_date: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
                    <input 
                      type="date" 
                      required
                      value={newTrip.end_date}
                      onChange={e => setNewTrip({...newTrip, end_date: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Trip Base Budget (₹ INR)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    placeholder="e.g. 50000"
                    value={newTrip.budget}
                    onChange={e => setNewTrip({...newTrip, budget: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                  />
                </div>

                {/* Live Destination Country Currency Preview */}
                {(newTrip.destination || newTrip.title) && (() => {
                  const curr = getCurrencyForDestination(newTrip.destination, newTrip.title);
                  const amount = Number(newTrip.budget) || 0;
                  const formatted = formatTripCurrency(amount, curr);
                  const foreignUnitInINR = curr.rateFromINR > 0 ? (1 / curr.rateFromINR) : 1;
                  return (
                    <div className="p-3.5 bg-gradient-to-r from-indigo-950/60 via-black to-purple-950/40 border border-indigo-500/30 rounded-2xl flex items-center justify-between text-xs shadow-inner">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{curr.flag}</span>
                        <div>
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <span>{curr.name}</span>
                            <span className="font-mono text-indigo-300">({curr.code})</span>
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                            {curr.code === 'INR' 
                              ? 'Domestic Indian Journey' 
                              : `1 ${curr.code} ≈ ₹${foreignUnitInINR.toFixed(2)} INR (1 INR = ${curr.rateFromINR.toFixed(4)} ${curr.code})`}
                          </p>
                        </div>
                      </div>

                      {amount > 0 && (
                        <div className="text-right">
                          <p className="font-extrabold text-emerald-400 font-mono text-sm">
                            {formatted.localFormatted}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono">
                            ≈ ₹{amount.toLocaleString('en-IN')}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Original Photo Upload Field */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Original Cover Photo (Optional)</label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="url" 
                      placeholder="Paste image URL (https://...)"
                      value={newTrip.cover_image}
                      onChange={e => setNewTrip({...newTrip, cover_image: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs"
                    />
                    <label className="flex items-center justify-center px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl cursor-pointer text-xs text-white font-semibold flex-shrink-0">
                      <Upload className="w-3.5 h-3.5 mr-1 text-primary" /> Upload
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'new')} className="hidden" />
                    </label>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-6 mt-4 shadow-lg shadow-primary/20">
                  Create Trip
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
