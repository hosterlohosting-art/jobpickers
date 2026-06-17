import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '../../../lib/prisma';
import { MapPin, Clock, DollarSign, Calendar, Building2, Globe, ShieldCheck, ArrowLeft, Bookmark, AlertCircle, ExternalLink } from 'lucide-react';
import AdSenseContainer from '../../../components/adsense';
import JobCard from '../../../components/job-card';
import { getRelativeTime } from '../../../lib/utils';
import { Metadata } from 'next';
import CompanyLogo from '../../../components/company-logo';
import BookmarkButton from '../../../components/bookmark-button';

interface JobDetailPageProps {
  params: {
    slug: string;
  };
}

// Generate dynamic SEO metadata for each job listing page
export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const job = await prisma.job.findUnique({
    where: { slug: params.slug },
    include: { company: true }
  });

  if (!job) return {};

  const cleanText = job.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const metaDesc = cleanText.slice(0, 150) + '...';

  return {
    title: `${job.title} Job at ${job.company.name} - JobPickers`,
    description: metaDesc,
    openGraph: {
      title: `${job.title} Job at ${job.company.name}`,
      description: metaDesc,
      type: 'article',
      url: `/jobs/${job.slug}`
    }
  };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const job = await prisma.job.findUnique({
    where: { slug: params.slug },
    include: {
      company: true
    }
  });

  if (!job) {
    notFound();
  }

  // 1. Fetch user save state
  let isSaved = false;
  try {
    const user = await prisma.user.findFirst({
      where: { role: 'user' }
    });
    if (user) {
      const savedRecord = await prisma.savedJob.findFirst({
        where: { userId: user.id, jobId: job.id }
      });
      isSaved = !!savedRecord;
    }
  } catch (error) {
    console.error('Error checking bookmark state:', error);
  }

  // 2. Fetch Ad Placement code
  let adDetailsCode = '';
  try {
    const adPlacement = await prisma.adPlacement.findUnique({
      where: { name: 'job_details_summary' }
    });
    if (adPlacement && adPlacement.isActive) {
      adDetailsCode = adPlacement.adCode;
    }
  } catch (error) {
    console.error('Error fetching details ad placement:', error);
  }

  // 3. Fetch Similar/Related Jobs
  let similarJobs: any[] = [];
  try {
    similarJobs = await prisma.job.findMany({
      where: {
        category: job.category,
        status: 'published',
        NOT: { id: job.id }
      },
      take: 3,
      orderBy: { postedAt: 'desc' },
      include: {
        company: {
          select: { name: true, logo: true, slug: true }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching similar jobs:', error);
  }

  // 2. Build Google Jobs Schema.org JSON-LD Object
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    'title': job.title,
    'description': job.description.replace(/<[^>]*>/g, ''), // Plain text snippet
    'identifier': {
      '@type': 'PropertyValue',
      'name': job.company.name,
      'value': job.id
    },
    'datePosted': job.postedAt.toISOString(),
    'validThrough': job.expiresAt.toISOString(),
    'employmentType': job.employmentType === 'full-time' ? 'FULL_TIME' : job.employmentType === 'part-time' ? 'PART_TIME' : job.employmentType === 'contract' ? 'CONTRACT' : job.employmentType === 'internship' ? 'INTERNSHIP' : 'OTHER',
    'hiringOrganization': {
      '@type': 'Organization',
      'name': job.company.name,
      'sameAs': job.company.website || undefined,
      'logo': job.company.logo || undefined
    },
    'jobLocation': {
      '@type': 'Place',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': job.city || job.location,
        'addressCountry': job.country
      }
    },
    'baseSalary': job.salaryMin ? {
      '@type': 'MonetaryAmount',
      'currency': job.salaryCurrency,
      'value': {
        '@type': 'QuantitativeValue',
        'minValue': job.salaryMin,
        'maxValue': job.salaryMax || job.salaryMin,
        'unitText': 'YEAR'
      }
    } : undefined
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Schema injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link href="/jobs" className="flex items-center gap-1.5 text-xs font-bold text-slateText-secondary hover:text-accent-green mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to job feed
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Job Body details Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-grayBorder rounded-lg p-6 md:p-8 shadow-sm">
            {job.status === 'expired' && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>Notice: This career posting has expired and is no longer accepting submissions.</span>
              </div>
            )}
            
            {/* Header info */}
            <div className="flex gap-4 items-start">
              <CompanyLogo logo={job.company.logo} name={job.company.name} className="w-14 h-14" textClassName="text-xl" />
              <div className="flex-grow">
                <h1 className="text-xl md:text-2xl font-extrabold text-slateText-primary leading-tight">
                  {job.title}
                </h1>
                <div className="flex items-center gap-2 mt-1.5 text-sm text-slateText-secondary font-semibold">
                  <Link href={`/companies/${job.company.slug}`} className="hover:text-accent-green hover:underline">
                    {job.company.name}
                  </Link>
                  <span>&bull;</span>
                  <span>{job.location}</span>
                </div>
              </div>
            </div>

            {/* Quick Metadata grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-y border-grayBorder/80 my-6 py-4 text-xs font-bold text-slateText-secondary uppercase tracking-wider">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slateText-muted">Workplace</span>
                <span className="text-slateText-primary">{job.remoteType}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slateText-muted">Job Type</span>
                <span className="text-slateText-primary">{job.employmentType.replace('-', ' ')}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slateText-muted">Experience</span>
                <span className="text-slateText-primary">{job.experienceLevel}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slateText-muted">Salary Target</span>
                {job.salaryMin ? (
                  <span className="text-accent-green font-extrabold">
                    ${Math.round(job.salaryMin / 1000)}k - ${Math.round((job.salaryMax || job.salaryMin) / 1000)}k
                  </span>
                ) : (
                  <span className="text-slateText-primary">Undisclosed</span>
                )}
              </div>
            </div>

            {/* Redirection Tracker Apply action */}
            <div className="flex gap-4">
              {job.status === 'expired' ? (
                <button
                  disabled
                  className="bg-slateText-muted/20 text-slateText-muted cursor-not-allowed text-xs font-bold px-6 py-3 rounded bg-grayBg border border-grayBorder"
                >
                  Position Expired
                </button>
              ) : (
                <a
                  href="#apply-section"
                  className="bg-accent-green/10 hover:bg-accent-green/20 text-accent-green text-sm font-bold px-6 py-3 rounded-md transition-colors shadow-sm inline-flex items-center justify-center gap-1.5"
                >
                  <span>Apply Now</span>
                </a>
              )}
              <BookmarkButton jobId={job.id} initialSaved={isSaved} />
            </div>

            {/* Source mapping footer */}
            <div className="flex items-center gap-1.5 text-xs text-slateText-muted font-semibold mt-4 border-t border-grayBorder/40 pt-4">
              <Calendar className="w-3.5 h-3.5" />
              <span>Posted {getRelativeTime(job.postedAt)} &bull; Ingested via <span className="text-slateText-secondary">{job.sourceName}</span></span>
            </div>
          </div>

          {/* AdSense slot below header summary */}
          <AdSenseContainer placementName="job_details_summary" adCode={adDetailsCode} />

          {/* Main Description details */}
          <div className="bg-white border border-grayBorder rounded-lg p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-extrabold text-slateText-primary border-b border-grayBorder pb-3 mb-4">
              Job Description
            </h2>
            <article 
              className="prose prose-sm max-w-none text-slateText-secondary leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
            {job.skills && job.skills !== 'Not Specified' && (
              <div className="mt-8 pt-6 border-t border-grayBorder">
                <h3 className="text-sm font-bold text-slateText-primary uppercase tracking-wide mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.split(',').map((skill: string) => (
                    <span key={skill} className="bg-grayBg border border-grayBorder text-slateText-secondary text-xs font-semibold px-2.5 py-1 rounded">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Apply section at the bottom of the description */}
            <div id="apply-section" className="mt-8 pt-6 border-t border-grayBorder flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slateText-primary">Ready to apply?</h4>
                <p className="text-xs text-slateText-muted">You will be redirected to the official company application portal.</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                {job.status === 'expired' ? (
                  <button
                    disabled
                    className="w-full sm:w-auto text-center bg-slateText-muted/20 text-slateText-muted cursor-not-allowed text-xs font-bold px-6 py-3 rounded bg-grayBg border border-grayBorder"
                  >
                    Position Expired
                  </button>
                ) : (
                  <a
                    href={`/api/jobs/apply?id=${job.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto text-center bg-accent-green hover:bg-accent-greenHover text-white text-sm font-bold px-6 py-3 rounded-md transition-colors shadow-sm inline-flex items-center justify-center gap-2"
                  >
                    <span>Apply on Company Site</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <BookmarkButton jobId={job.id} initialSaved={isSaved} />
              </div>
            </div>
          </div>

          {/* Related/Similar listings */}
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slateText-primary uppercase tracking-wider">
              Similar Career Opportunities
            </h2>
            {similarJobs.length > 0 ? (
              <div className="flex flex-col gap-3">
                {similarJobs.map((simJob: any) => (
                  <JobCard key={simJob.id} job={simJob} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slateText-muted">No related jobs matching this category at this time.</p>
            )}
          </div>
        </div>

        {/* Sidebar Company Profile details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-grayBorder rounded-lg p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slateText-primary uppercase tracking-wider border-b border-grayBorder pb-2 mb-4">
              Hiring Company
            </h2>
            <div className="flex items-center gap-3">
              <CompanyLogo logo={job.company.logo} name={job.company.name} className="w-12 h-12" textClassName="text-lg" />
              <div>
                <h3 className="font-bold text-sm text-slateText-primary">{job.company.name}</h3>
                <Link href={`/companies/${job.company.slug}`} className="text-xs font-bold text-accent-green hover:underline">
                  View full profile
                </Link>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs font-semibold text-slateText-secondary pt-4 border-t border-grayBorder/60">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slateText-muted" />
                <span>Industry: {job.company.industry || 'Not specified'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slateText-muted" />
                {job.company.website ? (
                  <a href={job.company.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-accent-green">
                    {job.company.website.replace('https://', '')}
                  </a>
                ) : (
                  <span>Website: Not specified</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slateText-muted" />
                <span>Employees: {job.company.size || 'Not specified'}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
