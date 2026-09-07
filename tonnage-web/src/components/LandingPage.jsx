import React, { useState } from 'react';
import { authApi } from '../services/api';
import { Dumbbell, Loader2 } from 'lucide-react';

export default function LandingPage({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const completeAuth = (response) => {
    const { token, email: userEmail } = response.data;
    localStorage.setItem('tonnage_token', token);
    localStorage.setItem('tonnage_user', userEmail);
    onAuthSuccess({ email: userEmail });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = isRegister
        ? await authApi.register(email, password)
        : await authApi.login(email, password);
      completeAuth(response);
    } catch (err) {
      const msg = err.response?.data || 'Authentication failed. Please verify your credentials.';
      setError(typeof msg === 'string' ? msg : 'Error processing request');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setDemoLoading(true);
    try {
      const response = await authApi.login('demo@tonnage.app', 'demo1234');
      completeAuth(response);
    } catch (err) {
      setError('Demo login is temporarily unavailable. Please try registering instead.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex items-center justify-center p-6">
      <div className="w-80">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
            <Dumbbell className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Tonnage</h1>
          <p className="text-sm text-slate-400 mt-1">Progressive Overload Analytics</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-lg font-semibold mb-5">
            {isRegister ? 'Create your account' : 'Sign in'}
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="lifter@tonnage.com"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isRegister ? 'Register' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-slate-400">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              {isRegister ? 'Sign in' : 'Register here'}
            </button>
          </div>

          <div className="mt-5 pt-5 border-t border-slate-800">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={demoLoading}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-slate-200 font-semibold py-2.5 rounded-xl text-sm transition border border-slate-700 flex items-center justify-center gap-2"
            >
              {demoLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Try Demo (no account needed)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}