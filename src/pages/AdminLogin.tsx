import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      navigate('/admin/dashboard');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.session) {
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      // Enhance error message if it's authentication related
      let userFriendlyError = err.message;
      if (err.message.includes('Invalid login credentials')) {
          userFriendlyError = 'Incorrect email or password.';
      } else if (err.message.includes('Email not confirmed')) {
           userFriendlyError = 'Email not confirmed. Please check your inbox.';
      }
      setError(userFriendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Apply the primary brand background to the main container
    <div className="min-h-screen bg-[#1c594e] flex items-center justify-center p-4">
      {/* Form container with Glassmorphism style */}
      <div className="bg-white/5 backdrop-blur-xl rounded-lg p-8 shadow-2xl shadow-black/40 w-full max-w-md border border-[#ffd453]/20 text-gray-200">
        {/* Title with accent color */}
        <h2 className="text-2xl font-bold mb-6 text-center text-[#ffd453]">Admin Login</h2>
        {/* Error message styling */}
        {error && (
          <div className="bg-red-800/30 border border-red-700 text-red-300 p-3 rounded mb-4">
            {error}
          </div>
        )}
        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            {/* Label with light text color */}
            <label className="block text-gray-300 mb-2">Email</label>
            {/* Input with Glassmorphism style and accent focus ring */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffd453] focus:border-transparent bg-black/20 backdrop-blur-sm border border-white/10"
              required
            />
          </div>
          <div>
            {/* Label with light text color */}
            <label className="block text-gray-300 mb-2">Password</label>
             {/* Input with Glassmorphism style and accent focus ring */}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffd453] focus:border-transparent bg-black/20 backdrop-blur-sm border border-white/10"
              required
            />
          </div>
          {/* Login Button with accent style */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#ffd453] text-[#1c594e] font-bold p-3 rounded hover:brightness-110 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}