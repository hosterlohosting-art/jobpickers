import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { notifyGoogleIndexing } from '../../../../lib/google-indexing';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    // Verify ownership or admin role
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      select: { postedById: true, status: true, slug: true }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job listing not found' }, { status: 404 });
    }

    if (role !== 'admin' && job.postedById !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      category,
      remoteType,
      employmentType,
      experienceLevel,
      location,
      salary,
      skills,
      description,
      applyUrl,
      status // e.g. status can be changed to expired/published
    } = body;

    const parsedSalary = salary ? parseInt(salary, 10) : null;

    const updatedJob = await prisma.job.update({
      where: { id: params.id },
      data: {
        title,
        category,
        remoteType,
        employmentType,
        experienceLevel,
        location,
        salaryMin: parsedSalary,
        salaryMax: parsedSalary,
        skills,
        description,
        applyUrl,
        status
      }
    });

    // Notify Google Indexing API if the status has changed
    if (status && status !== job.status) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jobpickers.com';
      const jobUrl = `${siteUrl}/jobs/${job.slug}`;
      const indexingType = (status === 'expired' || status === 'archived') ? 'URL_DELETED' : 'URL_UPDATED';
      notifyGoogleIndexing(jobUrl, indexingType).catch(err => console.error('[Google Indexing Error]', err));
    }

    return NextResponse.json({ success: true, job: updatedJob });
  } catch (error) {
    console.error('[API Employer PATCH] Failed to edit employer job listing:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    // Verify ownership or admin role
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      select: { postedById: true, slug: true }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job listing not found' }, { status: 404 });
    }

    if (role !== 'admin' && job.postedById !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.job.delete({
      where: { id: params.id }
    });

    // Notify Google Indexing API of deletion
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jobpickers.com';
    const jobUrl = `${siteUrl}/jobs/${job.slug}`;
    notifyGoogleIndexing(jobUrl, 'URL_DELETED').catch(err => console.error('[Google Indexing Error]', err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Employer DELETE] Failed to delete employer job listing:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
