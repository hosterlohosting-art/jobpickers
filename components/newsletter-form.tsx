'use client';

import React from 'react';

export default function NewsletterForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Subscribed to daily career notifications!');
  };

  return (
    <form onSubmit={handleSubmit} className="flex bg-white/10 p-1.5 rounded-lg border border-white/20 w-full lg:max-w-md">
      <input
        type="email"
        placeholder="Enter your email address"
        required
        className="bg-transparent border-none text-white text-sm px-4 py-3 outline-none flex-grow placeholder:text-white/50 font-semibold"
      />
      <button
        type="submit"
        className="bg-white text-accent-green hover:bg-white/95 font-bold px-6 py-3 rounded transition-colors text-sm shadow-sm whitespace-nowrap"
      >
        Sign Up Free
      </button>
    </form>
  );
}
