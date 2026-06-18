'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, DollarSign, Bookmark, ArrowRight, Star } from 'lucide-react';
import { useState } from 'react';
import CompanyLogo from './company-logo';
import { getRelativeTime } from '../lib/utils';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    slug: string;
    location: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    remoteType: string;
    employmentType: string;
    category: string;
    sourceName: string;
    postedAt: string | Date;
    featured?: boolean;
    company: {
      name: string;
      logo?: string | null;
      slug: string;
    };
  };
  isSaved?: boolean;
  onSaveToggle?: (jobId: string) => void;
  onApplyClick?: (jobId: string) => void;
}

export default function JobCard({ job, isSaved = false, onSaveToggle, onApplyClick }: JobCardProps) {
  const [saved, setSaved] = useState(isSaved);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Optimistic UI update
    const previousSaved = saved;
    setSaved(!previousSaved);

    try {
      const res = await fetch('/api/jobs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id })
      });
      if (res.ok) {
        const data = await res.json();
        setSaved(data.saved);
        if (onSaveToggle) onSaveToggle(job.id);
      } else {
        setSaved(previousSaved);
      }
    } catch (err) {
      console.error('Failed to save bookmark:', err);
      setSaved(previousSaved);
    }
  };

  const getCompanyInitial = () => job.company.name.charAt(0).toUpperCase();

  // Glassdoor mock rating derived from company name hash for visual consistency
  const getMockRating = () => {
    let hash = 0;
    for (let i = 0; i < job.company.name.length; i++) {
      hash = job.company.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (3.5 + (Math.abs(hash) % 15) / 10).toFixed(1);
  };

  return (
    <div className={`bg-grayBg/50 backdrop-blur-sm border rounded-lg p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent-green/5 ${
      job.featured ? 'border-accent-green/60 bg-accent-green/[0.04] shadow-sm shadow-accent-green/5' : 'border-grayBorder/40 hover:border-accent-green/45'
    }`}>
      <div className="flex gap-4">
        
        {/* Left: Company Logo / Initials */}
        <Link href={`/companies/${job.company.slug}`} className="flex-shrink-0">
          <CompanyLogo logo={job.company.logo} name={job.company.name} className="w-12 h-12" textClassName="text-lg" />
        </Link>

        {/* Center: Details */}
        <div className="flex-grow min-w-0">
          <div className="flex items-start justify-between gap-4">
            
            {/* Title & Company Name */}
            <div>
              <Link href={`/jobs/${job.slug}`}>
                <h3 className="font-bold text-slateText-primary text-base hover:text-accent-green transition-colors hover:underline leading-tight truncate">
                  {job.title}
                </h3>
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <Link href={`/companies/${job.company.slug}`} className="text-sm font-semibold text-slateText-secondary hover:text-accent-green hover:underline">
                  {job.company.name}
                </Link>
                
                {/* Glassdoor Star rating */}
                <div className="flex items-center gap-0.5 text-xs text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                  <Star className="w-3 h-3 fill-amber-500" />
                  <span>{getMockRating()}</span>
                </div>
              </div>
            </div>

            {/* Bookmark button */}
            <button
              onClick={handleSave}
              className={`p-1.5 rounded-full border transition-colors ${
                saved 
                  ? 'border-accent-green/30 bg-accent-green/10 text-accent-green' 
                  : 'border-grayBorder/40 text-slateText-muted hover:text-slateText-primary hover:bg-grayBg/50'
              }`}
              aria-label={saved ? 'Unsave Job' : 'Save Job'}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-accent-green' : ''}`} />
            </button>
          </div>

          {/* Location & Tags row */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-semibold text-slateText-secondary mt-3">
            <span className="flex items-center gap-1.5 text-slateText-primary">
              <MapPin className="w-3.5 h-3.5 text-slateText-muted" />
              {job.location}
            </span>
            <span className="flex items-center gap-1 text-slateText-muted uppercase tracking-wider text-[10px]">
              {job.remoteType}
            </span>
            <span className="flex items-center gap-1 text-slateText-muted uppercase tracking-wider text-[10px]">
              {job.employmentType.replace('-', ' ')}
            </span>
            {job.salaryMin && job.salaryMin > 0 && (
              <span className="text-accent-green flex items-center font-bold">
                <DollarSign className="w-3.5 h-3.5" />
                {Math.round(job.salaryMin / 1000)}k - {Math.round((job.salaryMax || job.salaryMin) / 1000)}k
              </span>
            )}
          </div>

          {/* Card Footer: Timestamp & Apply redirect */}
          <div className="border-t border-grayBorder/40 mt-4 pt-3 flex items-center justify-between gap-4 text-xs text-slateText-muted">
            <span>
              Posted {getRelativeTime(job.postedAt)} &bull; Source: <span className="font-semibold text-slateText-secondary">{job.sourceName}</span>
            </span>
            <Link
              href={`/jobs/${job.slug}`}
              className="flex items-center gap-1 font-bold text-accent-green hover:text-accent-greenHover group transition-colors"
            >
              <span>View Job</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
