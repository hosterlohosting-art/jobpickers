'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, Shield, Briefcase, User as UserIcon, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
      } else {
        router.refresh();
        // Redirect admin to /admin, others to callbackUrl or /dashboard
        if (email.toLowerCase().includes('admin')) {
          router.push('/admin');
        } else {
          router.push(callbackUrl);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-grayBorder rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        
        {/* Header Branding banner */}
        <div className="bg-slateText-primary text-white px-6 py-8 text-center relative">
          <div className="absolute top-4 right-4 bg-accent-green/20 text-accent-green px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Secure Portal
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Welcome Back</h2>
          <p className="text-white/70 text-xs mt-2">Access your Seeker dashboard, Admin controls, or Employer listings.</p>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-lg flex items-start gap-2.5 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slateText-secondary uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slateText-muted">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-grayBg border border-grayBorder rounded pl-10 pr-3 py-2.5 text-xs font-semibold outline-none focus:border-accent-green transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slateText-secondary uppercase tracking-wider">Password</label>
                <Link href="#" className="text-[10px] font-bold text-accent-green hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slateText-muted">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-grayBg border border-grayBorder rounded pl-10 pr-3 py-2.5 text-xs font-semibold outline-none focus:border-accent-green transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-green hover:bg-accent-greenHover text-white font-bold py-3 rounded transition-colors text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Preset accounts for quick developer testing */}
          <div className="border-t border-grayBorder pt-5 space-y-3">
            <h3 className="text-xs font-bold text-slateText-muted uppercase tracking-wider text-center">Developer Testing Presets</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => loadPreset('admin@jobpickers.com', 'admin123')}
                className="bg-slateText-primary/5 hover:bg-slateText-primary/10 border border-slateText-primary/10 text-slateText-primary rounded p-2 text-[10px] font-bold flex flex-col items-center gap-1 transition-all duration-200"
              >
                <Shield className="w-4 h-4 text-slateText-primary" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => loadPreset('john@example.com', 'john123')}
                className="bg-accent-green/5 hover:bg-accent-green/10 border border-accent-green/10 text-accent-green rounded p-2 text-[10px] font-bold flex flex-col items-center gap-1 transition-all duration-200"
              >
                <UserIcon className="w-4 h-4 text-accent-green" />
                <span>Seeker</span>
              </button>
              <button
                type="button"
                onClick={() => loadPreset('hiring@stripe.com', 'stripe123')}
                className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded p-2 text-[10px] font-bold flex flex-col items-center gap-1 transition-all duration-200"
              >
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Employer</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slateText-muted">
            Don't have an account? <Link href="/register" className="font-bold text-accent-green hover:underline">Register now</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
