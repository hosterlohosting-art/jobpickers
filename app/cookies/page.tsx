import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Cookie Policy - JobPickers',
  description: 'Learn how cookies, web beacons, and Google AdSense trackers are configured on JobPickers.'
};

export default function CookiesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white border border-grayBorder rounded-lg p-8 shadow-sm">
        
        <div className="flex items-center gap-3 border-b border-grayBorder pb-4 mb-6">
          <ShieldAlert className="w-8 h-8 text-accent-green" />
          <h1 className="text-xl md:text-2xl font-extrabold text-slateText-primary">Cookie Policy</h1>
        </div>

        <div className="prose prose-sm max-w-none text-slateText-secondary space-y-6">
          <p className="text-xs text-slateText-muted italic">Last updated: June 4, 2026</p>

          <p>
            This is the Cookie Policy for JobPickers, accessible from jobpickers.com.
          </p>

          <div>
            <h2 className="text-sm font-bold text-slateText-primary uppercase tracking-wide mb-2">1. What Are Cookies</h2>
            <p>
              As is common practice with almost all professional websites, this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it, and why we sometimes need to store these cookies.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slateText-primary uppercase tracking-wide mb-2">2. How We Use Cookies</h2>
            <p>
              We use cookies for a variety of reasons detailed below. Unfortunately, in most cases, there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site. It is recommended that you leave on all cookies if you are not sure whether you need them or not.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slateText-primary uppercase tracking-wide mb-2">3. Third-Party Cookies (AdSense & Analytics)</h2>
            <p>In some special cases, we also use cookies provided by trusted third parties. The following section details which third party cookies you might encounter through this site.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                This site uses **Google Analytics** which is one of the most widespread and trusted analytics solutions on the web for helping us to understand how you use the site and ways that we can improve your experience. These cookies may track things such as how long you spend on the site and the pages that you visit.
              </li>
              <li>
                The **Google AdSense** service we use to serve advertising uses a DoubleClick cookie to serve more relevant ads across the web and limit the number of times that a given ad is shown to you.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slateText-primary uppercase tracking-wide mb-2">4. Disabling Cookies</h2>
            <p>
              You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit.
            </p>
          </div>

          <div className="pt-4 border-t border-grayBorder text-xs text-slateText-muted">
            If you need further details, please review our <Link href="/privacy" className="text-accent-green hover:underline">Privacy Policy</Link> or get in touch through the <Link href="/contact" className="text-accent-green hover:underline">Contact Page</Link>.
          </div>
        </div>

      </div>
    </div>
  );
}
