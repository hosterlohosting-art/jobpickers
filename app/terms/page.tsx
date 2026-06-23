import { Scale } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms & Conditions - JobPickers',
  description: 'Read the terms of service governing the usage of JobPickers aggregator and recruitment board.'
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-8 shadow-sm">
        
        <div className="flex items-center gap-3 border-b border-grayBorder/40 pb-4 mb-6">
          <Scale className="w-8 h-8 text-accent-green" />
          <h1 className="text-xl md:text-2xl font-extrabold text-slateText-primary">Terms & Conditions</h1>
        </div>

        <div className="prose prose-sm max-w-none text-slateText-secondary space-y-6">
          <p className="text-xs text-slateText-muted italic">Last updated: June 4, 2026</p>

          <p>
            Welcome to JobPickers! These terms and conditions outline the rules and regulations for the use of JobPickerss Website, located at jobpickers.com.
          </p>

          <p>
            By accessing this website we assume you accept these terms and conditions. Do not continue to use JobPickers if you do not agree to take all of the terms and conditions stated on this page.
          </p>

          <div>
            <h2 className="text-sm font-bold text-slateText-primary uppercase tracking-wide mb-2">1. Intellectual Property Rights</h2>
            <p>
              Other than the content you own, under these Terms, JobPickers and/or its licensors own all the intellectual property rights and materials contained in this Website. You are granted limited license only for purposes of viewing the material contained on this Website.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slateText-primary uppercase tracking-wide mb-2">2. Job Seekers & Employer Responsibilities</h2>
            <p>
              JobPickers is an aggregator. Most listings redirect to third-party companies. We do not guarantee, represent, or warrant the legitimacy, safety, or accuracy of external job openings. Employers posting directly on JobPickers represent that the vacancy is active, accurate, and complies with local labor policies.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slateText-primary uppercase tracking-wide mb-2">3. Restricting Access</h2>
            <p>
              We reserve the right to restrict access to certain areas of our website, or indeed this entire website, at our discretion. You must not circumvent or bypass, or attempt to circumvent or bypass, any access restriction measures on our website.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slateText-primary uppercase tracking-wide mb-2">4. Limitation of Liability</h2>
            <p>
              In no event shall JobPickers, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract. JobPickers shall not be held liable for any indirect, consequential, or special liability arising out of or in any way related to your use of this Website.
            </p>
          </div>

          <div className="pt-4 border-t border-grayBorder/40 text-xs text-slateText-muted">
            If you have questions regarding these conditions, please <Link href="/contact" className="text-accent-green hover:underline">Contact Us</Link>.
          </div>
        </div>

      </div>
    </div>
  );
}
