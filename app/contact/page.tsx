'use client';

import { Mail, Send, CheckCircle2, Phone, MapPin } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-6 md:p-8 shadow-sm">
        
        <div className="flex items-center gap-3 border-b border-grayBorder/40 pb-4 mb-6">
          <Mail className="w-8 h-8 text-accent-green" />
          <h1 className="text-xl md:text-2xl font-extrabold text-slateText-primary">Contact JobPickers</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Form wrapper */}
          <div className="md:col-span-2">
            {submitted ? (
              <div className="bg-accent-green/10 border border-accent-green/30 text-accent-green rounded-lg p-6 flex items-start gap-3 animate-pulse">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-sm">Message Sent Successfully</h3>
                  <p className="text-xs mt-1 text-slateText-secondary">
                    Thank you for reaching out! Our support team will review your inquiry and reply within 12 to 24 hours.
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
                      placeholder="e.g. John Doe"
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
                      placeholder="e.g. john@domain.com"
                      className="bg-grayBg/60 border border-grayBorder/40 rounded px-3 py-2 text-sm font-semibold outline-none focus:border-accent-green text-slateText-primary"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slateText-secondary uppercase">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Advertising Inquiries"
                    className="bg-grayBg/60 border border-grayBorder/40 rounded px-3 py-2 text-sm font-semibold outline-none focus:border-accent-green text-slateText-primary"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slateText-secondary uppercase">Message Body</label>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Detail your question or business proposition..."
                    className="bg-grayBg/60 border border-grayBorder/40 rounded px-3 py-2 text-sm font-semibold outline-none focus:border-accent-green text-slateText-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-accent-green hover:bg-accent-greenHover text-white font-bold px-6 py-2.5 rounded text-sm transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>

          {/* Quick info metadata */}
          <div className="md:col-span-1 space-y-6 pt-4 border-t md:border-t-0 md:border-l border-grayBorder/40 md:pl-8">
            <h2 className="text-xs font-bold text-slateText-primary uppercase tracking-wider">
              Contact Details
            </h2>

            <div className="space-y-4 text-xs font-semibold text-slateText-secondary">
              <div className="flex items-start gap-2.5">
                <Mail className="w-4.5 h-4.5 text-accent-green mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block text-slateText-muted font-bold">Email Support</span>
                  <a href="mailto:support@jobpickers.com" className="hover:underline text-accent-green mt-1 block">
                    support@jobpickers.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-2.5">
                <Phone className="w-4.5 h-4.5 text-accent-green mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block text-slateText-muted font-bold">Business Phone</span>
                  <span className="mt-1 block text-slateText-primary">+1 (555) 321-4567</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4.5 h-4.5 text-accent-green mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block text-slateText-muted font-bold">HQ Office</span>
                  <address className="not-italic mt-1 block leading-relaxed text-slateText-primary">
                    JobPickers Inc.<br />
                    100 Pine Street, Suite 500<br />
                    San Francisco, CA 94111
                  </address>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
