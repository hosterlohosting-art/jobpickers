'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, FileText, PlusCircle, Bookmark, Menu, X, Building2, Coins } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Find Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Companies', href: '/companies', icon: Building2 },
    { name: 'Salaries & Reviews', href: '/salaries', icon: Coins },
    { name: 'Dashboard', href: '/dashboard', icon: Bookmark },
    { name: 'Career Advice', href: '/blog', icon: FileText },
    { name: 'Post a Job', href: '/employer', icon: PlusCircle },
  ];

  const isActive = (href: string) => {
    if (href === '/' && pathname !== '/') return false;
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/85 border-b border-grayBorder/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand Area */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-md bg-accent-green flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <span className="font-extrabold text-lg leading-none">JP</span>
            </div>
            <span className="text-xl font-extrabold text-slateText-primary tracking-tight">
              Job<span className="text-accent-green">Pickers</span>
            </span>
          </Link>
  
          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-md font-semibold text-sm transition-colors ${
                    active
                      ? 'bg-accent-green/10 text-accent-green'
                      : 'text-slateText-secondary hover:text-slateText-primary hover:bg-grayBg/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
  
          {/* Desktop CTA actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/admin" 
              className="text-xs font-semibold text-slateText-muted hover:text-accent-green transition-colors"
            >
              Admin Panel
            </Link>
            <Link
              href="/employer"
              className="bg-accent-green hover:bg-accent-greenHover text-white text-sm font-bold px-4 py-2 rounded-md transition-all shadow-sm hover:shadow-md flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Employers
            </Link>
          </div>
  
          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-slateText-secondary hover:text-slateText-primary hover:bg-grayBg/50 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
  
      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-grayBorder/40 bg-background/95 backdrop-blur-md px-4 py-3 flex flex-col gap-2 shadow-xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-md font-semibold text-base transition-colors ${
                  active
                    ? 'bg-accent-green/10 text-accent-green'
                    : 'text-slateText-secondary hover:text-slateText-primary hover:bg-grayBg/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}
          <div className="h-px bg-grayBorder/40 my-2" />
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-md text-slateText-secondary hover:text-slateText-primary font-semibold text-base"
          >
            Admin Panel
          </Link>
          <Link
            href="/employer"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full bg-accent-green hover:bg-accent-greenHover text-white text-center font-bold py-3 rounded-md transition-colors block mt-2 shadow-sm"
          >
            Employer Services
          </Link>
        </div>
      )}
    </header>
  );
}
