'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthForm() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (isRegister) {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        setMessage("Registration Error: " + error.message);
      } else if (data?.user) {
        setMessage('Registration successful! Check your email for a confirmation link.');
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setMessage("Login Error: " + error.message);
      } else if (data?.user) {
        setMessage('Successfully logged in!');
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4 text-white">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-emerald-400">PaycheckPal</h1>
        <p className="mt-2 text-sm text-gray-400">Know your sahod. Secure the bag.</p>
      </div>

      <div className="w-full max-w-md rounded-2xl bg-gray-800 p-8 shadow-xl border border-gray-700">
        <h2 className="mb-6 text-3xl font-bold text-center tracking-tight text-emerald-400">
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h2>

        <form className="space-y-4" onSubmit={handleAuth}>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-gray-700 border border-gray-600 p-3 text-white focus:border-emerald-500 focus:outline-none"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-gray-700 border border-gray-600 p-3 text-white focus:border-emerald-500 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500 p-3 font-semibold text-gray-950 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isRegister ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        {message && (
          <div className="mt-4 p-3 rounded bg-gray-700 text-sm text-center text-emerald-300 border border-emerald-500/30">
            {message}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-400">
          {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-emerald-400 hover:underline font-medium"
          >
            {isRegister ? 'Log In' : 'Register here'}
          </button>
        </div>
      </div>
    </div>
  );
}
