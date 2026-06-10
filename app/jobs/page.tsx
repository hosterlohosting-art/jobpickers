import { prisma } from '../../lib/prisma';
import JobCard from '../../components/job-card';
import AdSenseContainer from '../../components/adsense';
import Link from 'next/link';
import { Sliders, RefreshCw, AlertCircle } from 'lucide-react';

interface JobsPageProps {
  searchParams: {
    keyword?: string;
    location?: string;
    category?: string;
    remoteType?: string;
    employmentType?: string;
    minSalary?: string;
    sort?: string;
    datePosted?: string;
    page?: string;
  };
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const keyword = searchParams.keyword || '';
  const location = searchParams.location || '';
  const category = searchParams.category || '';
  const remoteType = searchParams.remoteType || '';
  const employmentType = searchParams.employmentType || '';
  const minSalary = searchParams.minSalary ? parseInt(searchParams.minSalary) : 0;
  const sort = searchParams.sort || 'newest';
  const datePosted = searchParams.datePosted || '';
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;

  const limit = 10;
  const skip = (page - 1) * limit;

  // Build Prisma query clauses
  const whereClause: any = {
    status: 'published'
  };

  // Keyword query matching titles, companies, description
  if (keyword) {
    whereClause.OR = [
      { title: { contains: keyword } },
      { company: { name: { contains: keyword } } },
      { description: { contains: keyword } },
      { skills: { contains: keyword } }
    ];
  }

  // Location query
  if (location) {
    if (location.toLowerCase() === 'remote') {
      whereClause.remoteType = 'remote';
    } else {
      whereClause.location = { contains: location };
    }
  }

  // Category query
  if (category) {
    whereClause.category = category;
  }

  // Remote type filters
  if (remoteType) {
    whereClause.remoteType = remoteType;
  }

  // Employment type filters
  if (employmentType) {
    whereClause.employmentType = employmentType;
  }

  // Salary query
  if (minSalary > 0) {
    whereClause.salaryMin = { gte: minSalary };
  }

  // Date posted logic
  if (datePosted) {
    const dateLimit = new Date();
    if (datePosted === '24h') {
      dateLimit.setHours(dateLimit.getHours() - 24);
    } else if (datePosted === '3d') {
      dateLimit.setDate(dateLimit.getDate() - 3);
    } else if (datePosted === '7d') {
      dateLimit.setDate(dateLimit.getDate() - 7);
    } else if (datePosted === '30d') {
      dateLimit.setDate(dateLimit.getDate() - 30);
    }
    whereClause.postedAt = { gte: dateLimit };
  }

  // Sorting
  let orderByClause: any = { postedAt: 'desc' };
  if (sort === 'salary-desc') {
    orderByClause = { salaryMax: 'desc' };
  } else if (sort === 'company') {
    orderByClause = { company: { name: 'asc' } };
  } else if (sort === 'relevance' && keyword) {
    orderByClause = { postedAt: 'desc' };
  }

  let jobs: any[] = [];
  let totalJobs = 0;

  let adSidebarCode = '';
  try {
    totalJobs = await prisma.job.count({ where: whereClause });
    jobs = await prisma.job.findMany({
      where: whereClause,
      orderBy: orderByClause,
      skip,
      take: limit,
      include: {
        company: {
          select: { name: true, logo: true, slug: true }
        }
      }
    });

    const adSidebar = await prisma.adPlacement.findUnique({ where: { name: 'job_sidebar' } });
    if (adSidebar && adSidebar.isActive) adSidebarCode = adSidebar.adCode;
  } catch (error) {
    console.error('Error fetching jobs feed:', error);
  }

  const totalPages = Math.ceil(totalJobs / limit);

