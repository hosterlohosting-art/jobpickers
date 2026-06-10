import { ShieldCheck, Info } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - JobPickers',
  description: 'Learn how JobPickers manages data privacy, cookie tracking, and Google AdSense configurations.'
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white border border-grayBorder rounded-lg p-8 shadow-sm">
        
        <div className="flex items-center gap-3 border-b border-grayBorder pb-4 mb-6">
          <ShieldCheck className="w-8 h-8 text-accent-green" />
          <h1 className="text-xl md:text-2xl font-extrabold text-slateText-primary">Privacy Policy</h1>
        </div>

        <div className="prose prose-sm max-w-none text-slateText-secondary space-y-6">
          <p className="text-xs text-slateText-muted italic">Last updated: June 4, 2026</p>

          <p>
            At JobPickers, accessible from jobpickers.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by JobPickers and how we use it.
          </p>

          <div>
            <h2 className="text-sm font-bold text-slateText-primary uppercase tracking-wide mb-2">1. Consent</h2>
            <p>By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slateText-primary uppercase tracking-wide mb-2">2. Information We Collect</h2>
            <p>
              The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information (e.g. newsletter signups, employer registrations, or resume optimization uploads).
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slateText-primary uppercase tracking-wide mb-2">3. How We Use Your Information</h2>
            <p>We use the information we collect in various ways, including to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provide, operate, and maintain our website.</li>
              <li>Improve, personalize, and expand our website features.</li>
              <li>Understand and analyze how you use our website.</li>
              <li>Develop new products, services, features, and functionality.</li>
              <li>Communicate with you, either directly or through one of our partners, for customer service, to provide you with updates and other information relating to the website, and for marketing purposes.</li>
              <li>Find and prevent fraudulent listings.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slateText-primary uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-accent-green" />
              <span>4. Google DoubleClick DART Cookie & AdSense Policies</span>
            </h2>
            <p className="mt-2">
              Google is one of our third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">https://policies.google.com/technologies/ads</a>.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slateText-primary uppercase tracking-wide mb-2">5. GDPR & CCPA Data Privacy Rights</h2>
            <p>
              We want to make sure you are fully aware of all of your data protection rights. Every user is entitled to the right to access, rectification, erasure, restrict processing, object to processing, and data portability. If you make a request, we have one month to respond to you.
            </p>
          </div>

          <div className="pt-4 border-t border-grayBorder text-xs text-slateText-muted">
            If you have additional questions or require more information about our Privacy Policy, do not hesitate to <Link href="/contact" className="text-accent-green hover:underline">Contact Us</Link>.
          </div>
        </div>

      </div>
    </div>
  );
}
