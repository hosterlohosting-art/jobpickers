import { Info } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Job Source Attribution Policy - JobPickers',
  description: 'Understand how JobPickers attributes job listings crawled from third-party boards and partner API connectors.'
};

export default function AttributionPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white border border-grayBorder rounded-lg p-8 shadow-sm">
        
        <div className="flex items-center gap-3 border-b border-grayBorder pb-4 mb-6">
          <Info className="w-8 h-8 text-accent-green" />
          <h1 className="text-xl md:text-2xl font-extrabold text-slateText-primary">Job Source Attribution Policy</h1>
        </div>

        <div className="prose prose-sm max-w-none text-slateText-secondary space-y-6">
          <p className="text-xs text-slateText-muted italic">Last updated: June 4, 2026</p>

          <p>
            JobPickers acts as a structured search directory. We harvest job vacancy details using legal, API, and RSS connector structures. To respect partner networks, we enforce strict attribution standards.
          </p>

          <div>
            <h2 className="text-sm font-bold text-slateText-primary uppercase tracking-wide mb-2">1. Redirection & Original Links</h2>
            <p>
              JobPickers does not claim ownership or direct hosting of aggregated positions. Every job detail page harvested via crawling connectors is explicitly labeled with its original sourcing network (e.g., "Arbeitnow", "Remotive", "Indeed Partner Feed"). 
            </p>
            <p className="mt-2">
              The primary action button on these detail pages redirects the seeker directly to the partner platform or employer website to complete the application process.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slateText-primary uppercase tracking-wide mb-2">2. Brand & Trademarks Respect</h2>
            <p>
              Trademarks and logos of third-party platforms (including Indeed, LinkedIn, and Glassdoor) belong to their respective owners. JobPickers is not endorsed by, associated with, or partnered with these platforms unless official API publisher credentials have been configured by the system administrator.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slateText-primary uppercase tracking-wide mb-2">3. Removal Requests</h2>
            <p>
              If you are an employer and wish for your crawled listings to be removed, updated, or excluded from future crawls, you may trigger a request via our <Link href="/dmca" className="text-accent-green hover:underline">DMCA Portal</Link> or opt-out by setting standard rules inside your careers website’s `robots.txt` configuration (our crawler respects all robots.txt exclusions).
            </p>
          </div>

          <div className="pt-4 border-t border-grayBorder text-xs text-slateText-muted">
            If you represent a job board API network and wish to partner, please get in touch on the <Link href="/contact" className="text-accent-green hover:underline">Contact Page</Link>.
          </div>
        </div>

      </div>
    </div>
  );
}
