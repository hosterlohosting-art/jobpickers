import { JobSource } from '@prisma/client';
import { JobSourceConnector, RawJob, NormalizedJob, ValidationResult, generateJobSlug } from './connector';

export class LinkedInConnector implements JobSourceConnector {
  name = 'LinkedIn Authorized Jobs API';

  async fetchJobs(source: JobSource): Promise<RawJob[]> {
    console.log(`[LinkedInConnector] Initiating fetch for source: ${source.name}`);
    
    const hasCredentials = process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET;
    if (!hasCredentials) {
      console.warn(`[LinkedInConnector] WARNING: Skipping fetch. Missing LINKEDIN_CLIENT_ID or LINKEDIN_CLIENT_SECRET in environment secrets.`);
      return [];
    }

    // In a real API integration, we would perform OAuth2 authentication:
    // const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', { ... });
    // const response = await fetch(`${source.apiBaseUrl}/jobSharePostings?limit=${source.dailyLimit}`, { ... });
    
    console.log(`[LinkedInConnector] Credentials detected. Performing API payload parsing (Mocked output)...`);
    return [
      {
        id: 'li-002',
        title: 'Staff Product Manager - Search Services',
        company: 'Google',
        location: 'Mountain View, CA',
        description: 'Mocked LinkedIn API job listing. Responsible for analytics data streams, cloud pipelines scaling, and indexing strategies.',
        applyUrl: 'https://google.com/careers/li-002',
        salaryMin: 180000,
        salaryMax: 240000,
        type: 'full-time'
      }
    ];
  }

  async normalizeJob(rawJob: RawJob, source: JobSource): Promise<NormalizedJob> {
    const slug = generateJobSlug(rawJob.title || 'LinkedIn Job', rawJob.company || 'Unknown');
    const defaultExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return {
      title: rawJob.title || 'LinkedIn Job Listing',
      slug,
      companyName: rawJob.company || 'Google',
      description: `<p>${rawJob.description || 'Visit original source to view full details.'}</p>`,
      salaryMin: rawJob.salaryMin,
      salaryMax: rawJob.salaryMax,
      salaryCurrency: 'USD',
      location: rawJob.location || 'Mountain View, CA',
      remoteType: 'hybrid',
      employmentType: 'full-time',
      experienceLevel: 'lead',
      category: 'Software',
      skills: 'Product Management, Search Engine Optimization, BigQuery',
      sourceName: this.name,
      sourceJobId: rawJob.id,
      sourceUrl: rawJob.applyUrl,
      applyUrl: rawJob.applyUrl || 'https://linkedin.com',
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
