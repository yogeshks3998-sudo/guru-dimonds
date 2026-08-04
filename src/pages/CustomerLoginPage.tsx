import React, { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { navigateTo } from '../utils/navigation';
import { useToast } from '../components/ui/Toast';
import { Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

export const CustomerLoginPage: React.FC = () => {
  const { loginCustomer, loading, error } = useAuthStore();
  const { showToast } = useToast();

  const [email, setEmail] = useState('ananya.d@gmail.com');
  const [password, setPassword] = useState('password123');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await loginCustomer(email, password);
    if (success) {
      showToast('Welcome Back', 'Logged in to Guru Diamonds customer portal.');
      navigateTo('/account');
    } else {
      showToast('Login Failed', error || 'Invalid email or password', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-[#E7E1D7] rounded-3xl p-8 space-y-6 shadow-xl text-xs">
        <div className="text-center space-y-2">
          <span className="font-logo text-2xl font-bold text-[#1B1A18] block">GURU DIAMONDS</span>
          <h2 className="font-serif text-xl font-bold text-[#1B1A18]">Customer Sign In</h2>
          <p className="text-[#6F6A62]">Access saved products, order history, and express checkout.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="font-bold text-[#1B1A18] block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#6F6A62] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-[#A67C32]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#1B1A18] block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#6F6A62] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-[#A67C32]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#A67C32] hover:bg-[#8e6828] text-white font-bold uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>Sign In to Account</span>
            {loading && <span>...</span>}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="p-3 bg-[#FAF3E6] border border-[#D8C29D] rounded-xl text-[11px] text-[#1B1A18] space-y-1">
          <p className="font-bold">Seeded Login Credentials:</p>
          <p>Email: ananya.d@gmail.com</p>
          <p>Password: password123</p>
        </div>
      </div>
    </div>
  );
};
