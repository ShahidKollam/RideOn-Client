import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Eye, EyeOff, Lock, Mail, Loader2, Bike, CalendarCheck,
  CreditCard, ShieldCheck, ArrowRight, Sun, Moon,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

export default function LoginPage() {
  const { login, isAuthenticated, bootstrapping } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (bootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app">
        <Loader2 className="animate-spin text-brand" size={32} />
      </div>
    );
  }
  if (isAuthenticated) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err?.message || err?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-[#060C18] relative overflow-hidden">
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-5 right-5 z-20 flex h-10 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-1.5 backdrop-blur-md hover:bg-white/10 transition-colors"
        aria-label="Toggle theme"
      >
        <span className={cn('flex h-7 w-7 items-center justify-center rounded-full transition-all', !isDark ? 'bg-white/20 text-white' : 'text-white/50')}>
          <Sun size={14} />
        </span>
        <span className={cn('flex h-7 w-7 items-center justify-center rounded-full transition-all', isDark ? 'bg-white/20 text-white' : 'text-white/50')}>
          <Moon size={14} />
        </span>
      </button>

      <div className="hidden lg:flex lg:w-[48%] relative flex-col justify-between p-12 xl:p-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1424] via-[#0A1628] to-[#1683FF]/15" />
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-[#1683FF]/25 blur-[100px]" />
          <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full bg-[#6D4AFF]/20 blur-[100px]" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#060C18] to-transparent z-[1]" />

        <div className="relative z-10">
          <div className="text-2xl font-bold tracking-tight mb-8">
            <span className="text-white">RIDE</span><span className="text-[#4ADE80]">ON</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 backdrop-blur mb-10">
            <ShieldCheck size={12} className="text-[#4C8DFF]" />
            RideOn Admin Control Center
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] mb-5">
            Smart. Simple.<br />Seamless <span className="text-[#4C8DFF]">Mobility.</span>
          </h1>
          <p className="text-white/60 text-sm max-w-md leading-relaxed mb-12">
            Manage your fleet, bookings, users and payments with complete control and visibility.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {[
              { icon: Bike, title: 'Fleet Management', desc: 'Track and manage all bikes in real-time' },
              { icon: CalendarCheck, title: 'Booking Control', desc: 'Monitor bookings and ride activities' },
              { icon: CreditCard, title: 'Payments & Reports', desc: 'View payments and business analytics' },
              { icon: ShieldCheck, title: 'Secure & Reliable', desc: 'Role-based access and data security' },
            ].map((f) => (
              <div key={f.title} className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#4C8DFF]">
                  <f.icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{f.title}</p>
                  <p className="text-[11px] text-white/50 leading-snug mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs text-white/30">© {new Date().getFullYear()} RideOn. All rights reserved.</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden flex items-center justify-center gap-0 mb-10 text-xl font-bold">
            <span className="text-white">RIDE</span><span className="text-[#4ADE80]">ON</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0B1424]/80 backdrop-blur-xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white">Welcome back 👋</h2>
              <p className="mt-2 text-sm text-white/50">Sign in to your RideOn Admin account to continue</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  <input
                    id="email" name="email" type="email" autoComplete="username email"
                    value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email"
                    className="w-full h-11 pl-10 pr-4 rounded-xl text-sm bg-[#060C18] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#4C8DFF]/40 focus:border-[#4C8DFF] transition-all"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  <input
                    id="password" name="password" type={showPass ? 'text' : 'password'} autoComplete="current-password"
                    value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"
                    className="w-full h-11 pl-10 pr-11 rounded-xl text-sm bg-[#060C18] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#4C8DFF]/40 focus:border-[#4C8DFF] transition-all"
                  />
                  <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60" tabIndex={-1}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="button" className="text-xs text-[#4C8DFF] hover:underline">Forgot password?</button>
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full h-11 rounded-xl text-sm font-semibold text-white bg-[#1683FF] hover:bg-[#0D73E6] focus:outline-none focus:ring-2 focus:ring-[#4C8DFF]/50 disabled:opacity-60 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
            <p className="mt-6 text-center text-xs text-white/30">
              Need help? <button type="button" className="text-[#4C8DFF] hover:underline">Contact support</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
