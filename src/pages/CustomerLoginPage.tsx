import React, { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { navigateTo } from '../utils/navigation';
import { useToast } from '../components/ui/Toast';
import { Mail, Lock, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import guruDiamondsLogo from '../../assets/gurudimondslogo.png';

export const CustomerLoginPage: React.FC = () => {
  const { loginCustomer, registerCustomer, loading, error } = useAuthStore();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'login') {
      const success = await loginCustomer(email, password);
      if (success) {
        showToast('Welcome Back', 'Logged in to Guru Diamonds customer portal.');
        navigateTo('/account');
      } else {
        showToast('Login Failed', error || 'Invalid email or password', 'error');
      }
    } else {
      if (!name.trim()) {
        showToast('Missing Field', 'Please enter your full name.', 'error');
        return;
      }
      const success = await registerCustomer({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });
      if (success) {
        showToast('Account Created', 'Welcome to Guru Diamonds! Your account is ready.');
        navigateTo('/account');
      } else {
        showToast('Registration Failed', error || 'Could not create account. Please check details.', 'error');
      }
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-[#FAF8F3]">
      <div className="w-full max-w-md bg-white border border-[#E7E1D7] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-xs">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <img src={guruDiamondsLogo} alt="Guru Diamonds" className="h-14 w-auto max-w-[200px] object-contain" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1B1A18]">
            {mode === 'login' ? 'Customer Sign In' : 'Create Account'}
          </h2>
          <p className="text-[#6F6A62] text-xs">
            {mode === 'login'
              ? 'Access saved products, track orders, and express checkout.'
              : 'Join Guru Diamonds to enjoy exclusive access, order tracking & rewards.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-[#FAF8F3] border border-[#E7E1D7] p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${
              mode === 'login'
                ? 'bg-[#2D080C] text-[#FFF9F0] shadow-sm'
                : 'text-[#1B1A18]/70 hover:text-[#1B1A18]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${
              mode === 'register'
                ? 'bg-[#2D080C] text-[#FFF9F0] shadow-sm'
                : 'text-[#1B1A18]/70 hover:text-[#1B1A18]'
            }`}
          >
            New Registration
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="font-bold text-[#1B1A18] block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#A67C32] absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32] focus:bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="font-bold text-[#1B1A18] block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A67C32] absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32] focus:bg-white"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="font-bold text-[#1B1A18] block mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#A67C32] absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32] focus:bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="font-bold text-[#1B1A18] block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A67C32] absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32] focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#2D080C] hover:bg-[#3D0B10] text-[#FFF9F0] font-bold uppercase tracking-widest rounded-xl shadow-md transition-all flex items-center justify-center gap-2 border border-[#B8893D]/30"
          >
            <span>{loading ? 'Processing...' : mode === 'login' ? 'Sign In to Account' : 'Create Customer Account'}</span>
            <ArrowRight className="w-4 h-4 text-[#B8893D]" />
          </button>
        </form>

        {/* Bottom Toggle Text */}
        <div className="pt-2 text-center border-t border-[#E7E1D7] text-xs text-[#6F6A62]">
          {mode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-bold text-[#A67C32] hover:underline"
              >
                Register Here
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-[#A67C32] hover:underline"
              >
                Sign In Here
              </button>
            </p>
          )}
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-[#A67C32] font-semibold pt-1">
          <ShieldCheck className="w-4 h-4 text-[#B8893D]" /> 256-Bit SSL Encrypted Secure Login
        </div>
      </div>
    </div>
  );
};

export default CustomerLoginPage;
