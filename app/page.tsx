import Link from 'next/link';
import { Search, MapPin, Laptop, Shield, Sparkles, Building2, TrendingUp, Cpu, Award, Users, Database, Coins } from 'lucide-react';
import { prisma } from '../lib/prisma';
import JobCard from '../components/job-card';
import AdSenseContainer from '../components/adsense';
import NewsletterForm from '../components/newsletter-form';
import CompanyLogo from '../components/company-logo';

export const revalidate = 3600; // Cache homepage for 1 hour

export default async function HomePage() {
  // Fetch active listings, companies, and ad placements for page details
  let jobs: any[] = [];
  let companies: any[] = [];
  let adTopCode = '';
  let adMiddleCode = '';
  let counts: Record<string, number> = {
    'Software': 0,
    'Design': 0,
    'Marketing': 0,
    'Customer Support': 0,
    'Finance': 0,
    'Sales': 0,
    'Data': 0,
    'HR': 0
  };

  try {
    jobs = await prisma.job.findMany({
      where: { status: 'published' },
      take: 4,
      orderBy: { postedAt: 'desc' },
      include: {
        company: {
          select: { name: true, logo: true, slug: true }
        }
      }
    });

    companies = await prisma.company.findMany({
      take: 6,
      select: { name: true, logo: true, slug: true, location: true, size: true }
    });

    const adTop = await prisma.adPlacement.findUnique({ where: { name: 'homepage_top' } });
    if (adTop && adTop.isActive) adTopCode = adTop.adCode;

    const adMiddle = await prisma.adPlacement.findUnique({ where: { name: 'homepage_middle' } });
    if (adMiddle && adMiddle.isActive) adMiddleCode = adMiddle.adCode;

    // Fetch dynamic category counts in a single group-by query
    const categoryGroups = await prisma.job.groupBy({
      by: ['category'],
      where: { status: 'published' },
      _count: {
        _all: true
      }
    });

    for (const group of categoryGroups) {
      if (group.category && group.category in counts) {
        counts[group.category] = group._count._all;
      }
    }
  } catch (error) {
    console.error('Error fetching homepage data:', error);
  }

  // Predefined Glassdoor-style categories mapping (aligned with canonical 8 DB categories)
  const categories = [
    { name: 'Software', count: counts['Software'], icon: Cpu },
    { name: 'Design', count: counts['Design'], icon: Sparkles },
    { name: 'Marketing', count: counts['Marketing'], icon: TrendingUp },
    { name: 'Customer Support', count: counts['Customer Support'], icon: Award },
    { name: 'Finance', count: counts['Finance'], icon: Shield },
    { name: 'Sales', count: counts['Sales'], icon: Coins },
    { name: 'Data', count: counts['Data'], icon: Database },
    { name: 'HR', count: counts['HR'], icon: Users }
  ];

  return (
    <div className="flex flex-col gap-12 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="bg-accent-teal text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(12,170,65,0.15),transparent)] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Find the Job That <span className="text-accent-green">Fits Your Life</span>
          </h1>
          <p className="text-sm md:text-base text-white/70 mt-3 max-w-xl mx-auto">
            JobPickers aggregates, normalizes, and filters thousands of developer, designer, and product careers daily.
          </p>

          {/* Unified Search Form (GET redirect to /jobs) */}
          <form action="/jobs" method="GET" className="bg-white rounded-lg p-2 shadow-lg mt-8 flex flex-col md:flex-row gap-2 items-center border border-accent-green/20">
            <div className="flex items-center gap-2 px-3 py-1 flex-grow w-full md:w-auto">
              <Search className="w-5 h-5 text-slateText-muted flex-shrink-0" />
              <input
                type="text"
                name="keyword"
                placeholder="Job title, keywords, or company..."
                className="w-full bg-transparent text-slateText-primary font-semibold text-sm outline-none placeholder:text-slateText-muted"
              />
            </div>
            
            <div className="h-px md:h-8 w-full md:w-px bg-grayBorder my-1 md:my-0 flex-shrink-0" />

            <div className="flex items-center gap-2 px-3 py-1 flex-grow w-full md:w-auto">
              <MapPin className="w-5 h-5 text-slateText-muted flex-shrink-0" />
              <input
                type="text"
                name="location"
                placeholder="City, state, or 'Remote'..."
                className="w-full bg-transparent text-slateText-primary font-semibold text-sm outline-none placeholder:text-slateText-muted"
              />
            </div>

            <button
              type="submit"
              className="w-full md:w-auto bg-accent-green hover:bg-accent-greenHover text-white font-bold px-6 py-3 rounded-md transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </form>

          {/* Popular Searches */}
          <div className="flex flex-wrap justify-center items-center gap-2 mt-5 text-xs text-white/60">
            <span className="font-semibold">Popular Searches:</span>
            {['React', 'Next.js', 'Remote', 'Product Designer', 'Growth SEO'].map((term) => (
              <Link 
                key={term}
                href={`/jobs?keyword=${term}`} 
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-2.5 py-1 rounded transition-colors"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top AdSense Slot */}
      <div className="max-w-7xl mx-auto px-4 w-full">
        <AdSenseContainer placementName="homepage_top" adCode={adTopCode} className="max-w-4xl" />
      </div>

      {/* 2. POPULAR CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between border-b border-grayBorder pb-4 mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slateText-primary">Popular Categories</h2>
            <p className="text-xs text-slateText-muted mt-1">Explore job openings categorized dynamically by our AI normalizer.</p>
          </div>
          <Link href="/jobs" className="text-xs font-bold text-accent-green hover:underline">
            View All Categories
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={`/jobs?category=${cat.name}`}
                className="bg-white border border-grayBorder rounded-lg p-5 flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-accent-green/30"
              >
                <div className="w-10 h-10 rounded-full bg-accent-green/10 flex items-center justify-center text-accent-green mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slateText-primary">{cat.name}</h3>
                <span className="text-[10px] text-slateText-muted font-bold mt-1 uppercase tracking-wide">
                  {cat.count}+ Jobs
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED JOBS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between border-b border-grayBorder pb-4 mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slateText-primary">Latest Job Listings</h2>
            <p className="text-xs text-slateText-muted mt-1">Direct employer postings and active crawls imported today.</p>
          </div>
          <Link href="/jobs" className="text-xs font-bold text-accent-green hover:underline">
            Browse All Jobs
          </Link>
        </div>

        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job: any) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-grayBorder rounded-lg p-8 text-center text-slateText-muted text-sm font-semibold">
            We are currently loading fresh job opportunities. Please check back shortly, or subscribe to our newsletter below to receive weekly job alerts!
          </div>
        )}
      </section>

      {/* Middle AdSense Slot */}
      <div className="max-w-7xl mx-auto px-4 w-full">
        <AdSenseContainer placementName="homepage_middle" adCode={adMiddleCode} className="max-w-4xl" />
      </div>

      {/* 4. FEATURED COMPANIES */}
      {companies.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-end justify-between border-b border-grayBorder pb-4 mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-slateText-primary">Featured Employers</h2>
              <p className="text-xs text-slateText-muted mt-1">Get inside access to hiring processes, reviews, and active careers.</p>
            </div>
            <Link href="/jobs" className="text-xs font-bold text-accent-green hover:underline">
              View All Companies
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((comp) => (
              <Link
                key={comp.name}
                href={`/companies/${comp.slug}`}
                className="bg-white border border-grayBorder rounded-lg p-5 flex items-start gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-accent-green/30"
              >
                <CompanyLogo logo={comp.logo} name={comp.name} className="w-12 h-12" textClassName="text-lg font-extrabold" />
                <div>
                  <h3 className="font-bold text-slateText-primary text-sm hover:text-accent-green">{comp.name}</h3>
                  <p className="text-xs text-slateText-muted mt-0.5">{comp.location}</p>
                  <div className="flex items-center gap-4 mt-2 text-[10px] font-bold text-slateText-muted uppercase tracking-wider">
                    <span>Size: {comp.size}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. NEWSLETTER BANNER (EMERALD) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-accent-green text-white rounded-lg p-8 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(26,67,50,0.15),transparent)] pointer-events-none" />
          
          <div className="max-w-md">
            <h2 className="text-2xl font-extrabold tracking-tight">Stay ahead of the crowd</h2>
            <p className="text-sm text-white/80 mt-2">
              Subscribe to daily alert newsletters containing fresh software engineering, design, and remote marketing positions.
            </p>
          </div>
          
          <NewsletterForm />
        </div>
      </section>

    </div>
  );
}
