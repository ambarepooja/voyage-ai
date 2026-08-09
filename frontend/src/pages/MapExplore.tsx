import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Compass, 
  ExternalLink, 
  Layers, 
  LocateFixed, 
  Route, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '../services/api';

export default function MapExplore() {
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destination, setDestination] = useState<string>('Tokyo, Japan');
  const [customOrigin, setCustomOrigin] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [userTrips, setUserTrips] = useState<any[]>([]);
  const [mapMode, setMapMode] = useState<'directions' | 'explore' | 'satellite'>('directions');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchUserTrips();
  }, []);

  const detectLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCurrentCoords({ lat, lng });

          try {
            // Reverse geocode via OpenStreetMap Nominatim (free, no API key required)
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.state_district || data.address?.state || 'My Location';
            const country = data.address?.country || '';
            const locationStr = `${city}${country ? `, ${country}` : ''}`;
            setCurrentLocation(locationStr);
            setCustomOrigin(locationStr);
          } catch {
            const coordStr = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            setCurrentLocation(coordStr);
            setCustomOrigin(coordStr);
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.warn("Geolocation permission error or timeout:", error.message);
          setCurrentLocation('GPS permission required');
          setIsLocating(false);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setCurrentLocation('Geolocation not supported');
      setIsLocating(false);
    }
  };

  const fetchUserTrips = async () => {
    try {
      const res = await api.get('/trips/');
      setUserTrips(res.data);
      if (res.data.length > 0 && res.data[0].destination) {
        setDestination(res.data[0].destination);
      }
    } catch (err) {
      console.error("Failed to load user trips", err);
    }
  };

  const effectiveOrigin = customOrigin.trim();

  // Construct dynamic Google Maps iframe URLs
  const getMapIframeUrl = () => {
    if (mapMode === 'directions' && effectiveOrigin) {
      // Direction route from Origin to Destination
      return `https://maps.google.com/maps?saddr=${encodeURIComponent(effectiveOrigin)}&daddr=${encodeURIComponent(destination)}&output=embed`;
    } else if (mapMode === 'satellite') {
      // Satellite view of destination
      return `https://maps.google.com/maps?q=${encodeURIComponent(destination)}&t=k&z=14&ie=UTF8&iwloc=&output=embed`;
    } else {
      // General map explore of destination or search
      const query = searchQuery.trim() || destination;
      return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
    }
  };

  const handleDestinationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setDestination(searchQuery.trim());
      setMapMode('directions');
    }
  };

  const popularDestinations = [
    { name: 'Tokyo, Japan', country: 'Japan', tag: 'Neon Metropolis' },
    { name: 'Paris, France', country: 'France', tag: 'City of Lights' },
    { name: 'Goa, India', country: 'India', tag: 'Tropical Beaches' },
    { name: 'Zurich, Switzerland', country: 'Switzerland', tag: 'Alpine Luxury' },
    { name: 'Santorini, Greece', country: 'Greece', tag: 'Aegean Island' },
    { name: 'Dubai, UAE', country: 'UAE', tag: 'Desert Oasis' },
    { name: 'Bali, Indonesia', country: 'Indonesia', tag: 'Island Retreat' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & HUD Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-white/10 via-white/5 to-transparent p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/20 rounded-2xl border border-primary/30 text-primary">
              <Navigation className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Interactive Map & Route Radar</h1>
              <p className="text-gray-400 text-xs mt-0.5">Live GPS tracking connecting your current coordinates to world destinations.</p>
            </div>
          </div>
        </div>

        {/* Live GPS Pill */}
        <div className="flex items-center gap-3 bg-black/50 border border-white/15 px-4 py-2.5 rounded-2xl">
          <button 
            onClick={detectLocation} 
            disabled={isLocating}
            title="Recalibrate Live GPS"
            className="text-emerald-400 hover:text-emerald-300 transition-colors p-1"
          >
            <LocateFixed className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          </button>
          <div className="text-left">
            <p className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${currentLocation ? 'bg-emerald-400 animate-ping' : 'bg-gray-500'} inline-block`} /> Live Current Location:
            </p>
            <p className="text-xs font-bold text-white font-mono">
              {currentLocation || 'GPS Standby (Click Auto-GPS to calibrate)'} {currentCoords ? `(${currentCoords.lat.toFixed(2)}°, ${currentCoords.lng.toFixed(2)}°)` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Control Panel & Route Navigator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Control Card: Origin & Destination Inputs */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#14151a] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5">
            <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
              <Route className="w-4 h-4 text-primary" /> Route Navigator
            </h3>

            {/* Origin (Starting Point) Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-400 flex items-center justify-between">
                <span>📍 Origin / Starting Location <span className="text-gray-500 font-normal">(Optional)</span></span>
                <button 
                  onClick={detectLocation}
                  className="text-[10px] text-primary hover:underline flex items-center gap-0.5 font-bold"
                >
                  <LocateFixed className="w-3 h-3" /> Auto-GPS
                </button>
              </label>
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={customOrigin}
                  onChange={(e) => setCustomOrigin(e.target.value)}
                  placeholder="Enter starting point or click Auto-GPS..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 pr-8 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {customOrigin && (
                  <button
                    type="button"
                    onClick={() => setCustomOrigin('')}
                    className="absolute right-2.5 text-gray-400 hover:text-white text-xs p-1"
                    title="Clear Origin"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Destination Input */}
            <form onSubmit={handleDestinationSubmit} className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-400">
                🎯 Destination Location
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    value={searchQuery || destination}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. Tokyo, Japan or Paris, France"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white rounded-xl px-4 text-xs font-bold">
                  Route
                </Button>
              </div>
            </form>

            {/* Quick Destination Select from User's Booked Trips */}
            {userTrips.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Select From My Journeys:
                </label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {userTrips.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setDestination(t.destination);
                        setSearchQuery(t.destination);
                        setMapMode('directions');
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                        destination === t.destination 
                          ? 'bg-primary/20 border-primary text-white font-bold' 
                          : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="truncate flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        {t.title} ({t.destination})
                      </span>
                      <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Map Mode Selector */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Map View Mode:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setMapMode('directions')}
                  className={`py-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    mapMode === 'directions' 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  <Route className="w-4 h-4" />
                  <span>Route</span>
                </button>
                <button
                  onClick={() => setMapMode('explore')}
                  className={`py-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    mapMode === 'explore' 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore</span>
                </button>
                <button
                  onClick={() => setMapMode('satellite')}
                  className={`py-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    mapMode === 'satellite' 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Satellite</span>
                </button>
              </div>
            </div>

            {/* External Google Maps App Link */}
            <a 
              href={
                effectiveOrigin 
                  ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(effectiveOrigin)}&destination=${encodeURIComponent(destination)}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all text-center"
            >
              <span>{effectiveOrigin ? 'Launch Live Turn-by-Turn GPS' : 'Open Destination in Google Maps'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Quick World Dest Tags */}
          <div className="bg-[#14151a] border border-white/10 rounded-3xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Popular Travel Hubs:
            </h4>
            <div className="flex flex-wrap gap-2">
              {popularDestinations.map((d) => (
                <button
                  key={d.name}
                  onClick={() => {
                    setDestination(d.name);
                    setSearchQuery(d.name);
                    setMapMode('directions');
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all border ${
                    destination === d.name
                      ? 'bg-primary text-white border-primary font-bold shadow-md'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 border-white/10'
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Main Panel: Live Interactive Map Display */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          {/* Active Navigation HUD Bar */}
          <div className="bg-[#14151a] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {effectiveOrigin ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-black" />
                    <span className="text-xs font-bold text-white truncate max-w-[140px]" title={effectiveOrigin}>
                      {effectiveOrigin}
                    </span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Navigation className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs text-gray-400 font-medium">Destination:</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400 border-2 border-black" />
                <span className="text-xs font-bold text-white truncate max-w-[140px]" title={destination}>
                  {destination}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 font-mono text-[11px] font-bold text-indigo-300">
                Mode: {mapMode.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Interactive Map Iframe Container */}
          <div className="flex-1 min-h-[550px] lg:min-h-[650px] rounded-3xl overflow-hidden border border-white/15 shadow-2xl relative bg-black/40">
            <iframe
              key={`${effectiveOrigin}-${destination}-${mapMode}`}
              title="Voyage AI Navigation Map"
              width="100%"
              height="100%"
              style={{ 
                border: 0, 
                minHeight: '550px',
                filter: mapMode === 'satellite' ? 'none' : 'invert(90%) hue-rotate(180deg)' 
              }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={getMapIframeUrl()}
              className="w-full h-full min-h-[550px] rounded-3xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
