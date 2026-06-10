import { JobSource } from '@prisma/client';
import { JobSourceConnector, RawJob, NormalizedJob, ValidationResult, generateJobSlug } from './connector';
import { enrichJobDetails } from '../ai';

export class RSSFeedConnector implements JobSourceConnector {
  name = 'RSSFeedConnector';

  async fetchJobs(source: JobSource): Promise<RawJob[]> {
    console.log(`[RSSFeedConnector] Fetching live public feeds...`);
    const jobsList: RawJob[] = [];

    // Fetch from Remotive remote jobs feed
    try {
      console.log(`[RSSFeedConnector] Invoking Remotive remote-jobs feed API...`);
      const remotiveRes = await fetch('https://remotive.com/api/remote-jobs?limit=30');
      if (remotiveRes.ok) {
        const remotiveJson = await remotiveRes.json();
        if (remotiveJson.jobs && Array.isArray(remotiveJson.jobs)) {
          console.log(`[RSSFeedConnector] Remotive returned ${remotiveJson.jobs.length} jobs.`);
          remotiveJson.jobs.forEach((job: any) => {
            // Extract salary bounds
            let minSalary = 80000;
            let maxSalary = 110000;
            if (job.salary) {
              const matched = job.salary.match(/\d+k/g);
              if (matched && matched.length >= 2) {
                minSalary = parseInt(matched[0]) * 1000;
                maxSalary = parseInt(matched[1]) * 1000;
              }
            } else {
              // Create dynamic estimations for standard seeds
              minSalary = 75000 + (Math.floor(Math.random() * 6) * 10000);
              maxSalary = minSalary + 25000;
            }

            jobsList.push({
              id: `remotive-${job.id}`,
              title: job.title,
              company: job.company_name,
              logo: job.company_logo || '',
              location: job.candidate_required_location || 'Remote',
              description: job.description || '',
              applyUrl: job.url,
              salaryMin: minSalary,
              salaryMax: maxSalary,
              type: job.job_type || 'full-time',
              postedAt: job.publication_date
            });
          });
        }
      }
    } catch (e) {
      console.error(`[RSSFeedConnector] Remotive fetch error:`, e);
    }

    // Fetch from Arbeitnow jobs feed (pages 1 to 3 to scale up)
    for (let page = 1; page <= 3; page++) {
      try {
        console.log(`[RSSFeedConnector] Invoking Arbeitnow feed API page ${page}...`);
        const arbeitnowRes = await fetch(`https://www.arbeitnow.com/api/job-board-api?page=${page}`);
        if (arbeitnowRes.ok) {
          const arbeitnowJson = await arbeitnowRes.json();
          if (arbeitnowJson.data && Array.isArray(arbeitnowJson.data)) {
            console.log(`[RSSFeedConnector] Arbeitnow page ${page} returned ${arbeitnowJson.data.length} jobs.`);
            arbeitnowJson.data.forEach((job: any) => {
              const minSalary = 70000 + (Math.floor(Math.random() * 6) * 10000);
              const maxSalary = minSalary + 20000;

              jobsList.push({
                id: `arbeitnow-${job.slug}`,
                title: job.title,
                company: job.company_name,
                location: job.location || 'Germany',
                description: job.description || '',
                applyUrl: job.url,
                salaryMin: minSalary,
                salaryMax: maxSalary,
                type: job.job_types ? job.job_types[0] : 'full-time',
                postedAt: new Date().toISOString()
              });
            });
          }
        }
      } catch (e) {
        console.error(`[RSSFeedConnector] Arbeitnow fetch error on page ${page}:`, e);
      }
    }

    return jobsList.slice(0, source.dailyLimit); // Obey sync settings limit
  }

