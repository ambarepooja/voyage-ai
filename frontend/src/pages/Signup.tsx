import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';

export default function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes TTL in seconds
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    let timer: any = null;
    if (isOtpStep && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOtpStep, timeLeft]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericVal = e.target.value.replace(/[^0-9]/g, '');
    if (numericVal.length <= 10) {
      setPhone(numericVal);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (phone.length !== 10) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }

    setIsLoading(true);
    
    try {
      // 1. Create the user and get OTP via email
      const res = await api.post('/auth/signup', { 
        email, 
        password,
        first_name: firstName,
        last_name: lastName,
        phone_number: phone
      });
      if (res.data.dev_otp) {
        setDevOtpHint(res.data.dev_otp);
        setOtpCode(res.data.dev_otp);
      }
      setTimeLeft(600); // Reset timer to 10 minutes
      setIsOtpStep(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (timeLeft <= 0) {
      setError("This verification code has expired. Please click 'Resend Code' to receive a fresh OTP.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Verify OTP
      await api.post('/auth/verify-otp', { email, code: otpCode });
      
      // 2. Automatically log them in after signup verification
      const loginResponse = await api.post('/auth/login', { email, password });
      
      // 3. Update auth context and redirect to dashboard
      login(loginResponse.data.access_token, loginResponse.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'OTP Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setIsLoading(true);
    try {
      const res = await api.post('/auth/resend-otp', { email });
      setTimeLeft(600); // Reset countdown timer
      if (res.data.dev_otp) {
        setDevOtpHint(res.data.dev_otp);
        setOtpCode(res.data.dev_otp);
        alert(`Demo Mode: New OTP is ${res.data.dev_otp}`);
      } else {
        alert(`A new verification OTP code has been sent to ${email}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black overflow-hidden relative">
      {/* Decorative background elements */}
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full border border-white/5 opacity-20"
      />
      
      <div className="z-10 w-full max-w-md p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl"
        >
          <div className="flex justify-center mb-8">
            <div className="bg-primary/20 p-4 rounded-2xl">
              <Compass className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-white mb-2">Create Account</h2>
          <p className="text-gray-300 text-center mb-8">Start planning your next adventure</p>
          
          {error && <div className="bg-red-500/20 text-red-200 p-3 rounded-xl mb-6 text-sm">{error}</div>}
          
          {isOtpStep ? (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {devOtpHint ? (
                <div className="bg-indigo-500/20 border border-indigo-500/40 text-indigo-200 p-4 rounded-2xl text-sm text-center space-y-1 shadow-lg">
                  <p className="font-semibold text-white">✨ Testing / Instant Signup Mode</p>
                  <p className="text-xs text-gray-300">Your OTP Code is <span className="font-mono text-lg font-bold text-indigo-300 underline tracking-widest">{devOtpHint}</span></p>
                  <p className="text-[11px] text-gray-400">It has been automatically entered below for you!</p>
                </div>
              ) : (
                <p className="text-gray-300 text-center mb-6">We've sent a 6-digit verification code to <strong>{email}</strong>. Please check your inbox and enter the code below.</p>
              )}

              {/* Expiry Countdown Timer */}
              <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-xs">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Code Security Lifespan:
                </span>
                <span className={`font-mono font-bold text-sm ${timeLeft <= 60 ? 'text-red-400 animate-pulse' : 'text-emerald-300'}`}>
                  {timeLeft > 0 ? formatTimer(timeLeft) : 'EXPIRED'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Verification Code</label>
                <input 
                  type="text" 
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  disabled={timeLeft <= 0}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-center tracking-[0.5em] text-2xl font-mono disabled:opacity-50"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              {timeLeft <= 0 && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl text-xs text-center font-medium">
                  ⚠️ This code has expired. Please click "Resend Code" below to receive a new OTP.
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isLoading || otpCode.length !== 6 || timeLeft <= 0}
                className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-xl font-semibold text-lg transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)] disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : timeLeft <= 0 ? 'Code Expired' : 'Verify & Continue'}
              </Button>
              
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-sm text-gray-400 hover:text-white underline transition-colors"
                >
                  Didn't receive email or code expired? Resend Code
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">First Name</label>
                  <input 
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-200">Mobile Number</label>
                  <span className={`text-xs font-mono font-semibold ${phone.length === 10 ? 'text-green-400' : 'text-gray-400'}`}>
                    {phone.length}/10 digits
                  </span>
                </div>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={10}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono tracking-wider"
                  placeholder="9876543210"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="traveler@voyage.ai"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-xl font-semibold text-lg transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)] disabled:opacity-70"
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>
          )}
          
          {!isOtpStep && (
            <p className="mt-8 text-center text-gray-400 text-sm">
              Already have an account? <span className="text-primary hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/login')}>Sign in</span>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
