import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import JobCard from '@/components/job-card';
import CompanyLogo from '@/components/company-logo';
import { Building2, Globe, ShieldCheck, Star, ArrowLeft, Heart, MessageSquare } from 'lucide-react';
import { Metadata } from 'next';

interface CompanyPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const company = await prisma.company.findUnique({
    where: { slug: params.slug }
  });
  if (!company) return {};
  return {
    title: `${company.name} Company Profile & Careers - JobPickers`,
    description: `Learn about ${company.name}. Discover company details, employee reviews placeholders, and active job listings.`
  };
}

export default async function CompanyProfilePage({ params }: CompanyPageProps) {
  const company = await prisma.company.findUnique({
    where: { slug: params.slug },
    include: {
      jobs: {
        where: { status: 'published' },
        orderBy: { postedAt: 'desc' }
      }
    }
  });

  if (!company) {
    notFound();
  }

  // Get a stable mock rating for the company
  const getMockRating = () => {
    let hash = 0;
    for (let i = 0; i < company.name.length; i++) {
      hash = company.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (3.8 + (Math.abs(hash) % 12) / 10).toFixed(1);
  };

  const rating = getMockRating();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      <Link href="/jobs" className="flex items-center gap-1 text-xs font-bold text-slateText-secondary hover:text-accent-green mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to job feed
      </Link>

      {/* Hero Header Card */}
      <div className="bg-white border border-grayBorder rounded-lg p-6 md:p-8 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-center gap-4">
            <CompanyLogo logo={company.logo} name={company.name} className="w-16 h-16" textClassName="text-2xl" />
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slateText-primary">{company.name}</h1>
              <p className="text-sm text-slateText-muted mt-0.5">{company.location}</p>
              
              {/* Star Rating displays */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5 text-xs text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{rating}</span>
                </div>
                <span className="text-xs text-slateText-muted font-semibold">Verified Company Profile</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto bg-accent-green hover:bg-accent-greenHover text-white text-xs font-bold px-4 py-2.5 rounded transition-all text-center"
              >
                Visit Website
              </a>
            )}
          </div>
        </div>

        {/* Tab Links Row */}
        <div className="flex border-t border-grayBorder mt-6 pt-4 gap-6 text-sm font-bold text-slateText-muted">
          <span className="text-accent-teal border-b-2 border-accent-green pb-2">Overview</span>
          <span className="hover:text-slateText-primary cursor-pointer flex items-center gap-1">Reviews <span className="text-xs bg-grayBorder px-1.5 py-0.5 rounded">12</span></span>
          <span className="hover:text-slateText-primary cursor-pointer flex items-center gap-1">Careers <span className="text-xs bg-accent-green/20 text-accent-green px-1.5 py-0.5 rounded">{company.jobs.length}</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main descriptions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* About Card */}
          <div className="bg-white border border-grayBorder rounded-lg p-6 shadow-sm">
            <h2 className="text-base font-extrabold text-slateText-primary border-b border-grayBorder pb-2.5 mb-4">
              About {company.name}
            </h2>
            <p className="text-sm text-slateText-secondary leading-relaxed">
              {company.description}
            </p>
          </div>

          {/* Reviews tab placeholders (original value, Glassdoor inspired but not copied) */}
          <div className="bg-white border border-grayBorder rounded-lg p-6 shadow-sm">
            <h2 className="text-base font-extrabold text-slateText-primary border-b border-grayBorder pb-2.5 mb-4 flex items-center gap-1.5">
              <MessageSquare className="w-5 h-5 text-accent-green" />
              <span>Company Culture Notes</span>
            </h2>
            <div className="space-y-4">
              <div className="border-b border-grayBorder/60 pb-4">
                <div className="flex justify-between items-center text-xs font-bold text-slateText-muted uppercase mb-1">
                  <span>Frontend Developer Review</span>
                  <div className="flex items-center gap-0.5 text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span>4.5</span>
                  </div>
                </div>
                <p className="text-sm font-bold text-slateText-primary">"Innovative workspace and fantastic scale engineering culture"</p>
                <p className="text-xs text-slateText-secondary mt-1">Excellent focus on Next.js, code quality, and testing practices. Leadership values developer experience highly.</p>
              </div>
              <div className="pb-2">
                <div className="flex justify-between items-center text-xs font-bold text-slateText-muted uppercase mb-1">
                  <span>Product Designer Review</span>
                  <div className="flex items-center gap-0.5 text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span>4.0</span>
                  </div>
                </div>
                <p className="text-sm font-bold text-slateText-primary">"Great design token systems and cross-functional teams"</p>
                <p className="text-xs text-slateText-secondary mt-1">Designers collaborate directly with frontend developers. High alignment on detail and typography excellence.</p>
              </div>
            </div>
          </div>

          {/* Active Job Openings list */}
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slateText-primary border-b border-grayBorder pb-2.5 mb-2 flex items-center gap-1.5">
              <Heart className="w-5 h-5 text-red-500" />
              <span>Hiring Positions ({company.jobs.length})</span>
            </h2>
            {company.jobs.length > 0 ? (
              <div className="flex flex-col gap-3">
                {company.jobs.map((job) => (
                  <JobCard key={job.id} job={{ ...job, company }} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-grayBorder rounded-lg p-6 text-center text-slateText-muted">
                No active job postings found at {company.name} currently.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-grayBorder rounded-lg p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slateText-primary uppercase tracking-wider border-b border-grayBorder pb-2 mb-3">
              Company Metadata
            </h2>
            
            <div className="space-y-3 text-xs font-semibold text-slateText-secondary">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slateText-muted" />
                <span>Industry: {company.industry || 'Not specified'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slateText-muted" />
                {company.website ? (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-accent-green">
                    {company.website.replace('https://', '')}
                  </a>
                ) : (
                  <span>Website: Not specified</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slateText-muted" />
                <span>Employees: {company.size || 'Not specified'}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
