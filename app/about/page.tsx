import { ShieldCheck, Heart } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'About Us - JobPickers',
  description: 'Learn about the mission, core values, and features of the JobPickers career board portal.'
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white border border-grayBorder rounded-lg p-8 shadow-sm">
        
        <div className="flex items-center gap-3 border-b border-grayBorder pb-4 mb-6">
          <Heart className="w-8 h-8 text-accent-green" />
          <h1 className="text-xl md:text-2xl font-extrabold text-slateText-primary">About JobPickers</h1>
        </div>

        <div className="prose prose-sm max-w-none text-slateText-secondary space-y-6">
          <p>
            JobPickers was launched in 2026 with a simple mission: **to make job search transparent, fast, and structured.**
          </p>
          <p>
            We noticed that many career boards are filled with duplicate listings, spammy postings, or hidden application links. We built JobPickers to resolve these pain points by constructing automated crawlers, database cleaning filters, and AI categorization tags.
          </p>

          <div>
            <h2 className="text-sm font-bold text-slateText-primary uppercase tracking-wide mb-2">Our Core Values</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                **Transparency**: We always attribute listings to their original platforms and never fabricate company reviews or salary details.
              </li>
              <li>
                **High Performance**: JobPickers is designed to load in milliseconds, satisfying core Web Vitals.
              </li>
              <li>
                **Helper Tools**: We build useful original resources, such as custom resumes builders, keyword trackers, and career advice blogs.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slateText-primary uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-accent-green" />
              <span>AdSense Compliance & Trust</span>
            </h2>
            <p className="mt-2">
              JobPickers is designed to be fully compliant with Google Publisher Policies. We exclude thin copied content, prevent duplicate spam, provide clear navigation, and host high-value blog articles to ensure a clean user experience.
            </p>
          </div>

          <div className="pt-4 border-t border-grayBorder text-xs text-slateText-muted">
            Ready to find your next opportunity? Browse our <Link href="/jobs" className="text-accent-green hover:underline">Jobs Board</Link> or get in touch on our <Link href="/contact" className="text-accent-green hover:underline">Contact Page</Link>.
          </div>
        </div>

      </div>
    </div>
  );
}
