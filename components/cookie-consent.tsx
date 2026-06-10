'use client';

import { useState, useEffect } from 'react';
import { X, Cookie, ShieldCheck, Settings } from 'lucide-react';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'jobpickers_cookie_consent';

type ConsentState = 'accepted' | 'declined' | null;

export default function CookieConsentBanner() {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY) as ConsentState;
      if (stored === 'accepted' || stored === 'declined') {
        setConsent(stored);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    } catch {}
    setConsent('accepted');
  };

  const handleDecline = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    } catch {}
    setConsent('declined');
  };

  // Don't render server-side or if already consented
  if (!mounted || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-modal="true"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-slide-up"
      style={{ animationFillMode: 'both' }}
    >
      <div className="max-w-4xl mx-auto bg-white border border-grayBorder rounded-xl shadow-2xl p-5 md:p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Icon + Text */}
          <div className="flex items-start gap-4 flex-1">
            <div className="w-10 h-10 rounded-lg bg-accent-green/10 flex items-center justify-center text-accent-green flex-shrink-0">
              <Cookie className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slateText-primary text-sm mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-accent-green" />
                We Value Your Privacy
              </h2>
              <p className="text-xs text-slateText-secondary leading-relaxed max-w-xl">
                JobPickers uses essential cookies to keep the site working and analytics cookies to improve your experience. 
                We never sell your data. By clicking <strong>"Accept All"</strong>, you consent to our use of cookies.{' '}
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-accent-green hover:underline font-semibold"
                >
                  {showDetails ? 'Hide details' : 'Learn more'}
                </button>{' '}
                or read our{' '}
                <Link href="/cookies" className="text-accent-green hover:underline font-semibold">
                  Cookie Policy
                </Link>.
              </p>

              {showDetails && (
                <div className="mt-3 p-3 bg-grayBg border border-grayBorder rounded-lg text-xs text-slateText-secondary space-y-2">
                  <div>
                    <span className="font-bold text-slateText-primary">Essential Cookies</span> — Required for authentication, 
                    security sessions, and basic site functionality. These cannot be disabled.
                  </div>
                  <div>
                    <span className="font-bold text-slateText-primary">Analytics Cookies</span> — Help us understand how visitors 
                    use JobPickers so we can improve search results and content. Data is anonymized.
                  </div>
                  <div>
                    <span className="font-bold text-slateText-primary">Advertising Cookies</span> — Used by Google AdSense to 
                    display relevant ads. Only active if you accept all cookies.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto">
            <button
              id="cookie-decline-btn"
              onClick={handleDecline}
              className="flex-1 md:flex-none border border-grayBorder text-slateText-secondary hover:border-slateText-secondary font-bold px-4 py-2 rounded text-xs transition-colors"
            >
              Essential Only
            </button>
            <button
              id="cookie-accept-btn"
              onClick={handleAccept}
              className="flex-1 md:flex-none bg-accent-green hover:bg-accent-greenHover text-white font-bold px-5 py-2 rounded text-xs transition-colors shadow-sm"
            >
              Accept All
            </button>
            <button
              onClick={handleDecline}
              aria-label="Close cookie banner"
              className="text-slateText-muted hover:text-slateText-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
