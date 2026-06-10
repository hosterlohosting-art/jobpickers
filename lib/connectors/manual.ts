import { JobSource } from '@prisma/client';
import { JobSourceConnector, RawJob, NormalizedJob, ValidationResult, generateJobSlug } from './connector';

export class ManualConnector implements JobSourceConnector {
  name = 'Manual Postings';

  async fetchJobs(source: JobSource): Promise<RawJob[]> {
    // Manual postings do not fetch anything since they originate from admin/employer forms
    return [];
  }

  async normalizeJob(rawJob: RawJob, source: JobSource): Promise<NormalizedJob> {
    const slug = generateJobSlug(rawJob.title || 'Job Post', rawJob.company || 'Direct Employer');
    const defaultExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return {
      title: rawJob.title || 'Job Listing',
      slug,
      companyName: rawJob.company || 'Verified Company',
      companyLogo: rawJob.logo || '',
      companyWebsite: rawJob.website || '',
      description: rawJob.description || '',
      salaryMin: rawJob.salaryMin,
      salaryMax: rawJob.salaryMax,
      salaryCurrency: 'USD',
      location: rawJob.location || 'Remote',
      remoteType: (rawJob.rawPayload?.remoteType) || 'remote',
      employmentType: (rawJob.rawPayload?.employmentType) || 'full-time',
      experienceLevel: (rawJob.rawPayload?.experienceLevel) || 'mid',
      category: (rawJob.rawPayload?.category) || 'Software',
      skills: (rawJob.rawPayload?.skills) || 'Not Specified',
      sourceName: this.name,
      sourceUrl: rawJob.applyUrl,
      applyUrl: rawJob.applyUrl || 'https://jobpickers.com',
      postedAt: new Date(),
      expiresAt: defaultExpiry
    };
  }

  async validateJob(job: NormalizedJob): Promise<ValidationResult> {
    if (!job.title || !job.companyName || !job.applyUrl) {
      return { isValid: false, reason: 'Missing essential fields: title, company name, or application link.' };
    }
    return { isValid: true };
  }
}
