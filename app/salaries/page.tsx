import { prisma } from '../../lib/prisma';
import Link from 'next/link';
import { Building2, Globe, Star, Users, Briefcase, Search, Sparkles, AlertCircle, Coins, ChevronRight, TrendingUp, UserCheck, MessageSquare } from 'lucide-react';
import CompanyLogo from '../../components/company-logo';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tech Salary Guide & Verified Employee Reviews - JobPickers',
  description: 'Explore average tech salary ranges by category (Software, Design, Marketing, HR, Finance) and read verified employee reviews for Stripe, Vercel, Google, and more.'
};

interface SalariesPageProps {
  searchParams: {
    search?: string;
  };
}

export default async function SalariesPage({ searchParams }: SalariesPageProps) {
  const search = searchParams.search || '';

  // 1. Fetch published jobs that have salary info
  let salaryJobs: any[] = [];
  let totalPublishedJobs = 0;
  try {
    totalPublishedJobs = await prisma.job.count({ where: { status: 'published' } });
    salaryJobs = await prisma.job.findMany({
      where: {
        status: 'published',
        salaryMin: { not: null }
      },
      select: {
        category: true,
        salaryMin: true,
        salaryMax: true
      }
    });
  } catch (error) {
    console.error('Error loading salary jobs:', error);
  }

  // 2. Compute category aggregates
  const categories = ['Software', 'Design', 'Marketing', 'Customer Support', 'Finance', 'Sales', 'Data', 'HR'];
  const salaryStats: Record<string, { min: number; max: number; avg: number; count: number }> = {};
  
  categories.forEach(cat => {
    salaryStats[cat] = { min: 0, max: 0, avg: 0, count: 0 };
  });

  let totalSalarySum = 0;
  let totalSalaryCount = 0;

  salaryJobs.forEach(job => {
    const min = job.salaryMin || 0;
    const max = job.salaryMax || min;
    const avg = (min + max) / 2;

    if (min > 0) {
      totalSalarySum += avg;
      totalSalaryCount++;

      const catStats = salaryStats[job.category];
      if (catStats) {
        catStats.count++;
        if (catStats.count === 1) {
          catStats.min = min;
          catStats.max = max;
          catStats.avg = avg;
        } else {
          catStats.min = Math.min(catStats.min, min);
          catStats.max = Math.max(catStats.max, max);
          catStats.avg = (catStats.avg * (catStats.count - 1) + avg) / catStats.count;
        }
      }
    }
  });

  const overallAvgSalary = totalSalaryCount > 0 ? Math.round(totalSalarySum / totalSalaryCount) : 0;

  // 3. Fetch reviews based on search
  const reviewWhere: any = {};
  if (search.trim()) {
    reviewWhere.OR = [
      { company: { name: { contains: search.trim() } } },
      { roleTitle: { contains: search.trim() } },
      { pros: { contains: search.trim() } },
      { cons: { contains: search.trim() } }
    ];
  }

  let reviews: any[] = [];
  let totalReviewCount = 0;
  try {
    totalReviewCount = await prisma.companyReview.count();
    reviews = await prisma.companyReview.findMany({
      where: reviewWhere,
      include: {
        company: {
          select: { name: true, logo: true, slug: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 12
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
  }

  // 4. Fetch top paying jobs
  let topPayingJobs: any[] = [];
  try {
    topPayingJobs = await prisma.job.findMany({
      where: {
        status: 'published',
        salaryMax: { not: null }
      },
      orderBy: { salaryMax: 'desc' },
      take: 3,
      include: {
        company: { select: { name: true, logo: true, slug: true } }
      }
    });
  } catch (error) {
    console.error('Error fetching top paying jobs:', error);
  }

  // 5. Fetch companies matching search (if searched)
  let searchedCompanies: any[] = [];
  if (search.trim()) {
    try {
      searchedCompanies = await prisma.company.findMany({
        where: {
          name: { contains: search.trim() }
        },
        include: {
          jobs: { where: { status: 'published' } },
          reviews: { select: { rating: true } }
        },
        take: 3
      });
    } catch (error) {
      console.error('Error fetching searched companies:', error);
    }
  }

  // 6. Find Top Rated Company dynamically
  let topCompany = { name: 'Stripe', rating: 4.8, slug: 'stripe' };
  try {
    const allCompaniesWithReviews = await prisma.company.findMany({
      include: { reviews: { select: { rating: true } } }
    });
    
    let bestAvg = 0;
    allCompaniesWithReviews.forEach(c => {
      if (c.reviews.length > 0) {
        const avg = c.reviews.reduce((sum, r) => sum + r.rating, 0) / c.reviews.length;
        if (avg > bestAvg) {
          bestAvg = avg;
          topCompany = { name: c.name, rating: parseFloat(avg.toFixed(1)), slug: c.slug };
        }
      }
    });
  } catch (error) {
    console.error('Error calculating top company:', error);
  }

  // Star renderer helper
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-3.5 h-3.5 ${
            i <= rating 
              ? 'text-amber-500 fill-amber-500' 
              : 'text-slateText-muted/30'
          }`} 
        />
      );
    }
    return stars;
  };

  // Min-Max salary percentage calculations for visual CSS bar chart
  const minLimit = 30000;
  const maxLimit = 250000;
  const rangeSpan = maxLimit - minLimit;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 1. Page Header & Search */}
      <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-6 md:p-8 shadow-sm mb-8">
        <div className="max-w-3xl">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slateText-primary leading-tight flex items-center gap-2">
            <Coins className="w-8 h-8 text-accent-green" />
            <span>Salaries & Verified Employee Reviews</span>
          </h1>
          <p className="text-xs md:text-sm text-slateText-secondary mt-2">
            Research dynamic salary ranges and explore honest pros and cons written by verified tech team members. 
            Make data-backed decisions about your next career step.
          </p>
          
          <form method="GET" action="/salaries" className="mt-6 flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative w-full">
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search reviews by company name, role, or keywords..."
                className="w-full bg-grayBg/60 border border-grayBorder/40 rounded pl-10 pr-3 py-3 text-xs font-semibold outline-none focus:border-accent-green text-slateText-primary"
              />
              <Search className="w-4 h-4 text-slateText-muted absolute left-3.5 top-3.5" />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto bg-accent-green hover:bg-accent-greenHover text-white text-xs font-bold px-6 py-3 rounded-md transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>Search Reviews</span>
            </button>
          </form>
        </div>
      </div>

      {/* 2. Portal Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 p-5 rounded-lg shadow-sm flex flex-col gap-1">
          <span className="text-[10px] text-slateText-muted font-bold uppercase tracking-wider">Salary Data Available</span>
          <span className="text-xl font-extrabold text-slateText-primary">{salaryJobs.length} listings</span>
          <span className="text-[10px] text-slateText-muted mt-1">From {totalPublishedJobs} active job posts</span>
        </div>
        <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 p-5 rounded-lg shadow-sm flex flex-col gap-1">
          <span className="text-[10px] text-slateText-muted font-bold uppercase tracking-wider">Average Annual Pay</span>
          <span className="text-xl font-extrabold text-accent-green">${(overallAvgSalary / 1000).toFixed(1)}k</span>
          <span className="text-[10px] text-slateText-muted mt-1">Cross-industry median range</span>
        </div>
        <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 p-5 rounded-lg shadow-sm flex flex-col gap-1">
          <span className="text-[10px] text-slateText-muted font-bold uppercase tracking-wider">Top Employer</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xl font-extrabold text-slateText-primary truncate max-w-[120px]">{topCompany.name}</span>
            <span className="text-xs bg-amber-500/10 text-amber-500 font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-500" />
              {topCompany.rating}
            </span>
          </div>
          <span className="text-[10px] text-slateText-muted mt-0.5">Based on employee reviews</span>
        </div>
        <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 p-5 rounded-lg shadow-sm flex flex-col gap-1">
          <span className="text-[10px] text-slateText-muted font-bold uppercase tracking-wider">Verified Reviews</span>
          <span className="text-xl font-extrabold text-slateText-primary">{totalReviewCount} reviews</span>
          <span className="text-[10px] text-slateText-muted mt-1">100% anonymous & validated</span>
        </div>
      </div>

      {/* 3. Main Split Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 cols): Salaries & Reviews list */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* A. Salaries Visualizer Cards */}
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slateText-primary uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-5 h-5 text-accent-green" />
              <span>Salary Distributions by Field</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map(cat => {
                const stats = salaryStats[cat];
                const hasData = stats && stats.count > 0;
                
                // Calculate percentage offsets for visual CSS bar chart
                const minPct = hasData ? Math.max(0, Math.min(100, ((stats.min - minLimit) / rangeSpan) * 100)) : 0;
                const maxPct = hasData ? Math.max(0, Math.min(100, ((stats.max - minLimit) / rangeSpan) * 100)) : 0;
                const avgPct = hasData ? Math.max(0, Math.min(100, ((stats.avg - minLimit) / rangeSpan) * 100)) : 0;

                return (
                  <div key={cat} className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 p-5 rounded-lg shadow-sm flex flex-col justify-between hover:border-accent-green/45 hover:shadow-lg hover:shadow-accent-green/5 transition-all duration-300">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-extrabold text-sm text-slateText-primary">{cat}</span>
                        <span className="text-[10px] text-slateText-muted font-semibold bg-grayBg border border-grayBorder px-2 py-0.5 rounded">
                          {hasData ? `${stats.count} samples` : '0 samples'}
                        </span>
                      </div>
                      
                      {hasData ? (
                        <div className="mt-4">
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs text-slateText-muted font-semibold">Average Pay</span>
                            <span className="text-base font-extrabold text-accent-green">
                              ${Math.round(stats.avg / 1000)}k <span className="text-[10px] text-slateText-muted font-normal">/ year</span>
                            </span>
                          </div>
                          
                          {/* CSS Bar Chart range slider visualization */}
                          <div className="relative mt-5 mb-2 h-4 flex items-center">
                            {/* Background bar line */}
                            <div className="absolute left-0 right-0 h-1.5 bg-grayBg border border-grayBorder/40 rounded-full" />
                            {/* Min-Max green range fill */}
                            <div 
                              className="absolute h-1.5 bg-accent-green/60 shadow shadow-accent-green/20 rounded-full"
                              style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
                            />
                            {/* Average Salary Marker circle */}
                            <div 
                              className="absolute w-3.5 h-3.5 bg-white border-2 border-accent-green rounded-full shadow-md shadow-accent-green/30 -mt-1 transform -translate-x-1/2 cursor-pointer"
                              style={{ left: `${avgPct}%` }}
                              title={`Average: $${Math.round(stats.avg).toLocaleString()}`}
                            />
                          </div>

                          <div className="flex justify-between text-[10px] text-slateText-muted font-extrabold mt-1">
                            <span>Min: ${Math.round(stats.min / 1000)}k</span>
                            <span>Max: ${Math.round(stats.max / 1000)}k</span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 text-center text-xs text-slateText-muted font-medium italic">
                          Salary data pending collection.
                        </div>
                      )}
                    </div>

                    <div className="border-t border-grayBorder/50 mt-4 pt-3 flex justify-end">
                      <Link 
                        href={`/jobs?category=${cat}`} 
                        className="text-[10px] font-bold text-accent-green hover:underline flex items-center gap-0.5"
                      >
                        <span>Explore jobs</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* B. Verified Reviews Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slateText-primary uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-5 h-5 text-accent-green" />
                <span>Verified Employee Feedbacks</span>
              </h2>
              {search && (
                <Link href="/salaries" className="text-xs text-accent-green font-bold hover:underline">
                  Clear search filters
                </Link>
              )}
            </div>

            {reviews.length === 0 ? (
              <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 p-8 rounded-lg shadow-sm text-center">
                <AlertCircle className="w-10 h-10 text-slateText-muted mx-auto mb-3" />
                <h3 className="text-sm font-extrabold text-slateText-primary">No employee reviews found</h3>
                <p className="text-xs text-slateText-muted mt-1.5 max-w-xs mx-auto">
                  We couldn't locate any ratings matching "{search}". Try searching for another company.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {reviews.map(review => (
                  <div key={review.id} className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-5 shadow-sm space-y-4">
                    
                    {/* Header: Company, rating, role */}
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                      <div className="flex gap-3 items-center">
                        <CompanyLogo logo={review.company.logo} name={review.company.name} className="w-10 h-10" textClassName="text-sm" />
                        <div>
                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/companies/${review.company.slug}`}
                              className="text-sm font-bold text-slateText-primary hover:text-accent-green hover:underline"
                            >
                              {review.company.name}
                            </Link>
                            <span className="text-[10px] text-accent-green bg-accent-green/10 border border-accent-green/20 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <UserCheck className="w-2.5 h-2.5" />
                              Verified
                            </span>
                          </div>
                          <span className="text-xs text-slateText-secondary font-medium">
                            {review.roleTitle} &bull; {review.isCurrentEmployee ? 'Current Employee' : 'Former Employee'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-0.5">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-[10px] text-slateText-muted font-medium">
                          {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Review text blocks */}
                    <div className="space-y-2.5 text-xs text-slateText-secondary pt-3 border-t border-grayBorder/40">
                      <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-md p-3">
                        <span className="font-extrabold text-[10px] text-emerald-400 uppercase tracking-wide block mb-1">Pros</span>
                        <p className="leading-relaxed font-medium">{review.pros}</p>
                      </div>

                      <div className="bg-rose-950/20 border border-rose-500/20 rounded-md p-3">
                        <span className="font-extrabold text-[10px] text-rose-400 uppercase tracking-wide block mb-1">Cons</span>
                        <p className="leading-relaxed font-medium">{review.cons}</p>
                      </div>
                      
                      {review.adviceToManagement && (
                        <div className="bg-grayBg/60 border border-grayBorder/40 p-3 rounded-md italic">
                          <span className="font-bold text-[10px] text-slateText-primary not-italic block mb-0.5">Advice to Management:</span>
                          "{review.adviceToManagement}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): High-paying jobs & Company filters list */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* C. Searched Companies (only shows if search parameter active) */}
          {search.trim() && searchedCompanies.length > 0 && (
            <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slateText-primary uppercase tracking-wider border-b border-grayBorder/40 pb-2 flex items-center gap-1">
                <Building2 className="w-4 h-4 text-accent-green" />
                <span>Hiring Companies</span>
              </h3>
              
              <div className="flex flex-col gap-3.5">
                {searchedCompanies.map(comp => {
                  const ratingAvg = comp.reviews.length > 0
                    ? (comp.reviews.reduce((s: number, r: any) => s + r.rating, 0) / comp.reviews.length).toFixed(1)
                    : 'N/A';

                  return (
                    <div key={comp.id} className="flex justify-between items-center gap-2">
                      <div className="flex gap-2.5 items-center">
                        <CompanyLogo logo={comp.logo} name={comp.name} className="w-8 h-8" textClassName="text-xs" />
                        <div>
                          <Link 
                            href={`/companies/${comp.slug}`}
                            className="font-bold text-xs text-slateText-primary hover:text-accent-green hover:underline block"
                          >
                            {comp.name}
                          </Link>
                          <span className="text-[10px] text-slateText-muted font-medium flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            {ratingAvg} ({comp.reviews.length} reviews)
                          </span>
                        </div>
                      </div>
                      
                      <Link 
                        href={`/companies/${comp.slug}`}
                        className="text-[10px] font-bold bg-accent-green/10 text-accent-green px-2 py-1 rounded hover:bg-accent-green/20 transition-colors"
                      >
                        {comp.jobs.length} jobs
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* D. High-Paying Job listings */}
          <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slateText-primary uppercase tracking-wider border-b border-grayBorder/40 pb-2 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-accent-green" />
              <span>High-Paying Opportunities</span>
            </h3>

            {topPayingJobs.length === 0 ? (
              <p className="text-xs text-slateText-muted italic">No high-paying job listings found.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {topPayingJobs.map(job => (
                  <div key={job.id} className="flex gap-3 items-start border-b border-grayBorder/40 pb-3 last:border-b-0 last:pb-0">
                    <CompanyLogo logo={job.company.logo} name={job.company.name} className="w-9 h-9 mt-0.5" textClassName="text-xs" />
                    <div className="flex-grow min-w-0">
                      <Link 
                        href={`/jobs/${job.slug}`}
                        className="text-xs font-bold text-slateText-primary hover:text-accent-green hover:underline truncate block"
                      >
                        {job.title}
                      </Link>
                      <span className="text-[10px] text-slateText-secondary font-medium block">
                        {job.company.name}
                      </span>
                      <div className="flex justify-between items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-accent-green font-extrabold bg-accent-green/10 px-2 py-0.5 rounded">
                          Up to ${Math.round(job.salaryMax / 1000)}k
                        </span>
                        <Link 
                          href={`/jobs/${job.slug}`}
                          className="text-[10px] font-bold text-slateText-muted hover:text-accent-green flex items-center gap-0.5"
                        >
                          <span>Apply</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
