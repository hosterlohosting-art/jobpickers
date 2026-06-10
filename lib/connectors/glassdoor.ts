import { JobSource } from '@prisma/client';
import { JobSourceConnector, RawJob, NormalizedJob, ValidationResult, generateJobSlug } from './connector';

export class GlassdoorConnector implements JobSourceConnector {
  name = 'Glassdoor API';

  async fetchJobs(source: JobSource): Promise<RawJob[]> {
    console.log(`[GlassdoorConnector] Initiating fetch for source: ${source.name}`);
    
    const hasCredentials = process.env.GLASSDOOR_API_KEY && process.env.GLASSDOOR_PARTNER_ID;
    if (!hasCredentials) {
      console.warn(`[GlassdoorConnector] WARNING: Skipping fetch. Missing GLASSDOOR_API_KEY or GLASSDOOR_PARTNER_ID in environment secrets.`);
      return [];
    }

    // In a real API integration, we would perform request signatures:
    // const response = await fetch(`${source.apiBaseUrl}/jobs?v=1&format=json&t.p=${process.env.GLASSDOOR_PARTNER_ID}&t.k=${process.env.GLASSDOOR_API_KEY}&action=jobs&q=software`, { ... });
    
    console.log(`[GlassdoorConnector] Credentials detected. Performing API payload parsing (Mocked output)...`);
    return [
      {
        id: 'gd-003',
        title: 'Senior Product Designer',
        company: 'Vercel',
        location: 'Remote, US',
        description: 'Mocked Glassdoor API job listing. Responsible for dashboard iterations, layout grid designs, and user testing reviews.',
        applyUrl: 'https://vercel.com/careers/gd-003',
        salaryMin: 120000,
        salaryMax: 165000,
        type: 'full-time'
      }
    ];
  }

  async normalizeJob(rawJob: RawJob, source: JobSource): Promise<NormalizedJob> {
    const slug = generateJobSlug(rawJob.title || 'Glassdoor Job', rawJob.company || 'Unknown');
    const defaultExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return {
      title: rawJob.title || 'Glassdoor Job Listing',
      slug,
      companyName: rawJob.company || 'Vercel',
      description: `<p>${rawJob.description || 'Visit original source to view full details.'}</p>`,
      salaryMin: rawJob.salaryMin,
      salaryMax: rawJob.salaryMax,
      salaryCurrency: 'USD',
      location: rawJob.location || 'Remote',
      remoteType: 'remote',
      employmentType: 'full-time',
      experienceLevel: 'senior',
      category: 'Design',
      skills: 'Figma, Visual Design, UX Research, Prototyping',
      sourceName: this.name,
      sourceJobId: rawJob.id,
      sourceUrl: rawJob.applyUrl,
      applyUrl: rawJob.applyUrl || 'https://glassdoor.com',
      postedAt: new Date(),
      expiresAt: defaultExpiry
    };
  }

  async validateJob(job: NormalizedJob): Promise<ValidationResult> {
    if (!job.title || !job.companyName || !job.applyUrl) {
      return { isValid: false, reason: 'Missing essential fields: title, company, or apply URL.' };
    }
    return { isValid: true };
  }
}
