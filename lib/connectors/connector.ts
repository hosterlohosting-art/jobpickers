import { JobSource } from '@prisma/client';

export interface RawJob {
  id?: string;
  title?: string;
  company?: string;
  logo?: string;
  website?: string;
  location?: string;
  description?: string;
  applyUrl?: string;
  salaryMin?: number;
  salaryMax?: number;
  type?: string;
  postedAt?: string;
  rawPayload?: any;
}

export interface NormalizedJob {
  title: string;
  slug: string;
  companyName: string;
  companyLogo?: string;
  companyWebsite?: string;
  description: string;
  requirements?: string;
  benefits?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  location: string;
  remoteType: 'remote' | 'hybrid' | 'onsite';
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
  category: string;
  skills: string;
  sourceName: string;
  sourceJobId?: string;
  sourceUrl?: string;
  applyUrl: string;
  postedAt: Date;
  expiresAt: Date;
}

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
}

export interface JobSourceConnector {
  name: string;
  fetchJobs(source: JobSource): Promise<RawJob[]>;
  normalizeJob(rawJob: RawJob, source: JobSource): Promise<NormalizedJob>;
  validateJob(job: NormalizedJob): Promise<ValidationResult>;
}

// Global duplicate checker
export function generateJobSlug(title: string, company: string): string {
  const cleanStr = `${title}-${company}`
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-alpha
    .replace(/[\s_]+/g, '-')  // replace spaces with hyphens
    .replace(/^-+|-+$/g, ''); // trim hyphens
  return `${cleanStr}-${Date.now().toString().slice(-4)}`;
}