  // Normalize API categories to match JobPickers standard selection categories
  private detectCategory(title: string, desc: string): string {
    const text = `${title} ${desc}`.toLowerCase();
    if (text.includes('developer') || text.includes('software') || text.includes('engineer') || text.includes('devops') || text.includes('programmer') || text.includes('web') || text.includes('frontend') || text.includes('backend') || text.includes('sysadmin')) {
      return 'Software';
    }
    if (text.includes('designer') || text.includes('ux') || text.includes('ui') || text.includes('creative') || text.includes('artist') || text.includes('illustrator')) {
      return 'Design';
    }
    if (text.includes('market') || text.includes('growth') || text.includes('seo') || text.includes('social media') || text.includes('content creator')) {
      return 'Marketing';
    }
    if (text.includes('support') || text.includes('customer success') || text.includes('help desk') || text.includes('advocate')) {
      return 'Customer Support';
    }
    if (text.includes('product manager') || text.includes('project manager') || text.includes('scrum master') || text.includes('product owner')) {
      return 'Product';
    }
    if (text.includes('sales') || text.includes('business development') || text.includes('account executive')) {
      return 'Sales';
    }
    if (text.includes('finance') || text.includes('financial') || text.includes('accountant') || text.includes('ledger') || text.includes('treasury')) {
      return 'Finance';
    }
    if (text.includes('recruiting') || text.includes('human resources') || text.includes('recruiter') || text.includes('hr coordinator')) {
      return 'HR';
    }
    
    return 'Software'; // Default fallback
  }

  async normalizeJob(rawJob: RawJob, source: JobSource): Promise<NormalizedJob> {
    const slug = generateJobSlug(rawJob.title || 'Job Listing', rawJob.company || 'Unknown');
    const defaultExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Invoke AI / Fallback rules normalizer
    const aiDetails = await enrichJobDetails(
      rawJob.title || 'Job Listing',
      rawJob.description || '',
      rawJob.location || 'Remote'
    );

    // Normalize experience
    let expLevel: 'entry' | 'mid' | 'senior' | 'lead' = 'mid';
    const titleL = (aiDetails.title || rawJob.title || '').toLowerCase();
    if (titleL.includes('junior') || titleL.includes('entry') || titleL.includes('intern')) {
      expLevel = 'entry';
    } else if (titleL.includes('senior') || titleL.includes('sr.')) {
      expLevel = 'senior';
    } else if (titleL.includes('lead') || titleL.includes('principal') || titleL.includes('director')) {
      expLevel = 'lead';
    }

    return {
      title: aiDetails.title || rawJob.title || 'Job Listing',
      slug,
      companyName: rawJob.company || 'Verified Employer',
      companyLogo: rawJob.logo || '',
      description: rawJob.description || '<p>Visit company website to read full job description details.</p>',
      salaryMin: rawJob.salaryMin,
      salaryMax: rawJob.salaryMax,
      salaryCurrency: 'USD',
      location: rawJob.location || 'Remote',
      remoteType: aiDetails.location.remoteType || 'remote',
      employmentType: (rawJob.type && ['full-time', 'part-time', 'contract', 'internship'].includes(rawJob.type.toLowerCase())) ? rawJob.type.toLowerCase() as any : 'full-time',
      experienceLevel: expLevel,
      category: aiDetails.category || 'Software',
      skills: aiDetails.skills.length > 0 ? aiDetails.skills.join(', ') : 'Not Specified',
      sourceName: this.name,
      sourceJobId: rawJob.id,
      sourceUrl: rawJob.applyUrl,
      applyUrl: rawJob.applyUrl || 'https://jobpickers.com',
      postedAt: (() => {
        if (rawJob.postedAt) {
          const d = new Date(rawJob.postedAt);
          if (!isNaN(d.getTime())) return d;
        }
        return new Date();
      })(),
      expiresAt: defaultExpiry
    };
  }

  async validateJob(job: NormalizedJob): Promise<ValidationResult> {
    if (!job.title || !job.companyName || !job.applyUrl) {
      return { isValid: false, reason: 'Missing essential fields: title, company, or apply URL.' };
    }
    // Block obvious spam listings
    const spamWords = ['commission payout only', 'make $1000 daily from home', 'telegram support job click', 'no qualifications needed start today'];
    const textToCheck = `${job.title} ${job.description}`.toLowerCase();
    for (const word of spamWords) {
      if (textToCheck.includes(word)) {
        return { isValid: false, reason: `Spam filter matched suspicious term: "${word}"` };
      }
    }
    return { isValid: true };
  }
}
