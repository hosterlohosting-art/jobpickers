'use client';

import Link from 'next/link';
import { Mail, Send, Award, Shield, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-accent-teal text-white/90 border-t border-accent-tealHover mt-auto">
      {/* Top segments: brand, lists, newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          
          {/* Column 1: Brand description */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-accent-green flex items-center justify-center text-white font-extrabold text-sm">
                JP
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Job<span className="text-accent-green">Pickers</span>
              </span>
            </Link>
            <p className="text-sm text-white/70 leading-relaxed">
              JobPickers is a clean, trustworthy career board aggregator collecting fresh software, marketing, finance, and product positions daily. Highly optimized for job seekers and SEO.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-white/50 font-semibold mt-2">
              <Shield className="w-3.5 h-3.5 text-accent-green" /> AdSense Compliant & Google Jobs Structured.
            </div>
          </div>

          {/* Column 2: Seekers navigation */}
          <div>
            <h3 className="font-bold text-white uppercase tracking-wider text-xs mb-4">Job Seekers</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/jobs" className="text-white/70 hover:text-accent-green hover:underline">Search All Jobs</Link></li>
              <li><Link href="/dashboard" className="text-white/70 hover:text-accent-green hover:underline">My Seeker Account</Link></li>
              <li><Link href="/blog" className="text-white/70 hover:text-accent-green hover:underline">Career Advice</Link></li>
              <li><Link href="/jobs/category/software" className="text-white/70 hover:text-accent-green hover:underline">Developer Careers</Link></li>
            </ul>
          </div>

          {/* Column 3: Corporate Policy Pages */}
          <div>
            <h3 className="font-bold text-white uppercase tracking-wider text-xs mb-4">Policies & Legal</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/privacy" className="text-white/70 hover:text-accent-green hover:underline">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-white/70 hover:text-accent-green hover:underline">Terms & Conditions</Link></li>
              <li><Link href="/cookies" className="text-white/70 hover:text-accent-green hover:underline">Cookie Policy</Link></li>
              <li><Link href="/editorial" className="text-white/70 hover:text-accent-green hover:underline">Editorial Guidelines</Link></li>
              <li><Link href="/dmca" className="text-white/70 hover:text-accent-green hover:underline">DMCA Takedown Requests</Link></li>
              <li><Link href="/attribution" className="text-white/70 hover:text-accent-green hover:underline">Job Attribution Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter signups */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-white uppercase tracking-wider text-xs">Newsletter Alerts</h3>
            <p className="text-xs text-white/70 leading-relaxed">
              Get a daily email digest containing fresh software engineering, design, and marketing remote jobs.
            </p>
            <form onSubmit={handleSubscribe} className="flex bg-white/10 rounded-md border border-white/10 focus-within:border-accent-green/60 p-1">
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-transparent border-none text-white text-xs px-3 py-2 outline-none flex-grow placeholder:text-white/40 font-semibold"
              />
              <button 
                type="submit"
                className="bg-accent-green hover:bg-accent-greenHover text-white p-2 rounded transition-colors"
                aria-label="Subscribe"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            {subscribed && (
              <div className="text-xs text-accent-green font-semibold flex items-center gap-1.5 animate-pulse">
                <Award className="w-3.5 h-3.5" /> Subscribed successfully!
              </div>
            )}
          </div>
        </div>

        {/* Bottom copyright segment */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50 font-semibold">
          <div>
            &copy; {new Date().getFullYear()} JobPickers.com. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-white">About Us</Link>
            <Link href="/contact" className="hover:text-white">Contact Page</Link>
            <a href="/sitemap.xml" className="hover:text-white flex items-center gap-1"><FileSpreadsheet className="w-3 h-3" /> Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
