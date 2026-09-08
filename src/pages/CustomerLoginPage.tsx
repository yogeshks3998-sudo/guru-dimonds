import React, { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { navigateTo } from '../utils/navigation';
import { useToast } from '../components/ui/Toast';
import { Mail, Lock, User, Phone, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import guruDiamondsLogo from '../../assets/gurudimondslogo.png';

export const CustomerLoginPage: React.FC = () => {
  const { loginCustomer, registerCustomer, loading, error } = useAuthStore();
  const { showToast } = useToast();

  // Form Mode: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = loginIdentifier.trim();
    if (!identifier) {
      showToast('Missing Field', 'Please enter your mobile number or email.', 'error');
      return;
    }
    if (!loginPassword) {
      showToast('Missing Field', 'Please enter your password.', 'error');
      return;
    }

    const success = await loginCustomer(identifier, loginPassword);
    if (success) {
      showToast('Welcome Back', 'Logged in to Guru Diamonds customer portal.');
      navigateTo('/account');
    } else {
      showToast('Login Failed', useAuthStore.getState().error || 'Invalid mobile number/email or password', 'error');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = regName.trim();
    const phone = regPhone.trim();
    const email = regEmail.trim();

    if (!name) {
      showToast('Missing Field', 'Please enter your full name.', 'error');
      return;
    }
    if (!phone) {
      showToast('Missing Field', 'Please enter your mobile number.', 'error');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      showToast('Weak Password', 'Password must be at least 6 characters long.', 'error');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      showToast('Password Mismatch', 'Password and confirm password do not match.', 'error');
      return;
    }

    const result = await registerCustomer({
      name,
      phone,
      email: email || undefined,
      password: regPassword,
      confirmPassword: regConfirmPassword,
    });

    if (result.success) {
      showToast('Account Created', 'Welcome to Guru Diamonds! You are now logged in.');
      navigateTo('/account');
    } else {
      showToast('Registration Failed', result.message || useAuthStore.getState().error || 'Could not create account.', 'error');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#FAF8F3]">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <img
              src={guruDiamondsLogo}
              alt="Guru Diamonds"
              className="h-14 w-auto max-w-[200px] object-contain cursor-pointer"
              onClick={() => navigateTo('/')}
            />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B1A18] tracking-tight">Customer Portal</h1>
          <p className="text-[#6F6A62] text-xs max-w-sm mx-auto">
            {activeTab === 'login'
              ? 'Sign in using your mobile number or email to access orders, wishlist & privileges.'
              : 'Free registration to unlock bespoke curation, insured delivery & tracking.'}
          </p>
        </div>

        <div className="bg-white border border-[#E7E1D7] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
          {/* Top Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#FAF8F3] rounded-2xl border border-[#E7E1D7]">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                activeTab === 'login'
                  ? 'bg-[#2D080C] text-[#FFF9F0] shadow-sm'
                  : 'text-[#6F6A62] hover:text-[#1B1A18]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                activeTab === 'register'
                  ? 'bg-[#2D080C] text-[#FFF9F0] shadow-sm'
                  : 'text-[#6F6A62] hover:text-[#1B1A18]'
              }`}
            >
              Free Register
            </button>
          </div>

          {/* TAB 1: LOGIN FORM */}
          {activeTab === 'login' ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-[#E7E1D7] pb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#A67C32] bg-[#FAF3E6] border border-[#D8C29D] px-2.5 py-0.5 rounded-full">
                  Returning Patrons
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#1B1A18] mt-2">Sign In to Account</h2>
                <p className="text-xs text-[#6F6A62] mt-1">
                  Access saved favourites, live order updates, and express checkout.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Mobile Number or Email</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#A67C32] absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9876543210 or client@example.com"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#1B1A18]">Password</label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#A67C32] absolute left-3 top-3" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl pl-9 pr-10 py-2.5 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-2.5 text-[#6F6A62] hover:text-[#1B1A18]"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#2D080C] hover:bg-[#3D0B10] text-[#FFF9F0] font-bold uppercase tracking-widest rounded-xl shadow-md transition-all flex items-center justify-center gap-2 border border-[#B8893D]/30"
                  >
                    <span>{loading ? 'Signing In...' : 'Sign In to Account'}</span>
                    <ArrowRight className="w-4 h-4 text-[#B8893D]" />
                  </button>
                </div>
              </form>

              {/* Prompt to switch to Register */}
              <div className="text-center pt-2">
                <p className="text-xs text-[#6F6A62]">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="font-bold text-[#A67C32] hover:text-[#2D080C] hover:underline"
                  >
                    Click here to Free Register
                  </button>
                </p>
              </div>

              {/* Privilege Highlights */}
              <div className="pt-4 border-t border-[#E7E1D7] space-y-2 text-[11px] text-[#6F6A62]">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span>Real-time delivery & dispatch tracking</span>
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span>Saved jewellery measurements & bespoke requests</span>
                </p>
              </div>
            </div>
          ) : (
            /* TAB 2: REGISTER FORM (FREE DIRECT REGISTER) */
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-[#E7E1D7] pb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#2D080C] bg-[#FAF3E6] border border-[#A67C32] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#A67C32]" /> Instant Free Registration
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#1B1A18] mt-2">Create Account</h2>
                <p className="text-xs text-[#6F6A62] mt-1">
                  Join Guru Diamonds instantly for bespoke diamond curation & certified authenticity.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                {/* 1. Full Name (Required) */}
                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#A67C32] absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Kumar"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32] focus:bg-white"
                    />
                  </div>
                </div>

                {/* 2. Mobile Number (Required) */}
                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Mobile Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#A67C32] absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32] focus:bg-white"
                    />
                  </div>
                </div>

                {/* 3. Email Address (Optional) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#1B1A18]">Email Address</label>
                    <span className="text-[10px] text-[#A67C32] font-semibold">(Optional)</span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#A67C32] absolute left-3 top-3" />
                    <input
                      type="email"
                      placeholder="client@example.com (optional)"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32] focus:bg-white"
                    />
                  </div>
                </div>

                {/* 4. Password (Required) */}
                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Create Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#A67C32] absolute left-3 top-3" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 6 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl pl-9 pr-10 py-2.5 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-2.5 text-[#6F6A62] hover:text-[#1B1A18]"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 5. Confirm Password (Required) */}
                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#A67C32] absolute left-3 top-3" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter your password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl pl-9 pr-10 py-2.5 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-[#6F6A62] hover:text-[#1B1A18]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#A67C32] hover:bg-[#8F6A29] text-white font-bold uppercase tracking-widest rounded-xl shadow-md transition-all flex items-center justify-center gap-2 border border-[#B8893D]"
                  >
                    <span>{loading ? 'Creating Account...' : 'Free Register & Sign In'}</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </form>

              {/* Prompt to switch back to Login */}
              <div className="text-center pt-2">
                <p className="text-xs text-[#6F6A62]">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="font-bold text-[#A67C32] hover:text-[#2D080C] hover:underline"
                  >
                    Sign In here
                  </button>
                </p>
              </div>

              {/* Security Assurance */}
              <div className="pt-4 border-t border-[#E7E1D7] flex items-center justify-center gap-2 text-[11px] text-[#A67C32] font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#B8893D]" /> 256-Bit SSL Encrypted Database Protection
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerLoginPage;

