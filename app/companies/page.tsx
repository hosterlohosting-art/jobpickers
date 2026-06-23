import { prisma } from '../../lib/prisma';
import Link from 'next/link';
import CompanyLogo from '../../components/company-logo';
import { Building2, Globe, Star, Users, Briefcase, ChevronRight, Search } from 'lucide-react';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Explore Top Tech Companies & Employee Reviews - JobPickers',
  description: 'Search and browse hiring partners on JobPickers. Read employee reviews, see active remote developer/marketing jobs, and compare company ratings.'
};

interface SearchParams {
  search?: string;
  industry?: string;
  size?: string;
}

export default async function CompanyDirectoryPage({ searchParams }: { searchParams: SearchParams }) {
  const { search, industry, size } = searchParams;

  // 1. Build DB filter clauses
  const whereClause: any = {};
  
  if (search && search.trim()) {
    whereClause.name = { contains: search.trim() };
  }
  
  if (industry && industry !== 'all') {
    whereClause.industry = industry;
  }

  if (size && size !== 'all') {
    whereClause.size = size;
  }

  // 2. Fetch companies matching criteria
  let companies: any[] = [];
  try {
    companies = await prisma.company.findMany({
      where: whereClause,
      include: {
        jobs: {
          where: { status: 'published' }
        },
        reviews: {
          select: { rating: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    console.error('[Company Directory] Failed to fetch companies list:', error);
  }

  // Get list of unique industries for filters dropdown
  const uniqueIndustries = [
    'Financial Technology',
    'Cloud Computing & Frontend Services',
    'Technology & Cloud Solutions',
    'E-Commerce Platforms'
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Page Title & Intro */}
      <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-6 mb-8 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slateText-primary flex items-center gap-2">
            <Building2 className="w-6 h-6 text-accent-green" />
            <span>Company Directory</span>
          </h1>
          <p className="text-xs text-slateText-muted mt-1">Research hiring partners, view verified employee ratings, and explore active job vacancies.</p>
        </div>
      </div>

      {/* Search & Filter Form (Server-rendered GET form) */}
      <form method="GET" action="/companies" className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-5 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-8">
        
        {/* Keyword Search */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-[10px] font-extrabold text-slateText-muted uppercase tracking-wider">Search Company Name</label>
          <div className="relative">
            <input
              type="text"
              name="search"
              defaultValue={search || ''}
              placeholder="e.g. Stripe, Google, Vercel..."
              className="w-full bg-grayBg/60 border border-grayBorder/40 rounded pl-8 pr-3 py-2 text-xs font-semibold outline-none focus:border-accent-green text-slateText-primary"
            />
            <Search className="w-3.5 h-3.5 text-slateText-muted absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Industry Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-extrabold text-slateText-muted uppercase tracking-wider">Industry</label>
          <select
            name="industry"
            defaultValue={industry || 'all'}
            className="bg-grayBg/60 border border-grayBorder/40 rounded px-3 py-2 text-xs font-semibold outline-none focus:border-accent-green text-slateText-secondary"
          >
            <option value="all">All Industries</option>
            {uniqueIndustries.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        {/* Submit Filter button */}
        <button
          type="submit"
          className="w-full bg-accent-green hover:bg-accent-greenHover text-white text-xs font-bold py-2.5 rounded transition-all shadow-sm flex items-center justify-center gap-1"
        >
          <span>Apply Filters</span>
        </button>
      </form>

      {/* Directory Grid Listing */}
      {companies.length === 0 ? (
        <div className="text-center py-16 bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg shadow-sm">
          <Building2 className="w-10 h-10 text-slateText-muted mx-auto mb-3" />
          <h3 className="text-sm font-extrabold text-slateText-primary">No companies matched your search</h3>
          <p className="text-xs text-slateText-muted mt-1 max-w-xs mx-auto">
            Try adjusting your spelling or changing your filters parameters.
          </p>
          <Link href="/companies" className="inline-block mt-4 text-xs font-bold text-accent-green hover:underline">
            Reset all filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => {
            // Calculate Rating
            const reviewsCount = company.reviews.length;
            const avgRating = reviewsCount > 0
              ? (company.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewsCount).toFixed(1)
              : 'N/A';

            return (
              <div 
                key={company.id} 
                className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 hover:border-accent-green/45 rounded-lg p-5 shadow-sm hover:shadow-lg hover:shadow-accent-green/5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Card Head */}
                  <div className="flex items-start justify-between gap-4">
                    <CompanyLogo logo={company.logo} name={company.name} className="w-12 h-12" textClassName="text-lg" />
                    
                    {/* Rating Badge */}
                    <div className="flex items-center gap-0.5 text-xs text-amber-500 font-extrabold bg-amber-500/10 px-2 py-0.5 rounded">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <span>{avgRating}</span>
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="mt-4">
                    <Link 
                      href={`/companies/${company.slug}`}
                      className="text-sm font-bold text-slateText-primary hover:text-accent-green transition-colors block"
                    >
                      {company.name}
                    </Link>
                    <span className="text-[10px] text-slateText-muted font-medium block mt-0.5">
                      {company.location || 'Remote-First'}
                    </span>
                  </div>

                  {/* Description Excerpt */}
                  <p className="text-xs text-slateText-secondary mt-3 line-clamp-2 leading-relaxed">
                    {company.description}
                  </p>
                </div>

                {/* Metadata tags & Footer */}
                <div className="mt-5 pt-4 border-t border-grayBorder/60 space-y-3">
                  <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-slateText-secondary">
                    {company.industry && (
                      <span className="bg-grayBg/60 px-2 py-0.5 rounded border border-grayBorder/40 max-w-[150px] truncate" title={company.industry}>
                        {company.industry}
                      </span>
                    )}
                    {company.size && (
                      <span className="bg-grayBg/60 px-2 py-0.5 rounded border border-grayBorder/40">
                        <Users className="w-2.5 h-2.5 inline mr-1 -mt-0.5 text-slateText-muted" />
                        {company.size}
                      </span>
                    )}
                  </div>

                  {/* Link action */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-accent-green bg-accent-green/10 px-2 py-0.5 rounded flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      <span>{company.jobs.length} Open Jobs</span>
                    </span>

                    <Link 
                      href={`/companies/${company.slug}`} 
                      className="text-[10px] font-bold text-slateText-secondary hover:text-accent-green flex items-center gap-0.5 transition-colors"
                    >
                      <span>Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
