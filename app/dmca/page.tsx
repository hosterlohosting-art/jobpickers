'use client';

import { ShieldX, Send, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function DMCAPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    jobUrl: '',
    details: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.jobUrl) {
      setSubmitted(true);
      setFormData({ name: '', email: '', company: '', jobUrl: '', details: '' });
      setTimeout(() => setSubmitted(false), 6000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-6 md:p-8 shadow-sm">
        
        <div className="flex items-center gap-3 border-b border-grayBorder/40 pb-4 mb-6">
          <ShieldX className="w-8 h-8 text-accent-green" />
          <h1 className="text-xl md:text-2xl font-extrabold text-slateText-primary">DMCA Takedown Portal</h1>
        </div>

        <div className="prose prose-sm max-w-none text-slateText-secondary space-y-4 mb-6">
          <p>
            JobPickers aggregates job listings from various public employer boards. If you are a copyright owner or a representative thereof and believe that any listing on our board infringes upon your copyrights or terms, you may submit a takedown request using this form.
          </p>
          <p className="text-xs text-slateText-muted">
            Upon receipt of a valid infringement notification, we will immediately remove or disable access to the disputed job listing.
          </p>
        </div>

        {submitted ? (
          <div className="bg-accent-green/10 border border-accent-green/30 text-accent-green rounded-lg p-6 flex items-start gap-3 animate-pulse">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-sm">Request Submitted Successfully</h3>
              <p className="text-xs mt-1 text-slateText-secondary">
                Our legal compliance team has received your content removal notification. The referenced URL will be audited and removed within 24 hours.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slateText-secondary uppercase">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Jane Doe"
                  className="bg-grayBg/60 border border-grayBorder/40 rounded px-3 py-2 text-sm font-semibold outline-none focus:border-accent-green text-slateText-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slateText-secondary uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. legal@company.com"
                  className="bg-grayBg/60 border border-grayBorder/40 rounded px-3 py-2 text-sm font-semibold outline-none focus:border-accent-green text-slateText-primary"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slateText-secondary uppercase">Hiring Company Represented</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Stripe Inc."
                className="bg-grayBg/60 border border-grayBorder/40 rounded px-3 py-2 text-sm font-semibold outline-none focus:border-accent-green text-slateText-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slateText-secondary uppercase">JobPickers Listing URL</label>
              <input
                type="url"
                required
                value={formData.jobUrl}
                onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                placeholder="e.g. https://jobpickers.com/jobs/senior-dev-stripe-123"
                className="bg-grayBg/60 border border-grayBorder/40 rounded px-3 py-2 text-sm font-semibold outline-none focus:border-accent-green text-slateText-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slateText-secondary uppercase">Infringement Details / Reasons</label>
              <textarea
                rows={4}
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                placeholder="Provide details mapping copyright ownership or specific scraping policy violations..."
                className="bg-grayBg/60 border border-grayBorder/40 rounded px-3 py-2 text-sm font-semibold outline-none focus:border-accent-green text-slateText-primary"
              />
            </div>

            <button
              type="submit"
              className="bg-accent-green hover:bg-accent-greenHover text-white font-bold px-6 py-2.5 rounded text-sm transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Submit Takedown Notice</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
