import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Star, Coffee, Wifi, Car, Filter, X, CheckCircle2, FileText, Building, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCurrencyForDestination, formatTripCurrency } from '../utils/currency';

const allHotels = [
  // ── India ─────────────────────────────────────────────────────────────────
  { id: 1,  name: "The Taj Mahal Palace",   location: "Mumbai, India",       country: "India",       rating: 4.9, price: 25000, image: "url('https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=800&auto=format&fit=crop')",  amenities: [Wifi, Coffee, Car] },
  { id: 2,  name: "The Oberoi Amarvilas",   location: "Agra, India",         country: "India",       rating: 4.9, price: 32000, image: "url('https://images.unsplash.com/photo-1601918774946-25832a4be0d6?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee] },
  { id: 3,  name: "Umaid Bhawan Palace",    location: "Jodhpur, India",      country: "India",       rating: 4.8, price: 45000, image: "url('https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Car] },
  { id: 4,  name: "Rambagh Palace",         location: "Jaipur, India",       country: "India",       rating: 4.8, price: 38000, image: "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee, Car] },
  { id: 5,  name: "Taj Lake Palace",        location: "Udaipur, India",      country: "India",       rating: 4.9, price: 42000, image: "url('https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee] },
  { id: 6,  name: "W Goa",                  location: "Goa, India",          country: "India",       rating: 4.6, price: 18000, image: "url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee, Car] },
  { id: 7,  name: "ITC Grand Chola",        location: "Chennai, India",      country: "India",       rating: 4.7, price: 15000, image: "url('https://images.unsplash.com/photo-1455587734955-081b22074882?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee] },
  { id: 8,  name: "The Leela Palace",       location: "New Delhi, India",    country: "India",       rating: 4.8, price: 22000, image: "url('https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Car] },
  { id: 9,  name: "Kumarakom Lake Resort",  location: "Kerala, India",       country: "India",       rating: 4.8, price: 24000, image: "url('https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee] },
  { id: 10, name: "Wildflower Hall",        location: "Shimla, India",       country: "India",       rating: 4.9, price: 28000, image: "url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee, Car] },
  { id: 11, name: "Ananda in the Himalayas",location: "Rishikesh, India",    country: "India",       rating: 4.9, price: 35000, image: "url('https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee] },
  { id: 12, name: "The Serai Jaisalmer",    location: "Jaisalmer, India",    country: "India",       rating: 4.7, price: 19000, image: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Car] },

  // ── Japan ──────────────────────────────────────────────────────────────────
  { id: 13, name: "Aman Tokyo",             location: "Tokyo, Japan",        country: "Japan",       rating: 4.9, price: 85000, image: "url('https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee] },
  { id: 14, name: "The Ritz-Carlton Kyoto", location: "Kyoto, Japan",        country: "Japan",       rating: 4.8, price: 72000, image: "url('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Car] },
  { id: 15, name: "Park Hyatt Tokyo",       location: "Tokyo, Japan",        country: "Japan",       rating: 4.7, price: 60000, image: "url('https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee, Car] },
  { id: 16, name: "Hoshinoya Kyoto",        location: "Kyoto, Japan",        country: "Japan",       rating: 4.9, price: 90000, image: "url('https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee] },
  { id: 17, name: "Conrad Osaka",           location: "Osaka, Japan",        country: "Japan",       rating: 4.8, price: 55000, image: "url('https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee, Car] },
  { id: 18, name: "Mandarin Oriental Tokyo",location: "Tokyo, Japan",        country: "Japan",       rating: 4.9, price: 78000, image: "url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Car] },

  // ── Switzerland ───────────────────────────────────────────────────────────
  { id: 19, name: "The Dolder Grand",       location: "Zurich, Switzerland", country: "Switzerland", rating: 4.8, price: 75000, image: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee, Car] },
  { id: 20, name: "Badrutt's Palace Hotel", location: "St. Moritz, Switzerland", country: "Switzerland", rating: 4.9, price: 95000, image: "url('https://images.unsplash.com/photo-1551918120-9739cb430c6d?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Car] },
  { id: 21, name: "Montreux Palace",        location: "Montreux, Switzerland", country: "Switzerland", rating: 4.7, price: 62000, image: "url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee] },
  { id: 22, name: "Chedi Andermatt",        location: "Andermatt, Switzerland", country: "Switzerland", rating: 4.9, price: 82000, image: "url('https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee, Car] },
  { id: 23, name: "Beau-Rivage Palace",     location: "Lausanne, Switzerland", country: "Switzerland", rating: 4.8, price: 68000, image: "url('https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee] },
  { id: 24, name: "Grand Hotel Les Trois Rois", location: "Basel, Switzerland", country: "Switzerland", rating: 4.8, price: 58000, image: "url('https://images.unsplash.com/photo-1543968996-ee822b8176ba?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Car] },

  // ── Greece ────────────────────────────────────────────────────────────────
  { id: 25, name: "Katikies Hotel",         location: "Santorini, Greece",   country: "Greece",      rating: 4.9, price: 65000, image: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee, Car] },
  { id: 26, name: "Cavo Tagoo",             location: "Mykonos, Greece",     country: "Greece",      rating: 4.8, price: 78000, image: "url('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Car] },
  { id: 27, name: "Blue Palace Resort",     location: "Crete, Greece",       country: "Greece",      rating: 4.7, price: 45000, image: "url('https://images.unsplash.com/photo-1561501900-3701fa6a0864?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee] },
  { id: 28, name: "Hotel Grande Bretagne",  location: "Athens, Greece",      country: "Greece",      rating: 4.8, price: 52000, image: "url('https://images.unsplash.com/photo-1544124499-58912cbddaad?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee, Car] },
  { id: 29, name: "Grace Hotel Santorini",  location: "Santorini, Greece",   country: "Greece",      rating: 4.9, price: 85000, image: "url('https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee] },
  { id: 30, name: "Mystique Hotel",         location: "Santorini, Greece",   country: "Greece",      rating: 4.9, price: 92000, image: "url('https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Car] },

  // ── Indonesia ─────────────────────────────────────────────────────────────
  { id: 31, name: "Four Seasons Bali",      location: "Bali, Indonesia",     country: "Indonesia",   rating: 4.9, price: 58000, image: "url('https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee, Car] },
  { id: 32, name: "Ayana Resort",           location: "Bali, Indonesia",     country: "Indonesia",   rating: 4.8, price: 42000, image: "url('https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee] },
  { id: 33, name: "Capella Ubud",           location: "Ubud, Bali",          country: "Indonesia",   rating: 4.9, price: 72000, image: "url('https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Car] },
  { id: 34, name: "Kempinski Nusa Dua",     location: "Nusa Dua, Bali",      country: "Indonesia",   rating: 4.7, price: 35000, image: "url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee, Car] },
  { id: 35, name: "Nihi Sumba",             location: "Sumba, Indonesia",    country: "Indonesia",   rating: 4.9, price: 120000, image: "url('https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee] },
  { id: 36, name: "Como Uma Canggu",        location: "Canggu, Bali",        country: "Indonesia",   rating: 4.8, price: 48000, image: "url('https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Car] },

  // ── UAE ───────────────────────────────────────────────────────────────────
  { id: 37, name: "Burj Al Arab Jumeirah",  location: "Dubai, UAE",          country: "UAE",         rating: 5.0, price: 250000, image: "url('https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee, Car] },
  { id: 38, name: "Atlantis The Palm",      location: "Dubai, UAE",          country: "UAE",         rating: 4.8, price: 65000, image: "url('https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee, Car] },
  { id: 39, name: "One&Only The Palm",      location: "Dubai, UAE",          country: "UAE",         rating: 4.9, price: 88000, image: "url('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Car] },
  { id: 40, name: "Armani Hotel Dubai",     location: "Dubai, UAE",          country: "UAE",         rating: 4.8, price: 72000, image: "url('https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee] },
  { id: 41, name: "Anantara Sir Bani Yas",  location: "Abu Dhabi, UAE",      country: "UAE",         rating: 4.7, price: 55000, image: "url('https://images.unsplash.com/photo-1586611292717-f828b167408c?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee, Car] },
  { id: 42, name: "W Dubai The Palm",       location: "Dubai, UAE",          country: "UAE",         rating: 4.6, price: 48000, image: "url('https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Car] },

  // ── France ────────────────────────────────────────────────────────────────
  { id: 43, name: "Four Seasons George V",  location: "Paris, France",       country: "France",      rating: 4.9, price: 115000, image: "url('https://images.unsplash.com/photo-1550340499-a6c60fc8287c?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee, Car] },
  { id: 44, name: "Le Meurice",             location: "Paris, France",       country: "France",      rating: 4.9, price: 98000, image: "url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee] },
  { id: 45, name: "Hôtel du Cap-Eden-Roc",  location: "Antibes, France",     country: "France",      rating: 4.8, price: 135000, image: "url('https://images.unsplash.com/photo-1504214208698-ea1916a2195a?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Car] },
  { id: 46, name: "Château de la Messardière", location: "Saint-Tropez, France", country: "France",  rating: 4.8, price: 88000, image: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee, Car] },
  { id: 47, name: "La Résidence de la Pinède", location: "Saint-Tropez, France", country: "France",  rating: 4.7, price: 72000, image: "url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee] },

  // ── Maldives ──────────────────────────────────────────────────────────────
  { id: 48, name: "Soneva Jani",            location: "North Malé Atoll, Maldives", country: "Maldives", rating: 5.0, price: 185000, image: "url('https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee] },
  { id: 49, name: "Gili Lankanfushi",       location: "North Malé Atoll, Maldives", country: "Maldives", rating: 4.9, price: 145000, image: "url('https://images.unsplash.com/photo-1540202404-a2f29016b523?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee] },
  { id: 50, name: "Six Senses Laamu",       location: "Laamu Atoll, Maldives", country: "Maldives",  rating: 4.9, price: 128000, image: "url('https://images.unsplash.com/photo-1504681869696-d977211a5f4c?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Car] },
  { id: 51, name: "One&Only Reethi Rah",    location: "North Malé Atoll, Maldives", country: "Maldives", rating: 4.8, price: 162000, image: "url('https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee, Car] },
  { id: 52, name: "Cheval Blanc Randheli",  location: "Noonu Atoll, Maldives", country: "Maldives",  rating: 4.9, price: 195000, image: "url('https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee] },

  // ── Thailand ──────────────────────────────────────────────────────────────
  { id: 53, name: "Mandarin Oriental Bangkok", location: "Bangkok, Thailand", country: "Thailand",   rating: 4.9, price: 48000, image: "url('https://images.unsplash.com/photo-1563492065599-3520f775eeed?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee, Car] },
  { id: 54, name: "Amanpuri",               location: "Phuket, Thailand",    country: "Thailand",    rating: 4.9, price: 115000, image: "url('https://images.unsplash.com/photo-1602391833977-358a52198938?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee] },
  { id: 55, name: "Rosewood Bangkok",       location: "Bangkok, Thailand",   country: "Thailand",    rating: 4.8, price: 42000, image: "url('https://images.unsplash.com/photo-1560347876-aeef00ee58a1?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Car] },
  { id: 56, name: "Six Senses Yao Noi",     location: "Phang Nga Bay, Thailand", country: "Thailand", rating: 4.9, price: 88000, image: "url('https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee, Car] },
  { id: 57, name: "Anantara Golden Triangle", location: "Chiang Rai, Thailand", country: "Thailand", rating: 4.7, price: 38000, image: "url('https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee] },

  // ── USA ───────────────────────────────────────────────────────────────────
  { id: 58, name: "The Plaza Hotel",        location: "New York, USA",       country: "USA",         rating: 4.8, price: 95000, image: "url('https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee, Car] },
  { id: 59, name: "Beverly Hills Hotel",    location: "Los Angeles, USA",    country: "USA",         rating: 4.8, price: 82000, image: "url('https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee] },
  { id: 60, name: "Post Ranch Inn",         location: "Big Sur, USA",        country: "USA",         rating: 4.9, price: 118000, image: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Car] },
  { id: 61, name: "Aulani Disney Resort",   location: "Hawaii, USA",         country: "USA",         rating: 4.7, price: 55000, image: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee, Car] },
  { id: 62, name: "The Breakers",           location: "Palm Beach, USA",     country: "USA",         rating: 4.8, price: 78000, image: "url('https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=800&auto=format&fit=crop')", amenities: [Wifi, Coffee] },
];

export default function Hotels() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'explore' | 'bookings'>('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedHotel, setSelectedHotel] = useState<any | null>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    check_in_date: today,
    check_out_date: tomorrow,
    guests_count: 2,
    room_type: 'Standard Room',
    special_requests: '',
    trip_id: '',
    payment_method: 'Credit / Debit Card'
  });

  const countries = ['All', 'India', 'Japan', 'Switzerland', 'Greece', 'Indonesia', 'UAE', 'France', 'Maldives', 'Thailand', 'USA'];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        guest_email: user.email || '',
        guest_name: user.email ? user.email.split('@')[0] : ''
      }));
    }
  }, [user]);

  const fetchInitialData = async () => {
    try {
      const [tripsRes, bookingsRes] = await Promise.all([
        api.get('/trips/'),
        api.get('/hotels/my-bookings')
      ]);
      setTrips(tripsRes.data);
      setMyBookings(bookingsRes.data);
      if (tripsRes.data.length > 0) {
        setFormData(prev => ({ ...prev, trip_id: tripsRes.data[0].id.toString() }));
      }
    } catch (err) {
      console.error("Failed to load initial hotel data", err);
    }
  };

  const fetchMyBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const res = await api.get('/hotels/my-bookings');
      setMyBookings(res.data);
    } catch (err) {
      console.error("Failed to fetch my bookings", err);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleOpenBookingModal = (hotel: any) => {
    setSelectedHotel(hotel);
    setConfirmedBooking(null);
  };

  const handleDeleteHotelBooking = async (bookingId: number) => {
    if (!window.confirm("Are you sure you want to cancel and delete this hotel reservation?")) return;
    try {
      await api.delete(`/hotels/my-bookings/${bookingId}`);
      setMyBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (err) {
      console.error("Failed to delete hotel booking", err);
      alert("Failed to delete hotel booking.");
    }
  };

  // Price Calculation logic
  const calculateTotal = useMemo(() => {
    if (!selectedHotel) return { nights: 1, baseTotal: 0, taxes: 0, grandTotal: 0 };
    const checkIn = new Date(formData.check_in_date);
    const checkOut = new Date(formData.check_out_date);
    let diffDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
    if (diffDays <= 0) diffDays = 1;

    let multiplier = 1.0;
    if (formData.room_type === 'Deluxe Ocean View') multiplier = 1.25;
    if (formData.room_type === 'Executive Luxury Suite') multiplier = 1.6;

    const ratePerNight = selectedHotel.price * multiplier;
    const baseTotal = ratePerNight * diffDays;
    const taxes = baseTotal * 0.12; // 12% GST/tax
    const grandTotal = baseTotal + taxes;

    return { nights: diffDays, ratePerNight, baseTotal, taxes, grandTotal };
  }, [selectedHotel, formData.check_in_date, formData.check_out_date, formData.room_type]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericVal = e.target.value.replace(/[^0-9]/g, '');
    if (numericVal.length <= 10) {
      setFormData(prev => ({ ...prev, guest_phone: numericVal }));
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHotel) return;

    if (formData.guest_phone.length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSubmitting(true);
    try {
      let tripIdToUse = formData.trip_id;

      // Auto-create a trip if none selected or no trip exists
      if (!tripIdToUse || trips.length === 0) {
        const tripRes = await api.post('/trips/', {
          title: `Stay at ${selectedHotel.name}`,
          destination: selectedHotel.location,
          start_date: formData.check_in_date,
          end_date: formData.check_out_date,
          budget: Math.round(calculateTotal.grandTotal + 30000)
        });
        tripIdToUse = tripRes.data.id.toString();
        setTrips(prev => [...prev, tripRes.data]);
        setFormData(prev => ({ ...prev, trip_id: tripIdToUse }));
      }

      const bookingPayload = {
        hotel_name: selectedHotel.name,
        location: selectedHotel.location,
        guest_name: formData.guest_name,
        guest_email: formData.guest_email,
        guest_phone: formData.guest_phone,
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date,
        guests_count: parseInt(formData.guests_count.toString()),
        room_type: formData.room_type,
        special_requests: formData.special_requests || "None",
        price_per_night: calculateTotal.ratePerNight,
        total_price: calculateTotal.grandTotal,
        trip_id: parseInt(tripIdToUse)
      };

      const res = await api.post('/hotels/book', bookingPayload);
      setConfirmedBooking(res.data);
      fetchMyBookings();
    } catch (err: any) {
      console.error("Booking error", err);
      alert(err.response?.data?.detail || "Failed to create hotel booking. Please check all fields.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredHotels = useMemo(() => {
    return allHotels.filter(hotel => {
      const matchesSearch = hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            hotel.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCountry = selectedCountry === 'All' || hotel.country === selectedCountry;
      return matchesSearch && matchesCountry;
    });
  }, [searchQuery, selectedCountry]);

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-full pb-10">
      {/* Navigation Tabs Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Luxury Hotels & Stays</h1>
          <p className="text-gray-400">Discover handpicked accommodations worldwide and track expenses seamlessly.</p>
        </div>
        
        <div className="flex bg-white/10 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'explore'
                ? 'bg-primary text-white shadow-lg'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Building className="w-4 h-4" /> Explore Hotels
          </button>
          <button
            onClick={() => {
              setActiveTab('bookings');
              fetchMyBookings();
            }}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'bg-primary text-white shadow-lg'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" /> My Bookings ({myBookings.length})
          </button>
        </div>
      </div>

      {activeTab === 'explore' ? (
        <>
          {/* Header & Search */}
          <div className="mb-10 text-center max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-full flex flex-col md:flex-row items-center shadow-2xl relative z-10 gap-2 md:gap-0">
              <div className="w-full md:flex-1 flex items-center px-4 md:border-r border-white/10 py-2 md:py-0">
                <MapPin className="text-gray-400 w-5 h-5 mr-3 flex-shrink-0" />
                <input 
                  type="text" 
                  placeholder="Search by hotel name or city..."
                  className="w-full bg-transparent border-none text-white focus:outline-none placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="w-full md:w-auto flex items-center px-4 py-2 md:py-0 md:border-r border-white/10 text-gray-400">
                <Filter className="w-5 h-5 mr-3 flex-shrink-0" />
                <select 
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="bg-transparent text-white border-none focus:outline-none cursor-pointer w-full"
                >
                  {countries.map(country => (
                    <option key={country} value={country} className="bg-gray-800 text-white">
                      {country}
                    </option>
                  ))}
                </select>
              </div>
              
              <Button type="button" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white rounded-full py-6 md:px-8 shadow-[0_0_20px_rgba(var(--primary),0.5)]">
                <Search className="w-5 h-5 md:mr-2" />
                <span className="md:inline">Search</span>
              </Button>
            </div>
          </div>

          {/* Country Chips */}
          <div className="flex gap-4 overflow-x-auto pb-4 mb-8 no-scrollbar justify-center">
            {countries.map((country) => (
              <button 
                key={country}
                onClick={() => setSelectedCountry(country)}
                className={`px-6 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCountry === country
                    ? 'bg-white text-black font-semibold shadow-lg' 
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/5'
                }`}
              >
                {country}
              </button>
            ))}
          </div>

          {/* Hotel Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredHotels.map((hotel) => (
                <motion.div
                  key={hotel.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -8 }}
                  onClick={() => handleOpenBookingModal(hotel)}
                  className="group rounded-3xl overflow-hidden relative h-[400px] cursor-pointer shadow-2xl border border-white/10"
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: hotel.image }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center border border-white/10 z-10">
                    <Star className="w-4 h-4 text-yellow-400 mr-1 fill-yellow-400" />
                    <span className="text-white font-semibold text-sm">{hotel.rating}</span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{hotel.name}</h3>
                    <p className="text-gray-300 text-sm flex items-center mb-4">
                      <MapPin className="w-3.5 h-3.5 mr-1 opacity-70" /> {hotel.location}
                    </p>
                    
                    <div className="flex items-end justify-between">
                      <div className="flex gap-2">
                        {hotel.amenities.map((Icon, i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                        ))}
                      </div>
                      {(() => {
                        const curr = getCurrencyForDestination(hotel.location);
                        const formatted = formatTripCurrency(hotel.price, curr);
                        return (
                          <div className="text-right">
                            <p className="text-[10px] text-gray-300">from</p>
                            <p className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center justify-end gap-1">
                              <span>{curr.flag}</span>
                              <span>{formatted.localFormatted}</span>
                              <span className="text-[10px] font-normal text-gray-400">/night</span>
                            </p>
                            {curr.code !== 'INR' && (
                              <p className="text-[10px] text-gray-400 font-mono">
                                ≈ {formatted.inrFormatted}
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      ) : (
        /* My Bookings List Tab */
        <div className="space-y-6">
          {isLoadingBookings ? (
            <div className="text-center py-20 text-gray-400">Loading your hotel bookings...</div>
          ) : myBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myBookings.map((b) => (
                <motion.div 
                  key={b.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                          {b.status}
                        </span>
                        <h3 className="text-2xl font-bold text-white mt-2">{b.hotel_name}</h3>
                        <p className="text-sm text-gray-400 flex items-center mt-1">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-primary" /> {b.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right bg-white/5 p-3 rounded-2xl border border-white/10">
                          <p className="text-xs text-gray-400">Booking Code</p>
                          <p className="font-mono font-bold text-indigo-300 tracking-wider text-sm">{b.booking_reference}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteHotelBooking(b.id)}
                          className="p-3 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all border border-red-500/20"
                          title="Cancel & Delete Hotel Reservation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 my-4 p-4 bg-black/40 rounded-2xl border border-white/5 text-sm">
                      <div>
                        <p className="text-xs text-gray-400">Guest Name</p>
                        <p className="font-semibold text-white truncate">{b.guest_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Room Type</p>
                        <p className="font-semibold text-white">{b.room_type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Check-In</p>
                        <p className="font-semibold text-gray-200">{b.check_in_date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Check-Out</p>
                        <p className="font-semibold text-gray-200">{b.check_out_date}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <div>
                      <p className="text-xs text-gray-400">Total Billed</p>
                      <p className="text-2xl font-bold text-green-400">{formatINR(Number(b.total_price))}</p>
                    </div>
                    <Button 
                      onClick={() => navigate('/dashboard/expenses')}
                      className="bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs gap-1"
                    >
                      View in Expenses <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
              <Building className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Hotel Bookings Yet</h3>
              <p className="text-gray-400 max-w-sm mx-auto mb-6">Click on any hotel in the Explore tab to make a booking and record expenses automatically.</p>
              <Button onClick={() => setActiveTab('explore')} className="bg-primary hover:bg-primary/90 text-white rounded-xl">
                Explore Hotels
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Clean Single Popup Hotel Booking Modal */}
      <AnimatePresence>
        {selectedHotel && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="bg-[#15161b] border border-white/20 rounded-3xl p-6 sm:p-7 w-full max-w-xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative my-auto max-h-[90vh] flex flex-col text-white"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 p-2.5 rounded-2xl flex-shrink-0">
                    <Building className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {selectedHotel.name}
                      <span className="flex items-center text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                        <Star className="w-3 h-3 fill-amber-400 mr-1" /> {selectedHotel.rating}
                      </span>
                    </h3>
                    <p className="text-gray-400 text-xs flex items-center mt-0.5">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-primary" /> {selectedHotel.location}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedHotel(null)}
                  className="text-gray-400 hover:text-white p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {confirmedBooking ? (
                /* Confirmed Booking Voucher Card */
                <div className="p-6 overflow-y-auto text-center space-y-5">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider">
                      Reservation Confirmed
                    </span>
                    <h2 className="text-2xl font-bold text-white mt-2">Stay Reserved Successfully!</h2>
                    <p className="text-gray-400 text-xs mt-1">Your reservation voucher and expense record have been automatically generated.</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                      <span className="text-gray-400">Booking Reference</span>
                      <span className="text-base font-bold text-indigo-300">{confirmedBooking.booking_reference}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-gray-400 text-[11px]">Hotel</p>
                        <p className="font-bold text-white font-sans text-sm">{confirmedBooking.hotel_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-[11px]">Location</p>
                        <p className="font-bold text-white font-sans text-sm">{confirmedBooking.location}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-[11px]">Guest Name</p>
                        <p className="font-bold text-white font-sans text-sm">{confirmedBooking.guest_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-[11px]">Room Type</p>
                        <p className="font-bold text-white font-sans text-sm">{confirmedBooking.room_type}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-[11px]">Dates</p>
                        <p className="font-bold text-gray-200">{confirmedBooking.check_in_date} to {confirmedBooking.check_out_date}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-[11px]">Total Amount</p>
                        <p className="font-bold text-emerald-400 text-base">{formatINR(Number(confirmedBooking.total_price))}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button 
                      onClick={() => {
                        setSelectedHotel(null);
                        setActiveTab('bookings');
                      }}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold text-xs"
                    >
                      View My Bookings
                    </Button>
                    <Button 
                      onClick={() => navigate('/dashboard/expenses')}
                      className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-primary/20"
                    >
                      Check Expenses Tracker
                    </Button>
                  </div>
                </div>
              ) : (
                /* Single Clean Form Body */
                <form onSubmit={handleCreateBooking} className="overflow-y-auto pr-1 space-y-4 pt-4 flex-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {/* 1. Dates */}
                  <div>
                    <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">1. Stay Dates</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-gray-400 mb-1">Check-In Date</label>
                        <input 
                          type="date"
                          required
                          min={today}
                          value={formData.check_in_date}
                          onChange={(e) => setFormData({...formData, check_in_date: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-gray-400 mb-1">Check-Out Date</label>
                        <input 
                          type="date"
                          required
                          min={formData.check_in_date}
                          value={formData.check_out_date}
                          onChange={(e) => setFormData({...formData, check_out_date: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Room Tier */}
                  <div>
                    <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">2. Room Tier</label>
                    <select 
                      value={formData.room_type}
                      onChange={(e) => setFormData({...formData, room_type: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                    >
                      <option value="Standard Room" className="bg-gray-900">Standard Room ({formatINR(selectedHotel.price)}/night)</option>
                      <option value="Deluxe Ocean View" className="bg-gray-900">Deluxe Ocean View ({formatINR(selectedHotel.price * 1.25)}/night)</option>
                      <option value="Executive Luxury Suite" className="bg-gray-900">Executive Luxury Suite ({formatINR(selectedHotel.price * 1.6)}/night)</option>
                    </select>
                  </div>

                  {/* 3. Guests & Journey */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">Guests</label>
                      <select 
                        value={formData.guests_count}
                        onChange={(e) => setFormData({...formData, guests_count: parseInt(e.target.value)})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                      >
                        <option value={1} className="bg-gray-900">1 Guest</option>
                        <option value={2} className="bg-gray-900">2 Guests</option>
                        <option value={3} className="bg-gray-900">3 Guests</option>
                        <option value={4} className="bg-gray-900">4 Guests</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">Associate Trip</label>
                      <select 
                        value={formData.trip_id}
                        onChange={(e) => setFormData({...formData, trip_id: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                      >
                        {trips.length > 0 ? (
                          trips.map(trip => (
                            <option key={trip.id} value={trip.id} className="bg-gray-900">
                              {trip.title} ({trip.destination})
                            </option>
                          ))
                        ) : (
                          <option value="" className="bg-gray-900">Auto-create new journey</option>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* 4. Guest Details */}
                  <div>
                    <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">3. Guest Details</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-gray-400 mb-1">Full Name *</label>
                        <input 
                          type="text"
                          required
                          placeholder="John Doe"
                          value={formData.guest_name}
                          onChange={(e) => setFormData({...formData, guest_name: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-gray-400 mb-1">Phone Number (10 Digits) *</label>
                        <input 
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="9876543210"
                          value={formData.guest_phone}
                          onChange={handlePhoneChange}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono tracking-wider"
                        />
                      </div>
                    </div>

                    <div className="mt-2.5">
                      <label className="block text-[11px] font-medium text-gray-400 mb-1">Special Requests (Optional)</label>
                      <input 
                        type="text"
                        placeholder="e.g. High floor room, Late check-in, Airport shuttle"
                        value={formData.special_requests}
                        onChange={(e) => setFormData({...formData, special_requests: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>

                  {/* 5. Pricing & Payment Breakdown */}
                  {selectedHotel && (() => {
                    const curr = getCurrencyForDestination(selectedHotel.location);
                    const formattedGrand = formatTripCurrency(calculateTotal.grandTotal, curr);
                    const formattedBase = formatTripCurrency(calculateTotal.baseTotal, curr);
                    return (
                      <div className="bg-black/50 border border-white/10 rounded-2xl p-4 space-y-2 text-xs">
                        <div className="flex justify-between items-center text-gray-400">
                          <span>Room Rate ({calculateTotal.nights} Night{calculateTotal.nights > 1 ? 's' : ''})</span>
                          <span className="text-white font-medium">{formattedBase.localFormatted}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-400">
                          <span>Taxes & Fees (12%)</span>
                          <span className="text-white font-medium">{formatINR(calculateTotal.taxes)}</span>
                        </div>
                        <div className="pt-2 border-t border-white/10 flex justify-between items-center text-sm font-bold text-white">
                          <div className="flex items-center gap-1.5">
                            <span>Grand Total</span>
                            <span className="text-xs text-indigo-300 font-mono">({curr.code})</span>
                          </div>
                          <div className="text-right">
                            <span className="text-emerald-400 text-lg font-extrabold block">
                              {formattedGrand.localFormatted}
                            </span>
                            {curr.code !== 'INR' && (
                              <span className="text-[10px] text-gray-400 font-mono block">
                                ≈ {formattedGrand.inrFormatted}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Payment Method */}
                  <div>
                    <label className="block text-[11px] font-medium text-gray-400 mb-1">Payment Method</label>
                    <select 
                      value={formData.payment_method}
                      onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                    >
                      <option value="Credit / Debit Card" className="bg-gray-900">Credit / Debit Card</option>
                      <option value="UPI / Instant Banking" className="bg-gray-900">UPI / Google Pay / PhonePe</option>
                      <option value="Pay at Hotel" className="bg-gray-900">Pay at Hotel</option>
                    </select>
                  </div>

                  {/* Submit CTA */}
                  <div className="pt-2">
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-6 font-bold text-sm shadow-[0_0_20px_rgba(var(--primary),0.3)] disabled:opacity-50"
                    >
                      {isSubmitting ? 'Confirming Reservation...' : `Confirm Booking • ${formatINR(calculateTotal.grandTotal)}`}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