  const getPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (location) params.set('location', location);
    if (category) params.set('category', category);
    if (remoteType) params.set('remoteType', remoteType);
    if (employmentType) params.set('employmentType', employmentType);
    if (minSalary) params.set('minSalary', minSalary.toString());
    if (sort) params.set('sort', sort);
    if (datePosted) params.set('datePosted', datePosted);
    params.set('page', targetPage.toString());
    return `/jobs?${params.toString()}`;
  };

  const categoriesList = ['Software', 'Marketing', 'Finance', 'Sales', 'Customer Support', 'Design', 'Data', 'HR'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Search bar wrapper */}
      <div className="bg-white border border-grayBorder rounded-lg p-4 shadow-sm mb-6">
        <form action="/jobs" method="GET" className="flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full md:flex-grow">
            <label className="block text-xs font-bold text-slateText-muted uppercase tracking-wider mb-1.5">What</label>
            <input
              type="text"
              name="keyword"
              placeholder="Job title, key terms, company..."
              defaultValue={keyword}
              className="w-full bg-grayBg border border-grayBorder rounded px-3 py-2 text-sm font-semibold outline-none focus:border-accent-green"
            />
          </div>
          <div className="w-full md:flex-grow">
            <label className="block text-xs font-bold text-slateText-muted uppercase tracking-wider mb-1.5">Where</label>
            <input
              type="text"
              name="location"
              placeholder="City, country, or 'Remote'..."
              defaultValue={location}
              className="w-full bg-grayBg border border-grayBorder rounded px-3 py-2 text-sm font-semibold outline-none focus:border-accent-green"
            />
          </div>
          <button
            type="submit"
            className="w-full md:w-auto bg-accent-green hover:bg-accent-greenHover text-white font-bold px-6 py-2.5 rounded md:self-end text-sm transition-colors shadow-sm"
          >
            Search
          </button>
        </form>
      </div>

      {/* Grid split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters Column (Details tag for Mobile collapsible toggle) */}
        <aside className="lg:col-span-1 h-fit lg:sticky lg:top-20">
          <details className="bg-white border border-grayBorder rounded-lg p-4 lg:p-5 w-full group" open>
            <summary className="lg:hidden list-none cursor-pointer flex items-center justify-between font-extrabold text-sm text-slateText-primary select-none">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-accent-green" />
                <span>Filters & Options</span>
              </span>
              <span className="text-[10px] text-accent-green font-bold uppercase tracking-wider border border-accent-green/20 px-2 py-0.5 rounded bg-accent-green/5">
                Toggle
              </span>
            </summary>

            <div className="mt-4 lg:mt-0 space-y-5">
              <div className="flex justify-between items-center border-b border-grayBorder pb-3 hidden lg:flex">
                <h2 className="font-extrabold text-sm text-slateText-primary flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-accent-green" />
                  <span>Job Filters</span>
                </h2>
                <Link href="/jobs" className="text-xs font-bold text-accent-green hover:underline flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Clear
                </Link>
              </div>

              <form action="/jobs" method="GET" className="space-y-5">
                {/* Preserve search keywords */}
                <input type="hidden" name="keyword" value={keyword} />
                <input type="hidden" name="location" value={location} />

                {/* Category Select */}
                <div>
                  <label className="block text-xs font-bold text-slateText-secondary uppercase mb-2">Category</label>
                  <select
                    name="category"
                    defaultValue={category}
                    className="w-full bg-grayBg border border-grayBorder rounded p-2 text-xs font-semibold outline-none focus:border-accent-green"
                  >
                    <option value="">All Categories</option>
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Remote policy */}
                <div>
                  <label className="block text-xs font-bold text-slateText-secondary uppercase mb-2">Workplace Policy</label>
                  <select
                    name="remoteType"
                    defaultValue={remoteType}
                    className="w-full bg-grayBg border border-grayBorder rounded p-2 text-xs font-semibold outline-none focus:border-accent-green"
                  >
                    <option value="">All Policies</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-Site</option>
                  </select>
                </div>

                {/* Contract type */}
                <div>
                  <label className="block text-xs font-bold text-slateText-secondary uppercase mb-2">Employment Type</label>
                  <select
                    name="employmentType"
                    defaultValue={employmentType}
                    className="w-full bg-grayBg border border-grayBorder rounded p-2 text-xs font-semibold outline-none focus:border-accent-green"
                  >
                    <option value="">All Types</option>
                    <option value="full-time">Full-Time</option>
                    <option value="part-time">Part-Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Ignition / Internship</option>
                  </select>
                </div>

                {/* Date Posted */}
                <div>
                  <label className="block text-xs font-bold text-slateText-secondary uppercase mb-2">Date Posted</label>
                  <select
                    name="datePosted"
                    defaultValue={datePosted}
                    className="w-full bg-grayBg border border-grayBorder rounded p-2 text-xs font-semibold outline-none focus:border-accent-green"
                  >
                    <option value="">Anytime</option>
                    <option value="24h">Past 24 Hours</option>
                    <option value="3d">Past 3 Days</option>
                    <option value="7d">Past Week</option>
                    <option value="30d">Past Month</option>
                  </select>
                </div>

                {/* Salary slider range */}
                <div>
                  <label className="block text-xs font-bold text-slateText-secondary uppercase mb-1">Min Annual Salary (USD)</label>
                  <input
                    type="range"
                    name="minSalary"
                    min="0"
                    max="200000"
                    step="10000"
                    defaultValue={minSalary}
                    className="w-full accent-accent-green"
                  />
                  <div className="flex justify-between text-[10px] text-slateText-muted font-bold mt-1.5 uppercase">
                    <span>Any</span>
                    <span>$200k+</span>
                  </div>
                </div>

                {/* Sort options */}
                <div>
                  <label className="block text-xs font-bold text-slateText-secondary uppercase mb-2">Sort By</label>
                  <select
                    name="sort"
                    defaultValue={sort}
                    className="w-full bg-grayBg border border-grayBorder rounded p-2 text-xs font-semibold outline-none focus:border-accent-green"
                  >
                    <option value="newest">Newest First</option>
                    <option value="salary-desc">Highest Salary</option>
                    {keyword && <option value="relevance">Relevance</option>}
                    <option value="company">Company Name</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-accent-green hover:bg-accent-greenHover text-white font-bold py-2 rounded text-xs transition-colors shadow-sm"
                >
                  Apply Filters
                </button>
              </form>
            </div>
          </details>

          {/* AdSense Sidebar Slot */}
          <AdSenseContainer placementName="job_sidebar" adCode={adSidebarCode} className="mt-6 hidden lg:block" />
        </aside>

        {/* Listings column */}
        <main className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-grayBorder pb-3">
            <h1 className="text-lg font-extrabold text-slateText-primary">
              Search Results ({totalJobs})
            </h1>
            <span className="text-xs text-slateText-muted font-bold">
              Showing page {page} of {totalPages || 1}
            </span>
          </div>

          {jobs.length > 0 ? (
            <div className="flex flex-col gap-3">
              {jobs.map((job: any) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-grayBorder rounded-lg p-12 text-center flex flex-col items-center justify-center shadow-sm">
              <AlertCircle className="w-10 h-10 text-slateText-muted/60 mb-3" />
              <h3 className="font-bold text-slateText-primary text-base">No Matching Jobs</h3>
              <p className="text-xs text-slateText-muted mt-1.5 max-w-sm">
                We couldn't find any job postings matching your keywords or filter parameters. Try clearing your filters or typing standard keyword queries.
              </p>
            </div>
          )}

          {/* Pagination Navigation Elements */}
          {totalPages > 1 && (
            <nav className="flex justify-between items-center border-t border-grayBorder pt-4 mt-6 text-xs font-bold text-slateText-secondary">
              <Link
                href={page > 1 ? getPageUrl(page - 1) : '#'}
                className={`px-4 py-2 border border-grayBorder rounded bg-white hover:bg-grayBg transition-colors ${
                  page <= 1 ? 'opacity-40 pointer-events-none' : ''
                }`}
              >
                &larr; Previous
              </Link>
              <span className="font-bold text-slateText-muted">
                Page {page} of {totalPages}
              </span>
              <Link
                href={page < totalPages ? getPageUrl(page + 1) : '#'}
                className={`px-4 py-2 border border-grayBorder rounded bg-white hover:bg-grayBg transition-colors ${
                  page >= totalPages ? 'opacity-40 pointer-events-none' : ''
                }`}
              >
                Next &rarr;
              </Link>
            </nav>
          )}
        </main>

      </div>
    </div>
  );
}
