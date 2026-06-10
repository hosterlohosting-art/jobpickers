import { Feather } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Editorial Policy - JobPickers',
  description: 'Understand the editorial guidelines, standards, and reviews processes for JobPickers content and job aggregation.'
};

export default function EditorialPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white border border-grayBorder rounded-lg p-8 shadow-sm">
        
        <div className="flex items-center gap-3 border-b border-grayBorder pb-4 mb-6">
          <Feather className="w-8 h-8 text-accent-green" />
          <h1 className="text-xl md:text-2xl font-extrabold text-slateText-primary">Editorial Policy</h1>
        </div>

        <div className="prose prose-sm max-w-none text-slateText-secondary space-y-6">
          <p className="text-xs text-slateText-muted italic">Last updated: June 4, 2026</p>

          <p>
            At JobPickers, we aim to provide accurate, transparent, and highly helpful resources for job seekers. This Editorial Policy defines our content guidelines, compilation standards, and listing criteria.
          </p>

          <div>
            <h2 className="text-sm font-bold text-slateText-primary uppercase tracking-wide mb-2">1. Article Quality and Accuracy</h2>
            <p>
              All guides, blog posts, and career advice articles published on JobPickers are authored by professional technical recruiters and copywriters. We do not use generative AI to write fake reviews or fabricate salaries. Every recommendation is fact-checked and structured to offer real, actionable help for job seekers.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slateText-primary uppercase tracking-wide mb-2">2. Automated Job Ingestion Guidelines</h2>
            <p>
              Job listings crawled from external sources must meet minimum data quality requirements. We enforce strict policies:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>**No Spam**: Obvious scams, fee-for-employment, and misleading postings are blocked automatically.</li>
              <li>**Original URLs**: We always preserve and attribute the original source links.</li>
              <li>**No Fabrication**: If key metrics (such as salary limits) are undisclosed, we label them "Not specified" rather than estimating fake values.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slateText-primary uppercase tracking-wide mb-2">3. Transparency & Redirection</h2>
            <p>
              JobPickers clearly distinguishes between direct employer vacancies (where seekers can apply internally) and aggregated listings. External vacancies will display the text "Apply on Company Site" and redirect users to the original hiring board.
            </p>
          </div>

          <div className="pt-4 border-t border-grayBorder text-xs text-slateText-muted">
            For feedback or content removal requests, please visit the <Link href="/dmca" className="text-accent-green hover:underline">DMCA Portal</Link> or the <Link href="/contact" className="text-accent-green hover:underline">Contact Page</Link>.
          </div>
        </div>

      </div>
    </div>
  );
}
