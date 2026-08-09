import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Shield, 
  Key, 
  Camera, 
  Check, 
  Sparkles, 
  Calendar, 
  Plane, 
  Hotel, 
  Wallet, 
  Lock, 
  Eye, 
  EyeOff, 
  Save, 
  AlertCircle, 
  CheckCircle2,
  Compass,
  ArrowRight,
  ShieldCheck,
  MapPin,
  UploadCloud,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const AVATAR_PRESETS = [
  '✈️', '🏝️', '🏔️', '🚀', '🎒', '👑', '🌍', '🗺️', '🌅', '📸', '⛵', '🗽', '🏰', '🏎️', '🏖️', '🌆'
];

export default function Profile() {
  const { user, updateUser, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Stats summary for traveler dashboard
  const [stats, setStats] = useState({ trips: 0, flights: 0, hotels: 0, expenses: 0 });

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setEmail(user.email || '');
      setPhone(user.phone_number || '');
      setAvatarUrl(user.avatar_url || '');
    }
    fetchTravelerStats();
  }, [user]);

  const fetchTravelerStats = async () => {
    try {
      const [tripsRes, flightsRes, hotelsRes, expensesRes] = await Promise.allSettled([
        api.get('/trips/'),
        api.get('/flights/my-bookings'),
        api.get('/hotels/my-bookings'),
        api.get('/expenses/')
      ]);

      setStats({
        trips: tripsRes.status === 'fulfilled' ? tripsRes.value.data.length : 0,
        flights: flightsRes.status === 'fulfilled' ? flightsRes.value.data.length : 0,
        hotels: hotelsRes.status === 'fulfilled' ? hotelsRes.value.data.length : 0,
        expenses: expensesRes.status === 'fulfilled' ? expensesRes.value.data.length : 0,
      });
    } catch (e) {
      console.warn("Could not fetch user stats", e);
    }
  };

  /**
   * Processes and compresses an image file using an offscreen canvas
   * to ensure fast responsiveness and high-resolution avatar display.
   */
  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error("Selected file must be an image (PNG, JPG, JPEG, WEBP, GIF)."));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        reject(new Error("File size must be under 10MB."));
        return;
      }

      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 512;
          let width = img.width;
          let height = img.height;

          // Calculate square crop/contain dimensions
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(readerEvent.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error("Failed to process image file."));
        img.src = readerEvent.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Could not read file."));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (file: File) => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsUploadingPhoto(true);

    try {
      const dataUrl = await processImageFile(file);
      setAvatarUrl(dataUrl);

      // Auto-save uploaded avatar to backend
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await api.post('/auth/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (uploadRes.data?.avatar_url) {
        updateUser({ avatar_url: uploadRes.data.avatar_url });
        await refreshUser();
        setSuccessMessage("Profile photo uploaded and saved successfully! 📸✨");
      }
    } catch (err: any) {
      console.error("Photo upload error", err);
      setErrorMessage(err.message || "Failed to upload photo. Please try another image.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    setSuccessMessage("Photo removed. Initial avatar restored. Click 'Save Profile Changes' to finalize.");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    // Phone validation
    const cleanPhone = phone.trim().replace('+', '').replace('-', '').replace(' ', '');
    if (cleanPhone && (cleanPhone.length !== 10 || !/^\d+$/.test(cleanPhone))) {
      setErrorMessage("Phone number must be exactly 10 digits.");
      return;
    }

    // Password validation if entered
    if (newPassword) {
      if (!currentPassword) {
        setErrorMessage("Please enter your current password to set a new password.");
        return;
      }
      if (newPassword.length < 6) {
        setErrorMessage("New password must be at least 6 characters long.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage("New password and confirm password do not match.");
        return;
      }
    }

    setIsLoading(true);
    try {
      const payload: any = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: cleanPhone,
        avatar_url: avatarUrl.trim(),
        email: email.trim().toLowerCase(),
      };

      if (newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      const res = await api.put('/auth/profile', payload);
      if (res.data) {
        updateUser(res.data);
        await refreshUser();
        setSuccessMessage("Your profile information has been successfully updated! ✨");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      console.error("Failed to update profile", err);
      const detail = err.response?.data?.detail || "Failed to update profile. Please check your inputs.";
      setErrorMessage(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayName = () => {
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) return fullName;
    if (user?.first_name || user?.last_name) return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return user?.email?.split('@')[0] || 'Voyager';
  };

  const renderAvatarContent = () => {
    if (avatarUrl) {
      if (AVATAR_PRESETS.includes(avatarUrl) || avatarUrl.length <= 4) {
        return <span className="text-4xl">{avatarUrl}</span>;
      }
      return (
        <img 
          src={avatarUrl} 
          alt="User Avatar" 
          className="w-full h-full object-cover rounded-2xl"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      );
    }
    const initial = (firstName?.[0] || user?.email?.[0] || 'U').toUpperCase();
    return <span className="text-3xl font-bold text-white">{initial}</span>;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Hidden File Input for Custom Photo Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onFileInputChange} 
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif" 
        className="hidden" 
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <span>Traveler Profile & Settings</span>
            <span className="text-2xl">👤</span>
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Manage your personal traveler identity, upload custom profile photos, update credentials, and sync preferences.
          </p>
        </div>
      </div>

      {/* Main Profile Header Identity Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/40 via-black to-indigo-950/50 border border-white/15 p-6 sm:p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar Display with Quick Click-to-Upload Trigger */}
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()} title="Click to upload custom photo">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-primary via-indigo-600 to-purple-500 p-1 shadow-[0_0_30px_rgba(var(--primary),0.4)] flex items-center justify-center">
              <div className="w-full h-full bg-black/80 rounded-[22px] flex items-center justify-center overflow-hidden relative">
                {renderAvatarContent()}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white">
                  <Camera className="w-6 h-6 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                </div>
              </div>
            </div>

            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="absolute -bottom-2 -right-2 bg-primary hover:bg-primary/90 text-white p-2 rounded-xl shadow-lg transition-transform hover:scale-110"
              title="Upload Custom Photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* User Details & Badges */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-center md:justify-start">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                {getDisplayName()}
              </h3>
              <div className="flex items-center gap-2 justify-center">
                <span className="px-3 py-1 bg-primary/20 border border-primary/40 rounded-full text-xs font-bold text-primary flex items-center gap-1.5 shadow-sm">
                  <Compass className="w-3.5 h-3.5" /> Pro Traveler
                </span>
                {user?.is_superuser && (
                  <span className="px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-full text-xs font-bold text-red-400 flex items-center gap-1.5 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5" /> Administrator
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-400 flex items-center justify-center md:justify-start gap-2 font-mono">
              <Mail className="w-3.5 h-3.5 text-gray-500" />
              <span>{user?.email}</span>
              {phone && (
                <>
                  <span className="text-gray-600">•</span>
                  <Phone className="w-3.5 h-3.5 text-gray-500" />
                  <span>+91 {phone}</span>
                </>
              )}
            </p>

            {/* Travel Stats Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl text-center">
                <p className="text-lg font-black text-primary font-mono">{stats.trips}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1 mt-0.5">
                  <Compass className="w-3 h-3 text-primary" /> Journeys
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl text-center">
                <p className="text-lg font-black text-indigo-300 font-mono">{stats.flights}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1 mt-0.5">
                  <Plane className="w-3 h-3 text-indigo-400" /> Flights
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl text-center">
                <p className="text-lg font-black text-emerald-400 font-mono">{stats.hotels}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1 mt-0.5">
                  <Hotel className="w-3 h-3 text-emerald-400" /> Hotels
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl text-center">
                <p className="text-lg font-black text-purple-400 font-mono">{stats.expenses}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1 mt-0.5">
                  <Wallet className="w-3 h-3 text-purple-400" /> Expenses
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notifications / Alerts */}
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs shadow-lg shadow-emerald-950/40"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-500/20 border border-red-500/40 rounded-2xl flex items-center gap-3 text-red-300 text-xs shadow-lg shadow-red-950/40"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Section 1: Custom Photo Upload & Avatar Customization */}
        <div className="bg-[#14151a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Custom Profile Photo & Avatar</h4>
              <p className="text-xs text-gray-400">Upload a custom photo from your computer or pick a travel badge.</p>
            </div>
          </div>

          {/* Upload Drag-and-Drop Zone */}
          <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all ${
              isDragging 
                ? 'border-primary bg-primary/10 scale-[1.01]' 
                : 'border-white/15 bg-black/40 hover:border-white/30 hover:bg-black/60'
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
                {isUploadingPhoto ? (
                  <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UploadCloud className="w-8 h-8" />
                )}
              </div>

              <div>
                <p className="text-sm font-bold text-white">
                  {isUploadingPhoto ? "Processing and saving photo..." : "Upload Custom Profile Photo"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Drag and drop your image here, or browse from your device (PNG, JPG, JPEG, WEBP up to 5MB)
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="bg-primary hover:bg-primary/90 text-white rounded-xl px-5 py-2.5 text-xs font-bold shadow-md shadow-primary/20 flex items-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" /> Choose Image from Device
                </Button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Custom Photo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Travel Badges & Web URL Option */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Or Choose a Travel Badge Preset:
              </label>
              <div className="flex flex-wrap gap-2.5">
                {AVATAR_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAvatarUrl(preset)}
                    className={`w-12 h-12 rounded-2xl border text-xl flex items-center justify-center transition-all ${
                      avatarUrl === preset 
                        ? 'bg-primary/30 border-primary scale-110 shadow-lg shadow-primary/30' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:scale-105'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Or Direct Image URL:
              </label>
              <input 
                type="url" 
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or leave blank for initials"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Personal & Contact Information */}
        <div className="bg-[#14151a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2.5 bg-primary/20 rounded-xl text-primary">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Personal & Contact Information</h4>
              <p className="text-xs text-gray-400">Update your official name and contact numbers used for reservations.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                First Name
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Pooja"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                Last Name
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Ambare"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-4 h-4 text-gray-500" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. pooja@example.com"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
                <span>Mobile Phone (10 Digits)</span>
                <span className="text-[10px] text-gray-500 font-normal">SMS / WhatsApp Sync</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-xs font-mono text-gray-400 font-bold">🇮🇳 +91</span>
                <input 
                  type="tel" 
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-20 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Password & Security */}
        <div className="bg-[#14151a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Security & Password</h4>
              <p className="text-xs text-gray-400">Leave these blank if you do not wish to change your login password.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                Current Password
              </label>
              <div className="relative flex items-center">
                <input 
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 pr-10 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 text-gray-400 hover:text-white p-1"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative flex items-center">
                <input 
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 pr-10 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 text-gray-400 hover:text-white p-1"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                Confirm New Password
              </label>
              <div className="relative flex items-center">
                <input 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full sm:w-auto bg-gradient-to-r from-primary via-indigo-600 to-purple-600 hover:opacity-90 text-white rounded-2xl px-8 py-6 text-sm font-bold shadow-xl shadow-primary/30 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving Changes...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Profile Changes
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
