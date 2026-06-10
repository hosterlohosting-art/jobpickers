import { prisma } from '../../lib/prisma';
import JobCard from '../../components/job-card';
import AdSenseContainer from '../../components/adsense';
import Link from 'next/link';
import { Laptop, Briefcase, ChevronRight } from 'lucide-react';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Remote Jobs | Work From Anywhere - JobPickers',
  description: 'Explore the latest remote software developer, marketing, and design job listings. Apply to remote vacancies directly from top global brands.'
};

export default async function RemoteJobsPage() {
  let remoteJobs: any[] = [];
  try {
    remoteJobs = await prisma.job.findMany({
      where: {
        status: 'published',
        remoteType: 'remote'
      },
      orderBy: { postedAt: 'desc' },
      include: {
        company: {
          select: { name: true, logo: true, slug: true }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching remote jobs:', error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Breadcrumb navigation */}
      <nav className="flex items-center gap-1 text-xs text-slateText-muted font-bold uppercase tracking-wider mb-6">
        <Link href="/" className="hover:text-accent-green">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/jobs" className="hover:text-accent-green">Jobs</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slateText-secondary">Remote Only</span>
      </nav>

      {/* Hero Banner Section */}
      <div className="bg-white border border-grayBorder rounded-lg p-6 md:p-8 shadow-sm mb-8 flex items-center justify-between flex-wrap gap-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(12,170,65,0.06),transparent)] pointer-events-none" />
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded bg-accent-green/10 flex items-center justify-center text-accent-green flex-shrink-0">
            <Laptop className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-extrabold text-slateText-primary">
              Remote Careers & Vacancies
            </h1>
            <p className="text-xs md:text-sm text-slateText-muted mt-1.5 max-w-2xl leading-relaxed">
              Work from anywhere in the world. We aggregate, parse, and verify remote job vacancies daily from trusted partner APIs and company RSS feeds.
            </p>
          </div>
        </div>
        
        <Link
          href="/employer"
          className="bg-accent-green hover:bg-accent-greenHover text-white text-xs font-bold px-4 py-2.5 rounded-md shadow-sm transition-colors whitespace-nowrap"
        >
          Post a Remote Job
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main List column */}
        <main className="lg:col-span-3 space-y-4">
          {/* AdSense Top slot */}
          <AdSenseContainer placementName="remote_jobs_top" className="mb-4" />

          <div className="flex justify-between items-center border-b border-grayBorder pb-2.5">
            <h2 className="text-sm font-extrabold text-slateText-primary uppercase tracking-wider">
              Latest Remote Job Openings ({remoteJobs.length})
            </h2>
          </div>

          {remoteJobs.length > 0 ? (
            <div className="flex flex-col gap-3">
              {remoteJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-grayBorder rounded-lg p-12 text-center text-slateText-muted">
              We couldn't find any remote vacancies in our system right now. Run sync crawls from the Admin Panel.
            </div>
          )}

          {/* AdSense Bottom slot */}
          <AdSenseContainer placementName="remote_jobs_bottom" className="mt-4" />
        </main>

        {/* Sidebar details */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-grayBorder rounded-lg p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slateText-primary uppercase tracking-wider border-b border-grayBorder pb-2">
              Why Work Remotely?
            </h3>
            <p className="text-xs text-slateText-secondary leading-relaxed">
              Remote positions allow you to eliminate commutes, choose your ideal workspace, and collaborate with teams around the globe.
            </p>
            <ul className="text-xs font-semibold text-slateText-secondary space-y-2 list-inside list-disc">
              <li>Better work-life integration</li>
              <li>Work from home or co-working spots</li>
              <li>Access global salary medians</li>
            </ul>
          </div>

          {/* AdSense Sidebar slot */}
          <AdSenseContainer placementName="job_sidebar" />
        </aside>

      </div>
    </div>
  );
}
