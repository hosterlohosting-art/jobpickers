import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { IndeedConnector } from '../../../../lib/connectors/indeed';
import { LinkedInConnector } from '../../../../lib/connectors/linkedin';
import { GlassdoorConnector } from '../../../../lib/connectors/glassdoor';
import { RSSFeedConnector } from '../../../../lib/connectors/rss';
import { ManualConnector } from '../../../../lib/connectors/manual';

function getConnector(name: string) {
  switch (name) {
    case 'Indeed Partner Feed':
      return new IndeedConnector();
    case 'LinkedIn Authorized Jobs API':
      return new LinkedInConnector();
    case 'Glassdoor API':
      return new GlassdoorConnector();
    case 'RSSFeedConnector':
      return new RSSFeedConnector();
    case 'Manual Postings':
      return new ManualConnector();
    default:
      return null;
  }
}

export async function POST(request: Request) {
  // Security check: Protect the crawler endpoint in production from unauthorized triggers
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return new Response('Unauthorized crawler request', { status: 401 });
    }
  }

  let sourceId: string | null = null;
  try {
    const body = await request.json().catch(() => ({}));
    sourceId = body.sourceId || null;
  } catch (e) {
    // Body reading might fail if request is empty
  }

  return handleImport(sourceId);
}

export async function GET(request: Request) {
  // Security check: Protect the crawler endpoint in production from unauthorized triggers
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return new Response('Unauthorized crawler request', { status: 401 });
    }
  }

  const { searchParams } = new URL(request.url);
  const sourceId = searchParams.get('sourceId');

  return handleImport(sourceId);
}

