import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.access_token, response.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black overflow-hidden relative">
      {/* Decorative background elements */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full border border-white/5 opacity-20"
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
          <h2 className="text-3xl font-bold text-center text-white mb-2">Welcome Back</h2>
          <p className="text-gray-300 text-center mb-8">Sign in to continue your journey</p>
          
          {error && (
            <div className="bg-red-500/20 text-red-200 p-4 rounded-xl mb-6 text-sm space-y-2">
              <p>{error}</p>
              {error.includes("not verified") && (
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full mt-2 bg-white/10 hover:bg-white/20 text-white font-medium py-2 rounded-lg transition-colors text-xs"
                >
                  👉 Click here to complete Signup & Verify OTP
                </button>
              )}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
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
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-xl font-semibold text-lg transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)]">
              Sign In
            </Button>
          </form>
          
          <p className="mt-8 text-center text-gray-400 text-sm">
            Don't have an account? <span className="text-primary hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/signup')}>Create one</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
