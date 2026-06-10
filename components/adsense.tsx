'use client';

import { useEffect, useState } from 'react';
import { AlertOctagon } from 'lucide-react';

interface AdSenseProps {
  placementName: string;
  adCode?: string;
  className?: string;
}

export default function AdSenseContainer({ placementName, adCode, className = '' }: AdSenseProps) {
  const [activeCode, setActiveCode] = useState<string | null>(null);

  useEffect(() => {
    // If adCode is provided via database records, use it. Otherwise, look up or fallback.
    if (adCode && adCode.trim().length > 0) {
      setActiveCode(adCode);
    }
  }, [adCode]);

  const isProd = process.env.NODE_ENV === 'production';

  // In production, if we have actual AdSense code script configured, parse and inject it.
  // We wrap it in a container that reserves height (min-h-[100px] to min-h-[250px] depending on device) to avoid CLS.
  if (isProd) {
    // If no adCode is configured or it is just a seeded mock placeholder, return null to avoid cluttering the UI
    if (!activeCode || activeCode.includes('Mock') || activeCode.trim().length === 0) {
      return null;
    }

    return (
      <div className={`adsense-container mx-auto my-4 w-full flex flex-col items-center ${className}`}>
        <span className="text-[10px] font-bold text-slateText-muted/50 uppercase tracking-widest mb-1.5 block text-center">
          Advertisement
        </span>
        <div 
          className="adsbygoogle-wrapper overflow-hidden w-full flex justify-center items-center min-h-[100px] sm:min-h-[250px]"
          dangerouslySetInnerHTML={{ __html: activeCode }}
        />
      </div>
    );
  }

  // Visual Sponsored AdSense placeholder box matching light clean Glassdoor layouts in development/fallback
  return (
    <div className={`border border-dashed border-slateText-muted/30 bg-grayBg/60 rounded-md p-4 flex flex-col justify-center items-center text-center relative overflow-hidden min-h-[100px] sm:min-h-[250px] my-4 ${className}`}>
      <span className="absolute top-1 right-2 text-[8px] font-bold text-slateText-muted/50 uppercase tracking-widest">
        Advertisement
      </span>
      <div className="flex items-center gap-2 text-slateText-secondary font-semibold text-xs mt-1">
        <AlertOctagon className="w-4 h-4 text-accent-green" />
        <span>AdSense Placeholder: <span className="font-bold text-slateText-primary">{placementName}</span></span>
      </div>
      <p className="text-[10px] text-slateText-muted mt-1 max-w-sm">
        {isProd 
          ? "No Google AdSense code script has been configured. Update this block in the Admin Settings panel to monetize."
          : "Visible in Development Mode. The actual script will inject in Production mode when configured."
        }
      </p>
    </div>
  );
}