async function handleImport(sourceId: string | null) {
  try {
    // 1. Fetch matching source configurations
    let sourcesToSync = [];
    if (sourceId) {
      const singleSource = await prisma.jobSource.findUnique({
        where: { id: sourceId }
      });
      if (singleSource) {
        sourcesToSync.push(singleSource);
      }
    } else {
      sourcesToSync = await prisma.jobSource.findMany({
        where: { isActive: true }
      });
    }

    if (sourcesToSync.length === 0) {
      return NextResponse.json({ 
        message: 'No active job sources to synchronize.',
        fetched: 0,
        imported: 0
      });
    }

    let globalFetched = 0;
    let globalImported = 0;
    let globalDuplicates = 0;
    let globalRejected = 0;

    for (const source of sourcesToSync) {
      const connector = getConnector(source.name);
      if (!connector) {
        console.warn(`[Jobs Import] No connector mapped for source: ${source.name}`);
        continue;
      }

      // Initialize audit log
      const importLog = await prisma.importLog.create({
        data: {
          sourceId: source.id,
          status: 'success',
          fetchedCount: 0,
          importedCount: 0,
          duplicateCount: 0,
          rejectedCount: 0,
          startedAt: new Date()
        }
      });

      let fetchedCount = 0;
      let importedCount = 0;
      let duplicateCount = 0;
      let rejectedCount = 0;
      let errorMsg: string | null = null;

      try {
        // Fetch raw list
        const rawJobs = await connector.fetchJobs(source);
        fetchedCount = rawJobs.length;
        globalFetched += fetchedCount;

        for (const rawJob of rawJobs) {
          // Normalize job payload
          const normalized = await connector.normalizeJob(rawJob, source);
          
          // Validate
          const validation = await connector.validateJob(normalized);
          if (!validation.isValid) {
            rejectedCount++;
            globalRejected++;
            continue;
          }

          // Strict duplicate search matching slug OR title+company+location+applyUrl
          const existingJob = await prisma.job.findFirst({
            where: {
              OR: [
                { slug: normalized.slug },
                {
                  title: normalized.title,
                  company: { name: normalized.companyName },
                  location: normalized.location,
                  applyUrl: normalized.applyUrl
                }
              ]
            }
          });

          if (existingJob) {
            // Update seen times, extend expiry, and re-publish if expired/archived
            await prisma.job.update({
              where: { id: existingJob.id },
              data: {
                sourceLastSeenAt: new Date(),
                expiresAt: normalized.expiresAt,
                status: 'published'
              }
            });
            duplicateCount++;
            globalDuplicates += 1;
            continue;
          }

          // Fuzzy check: same company and similar title structure in last 7 days
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          const fuzzyJob = await prisma.job.findFirst({
            where: {
              company: { name: normalized.companyName },
              title: { contains: normalized.title },
              postedAt: { gte: sevenDaysAgo }
            }
          });

          if (fuzzyJob) {
            // Treat as duplicate, update seen dates, and re-publish if expired/archived
            await prisma.job.update({
              where: { id: fuzzyJob.id },
              data: {
                sourceLastSeenAt: new Date(),
                expiresAt: normalized.expiresAt,
                status: 'published'
              }
            });
            duplicateCount++;
            globalDuplicates += 1;
            continue;
          }

          // Resolve Company Profile
          const companySlug = normalized.companyName
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_]+/g, '-')
            .replace(/^-+|-+$/g, '');

          let company = await prisma.company.findUnique({
            where: { name: normalized.companyName }
          });

          if (!company) {
            company = await prisma.company.create({
              data: {
                name: normalized.companyName,
                slug: companySlug,
                logo: normalized.companyLogo || '',
                website: normalized.companyWebsite || '',
                description: `${normalized.companyName} is a hiring partner listing open vacancies.`
              }
            });
          } else if (normalized.companyLogo && !company.logo) {
            company = await prisma.company.update({
              where: { id: company.id },
              data: { logo: normalized.companyLogo }
            });
          }

          // Save Job Post
          await prisma.job.create({
            data: {
              title: normalized.title,
              slug: normalized.slug,
              companyId: company.id,
              description: normalized.description,
              salaryMin: normalized.salaryMin,
              salaryMax: normalized.salaryMax,
              salaryCurrency: normalized.salaryCurrency,
              location: normalized.location,
              remoteType: normalized.remoteType,
              employmentType: normalized.employmentType,
              experienceLevel: normalized.experienceLevel,
              category: normalized.category,
              skills: normalized.skills,
              sourceName: source.name,
              sourceJobId: normalized.sourceJobId || null,
              sourceUrl: normalized.sourceUrl || null,
              applyUrl: normalized.applyUrl,
              status: 'published',
              expiresAt: normalized.expiresAt
            }
          });

          importedCount++;
          globalImported++;
        }

        // Update JobSource last sync timestamp
        await prisma.jobSource.update({
          where: { id: source.id },
          data: { lastSyncedAt: new Date() }
        });

      } catch (err: any) {
        console.error(`[Jobs Import] Failure syncing source ${source.name}:`, err);
        errorMsg = err.message || 'Unknown crawl error';
      }

      // Finish log row
      await prisma.importLog.update({
        where: { id: importLog.id },
        data: {
          status: errorMsg ? 'failed' : 'success',
          fetchedCount,
          importedCount,
          duplicateCount,
          rejectedCount,
          errorMessage: errorMsg,
          finishedAt: new Date()
        }
      });
    }

    // 4. Lifecycle management: Auto-expire jobs past their validThrough dates
    const now = new Date();
    const expiredResult = await prisma.job.updateMany({
      where: {
        expiresAt: { lte: now },
        status: 'published'
      },
      data: {
        status: 'expired'
      }
    });
    if (expiredResult.count > 0) {
      console.log(`[Lifecycle Engine] Auto-expired ${expiredResult.count} active vacancies.`);
    }

    // 5. Clean up old entries (archives listings older than 60 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const archivedResult = await prisma.job.updateMany({
      where: {
        postedAt: { lte: sixtyDaysAgo },
        status: { in: ['published', 'expired'] }
      },
      data: {
        status: 'archived'
      }
    });
    if (archivedResult.count > 0) {
      console.log(`[Lifecycle Engine] Archived ${archivedResult.count} outdated listings.`);
    }

    return NextResponse.json({
      success: true,
      fetched: globalFetched,
      imported: globalImported,
      duplicates: globalDuplicates,
      rejected: globalRejected
    });

  } catch (error: any) {
    console.error('[Jobs Import POST] Unexpected sync failure:', error);
    return NextResponse.json(
      { error: error.message || 'Unexpected Internal Server Error' },
      { status: 500 }
    );
  }
}
