'use client';

import { useState } from 'react';
import { 
  Building2, Star, MessageSquare, Briefcase, DollarSign, PlusCircle, 
  CheckCircle2, X, AlertCircle, Calendar, ShieldCheck, Heart, Globe, Users 
} from 'lucide-react';
import JobCard from '../../../components/job-card';
import CompanyLogo from '../../../components/company-logo';

interface CompanyClientProps {
  company: any;
  initialReviews: any[];
  jobs: any[];
  currentUser: any;
}

export default function CompanyClientDashboard({ company, initialReviews, jobs, currentUser }: CompanyClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'salaries' | 'careers'>('overview');
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form state
  const [form, setReviewForm] = useState({
    roleTitle: '',
    rating: 5,
    pros: '',
    cons: '',
    adviceToManagement: '',
    isCurrentEmployee: true
  });

  // 1. Calculate Average Rating & Distribution
  const reviewsCount = reviews.length;
  const avgRating = reviewsCount > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount).toFixed(1)
    : 'N/A';

  const ratingCounts = [0, 0, 0, 0, 0]; // index 0 = 1 star, index 4 = 5 star
  reviews.forEach(r => {
    const starIdx = Math.max(1, Math.min(5, r.rating)) - 1;
    ratingCounts[starIdx]++;
  });

  const ratingPercentages = ratingCounts.map(count => 
    reviewsCount > 0 ? Math.round((count / reviewsCount) * 100) : 0
  );

  const recommendPercent = reviewsCount > 0
    ? Math.round((reviews.filter(r => r.rating >= 4).length / reviewsCount) * 100)
    : 0;

  // 2. Compile Salaries Statistics
  const salaryJobs = jobs.filter(j => j.salaryMin || j.salaryMax);
  const salaryStatsByCategory = (() => {
    const categoriesMap: { [key: string]: { min: number[], max: number[] } } = {};
    
    salaryJobs.forEach(job => {
      const cat = job.category;
      if (!categoriesMap[cat]) {
        categoriesMap[cat] = { min: [], max: [] };
      }
      if (job.salaryMin) categoriesMap[cat].min.push(job.salaryMin);
      if (job.salaryMax) categoriesMap[cat].max.push(job.salaryMax);
    });

    return Object.keys(categoriesMap).map(cat => {
      const mins = categoriesMap[cat].min;
      const maxs = categoriesMap[cat].max;
      
      const avgMin = mins.reduce((a, b) => a + b, 0) / mins.length;
      const avgMax = maxs.reduce((a, b) => a + b, 0) / maxs.length;
      const avgMid = (avgMin + avgMax) / 2;

      return {
        category: cat,
        avgMin,
        avgMax,
        avgMid,
        count: mins.length
      };
    }).sort((a, b) => b.avgMid - a.avgMid);
  })();

  const handleOpenModal = () => {
    setErrorMsg('');
    setSuccessMsg(false);
    setShowReviewModal(true);
  };

  const handleStarClick = (rating: number) => {
    setReviewForm({ ...form, rating });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/companies/${company.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        setReviews([data.review, ...reviews]);
        setSuccessMsg(true);
        setReviewForm({
          roleTitle: '',
          rating: 5,
          pros: '',
          cons: '',
          adviceToManagement: '',
          isCurrentEmployee: true
        });
        setTimeout(() => {
          setShowReviewModal(false);
          setSuccessMsg(false);
        }, 1500);
      } else {
        setErrorMsg(data.error || 'Failed to submit review.');
      }
    } catch (err) {
      console.error('Submit review error:', err);
      setErrorMsg('Network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Hero Header Card */}
      <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-center gap-4">
            <CompanyLogo logo={company.logo} name={company.name} className="w-16 h-16" textClassName="text-2xl" />
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slateText-primary">{company.name}</h1>
              <p className="text-sm text-slateText-muted mt-0.5">{company.location || 'Remote-First'}</p>
              
              {/* Star Rating displays */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5 text-xs text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{avgRating}</span>
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
                className="w-full md:w-auto bg-accent-green hover:bg-accent-greenHover text-white text-xs font-bold px-4 py-2.5 rounded transition-all text-center shadow-sm"
              >
                Visit Website
              </a>
            )}
          </div>
        </div>

        {/* Tab Links Row */}
        <div className="flex border-t border-grayBorder/40 mt-6 pt-4 gap-6 text-sm font-bold text-slateText-muted overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 outline-none transition-all border-b-2 text-xs md:text-sm ${
              activeTab === 'overview' ? 'border-accent-green text-accent-green' : 'border-transparent hover:text-slateText-primary'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-2 outline-none transition-all border-b-2 text-xs md:text-sm flex items-center gap-1 ${
              activeTab === 'reviews' ? 'border-accent-green text-accent-green' : 'border-transparent hover:text-slateText-primary'
            }`}
          >
            Reviews <span className="text-[10px] bg-grayBg/90 border border-grayBorder/40 px-1.5 py-0.5 rounded text-slateText-secondary">{reviewsCount}</span>
          </button>
          <button
            onClick={() => setActiveTab('salaries')}
            className={`pb-2 outline-none transition-all border-b-2 text-xs md:text-sm flex items-center gap-1 ${
              activeTab === 'salaries' ? 'border-accent-green text-accent-green' : 'border-transparent hover:text-slateText-primary'
            }`}
          >
            Salaries <span className="text-[10px] bg-grayBg/90 border border-grayBorder/40 px-1.5 py-0.5 rounded text-slateText-secondary">{salaryJobs.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('careers')}
            className={`pb-2 outline-none transition-all border-b-2 text-xs md:text-sm flex items-center gap-1 ${
              activeTab === 'careers' ? 'border-accent-green text-accent-green' : 'border-transparent hover:text-slateText-primary'
            }`}
          >
            Careers <span className="text-[10px] bg-grayBg/90 border border-grayBorder/40 px-1.5 py-0.5 rounded text-slateText-secondary">{jobs.length}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Tab Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-6 shadow-sm">
                <h2 className="text-sm font-extrabold text-slateText-primary border-b border-grayBorder/40 pb-2.5 mb-4">
                  About {company.name}
                </h2>
                <p className="text-xs text-slateText-secondary leading-relaxed whitespace-pre-line">
                  {company.description}
                </p>
              </div>

              {/* Quick Summary stats card */}
              <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-6 shadow-sm">
                <h2 className="text-sm font-extrabold text-slateText-primary border-b border-grayBorder/40 pb-2.5 mb-4">
                  Employee Consensus Summary
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="flex flex-col items-center justify-center p-4 border border-grayBorder/40 rounded bg-grayBg/20">
                    <span className="text-3xl font-black text-slateText-primary">{avgRating}</span>
                    <div className="flex items-center gap-0.5 text-amber-500 mt-1">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} className={`w-3.5 h-3.5 ${star <= Math.round(Number(avgRating)) ? 'fill-amber-500 text-amber-500' : 'text-slateText-muted/40'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] text-slateText-muted mt-2 font-bold uppercase tracking-wider">Overall score</span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-4 border border-grayBorder/40 rounded bg-grayBg/20">
                    <span className="text-3xl font-black text-accent-green">{recommendPercent}%</span>
                    <span className="text-xs font-bold text-slateText-secondary mt-1">Recommend to a Friend</span>
                    <span className="text-[10px] text-slateText-muted mt-1 font-bold uppercase tracking-wider">Based on {reviewsCount} reviews</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. REVIEWS TAB */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              
              {/* Ratings Aggregation header */}
              <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div>
                    <h2 className="text-sm font-extrabold text-slateText-primary flex items-center gap-1.5">
                      <MessageSquare className="w-4.5 h-4.5 text-accent-green" />
                      <span>Employee Feedback Reports</span>
                    </h2>
                    <p className="text-[10px] text-slateText-muted mt-1">Real ratings submitted by anonymous staff members.</p>
                  </div>
                  <button
                    onClick={handleOpenModal}
                    className="w-full md:w-auto bg-accent-green hover:bg-accent-greenHover text-white text-xs font-bold px-4 py-2.5 rounded transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Write a Review</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mt-6 pt-6 border-t border-grayBorder/40">
                  {/* Rating Average */}
                  <div className="text-center md:border-r border-grayBorder/40 py-2">
                    <span className="text-4xl font-black text-slateText-primary block">{avgRating}</span>
                    <div className="flex justify-center items-center gap-0.5 text-amber-500 mt-1">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} className={`w-4 h-4 ${star <= Math.round(Number(avgRating)) ? 'fill-amber-500 text-amber-500' : 'text-slateText-muted/40'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] text-slateText-muted mt-2 block font-extrabold uppercase">Average Score</span>
                  </div>

                  {/* Rating Distribution bars (5 stars down to 1) */}
                  <div className="md:col-span-2 space-y-2 text-[10px] font-bold text-slateText-secondary">
                    {[5, 4, 3, 2, 1].map(stars => {
                      const pct = ratingPercentages[stars - 1];
                      const count = ratingCounts[stars - 1];
                      return (
                        <div key={stars} className="flex items-center gap-2">
                          <span className="w-10 text-right">{stars} Star</span>
                          <div className="flex-1 bg-grayBg/60 h-2.5 rounded overflow-hidden border border-grayBorder/40">
                            <div className="bg-accent-green h-full rounded transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-12 text-slateText-muted">{pct}% ({count})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-8 text-center text-slateText-muted shadow-sm">
                    <MessageSquare className="w-8 h-8 text-slateText-muted mx-auto mb-2" />
                    <h4 className="font-bold text-slateText-primary text-xs">No reviews submitted yet</h4>
                    <p className="text-[10px] text-slateText-muted mt-1">
                      Be the first to share your workspace experience at {company.name}!
                    </p>
                    <button 
                      onClick={handleOpenModal}
                      className="mt-4 px-4 py-2 border border-accent-green text-accent-green hover:bg-accent-green/5 text-xs font-bold rounded transition-colors"
                    >
                      Write First Review
                    </button>
                  </div>
                ) : (
                  reviews.map((rev) => {
                    const reviewDate = new Date(rev.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric'
                    });
                    
                    return (
                      <div key={rev.id} className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-5 shadow-sm space-y-4">
                        {/* Title & rating */}
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-xs text-slateText-muted font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                              <span>{rev.roleTitle}</span>
                              <span className="text-[10px] font-semibold text-slateText-secondary lowercase bg-grayBg/60 px-2 py-0.5 rounded">
                                {rev.isCurrentEmployee ? 'current employee' : 'former employee'}
                              </span>
                            </span>
                            <span className="text-[10px] text-slateText-muted font-medium block mt-1">
                              <Calendar className="w-3.5 h-3.5 inline mr-1 -mt-0.5" /> Posted on {reviewDate}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-0.5 text-xs text-amber-500 font-extrabold bg-amber-500/10 px-2 py-0.5 rounded">
                            <Star className="w-3 h-3 fill-amber-500" />
                            <span>{rev.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        {/* Pros */}
                        <div className="text-xs leading-relaxed space-y-1">
                          <span className="block font-extrabold text-accent-green">Pros:</span>
                          <p className="text-slateText-secondary">{rev.pros}</p>
                        </div>

                        {/* Cons */}
                        <div className="text-xs leading-relaxed space-y-1">
                          <span className="block font-extrabold text-red-500">Cons:</span>
                          <p className="text-slateText-secondary">{rev.cons}</p>
                        </div>

                        {/* Advice */}
                        {rev.adviceToManagement && (
                          <div className="text-xs leading-relaxed space-y-1 bg-grayBg/40 p-3 rounded border border-grayBorder/40">
                            <span className="block font-bold text-slateText-primary">Advice to Management:</span>
                            <p className="text-slateText-secondary italic">"{rev.adviceToManagement}"</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* 3. SALARIES TAB */}
          {activeTab === 'salaries' && (
            <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-sm font-extrabold text-slateText-primary flex items-center gap-1.5">
                  <DollarSign className="w-4.5 h-4.5 text-accent-green" />
                  <span>Salary Benchmarks (Estimated)</span>
                </h2>
                <p className="text-[10px] text-slateText-muted mt-1">Aggregated statistics calculated directly from active job postings at {company.name}.</p>
              </div>

              {salaryStatsByCategory.length === 0 ? (
                <div className="text-center py-12 bg-grayBg/20 border border-dashed border-grayBorder/40 rounded-lg text-slateText-muted">
                  <DollarSign className="w-8 h-8 text-slateText-muted mx-auto mb-2" />
                  <h4 className="font-bold text-slateText-primary text-xs">No salary statistics compiled</h4>
                  <p className="text-[10px] text-slateText-muted mt-1 max-w-sm mx-auto">
                    We haven't compiled enough active listings with salary ranges for {company.name} yet. Check back soon!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {salaryStatsByCategory.map(stat => {
                    const avg = stat.avgMid.toLocaleString(undefined, { maximumFractionDigits: 0 });
                    const min = stat.avgMin.toLocaleString(undefined, { maximumFractionDigits: 0 });
                    const max = stat.avgMax.toLocaleString(undefined, { maximumFractionDigits: 0 });
                    
                    return (
                      <div key={stat.category} className="space-y-2 border-b border-grayBorder/40 pb-5 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center text-xs font-bold text-slateText-primary">
                          <span>{stat.category} Roles</span>
                          <span className="text-accent-green font-extrabold text-sm">${avg}/yr</span>
                        </div>
                        <p className="text-[10px] text-slateText-muted">Based on {stat.count} active listing{stat.count > 1 ? 's' : ''}</p>
                        
                        {/* Range slider indicator */}
                        <div className="space-y-1.5 pt-1">
                           <div className="relative bg-grayBg/60 h-2.5 rounded border border-grayBorder/40 overflow-hidden flex justify-between items-center">
                            <div className="bg-accent-green/10 h-full absolute w-[60%] left-[20%]" />
                            <div className="bg-accent-green h-full w-2 absolute left-[50%] -ml-1 rounded" title="Average Midpoint" />
                          </div>
                          <div className="flex justify-between text-[9px] font-extrabold text-slateText-secondary">
                            <span>Min: ${min}</span>
                            <span>Max: ${max}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 4. CAREERS TAB */}
          {activeTab === 'careers' && (
            <div className="space-y-4">
              <h2 className="text-sm font-extrabold text-slateText-primary border-b border-grayBorder pb-2.5 flex items-center gap-1.5">
                <Briefcase className="w-4.5 h-4.5 text-accent-green" />
                <span>Open Positions ({jobs.length})</span>
              </h2>
              
              {jobs.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={{ ...job, company }} />
                  ))}
                </div>
              ) : (
                <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-8 text-center text-slateText-muted shadow-sm">
                  <Briefcase className="w-8 h-8 text-slateText-muted mx-auto mb-2" />
                  <h4 className="font-bold text-slateText-primary text-xs">No active vacancies</h4>
                  <p className="text-[10px] text-slateText-muted mt-1">
                    There are currently no active openings posted by {company.name}.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Info Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-grayBg/50 backdrop-blur-sm border border-grayBorder/40 rounded-lg p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-slateText-primary uppercase tracking-wider border-b border-grayBorder/40 pb-2 mb-3">
              Company Meta
            </h2>
            
            <div className="space-y-3 text-xs font-semibold text-slateText-secondary">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slateText-muted" />
                <span>Industry: {company.industry || 'Not specified'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slateText-muted" />
                {company.website ? (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-accent-green truncate max-w-[200px]">
                    {company.website.replace('https://', '').replace('http://', '')}
                  </a>
                ) : (
                  <span>Website: Not specified</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slateText-muted" />
                <span>Employees: {company.size || 'Not specified'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WRITE A REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slateText-primary/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-grayBg/90 border border-grayBorder/40 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative">
            
            {/* Close Button */}
            <button
              onClick={() => setShowReviewModal(false)}
              className="p-1 hover:bg-grayBg rounded-full absolute right-4 top-4 text-slateText-muted hover:text-slateText-primary transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-extrabold text-slateText-primary flex items-center gap-1 border-b border-grayBorder pb-3 mb-5">
              <PlusCircle className="w-4.5 h-4.5 text-accent-green" />
              <span>Submit Employee Review for {company.name}</span>
            </h3>

            {successMsg ? (
              <div className="py-12 text-center bg-accent-green/10 border border-accent-green/20 rounded-lg text-accent-green flex flex-col items-center justify-center">
                <CheckCircle2 className="w-10 h-10 mb-3 animate-pulse" />
                <h4 className="font-extrabold text-sm">Review Saved Successfully!</h4>
                <p className="text-[10px] text-slateText-secondary mt-1">Thank you for your valuable workplace feedback.</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                
                {errorMsg && (
                  <div className="bg-red-950/20 border border-red-500/20 text-red-400 p-3 rounded text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* 1. Job Title / Role */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slateText-secondary">Your Job Title/Role</label>
                  <input
                    type="text" required
                    value={form.roleTitle}
                    onChange={(e) => setReviewForm({ ...form, roleTitle: e.target.value })}
                    placeholder="e.g. Software Engineer, Product Designer"
                    className="bg-grayBg/60 border border-grayBorder/40 rounded px-3 py-2 text-xs font-semibold outline-none focus:border-accent-green text-slateText-primary"
                  />
                </div>

                {/* 2. Star Rating (Interactive selector) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slateText-secondary">Star Rating (1 - 5)</label>
                  <div className="flex items-center gap-1 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarClick(star)}
                        className="p-1 hover:scale-110 transition-transform outline-none"
                      >
                        <Star 
                          className={`w-6 h-6 ${
                            star <= form.rating 
                              ? 'fill-amber-500 text-amber-500' 
                              : 'text-slateText-muted/40'
                          }`} 
                        />
                      </button>
                    ))}
                    <span className="text-[10px] text-slateText-muted font-extrabold ml-2">
                      {form.rating} out of 5 stars
                    </span>
                  </div>
                </div>

                {/* 3. Employee status */}
                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slateText-secondary">
                    <input
                      type="checkbox"
                      checked={form.isCurrentEmployee}
                      onChange={(e) => setReviewForm({ ...form, isCurrentEmployee: e.target.checked })}
                      className="accent-accent-green"
                    />
                    <span>I am a current employee</span>
                  </label>
                </div>

                {/* 4. Pros */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slateText-secondary">Pros (Min 10 characters)</label>
                  <textarea
                    rows={3} required
                    value={form.pros}
                    onChange={(e) => setReviewForm({ ...form, pros: e.target.value })}
                    placeholder="What do you love about working here? Great culture, tools, mentorship?"
                    className="bg-grayBg/60 border border-grayBorder/40 rounded p-3 text-xs outline-none focus:border-accent-green text-slateText-primary font-sans"
                  />
                </div>

                {/* 5. Cons */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slateText-secondary">Cons (Min 10 characters)</label>
                  <textarea
                    rows={3} required
                    value={form.cons}
                    onChange={(e) => setReviewForm({ ...form, cons: e.target.value })}
                    placeholder="What are the drawbacks? Bureaucracy, timezones, lack of upward mobility?"
                    className="bg-grayBg/60 border border-grayBorder/40 rounded p-3 text-xs outline-none focus:border-accent-green text-slateText-primary font-sans"
                  />
                </div>

                {/* 6. Advice to management */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slateText-secondary">Advice to Management (Optional)</label>
                  <textarea
                    rows={2}
                    value={form.adviceToManagement}
                    onChange={(e) => setReviewForm({ ...form, adviceToManagement: e.target.value })}
                    placeholder="Any suggestions or requests for leaders at the company?"
                    className="bg-grayBg/60 border border-grayBorder/40 rounded p-3 text-xs outline-none focus:border-accent-green text-slateText-primary font-sans"
                  />
                </div>

                {/* Footer buttons */}
                <div className="flex gap-3 pt-3 border-t border-grayBorder/40">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2.5 border border-grayBorder/40 text-slateText-secondary font-bold rounded hover:bg-grayBg/80 text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-accent-green hover:bg-accent-greenHover text-white font-bold py-2.5 rounded transition-all text-xs shadow-sm flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <span>{submitting ? 'Submitting...' : 'Post Employee Review'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
