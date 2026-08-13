import React, { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { navigateTo } from '../utils/navigation';
import { useToast } from '../components/ui/Toast';
import { ShieldCheck, Flame, ArrowRight } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { loginAdmin, loading, error } = useAuthStore();
  const { showToast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await loginAdmin(username, password);
    if (success) {
      showToast('Admin Authenticated', 'Access granted to Guru Diamonds CMS.');
      navigateTo('/admin');
    } else {
      showToast('Admin Login Failed', error || 'Invalid admin credentials', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#1B1A18] flex items-center justify-center px-4 py-16">
      <div className="bg-[#23211E] border border-[#A67C32]/40 rounded-3xl p-8 max-w-md w-full space-y-6 text-xs text-[#FAF8F3] shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#A67C32]/20 border border-[#A67C32] rounded-2xl flex items-center justify-center mx-auto text-[#D8C29D]">
            <Flame className="w-6 h-6" />
          </div>
          <span className="font-logo text-2xl font-bold text-white block">GURU DIAMONDS CMS</span>
          <p className="text-[#A7A9AC]">Authorized Manager & Staff Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="font-bold text-white block mb-1">Username / Access Key</label>
            <input
              type="text"
              required
              placeholder="e.g. owner@gurudimonds.in"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#1B1A18] border border-[#3D3A36] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#A67C32]"
            />
          </div>

          <div>
            <label className="font-bold text-white block mb-1">Passcode</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1B1A18] border border-[#3D3A36] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#A67C32]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#A67C32] hover:bg-[#8e6828] text-white font-bold uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Enter Admin Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
