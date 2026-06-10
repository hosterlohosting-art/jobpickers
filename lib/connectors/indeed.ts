import { JobSource } from '@prisma/client';
import { JobSourceConnector, RawJob, NormalizedJob, ValidationResult, generateJobSlug } from './connector';

export class IndeedConnector implements JobSourceConnector {
  name = 'Indeed Partner Feed';

  async fetchJobs(source: JobSource): Promise<RawJob[]> {
    console.log(`[IndeedConnector] Initiating fetch for source: ${source.name}`);
    
    const hasCredentials = process.env.INDEED_API_KEY && process.env.INDEED_PUBLISHER_ID;
    if (!hasCredentials) {
      console.warn(`[IndeedConnector] WARNING: Skipping fetch. Missing INDEED_API_KEY or INDEED_PUBLISHER_ID in environment secrets.`);
      return [];
    }

    // In a real API integration, we would invoke an HTTP request like:
    // const response = await fetch(`${source.apiBaseUrl}/jobs?publisher=${process.env.INDEED_PUBLISHER_ID}&v=2&format=json&limit=${source.dailyLimit}`, {
    //   headers: { 'Authorization': `Bearer ${process.env.INDEED_API_KEY}` }
    // });
    // return response.json();
    
    console.log(`[IndeedConnector] Credentials detected. Performing API payload parsing (Mocked output)...`);
    return [
      {
        id: 'ind-001',
        title: 'Senior Site Reliability Architect',
        company: 'Stripe',
        location: 'Remote, US',
        description: 'Mocked Indeed API job description. Responsible for container orchestrations, cloud architecture monitoring, and post-mortem reports.',
        applyUrl: 'https://stripe.com/careers/ind-001',
        salaryMin: 155000,
        salaryMax: 195000,
        type: 'full-time'
      }
    ];
  }

  async normalizeJob(rawJob: RawJob, source: JobSource): Promise<NormalizedJob> {
    const slug = generateJobSlug(rawJob.title || 'Indeed Job', rawJob.company || 'Unknown');
    const defaultExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default

    return {
      title: rawJob.title || 'Indeed Job Listing',
      slug,
      companyName: rawJob.company || 'Indeed Verified Employer',
      description: `<p>${rawJob.description || 'Visit original source to view full details.'}</p>`,
      salaryMin: rawJob.salaryMin,
      salaryMax: rawJob.salaryMax,
      salaryCurrency: 'USD',
      location: rawJob.location || 'Remote',
      remoteType: 'remote',
      employmentType: 'full-time',
      experienceLevel: 'senior',
      category: 'Software',
      skills: 'SRE, AWS, Docker, Kubernetes',
      sourceName: this.name,
      sourceJobId: rawJob.id,
      sourceUrl: rawJob.applyUrl,
      applyUrl: rawJob.applyUrl || 'https://indeed.com',
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
