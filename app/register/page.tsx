'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Briefcase, Mail, Lock, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'employer'>('user');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed. Please try again.');
      } else {
        setSuccess(true);
        setName('');
        setEmail('');
        setPassword('');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-grayBorder rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        
        {/* Header Branding banner */}
        <div className="bg-slateText-primary text-white px-6 py-8 text-center relative">
          <h2 className="text-2xl font-extrabold tracking-tight">Create Account</h2>
          <p className="text-white/70 text-xs mt-2">Join JobPickers to seek opportunities or list active developer roles.</p>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-lg flex items-start gap-2.5 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-accent-green/10 border border-accent-green/30 text-accent-green p-4 rounded-lg flex items-start gap-2.5 text-xs font-semibold animate-pulse">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-extrabold">Registration Successful!</p>
                <p className="text-[10px] text-slateText-muted mt-0.5">Redirecting you to the login page...</p>
              </div>
            </div>
          )}

          {!success && (
            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Account Type Toggle */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slateText-secondary uppercase tracking-wider">Account Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={`border rounded-lg p-3 flex items-center justify-center gap-2 font-bold text-xs transition-all duration-200 ${
                      role === 'user' 
                        ? 'border-accent-green bg-accent-green/[0.03] text-accent-green' 
                        : 'border-grayBorder text-slateText-secondary hover:bg-grayBg'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Job Seeker</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('employer')}
                    className={`border rounded-lg p-3 flex items-center justify-center gap-2 font-bold text-xs transition-all duration-200 ${
                      role === 'employer' 
                        ? 'border-accent-green bg-accent-green/[0.03] text-accent-green' 
                        : 'border-grayBorder text-slateText-secondary hover:bg-grayBg'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Employer</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slateText-secondary uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slateText-muted">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full bg-grayBg border border-grayBorder rounded pl-10 pr-3 py-2.5 text-xs font-semibold outline-none focus:border-accent-green transition-all duration-200"
                  />
                </div>
              </div>

              {/* Email */}
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

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slateText-secondary uppercase tracking-wider">Password</label>
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
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Registering...' : 'Create Account'}</span>
              </button>
            </form>
          )}

          <div className="text-center text-xs text-slateText-muted">
            Already have an account? <Link href="/login" className="font-bold text-accent-green hover:underline">Sign In</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
